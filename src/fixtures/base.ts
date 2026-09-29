import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { Healer} from '../healing/healer'
import { loadHealingConfig, type HealingConfig } from '../healing/config'
import { NavbarComponent } from '../components/navbar.component';
import { NAVBAR_ITEMS } from '../constant/navbar.options';

type MyFixtures = {
    loginPage: LoginPage,
    navbar:NavbarComponent,
    productPage: ProductPage,
    cartWithProduct: CartPage
};

type HealingFixtures = {
    healingConfig: HealingConfig;
    healer: Healer
}

export const test = base.extend<MyFixtures & HealingFixtures>({

    healingConfig: [
        async ({},use) => {await use(loadHealingConfig());},
        {option:true}
    ],

    healer: async ({page, healingConfig}, use, testInfo) =>{
        const healer = new Healer(page, {testInfo, config:healingConfig});
        await use(healer),
        await healer.flush()
    },

    navbar: async({page,healer}, use) => {
        await use(new NavbarComponent(page,healer))
    },

    loginPage: async ({ page,healer }, use) => {
        const loginpage = new LoginPage(page, healer);
        await loginpage.goto();
        await use(loginpage);
    },
    productPage: async ({ page,healer,navbar }, use) => {
        const productpage = new ProductPage(page,healer,navbar);
        await productpage.goto();
        await use(productpage);
    },
    cartWithProduct: async ({ productPage, page, healer }, use) => {
        const option = NAVBAR_ITEMS.Cart
        await productPage.addProductToCart('Blue Top');
        await productPage.navbar.navbarOption(option)
        await expect(page.locator('tr[id^="product-"]').filter({ hasText: 'Blue Top' })).toBeVisible();
        await use(new CartPage(page, healer));
    }
});

export {expect} from '@playwright/test';