/**
 * Variante batch del motor System One: resuelve varios locators en una llamada.
 *
 * Reutiliza el snapshot y el mapa de opciones ({@link buildChoiceCriteria}) y
 * envía una pregunta independiente por spec (`target_<clave>`), reduciendo
 * latencia y tokens frente a N llamadas secuenciales.
 */
import type { Page } from '@playwright/test'
import type { SystemOneConfig } from './config'
import type { LocatorCandidate, LocatorSpec, TokenUsage } from './types'
import { capturePageSnapshot, type PageSnapshot, type SnapshotElement, type SnapshotMode } from './snapshot'
import { SystemOneClient, usageOf, type SystemOneQuestion, type SystemOneResponse } from './systemone-client'
import {
  NONE_OF_THE_ABOVE,
  NONE_OF_THE_ABOVE_DESCRIPTION,
  buildChoiceCriteria,
  describeElement,
  locatorForElement,
  optionKey,
} from './systemone-resolver'

const MAX_ELEMENTS = 60
const MAX_STATE_CHARS = 16_000
const MAX_ARIA_STATE_CHARS = 8_000

/** Resultado de un spec dentro de una resolución batch. */
export interface BatchResolution {
  /** Spec resuelto. */
  spec: LocatorSpec
  /** Candidato derivado, si hubo elección válida. */
  candidate?: LocatorCandidate
  /** Elemento elegido, si hubo elección válida. */
  element?: SnapshotElement
  /** Confianza calibrada de la elección. */
  confidence?: number
  /** Distribución de probabilidades de la elección. */
  probabilities?: Record<string, number>
  /** Motivo cuando el spec no pudo resolverse. */
  error?: string
}

/** Propuesta completa de una resolución batch. */
export interface SystemOneBatchProposal {
  /** Resoluciones alineadas con los specs enviados. */
  resolutions: BatchResolution[]
  /** Snapshot compartido por todas las preguntas. */
  snapshot: PageSnapshot
  /** Respuesta cruda del servicio. */
  response: SystemOneResponse
  /** Tokens consumidos por la llamada. */
  usage?: TokenUsage
  /** Texto enviado como `state`. */
  state: string
  /** Preguntas enviadas, una por spec. */
  questions: Record<string, SystemOneQuestion>
}

/**
 * Genera el nombre de pregunta para un spec.
 *
 * @param key - Clave del {@link LocatorSpec}.
 * @returns Nombre saneado con el prefijo `target_`.
 */
export function batchQuestionKey(key: string): string {
  return `target_${key.replace(/[^a-zA-Z0-9_]/g, '_')}`
}

/**
 * Resuelve varios locators con una sola llamada a System One.
 *
 * @param page - Página en el estado actual (fuente del snapshot).
 * @param specs - Locators a reparar.
 * @param config - Configuración del backend System One.
 * @param snapshotMode - Vista de contexto a enviar; por defecto `hybrid`.
 * @returns Propuesta con una resolución por spec y la respuesta completa.
 * @throws Error si no hay elementos que ofrecer como opciones.
 */
export async function proposeLocatorsWithSystemOne(
  page: Page,
  specs: LocatorSpec[],
  config: SystemOneConfig,
  snapshotMode: SnapshotMode = 'hybrid',
): Promise<SystemOneBatchProposal> {
  const snapshot = await capturePageSnapshot(page, snapshotMode)
  const elements = snapshot.elements.slice(0, MAX_ELEMENTS)
  if (elements.length === 0) {
    throw new Error('El snapshot no contiene elementos interactivos que ofrecer como candidatos')
  }

  const criteria: Record<string, string> = buildChoiceCriteria(elements)
  criteria[NONE_OF_THE_ABOVE] = NONE_OF_THE_ABOVE_DESCRIPTION

  const questions: Record<string, SystemOneQuestion> = {}
  for (const spec of specs) {
    questions[batchQuestionKey(spec.key)] = {
      type: 'choice',
      instructions: `Action: ${spec.action}. Which element on the page exactly matches this description? "${spec.description}". Choose none_of_the_above if no candidate matches.`,
      criteria,
    }
  }

  const state = buildBatchState(specs, snapshot, elements)
  const client = new SystemOneClient(config)
  const response = await client.complete(state, questions)

  const resolutions: BatchResolution[] = specs.map((spec) => {
    const answer = response.answers[batchQuestionKey(spec.key)]
    if (!answer || answer.type !== 'choice') {
      return { spec, error: 'sin respuesta para la pregunta' }
    }
    if (answer.choice === NONE_OF_THE_ABOVE) {
      return {
        spec,
        error: `none_of_the_above (confianza ${answer.confidence.toFixed(2)})`,
        confidence: answer.confidence,
        probabilities: answer.probabilities,
      }
    }
    const element = elements.find((item) => optionKey(item) === answer.choice)
    if (!element) {
      return { spec, error: `candidato desconocido ${answer.choice}` }
    }
    return {
      spec,
      element,
      candidate: locatorForElement(element),
      confidence: answer.confidence,
      probabilities: answer.probabilities,
    }
  })

  return { resolutions, snapshot, response, usage: usageOf(response), state, questions }
}

/**
 * Construye el `state` compartido: objetivos, contexto JSON y árbol de accesibilidad.
 *
 * @param specs - Specs que se resolverán en la misma llamada.
 * @param snapshot - Snapshot capturado.
 * @param elements - Elementos enumerados como candidatos.
 * @returns Texto enviado como `state` en el POST.
 */
function buildBatchState(
  specs: LocatorSpec[],
  snapshot: PageSnapshot,
  elements: SnapshotElement[],
): string {
  const context = {
    url: snapshot.url,
    title: snapshot.title,
    headings: snapshot.headings,
    candidates: elements.map((element) => ({
      id: optionKey(element),
      description: describeElement(element),
    })),
  }

  const targets = specs.map(
    (spec) => `- ${batchQuestionKey(spec.key)}: action=${spec.action}; ${spec.description}`,
  )

  const lines = [
    'Targets:',
    ...targets,
    'Page context (JSON):',
    JSON.stringify(context).slice(0, MAX_STATE_CHARS),
  ]
  if (snapshot.ariaTree) {
    lines.push('Accessibility tree (YAML):', snapshot.ariaTree.slice(0, MAX_ARIA_STATE_CHARS))
  }
  return lines.join('\n')
}
