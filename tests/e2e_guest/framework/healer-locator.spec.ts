import { test, expect } from '../../../src/fixtures/base';
import { cssCandidateIndex } from '../../../src/healing/locator-factory';
import type { LocatorSpec } from '../../../src/healing/types';
import { loginLocators } from '../../../src/locators/login.locators';
import { signupLocators } from '../../../src/locators/signup.locators';

test.describe('API de proyección de locators del healer', () => {

  test('HL-01: el campo de email se proyecta desde los candidatos del spec sin gastar la escalera', async ({ healer, loginPage, page }) => {
    await test.step('Dado que estoy en la página de inicio de sesión sin sesión', async () => {
      await expect(page, 'Debo estar en la página de inicio de sesión').toHaveURL(/\/login$/);
    });

    await test.step('Cuando proyecto el locator del email con el candidato primario', async () => {
      await expect(
        healer.locator(loginLocators.loginEmail),
        'El campo de email debe estar presente exactamente una vez',
      ).toHaveCount(1);
    });

    await test.step('Y lo proyecto con el índice del candidato css del spec', async () => {
      await expect(
        healer.locator(loginLocators.loginEmail, cssCandidateIndex(loginLocators.loginEmail)),
        'El candidato css del email debe encontrar el mismo campo presente',
      ).toHaveCount(1);
    });

    await test.step('Y confirmo que el heading de registro usa el candidato css en el índice 0', async () => {
      expect(
        cssCandidateIndex(signupLocators.accountInformationHeading),
        'El heading de registro debe tener su candidato css en el índice 0',
      ).toBe(0);
    });

    await test.step('Y confirmo que omitir el índice equivale al candidato 0', async () => {
      await expect(
        healer.locator(loginLocators.loginEmail, 0),
        'Omitir el índice debe equivaler al candidato primario',
      ).toHaveCount(1);
    });

    await test.step('Y confirmo que el último índice válido se proyecta sin lanzar', async () => {
      const lastIndex = loginLocators.loginEmail.candidates.length - 1;
      expect(
        () => healer.locator(loginLocators.loginEmail, lastIndex),
        'El último índice válido no debe lanzar',
      ).not.toThrow();
    });

    await test.step('Y con un spec sin candidato css la proyección falla de forma explícita', async () => {
      const specSinCss: LocatorSpec = {
        key: 'frameworkSinCss',
        description: 'Spec local de prueba sin candidato css',
        action: 'assert',
        candidates: [{ strategy: 'role', role: 'button', name: 'Boton Inexistente' }],
      };
      expect(
        () => cssCandidateIndex(specSinCss),
        'Un spec sin candidato css debe lanzar RangeError',
      ).toThrow(RangeError);
      expect(
        () => cssCandidateIndex(specSinCss),
        'El error debe nombrar la key del spec sin candidato css',
      ).toThrow(/frameworkSinCss/);
    });
  });

  test('HL-02: sin sesión, el enlace de logout se proyecta desde el spec y no existe', async ({ healer, loginPage, page }) => {
    await test.step('Dado que estoy en la página de inicio de sesión sin sesión', async () => {
      await expect(page, 'Debo estar en la página de inicio de sesión').toHaveURL(/\/login$/);
    });

    await test.step('Cuando proyecto el locator del logout con el índice del candidato css', async () => {
      await expect(
        healer.locator(loginLocators.logoutLink, cssCandidateIndex(loginLocators.logoutLink)),
        'Sin sesión, el enlace Logout no debe existir en el navbar',
      ).toHaveCount(0);
    });
  });
});
