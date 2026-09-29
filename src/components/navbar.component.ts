import type { Page, Locator } from "@playwright/test";
import { Healer } from "../healing";
import { NavbarOption } from "../constant/navbar.options";
import { navbarLocator } from "../locators/navbar.locators";

export class NavbarComponent {
    constructor(
        private readonly page: Page,
        private readonly healer: Healer) { }

        async navbarOption(optionName:NavbarOption){
            this.healer.click(navbarLocator.option(optionName))
        }
}