import { randomUUID } from 'node:crypto'

/** Usuario de prueba: nombre, email y contraseña. */
export interface NewUser {
  name: string
  email: string
  password: string
}

/**
 * Cuenta sembrada en el sitio para login exitoso (L-01) y rechazo de email
 * duplicado (R-04). Solo lectura: los specs nunca la eliminan ni la modifican.
 */
export const SEEDED_USER: NewUser & { name: 'Locanto' } = {
  name: 'Locanto',
  email: 'locanto@mail.com',
  password: 'Hola1234*',
}

/**
 * Genera un usuario válido y único para los flujos de registro.
 *
 * El sufijo es un `randomUUID()` (`node:crypto`), único incluso en llamadas
 * consecutivas dentro del mismo milisegundo (a diferencia de `Date.now()`).
 * Nombre y contraseña son valores válidos para la validación nativa del sitio;
 * la contraseña es no vacía y la unicidad del usuario la da el email.
 *
 * @param prefix Prefijo del escenario (p. ej. `r07`). Sin sanitizar.
 * @returns Un {@link NewUser} con email `e2e.<prefix>.<sufijo>@mail.com`.
 */
export function buildUniqueUser(prefix: string): NewUser {
  const suffix = randomUUID()
  return {
    name: `E2E ${prefix} ${suffix}`,
    email: `e2e.${prefix}.${suffix}@mail.com`,
    password: 'Hola1234*',
  }
}

/** País por defecto del alta (valor real del select del sitio). */
export const SIGNUP_COUNTRY = 'Canada'

/** Fecha de nacimiento por defecto del alta (10/May/1995). */
export const SIGNUP_DOB = { day: '10', month: 'May', year: '1995' } as const
