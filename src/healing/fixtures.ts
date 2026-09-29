/**
 * Fixtures de Playwright para el healing.
 *
 * Extiende `test` con dos fixtures:
 * - `healingConfig`: configuración cargada del entorno; se puede sobreescribir
 *   por test con `test.use({ healingConfig: ... })`.
 * - `healer`: instancia de {@link Healer} ligada a la `page` del test; al terminar
 *   la prueba ejecuta {@link Healer.flush} para escribir el reporte de curación.
 *
 * @example
 * ```ts
 * import { test, expect } from '../src/healing/fixtures'
 * import { loginLocators } from '../src/locators/registry'
 *
 * test('login con auto-recuperacion', async ({ page, healer }) => {
 *   await page.goto('/login')
 *   await healer.fill(loginLocators.loginEmail, 'user@example.com')
 * })
 * ```
 */
import { test as base, expect } from '@playwright/test'
import { loadHealingConfig, type HealingConfig } from './config'
import { Healer } from './healer'

export const test = base.extend<{ healingConfig: HealingConfig; healer: Healer }>({
  healingConfig: [
    async ({}, use) => {
      await use(loadHealingConfig())
    },
    { option: true },
  ],
  healer: async ({ page, healingConfig }, use, testInfo) => {
    const healer = new Healer(page, { testInfo, config: healingConfig })
    await use(healer)
    await healer.flush()
  },
})

export { expect }
