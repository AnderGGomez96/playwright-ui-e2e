import { type Page, expect } from '@playwright/test'
import type { Healer } from '../healing'
import type { LocatorSpec } from '../healing/types'
import { signupLocators } from '../locators/signup.locators'
import { loginLocators } from '../locators/login.locators'

/** Campo del formulario de registro del paso 1. */
export type SignupField = 'name' | 'email'

/** Campo obligatorio del formulario de datos de la cuenta (paso 2). */
export type AccountField = 'name' | 'email' | 'password' | 'firstName'
  | 'lastName' | 'address' | 'country' | 'state' | 'city' | 'zipcode'
  | 'mobileNumber'

/** Datos del formulario "Enter Account Information" del paso 2. */
export interface AccountDetails {
  password: string; firstName: string; lastName: string; address: string
  country: string; state: string; city: string; zipcode: string
  mobileNumber: string
  title?: 'Mr' | 'Mrs'; day?: string; month?: string; year?: string
  company?: string; address2?: string; newsletter?: boolean; offers?: boolean
}

/**
 * POM del flujo de registro.
 *
 * Paso 1 vive en `/login` (bloque "New User Signup!"); el paso 2 y el alta
 * corresponden a tareas posteriores del módulo.
 */
export class SignupPage {

    constructor(
        private readonly page: Page,
        private readonly healer: Healer,
    ) { }

    async goto() {
        await this.page.goto('/login');
    }

    async fillSignupName(name: string) {
        await this.healer.fill(signupLocators.signupName, name);
    }

    async fillSignupEmail(email: string) {
        await this.healer.fill(signupLocators.signupEmail, email);
    }

    async submitSignup() {
        await this.healer.click(signupLocators.signupButton);
    }

    async startSignup(name: string, email: string) {
        await this.fillSignupName(name);
        await this.fillSignupEmail(email);
        await this.submitSignup();
    }

    async signupErrorMessage(): Promise<string> {
        return this.healer.text(signupLocators.signupError);
    }

    async signupValidationMessage(field: SignupField): Promise<string> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.validationMessage);
    }

    async signupFieldIsValid(field: SignupField): Promise<boolean> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.checkValidity());
    }

    async signupFieldTypeMismatch(field: SignupField): Promise<boolean> {
        const locator = await this.healer.resolve(this.locatorFor(field));
        return locator.evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
    }

    /** `data-qa` del elemento activo, o `null` si no tiene. */
    async focusedField(): Promise<string | null> {
        return this.page.evaluate(() => document.activeElement?.getAttribute('data-qa') ?? null);
    }

    async expectAccountInformationHidden(): Promise<void> {
        await expect(this.page.locator('h2:has-text("Enter Account Information")')).toHaveCount(0);
    }

    async expectAccountInformationVisible(): Promise<void> {
        await expect(this.page.locator('h2:has-text("Enter Account Information")')).toBeVisible();
        await expect(this.page.locator('input[data-qa="password"]')).toBeVisible();
    }

    async fillAccountName(name: string) {
        await this.healer.fill(signupLocators.accountName, name);
    }

    async accountNameValue(): Promise<string> {
        return (await this.healer.resolve(signupLocators.accountName)).inputValue();
    }

    async accountEmailValue(): Promise<string> {
        return (await this.healer.resolve(signupLocators.accountEmail)).inputValue();
    }

    async accountEmailDisabled(): Promise<boolean> {
        return (await this.healer.resolve(signupLocators.accountEmail)).isDisabled();
    }

    async accountValidationMessage(field: AccountField): Promise<string> {
        const locator = await this.healer.resolve(this.accountLocatorFor(field));
        return locator.evaluate((el: HTMLInputElement | HTMLSelectElement) => el.validationMessage);
    }

    async accountFieldIsValid(field: AccountField): Promise<boolean> {
        const locator = await this.healer.resolve(this.accountLocatorFor(field));
        return locator.evaluate((el: HTMLInputElement | HTMLSelectElement) => el.checkValidity());
    }

    async fillAccountInformation(details: AccountDetails) {
        if (details.title === 'Mr') await this.healer.click(signupLocators.titleMr);
        if (details.title === 'Mrs') await this.healer.click(signupLocators.titleMrs);
        await this.healer.fill(signupLocators.accountPassword, details.password);
        if (details.day) await this.selectOption(signupLocators.daySelect, details.day);
        if (details.month) await this.selectOption(signupLocators.monthSelect, details.month);
        if (details.year) await this.selectOption(signupLocators.yearSelect, details.year);
        if (details.newsletter) await this.healer.click(signupLocators.newsletterCheckbox);
        if (details.offers) await this.healer.click(signupLocators.offersCheckbox);
        await this.healer.fill(signupLocators.firstName, details.firstName);
        await this.healer.fill(signupLocators.lastName, details.lastName);
        if (details.company) await this.healer.fill(signupLocators.company, details.company);
        await this.healer.fill(signupLocators.address, details.address);
        if (details.address2) await this.healer.fill(signupLocators.address2, details.address2);
        await this.selectOption(signupLocators.countrySelect, details.country);
        await this.healer.fill(signupLocators.state, details.state);
        await this.healer.fill(signupLocators.city, details.city);
        await this.healer.fill(signupLocators.zipcode, details.zipcode);
        await this.healer.fill(signupLocators.mobileNumber, details.mobileNumber);
    }

    async createAccount() {
        await this.healer.click(signupLocators.createAccountButton);
    }

    /** Texto renderizado del heading de alta (CSS aplica `text-transform`). */
    async accountCreatedText(): Promise<string> {
        const locator = await this.healer.resolve(signupLocators.accountCreated);
        return locator.evaluate((el: HTMLElement) => el.innerText);
    }

    async continueAfterCreation() {
        await this.healer.click(signupLocators.continueButton);
    }

    async deleteAccount() {
        await this.healer.click(loginLocators.deleteAccountLink);
    }

    /** Texto renderizado del heading de borrado (CSS aplica `text-transform`). */
    async accountDeletedText(): Promise<string> {
        const locator = await this.healer.resolve(signupLocators.accountDeleted);
        return locator.evaluate((el: HTMLElement) => el.innerText);
    }

    private async selectOption(spec: LocatorSpec, value: string) {
        const locator = await this.healer.resolve(spec);
        await locator.selectOption(value);
    }

    private accountLocatorFor(field: AccountField) {
        const map = {
            name: signupLocators.accountName,
            email: signupLocators.accountEmail,
            password: signupLocators.accountPassword,
            firstName: signupLocators.firstName,
            lastName: signupLocators.lastName,
            address: signupLocators.address,
            country: signupLocators.countrySelect,
            state: signupLocators.state,
            city: signupLocators.city,
            zipcode: signupLocators.zipcode,
            mobileNumber: signupLocators.mobileNumber,
        } as const;
        return map[field];
    }

    private locatorFor(field: SignupField) {
        return field === 'name' ? signupLocators.signupName : signupLocators.signupEmail;
    }
}
