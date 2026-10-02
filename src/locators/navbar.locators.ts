import { NAVBAR_ITEMS, type NavbarOption } from '../constant/navbar.options'
import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/navbar.locators.ts'

/**
 * Locators de las opciones del navbar.
 *
 * Primario semántico (`role: link` con nombre accesible real) y fallback `css`
 * por `href` estable, ambos acotados al menú (`.shop-menu`).
 */
export const navbarLocator = {
  option(key: NavbarOption): LocatorSpec {
    const { label, href } = NAVBAR_ITEMS[key]
    return {
      key: `navbarOption.${key}`,
      description: `Enlace "${label}" de la barra de navegación`,
      action: 'click',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:navbarOption
        { strategy: 'role', role: 'link', name: label, within: '.shop-menu' },
        { strategy: 'css', value: `a[href="${href}"]`, within: '.shop-menu' },
      ],
    }
  },
}
