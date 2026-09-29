import { test, expect } from '../../src/fixtures/base';

import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');


test('authenticate', async ({ loginPage, page }) => {
  await loginPage.usernameInput.fill('locanto@mail.com');
  await loginPage.passwordInput.fill('Hola1234*');
  await loginPage.loginButton.click();

  const logout = page.getByRole('link', { name: /logout/i });
  await expect(logout).toBeVisible();
  await expect(logout).toHaveAttribute('href', '/logout');

  await page.context().storageState({ path: authFile });
})


