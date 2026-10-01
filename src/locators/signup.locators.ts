import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/signup.locators.ts'

/**
 * Selectores estables del área de registro (contrato H-01).
 *
 * Fuente única para los candidatos `css` de los `LocatorSpec` y para las
 * aserciones de ausencia de los POM: estas últimas no pasan por el healer.
 */
export const signupStableSelectors = {
    nameInput: 'input[data-qa="signup-name"]',
    accountHeading: 'h2:has-text("Enter Account Information")',
    accountPasswordInput: 'input[data-qa="password"]',
} as const

/**
 * Locators del flujo de registro.
 *
 * Paso 1 ("New User Signup!" en `/login`): nombre, email y botón Signup.
 * Primarios semánticos con `within` del form real y fallback `css` `data-qa`.
 * Máximo 2 candidatos.
 */
export const signupLocators = {

    signupName: {
        key: 'signupName',
        description: 'Campo de nombre del formulario de registro (paso 1)',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:signupName
            { strategy: 'placeholder', value: 'Name', within: 'form[action="/signup"]' },
            { strategy: 'css', value: signupStableSelectors.nameInput },
        ]
    } satisfies LocatorSpec,

    signupEmail: {
        key: 'signupEmail',
        description: 'Campo de email del formulario de registro (paso 1)',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:signupEmail
            { strategy: 'placeholder', value: 'Email Address', within: 'form[action="/signup"]' },
            { strategy: 'css', value: 'input[data-qa="signup-email"]' },
        ]
    } satisfies LocatorSpec,

    signupButton: {
        key: 'signupButton',
        description: 'Botón Signup que envía el formulario de registro (paso 1)',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:signupButton
            { strategy: 'role', role: 'button', name: 'Signup', within: 'form[action="/signup"]' },
            { strategy: 'css', value: 'button[data-qa="signup-button"]' },
        ]
    } satisfies LocatorSpec,

    signupError: {
        key: 'signupError',
        description: 'Mensaje de error del formulario de registro (email ya existente)',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:signupError
            { strategy: 'text', value: 'Email Address already exist!', within: '.signup-form' },
            { strategy: 'css', value: '.signup-form p' },
        ]
    } satisfies LocatorSpec,

    accountInformationHeading: {
        key: 'accountInformationHeading',
        description: 'Encabezado "Enter Account Information" del paso 2',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:accountInformationHeading
            { strategy: 'css', value: signupStableSelectors.accountHeading },
            { strategy: 'text', value: 'Enter Account Information', within: '.signup-form' },
        ]
    } satisfies LocatorSpec,

    titleMr: {
        key: 'titleMr',
        description: 'Opción de título Mr del paso 2',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:titleMr
            { strategy: 'css', value: '#id_gender1' },
            { strategy: 'css', value: 'input[name="title"][value="Mr"]' },
        ]
    } satisfies LocatorSpec,

    titleMrs: {
        key: 'titleMrs',
        description: 'Opción de título Mrs del paso 2',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:titleMrs
            { strategy: 'css', value: '#id_gender2' },
            { strategy: 'css', value: 'input[name="title"][value="Mrs"]' },
        ]
    } satisfies LocatorSpec,

    accountName: {
        key: 'accountName',
        description: 'Campo de nombre precargado en el paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:accountName
            { strategy: 'css', value: 'input[data-qa="name"]' },
            { strategy: 'css', value: '#name' },
        ]
    } satisfies LocatorSpec,

    accountEmail: {
        key: 'accountEmail',
        description: 'Campo de email precargado y deshabilitado en el paso 2',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:accountEmail
            { strategy: 'css', value: 'input[data-qa="email"]' },
            { strategy: 'css', value: '#email' },
        ]
    } satisfies LocatorSpec,

    accountPassword: {
        key: 'accountPassword',
        description: 'Campo de contraseña del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:accountPassword
            { strategy: 'css', value: signupStableSelectors.accountPasswordInput },
            { strategy: 'css', value: '#password' },
        ]
    } satisfies LocatorSpec,

    daySelect: {
        key: 'daySelect',
        description: 'Selector de día de nacimiento del paso 2',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:daySelect
            { strategy: 'css', value: 'select[data-qa="days"]' },
            { strategy: 'css', value: '#days' },
        ]
    } satisfies LocatorSpec,

    monthSelect: {
        key: 'monthSelect',
        description: 'Selector de mes de nacimiento del paso 2',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:monthSelect
            { strategy: 'css', value: 'select[data-qa="months"]' },
            { strategy: 'css', value: '#months' },
        ]
    } satisfies LocatorSpec,

    yearSelect: {
        key: 'yearSelect',
        description: 'Selector de año de nacimiento del paso 2',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:yearSelect
            { strategy: 'css', value: 'select[data-qa="years"]' },
            { strategy: 'css', value: '#years' },
        ]
    } satisfies LocatorSpec,

    newsletterCheckbox: {
        key: 'newsletterCheckbox',
        description: 'Casilla de suscripción a la newsletter del paso 2',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:newsletterCheckbox
            { strategy: 'css', value: '#newsletter' },
            { strategy: 'css', value: 'input[name="newsletter"]' },
        ]
    } satisfies LocatorSpec,

    offersCheckbox: {
        key: 'offersCheckbox',
        description: 'Casilla de recepción de ofertas del paso 2',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:offersCheckbox
            { strategy: 'css', value: '#optin' },
            { strategy: 'css', value: 'input[name="optin"]' },
        ]
    } satisfies LocatorSpec,

    firstName: {
        key: 'firstName',
        description: 'Campo de nombre del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:firstName
            { strategy: 'css', value: 'input[data-qa="first_name"]' },
            { strategy: 'css', value: '#first_name' },
        ]
    } satisfies LocatorSpec,

    lastName: {
        key: 'lastName',
        description: 'Campo de apellido del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:lastName
            { strategy: 'css', value: 'input[data-qa="last_name"]' },
            { strategy: 'css', value: '#last_name' },
        ]
    } satisfies LocatorSpec,

    company: {
        key: 'company',
        description: 'Campo de compañía del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:company
            { strategy: 'css', value: 'input[data-qa="company"]' },
            { strategy: 'css', value: '#company' },
        ]
    } satisfies LocatorSpec,

    address: {
        key: 'address',
        description: 'Campo de dirección del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:address
            { strategy: 'css', value: 'input[data-qa="address"]' },
            { strategy: 'css', value: '#address1' },
        ]
    } satisfies LocatorSpec,

    address2: {
        key: 'address2',
        description: 'Campo de dirección secundaria del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:address2
            { strategy: 'css', value: 'input[data-qa="address2"]' },
            { strategy: 'css', value: '#address2' },
        ]
    } satisfies LocatorSpec,

    countrySelect: {
        key: 'countrySelect',
        description: 'Selector de país del paso 2',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:countrySelect
            { strategy: 'css', value: 'select[data-qa="country"]' },
            { strategy: 'css', value: '#country' },
        ]
    } satisfies LocatorSpec,

    state: {
        key: 'state',
        description: 'Campo de estado o provincia del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:state
            { strategy: 'css', value: 'input[data-qa="state"]' },
            { strategy: 'css', value: '#state' },
        ]
    } satisfies LocatorSpec,

    city: {
        key: 'city',
        description: 'Campo de ciudad del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:city
            { strategy: 'css', value: 'input[data-qa="city"]' },
            { strategy: 'css', value: '#city' },
        ]
    } satisfies LocatorSpec,

    zipcode: {
        key: 'zipcode',
        description: 'Campo de código postal del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:zipcode
            { strategy: 'css', value: 'input[data-qa="zipcode"]' },
            { strategy: 'css', value: '#zipcode' },
        ]
    } satisfies LocatorSpec,

    mobileNumber: {
        key: 'mobileNumber',
        description: 'Campo de número de móvil del paso 2',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:mobileNumber
            { strategy: 'css', value: 'input[data-qa="mobile_number"]' },
            { strategy: 'css', value: '#mobile_number' },
        ]
    } satisfies LocatorSpec,

    createAccountButton: {
        key: 'createAccountButton',
        description: 'Botón Create Account que envía el paso 2',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:createAccountButton
            { strategy: 'css', value: 'button[data-qa="create-account"]' },
            { strategy: 'role', role: 'button', name: 'Create Account' },
        ]
    } satisfies LocatorSpec,

    accountCreated: {
        key: 'accountCreated',
        description: 'Encabezado "Account Created!" de la página de alta',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:accountCreated
            { strategy: 'css', value: 'h2[data-qa="account-created"]' },
            { strategy: 'text', value: 'Account Created!' },
        ]
    } satisfies LocatorSpec,

    continueButton: {
        key: 'continueButton',
        description: 'Enlace Continue de la página de alta o borrado',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:continueButton
            { strategy: 'css', value: '[data-qa="continue-button"]' },
            { strategy: 'role', role: 'link', name: 'Continue' },
        ]
    } satisfies LocatorSpec,

    accountDeleted: {
        key: 'accountDeleted',
        description: 'Encabezado "Account Deleted!" de la página de borrado',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:accountDeleted
            { strategy: 'css', value: 'h2[data-qa="account-deleted"]' },
            { strategy: 'text', value: 'Account Deleted!' },
        ]
    } satisfies LocatorSpec,

}
