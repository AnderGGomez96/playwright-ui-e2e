import { test, expect } from '../../src/fixtures/base';
import { SEEDED_USER } from '../../src/constant/test-data';

import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test('autenticación de la sesión', async ({ loginPage, page }) => {
  await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);

  await expect.poll(() => loginPage.loggedInAsText()).toContain('Logged in as Locanto');

  await page.context().storageState({ path: authFile });
})
