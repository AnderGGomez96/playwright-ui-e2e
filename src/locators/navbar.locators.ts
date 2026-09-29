import { NAVBAR_ITEMS, NavbarOption } from '../constant/navbar.options'
import { LocatorSpec } from '../healing'

const SOURCE = 'src/locators/navbar.locators.ts'


export const navbarLocator = {
    option(option: NavbarOption): LocatorSpec {
        const label  = NAVBAR_ITEMS[option]
        return {
            key: `navbarOption.${option}`,
            description: `Enlace "${label}" de la barra de navegación`,
            action: 'click',
            sourceFile: SOURCE,
            candidates: [
                { strategy: 'role', role: 'link', name: label },
                //{ strategy: 'testid', value: `nav-${option}` },
            ],
        }
    }
}
