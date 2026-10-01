import { type Page, expect } from '@playwright/test'
import type { Healer } from '../healing'
import { loginLocators } from '../locators/login.locators'

/** Campo del formulario de login. */
export type LoginField = 'email' | 'password'

/**
 * POM del flujo de login y del estado de sesión.
 *
 * Las acciones y lecturas van por el healer; las ausencias (H-01) usan
 * selectores estables dentro del POM con aserciones web-first, sin healer.
 */
export class LoginPage {

    constructor(
        private readonly page: Page,
        private readonly healer: Healer,
    ) { }

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, password: string) {
        await this.healer.fill(loginLocators.loginEmail, email);
        await this.healer.fill(loginLocators.loginPassword, password);
        await this.healer.click(loginLocators.loginButton);
    }

    async loggedInAsText(): Promise<string> {
        return this.healer.text(loginLocators.loggedInAsText);
    }

    async logout() {
        await this.healer.click(loginLocators.logoutLink);
    }

    async loginErrorMessage(): Promise<string> {
        return this.healer.text(loginLocators.loginError);
    }

    async loginEmailValidationMessage(): Promise<string> {
        return this.validationMessage('email');
    }

    async loginPasswordValidationMessage(): Promise<string> {
        return this.validationMessage('password');
    }

    async loginFieldIsValid(field: LoginField): Promise<boolean> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.checkValidity());
    }

    async loginFieldTypeMismatch(field: LoginField): Promise<boolean> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
    }

    /** `data-qa` del elemento activo, o `null` si no tiene. */
    async focusedField(): Promise<string | null> {
        return this.page.evaluate(() => document.activeElement?.getAttribute('data-qa') ?? null);
    }

    async expectLoginFormVisible(): Promise<void> {
        const email = await this.healer.resolve(loginLocators.loginEmail);
        await expect(email).toBeVisible();
    }

    async expectAuthFormsHidden(): Promise<void> {
        await expect(this.page.locator('input[data-qa="login-email"]')).toHaveCount(0);
        await expect(this.page.locator('input[data-qa="signup-name"]')).toHaveCount(0);
    }

    async expectLoggedOutNav(): Promise<void> {
        await expect(this.page.locator('a[href="/logout"]')).toHaveCount(0);
        await expect(this.page.locator('a[href="/delete_account"]')).toHaveCount(0);
    }

    async expectNoLoginError(): Promise<void> {
        await expect(this.page.locator('.login-form p')).toHaveCount(0);
    }

    private async validationMessage(field: LoginField): Promise<string> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.validationMessage);
    }

    private locatorFor(field: LoginField) {
        return field === 'email' ? loginLocators.loginEmail : loginLocators.loginPassword;
    }
}
