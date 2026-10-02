import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { Healer} from '../healing/healer'
import { loadHealingConfig, type HealingConfig } from '../healing/config'
import { NavbarComponent } from '../components/navbar.component';

type MyFixtures = {
    loginPage: LoginPage,
    signupPage: SignupPage,
    navbar:NavbarComponent,
    productPage: ProductPage,
    cartPage: CartPage,
    cartWithProduct: CartPage
};

type HealingFixtures = {
    healingConfig: HealingConfig;
    healer: Healer
}

type ThrottleFixtures = {
    /** Pausa configurable entre pruebas (ver `E2E_TEST_DELAY_MS`). */
    testDelay: void;
}

/**
 * Milisegundos de pausa al terminar cada test, para no saturar el sitio
 * externo cuando responde "bajo carga". `0` (default) = sin pausa. Es un
 * throttle del runner, no un `waitForTimeout` de compensación dentro de un
 * test (prohibido por RNF-01).
 */
const testDelayMs = Number(process.env.E2E_TEST_DELAY_MS ?? 0)

export const test = base.extend<MyFixtures & HealingFixtures & ThrottleFixtures>({

    healingConfig: [
        async ({},use) => {await use(loadHealingConfig());},
        {option:true}
    ],

    healer: async ({page, healingConfig}, use, testInfo) =>{
        const healer = new Healer(page, {testInfo, config:healingConfig});
        await use(healer),
        await healer.flush()
    },

    testDelay: [async ({}, use) => {
        await use();
        if (Number.isFinite(testDelayMs) && testDelayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, testDelayMs));
        }
    }, { auto: true }],

    navbar: async({healer}, use) => {
        await use(new NavbarComponent(healer))
    },

    loginPage: async ({ page,healer }, use) => {
        const loginpage = new LoginPage(page, healer);
        await loginpage.goto();
        await use(loginpage);
    },
    signupPage: async ({ page, healer }, use) => {
        const signupPage = new SignupPage(page, healer);
        await signupPage.goto();
        await use(signupPage);
    },
    productPage: async ({ page,healer,navbar }, use) => {
        const productpage = new ProductPage(page,healer,navbar);
        await productpage.goto();
        await use(productpage);
    },
    cartPage: async ({ page, healer }, use) => {
        const cartPage = new CartPage(page, healer);
        await cartPage.goto();
        await use(cartPage);
    },
    cartWithProduct: async ({ productPage, cartPage }, use) => {
        await cartPage.goto();
        await cartPage.clearCart();
        await productPage.goto();
        await productPage.addProductToCart('Blue Top');
        await cartPage.goto();
        const row = await cartPage.productRow('Blue Top');
        await expect(row, 'El carrito debe mostrar la fila del producto agregado').toBeVisible();
        await use(cartPage);
    }
});

export {expect} from '@playwright/test';
