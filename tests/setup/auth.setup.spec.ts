import { test, expect } from '../../src/fixtures/base';
import { SEEDED_USER } from '../../src/constant/test-data';

import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test('autenticación de la sesión', async ({ loginPage, page }) => {
  await test.step('Dado que inicio sesión con el usuario de prueba', async () => {
    await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
  }, { subtitle: SEEDED_USER.email });

  await test.step('Entonces veo mi sesión activa en el encabezado', async () => {
    await expect.poll(() => loginPage.loggedInAsText(), { message: 'El encabezado debe mostrar "Logged in as Locanto"' })
      .toContain('Logged in as Locanto');
  });

  await test.step('Y guardo el estado de sesión para los tests autenticados', async () => {
    await page.context().storageState({ path: authFile });
  });
})
