import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/login.locators.ts'

/**
 * Selectores estables del área de login (contrato H-01).
 *
 * Fuente única para los candidatos `css` de los `LocatorSpec` y para las
 * aserciones de ausencia de los POM: estas últimas no pasan por el healer
 * (resolver un elemento ausente gastaría la escalera y podría curar de más).
 */
export const loginStableSelectors = {
    emailInput: 'input[data-qa="login-email"]',
    logoutLink: 'a[href="/logout"]',
    deleteAccountLink: 'a[href="/delete_account"]',
    formError: '.login-form p',
} as const

/**
 * Locators del flujo de login y del estado de sesión.
 *
 * Primarios semánticos (`placeholder`/`role`/`text` con `within` real) y
 * fallback `css` anclado en `data-qa`/`href` estable. Máximo 2 candidatos.
 */
export const loginLocators = {

    loginEmail: {
        key: 'loginEmail',
        description: 'Campo de email del formulario de inicio de sesión',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loginEmail
            { strategy: 'placeholder', value: 'Email Address', within: 'form[action="/login"]' },
            { strategy: 'css', value: loginStableSelectors.emailInput },
        ]
    } satisfies LocatorSpec,

    loginPassword: {
        key: 'loginPassword',
        description: 'Campo de contraseña del formulario de inicio de sesión',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loginPassword
            { strategy: 'placeholder', value: 'Password', within: 'form[action="/login"]' },
            { strategy: 'css', value: 'input[data-qa="login-password"]' },
        ]
    } satisfies LocatorSpec,

    loginButton: {
        key: 'loginButton',
        description: 'Botón Login que envía el formulario de inicio de sesión',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loginButton
            { strategy: 'role', role: 'button', name: 'Login', within: 'form[action="/login"]' },
            { strategy: 'css', value: 'button[data-qa="login-button"]' },
        ]
    } satisfies LocatorSpec,

    loginError: {
        key: 'loginError',
        description: 'Mensaje de error mostrado al fallar el inicio de sesión',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loginError
            { strategy: 'text', value: 'Your email or password is incorrect!', within: '.login-form' },
            { strategy: 'css', value: loginStableSelectors.formError },
        ]
    } satisfies LocatorSpec,

    loggedInAsText: {
        key: 'loggedInAsText',
        description: 'Texto "Logged in as <nombre>" de la cabecera con sesión iniciada',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loggedInAsText
            { strategy: 'text', value: 'Logged in as', within: '.shop-menu' },
            { strategy: 'css', value: '.shop-menu a:has-text("Logged in as")' },
        ]
    } satisfies LocatorSpec,

    logoutLink: {
        key: 'logoutLink',
        description: 'Enlace Logout de la cabecera con sesión iniciada',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:logoutLink
            { strategy: 'role', role: 'link', name: 'Logout', within: '.shop-menu' },
            { strategy: 'css', value: loginStableSelectors.logoutLink },
        ]
    } satisfies LocatorSpec,

    deleteAccountLink: {
        key: 'deleteAccountLink',
        description: 'Enlace Delete Account de la cabecera con sesión iniciada',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:deleteAccountLink
            { strategy: 'role', role: 'link', name: 'Delete Account', within: '.shop-menu' },
            { strategy: 'css', value: loginStableSelectors.deleteAccountLink },
        ]
    } satisfies LocatorSpec,

}
