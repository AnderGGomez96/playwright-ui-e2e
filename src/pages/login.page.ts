import { type Page, expect } from '@playwright/test'
import type { Healer } from '../healing'
import { cssCandidateIndex } from '../healing/locator-factory'
import { loginLocators } from '../locators/login.locators'
import { signupLocators } from '../locators/signup.locators'

/** Campo del formulario de login. */
export type LoginField = 'email' | 'password'

/**
 * POM del flujo de login y del estado de sesión.
 *
 * Las acciones y lecturas van por el healer; las ausencias (H-01) derivan su
 * locator del propio `LocatorSpec` con `healer.locator` (traducción pura,
 * sin escalera) y aserciones web-first.
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
        await expect(this.healer.locator(loginLocators.loginEmail, cssCandidateIndex(loginLocators.loginEmail))).toHaveCount(0);
        await expect(this.healer.locator(signupLocators.signupName, cssCandidateIndex(signupLocators.signupName))).toHaveCount(0);
    }

    async expectLoggedOutNav(): Promise<void> {
        await expect(this.healer.locator(loginLocators.logoutLink, cssCandidateIndex(loginLocators.logoutLink))).toHaveCount(0);
        await expect(this.healer.locator(loginLocators.deleteAccountLink, cssCandidateIndex(loginLocators.deleteAccountLink))).toHaveCount(0);
    }

    async expectNoLoginError(): Promise<void> {
        await expect(this.healer.locator(loginLocators.loginError, cssCandidateIndex(loginLocators.loginError))).toHaveCount(0);
    }

    private async validationMessage(field: LoginField): Promise<string> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.validationMessage);
    }

    private locatorFor(field: LoginField) {
        return field === 'email' ? loginLocators.loginEmail : loginLocators.loginPassword;
    }
}
