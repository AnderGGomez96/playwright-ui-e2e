import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { SignupPage } from '../pages/signup.page';
import { Healer} from '../healing/healer'
import { loadHealingConfig, type HealingConfig } from '../healing/config'

type MyFixtures = {
    loginPage: LoginPage,
    signupPage: SignupPage
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

    loginPage: async ({ page,healer }, use) => {
        const loginpage = new LoginPage(page, healer);
        await loginpage.goto();
        await use(loginpage);
    },
    signupPage: async ({ page, healer }, use) => {
        const signupPage = new SignupPage(page, healer);
        await signupPage.goto();
        await use(signupPage);
    }
});

export {expect} from '@playwright/test';
