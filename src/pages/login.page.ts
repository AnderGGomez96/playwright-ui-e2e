import type { Page, Locator } from "@playwright/test";
import { Healer } from "../healing";
import { loginLocators } from "../locators/login.locators";

export class LoginPage {
    constructor(
        private readonly page: Page,
        private readonly healer: Healer) { }

    async goto() {
        await this.page.goto('/login');
    }

    async login(email:string, password:string){
        await this.healer.fill(loginLocators.loginEmailAddress, email);
        await this.healer.fill(loginLocators.LoginPassword,password);
        await this.healer.click(loginLocators.loginButton);
    }

    async logiAs(): Promise<String>{
        return await this.healer.text(loginLocators.loginAsText)
    }

    async loginError(): Promise<String>{
        return await this.healer.text(loginLocators.loginError)
    }
}