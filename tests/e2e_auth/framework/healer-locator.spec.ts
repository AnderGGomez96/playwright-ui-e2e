import { test, expect } from '../../../src/fixtures/base';
import { cssCandidateIndex } from '../../../src/healing/locator-factory';
import { loginLocators } from '../../../src/locators/login.locators';

test.describe('API de proyección de locators del healer con sesión activa', () => {

  test('HL-07: con sesión iniciada, el enlace de logout se proyecta desde su spec y está presente', async ({ healer, page }) => {
    await test.step('Dado que tengo la sesión iniciada y abro la página principal', async () => {
      await page.goto('/');
      await expect(
        page,
        'Con sesión iniciada debo quedar en la página principal del sitio',
      ).toHaveURL(/^https:\/\/automationexercise\.com\/$/);
    });

    await test.step('Cuando proyecto el locator del logout con el índice de su candidato css', async () => {
      await expect(
        healer.locator(loginLocators.logoutLink, cssCandidateIndex(loginLocators.logoutLink)),
        'Con sesión iniciada, el enlace Logout debe estar presente exactamente una vez',
      ).toHaveCount(1);
    });

    await test.step('Entonces la proyección no gasta la escalera ni registra eventos de curación', async () => {
      expect(
        healer.events,
        'Proyectar el locator del logout sin resolución no debe registrar eventos de healing',
      ).toHaveLength(0);
    });
  });
});
