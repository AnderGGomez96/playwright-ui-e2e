# playwright-ui-e2e

Framework de pruebas E2E de UI sobre `https://automationexercise.com`
con Playwright + TypeScript: Page Objects, locators declarados como datos
(`LocatorSpec`) y **self-healing de locators** en escalera
(cadena de candidatos -> caché -> IA).

## Stack

- Node 22 / npm 11
- TypeScript 7 (`strict`, `noEmit`)
- `@playwright/test` 1.63
- `dotenv` (carga `.env` desde `playwright.config.ts`)
- `diff` (generación de parches del healing)

## Estructura

```text
src/
  components/     navbar y piezas reutilizables
  constant/       opciones de navbar
  fixtures/       export único de `test` (healer + POM + cartWithProduct)
  healing/        escalera de resolución, gobernanza, caché, snapshots, parches
  locators/       locators como datos (`LocatorSpec` + `@heal-target`)
  pages/          Page Objects
tests/
  e2e_guest/      specs sin sesión (proyecto chromium-guest)
  e2e_auth/       specs con storageState (proyecto chromium-logged)
  setup/          autenticación para storageState (ver deuda D-002)
docs/             plan de estudio y registro de cambios
```

## Cómo correr

```bash
npm ci
cp .env.example .env   # si existe; completar HEAL_* (nunca commitear)
npx playwright test                        # suite completa
npx playwright test --project=chromium-guest
npx playwright test --project=chromium-logged
npx playwright show-report
npx tsc --noEmit                           # typecheck (deuda D-001 activa)
```

Sin `.env` el healing funciona igual en niveles cadena/caché; el nivel IA
requiere `HEAL_LLM_API_KEY` (chat) o `HEAL_JEV_API_KEY` (System One).

## Self-healing

Cada `LocatorSpec` declara una cadena de candidatos. Si ninguno resuelve,
`Healer` consulta la caché y, como último nivel, a un motor de IA
(`HEAL_ENGINE=chat|systemone`). Cada cura:

- anota el test y escribe `.healing/healing-report-*.json`,
- guarda evento y snapshot en `.healing/`,
- propone un parche en `patches/` (aplicable con `HEAL_APPLY=1`).

Umbrales de gobernanza (`HEAL_MODE=local|ci`) y variables completas:
ver `AGENTS.md`, sección PRODUCTO.

## Notas

- `AGENTS.md` y `.opencode/` son locales: **no se commitean**.
- Deuda técnica abierta (D-001 a D-004) documentada en `AGENTS.md`.
