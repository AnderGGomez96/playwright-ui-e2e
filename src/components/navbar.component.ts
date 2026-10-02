import { expect } from '@playwright/test'
import type { Healer } from '../healing'
import { cssCandidateIndex } from '../healing'
import { NAVBAR_ITEMS, type NavbarOption } from '../constant/navbar.options'
import { navbarLocator } from '../locators/navbar.locators'
import { loginLocators } from '../locators/login.locators'

/**
 * Componente de la barra de navegación.
 *
 * Acciones y presencias del camino feliz pasan por la escalera gobernada
 * (`healer.resolve`/`click`/`text`); las ausencias se derivan del propio
 * `LocatorSpec` con `healer.locator` (traducción pura, sin gastar curaciones).
 */
export class NavbarComponent {
  constructor(private readonly healer: Healer) {}

  /** Navega a la opción del menú indicada. */
  async navbarOption(key: NavbarOption): Promise<void> {
    await this.healer.click(navbarLocator.option(key))
  }

  /** Lee el `href` del elemento vivo (no de la constante). */
  async optionHref(key: NavbarOption): Promise<string | null> {
    const option = await this.healer.resolve(navbarLocator.option(key))
    return option.getAttribute('href')
  }

  /** Verifica que cada opción indicada esté visible como enlace del menú. */
  async expectOptionsVisible(keys: NavbarOption[]): Promise<void> {
    for (const key of keys) {
      const option = await this.healer.resolve(navbarLocator.option(key))
      await expect.soft(option, `La opción "${NAVBAR_ITEMS[key].label}" del menú debe estar visible`).toBeVisible()
    }
  }

  /** Verifica que el menú muestre "Logged in as <name>". */
  async expectLoggedInAs(name: string): Promise<void> {
    const text = await this.healer.text(loginLocators.loggedInAsText)
    expect(text, `El menú debe mostrar "Logged in as ${name}"`).toContain(`Logged in as ${name}`)
  }

  /** Cierra la sesión desde el menú. */
  async logout(): Promise<void> {
    await this.healer.click(loginLocators.logoutLink)
  }

  /** Verifica que no haya rastros de sesión iniciada en el menú. */
  async expectLoggedOutNav(): Promise<void> {
    await expect(this.healer.locator(loginLocators.logoutLink, cssCandidateIndex(loginLocators.logoutLink)), 'Sin sesión no debe aparecer Logout')
      .toHaveCount(0)
    await expect(this.healer.locator(loginLocators.deleteAccountLink, cssCandidateIndex(loginLocators.deleteAccountLink)), 'Sin sesión no debe aparecer Delete Account')
      .toHaveCount(0)
    await expect(this.healer.locator(loginLocators.loggedInAsText, cssCandidateIndex(loginLocators.loggedInAsText)), 'Sin sesión no debe aparecer "Logged in as"')
      .toHaveCount(0)
  }

  /** Verifica que el menú muestre las opciones de una sesión iniciada. */
  async expectLoggedInNav(): Promise<void> {
    await expect(await this.healer.resolve(loginLocators.logoutLink), 'Con sesión debe verse Logout')
      .toBeVisible()
    await expect(await this.healer.resolve(loginLocators.deleteAccountLink), 'Con sesión debe verse Delete Account')
      .toBeVisible()
    await expect(await this.healer.resolve(loginLocators.loggedInAsText), 'Con sesión debe verse "Logged in as"')
      .toBeVisible()
  }
}
