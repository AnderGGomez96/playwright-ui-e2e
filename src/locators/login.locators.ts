import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/login.locators.ts'

export const loginLocators = {

    loginEmailAddress: {
        key: 'loginEmailAddress',
        description: 'Input "loginEmailAddress" para iniciar sesión',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loginEmailAddress
            { strategy: 'placeholder', value: 'Email Address', within: 'form[action="/login"]' },
            { strategy: 'css', value: 'input[data-qa="login-email"]' },
        ]
    } satisfies LocatorSpec,

    LoginPassword: {
        key: 'passwordLogin',
        description: 'input "password login" para iniciar sesión',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:passwordInput
            { strategy: 'placeholder', value: 'Password', within: 'form[action="/login"]' },
            { strategy: 'css', value: 'input[data-qa="login-password"]' },
        ]
    } satisfies LocatorSpec,

    loginButton: {
        key: 'loginPassword',
        description: 'Boton para iniciar sesión',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:loginButton
            { strategy: 'role', role: 'button', name: 'Login', within: 'form[action="/login"]' },
            { strategy: 'css', value: 'input[data-qa="login-button"]' }
        ]
    } satisfies LocatorSpec,

    loginAsText :{
        key: 'loginAsText',
        description: 'Login as <nombre> en la cabecera tras iniciar sesión',
        action: 'read',
        sourceFile: SOURCE,
        candidates:[
            //@heal-target:loginAsText
            {strategy:'text', value:'logged in as'},
            {strategy:'css', value:'a[href="/logout"]'}
        ]
    } satisfies LocatorSpec,

    loginError : {
        key: 'loginError',
        description: 'Mensaje de error al logearse',
        action: 'read',
        sourceFile: SOURCE,
        candidates:[
            //@heal-target:loginError
            {strategy:'text', value:'Your email or password is incorrect!'},
        ]
    } satisfies LocatorSpec

}
