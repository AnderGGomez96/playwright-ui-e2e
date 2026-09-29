import { type Page, type Locator, expect } from "@playwright/test";
import type { Healer } from "../healing";
import { cartLocators } from "../locators/cart.locators";


export class CartPage {

    constructor (
        private readonly page: Page,
        private readonly healer: Healer,
    ){}

    async goto() {
        await this.page.goto('/view_cart');
    }

    async checkout (){
        await this.healer.click(cartLocators.checkoutButton);
    }

    async productRow(product: string): Promise<Locator> {
        return this.healer.resolve(cartLocators.product(product))
    }

}