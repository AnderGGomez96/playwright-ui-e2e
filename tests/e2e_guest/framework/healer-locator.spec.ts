import { test, expect } from '../../../src/fixtures/base';
import { candidateToLocator, cssCandidateIndex } from '../../../src/healing/locator-factory';
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

  test('HL-03: un índice de candidato fuera de rango falla con la key y el índice pedido', async ({ healer, loginPage, page }) => {
    await test.step('Dado que estoy en la página de inicio de sesión sin sesión', async () => {
      await expect(page, 'Debo estar en la página de inicio de sesión').toHaveURL(/\/login$/);
    });

    await test.step('Cuando pido el índice negativo -1', async () => {
      expect(
        () => healer.locator(loginLocators.loginEmail, -1),
        'Un índice negativo debe lanzar RangeError en vez de devolver un locator inservible',
      ).toThrow(RangeError);
      expect(
        () => healer.locator(loginLocators.loginEmail, -1),
        'El error debe nombrar la key loginEmail y el índice -1',
      ).toThrow(/loginEmail/);
      expect(
        () => healer.locator(loginLocators.loginEmail, -1),
        'El error debe incluir el índice -1 pedido',
      ).toThrow(/-1/);
    });

    await test.step('Y pido justo el primer índice inválido, candidates.length', async () => {
      const fueraDeRango = loginLocators.loginEmail.candidates.length;
      expect(
        () => healer.locator(loginLocators.loginEmail, fueraDeRango),
        'Pedir candidates.length debe lanzar RangeError porque el último índice válido es length - 1',
      ).toThrow(RangeError);
      expect(
        () => healer.locator(loginLocators.loginEmail, fueraDeRango),
        'El mensaje debe nombrar la key loginEmail y el índice fuera de rango',
      ).toThrow(new RegExp(`Índice ${fueraDeRango} fuera de rango para el spec "loginEmail"`));
    });

    await test.step('Y pido un índice claramente desmedido como 99', async () => {
      expect(
        () => healer.locator(loginLocators.loginEmail, 99),
        'Un índice desmedido debe lanzar RangeError, no devolver un locator silencioso',
      ).toThrow(RangeError);
      expect(
        () => healer.locator(loginLocators.loginEmail, 99),
        'El error debe nombrar la key loginEmail',
      ).toThrow(/loginEmail/);
      expect(
        () => healer.locator(loginLocators.loginEmail, 99),
        'El error debe incluir el índice 99 pedido',
      ).toThrow(/99/);
    });

    await test.step('Y el último índice válido se proyecta y es visible', async () => {
      const ultimoValido = loginLocators.loginEmail.candidates.length - 1;
      expect(
        () => healer.locator(loginLocators.loginEmail, ultimoValido),
        'El último índice válido no debe lanzar',
      ).not.toThrow();
      await expect(
        healer.locator(loginLocators.loginEmail, ultimoValido),
        'El candidato del último índice válido debe apuntar al campo de email visible',
      ).toBeVisible();
    });
  });

  test('HL-04: un candidato ambiguo se acota con .first() y no rompe el modo estricto', async ({ healer, loginPage, page }) => {
    const specAmbiguo: LocatorSpec = {
      key: 'frameworkEmailAmbiguo',
      description: 'Spec local cuyo único candidato css coincide con los dos campos de email de /login',
      action: 'assert',
      candidates: [{ strategy: 'css', value: 'input[placeholder="Email Address"]' }],
    };

    await test.step('Dado que estoy en la página de inicio de sesión sin sesión', async () => {
      await expect(page, 'Debo estar en la página de inicio de sesión').toHaveURL(/\/login$/);
    });

    await test.step('Y confirmo que el candidato es ambiguo y coincide con dos campos reales', async () => {
      await expect(
        candidateToLocator(page, specAmbiguo.candidates[0]),
        'El candidato ambiguo debe coincidir con los dos campos de email reales de la página',
      ).toHaveCount(2);
    });

    await test.step('Cuando proyecto el locator ambiguo por la healer', async () => {
      await expect(
        healer.locator(specAmbiguo),
        'El locator ambiguo debe acotarse con .first() y mostrar el primer campo de email sin violar el modo estricto',
      ).toBeVisible();
      await expect(
        healer.locator(specAmbiguo),
        'El locator acotado con .first() debe contar exactamente uno pese a las dos coincidencias reales',
      ).toHaveCount(1);
    });
  });

  test('HL-05: proyectar locators no gasta la escalera ni deja rastro de curación', async ({ healer, loginPage, page }) => {
    const specsPresentes: LocatorSpec[] = [
      loginLocators.loginEmail,
      loginLocators.loginPassword,
    ];
    const specsAusentes: LocatorSpec[] = [
      loginLocators.logoutLink,
      loginLocators.deleteAccountLink,
      loginLocators.loginError,
    ];

    await test.step('Dado que estoy en la página de inicio de sesión sin sesión', async () => {
      await expect(page, 'Debo estar en la página de inicio de sesión').toHaveURL(/\/login$/);
    });

    await test.step('Cuando proyecto repetidamente locators presentes y ausentes por la healer', async () => {
      for (let ronda = 0; ronda < 2; ronda++) {
        for (const spec of specsPresentes) {
          const locator = ronda === 0
            ? healer.locator(spec)
            : healer.locator(spec, cssCandidateIndex(spec));
          await expect(
            locator,
            `El locator presente "${spec.key}" debe encontrar un único elemento real sin gastar la escalera`,
          ).toHaveCount(1);
        }
        for (const spec of specsAusentes) {
          await expect(
            healer.locator(spec, cssCandidateIndex(spec)),
            `El locator ausente "${spec.key}" debe confirmar su ausencia real sin gastar la escalera`,
          ).toHaveCount(0);
        }
      }
    });

    await test.step('Entonces la proyección no registra ningún evento de healing', async () => {
      expect(
        healer.events,
        'Proyectar locators sin resolución no debe registrar eventos de healing',
      ).toHaveLength(0);
    });

    await test.step('Y no registra niveles de caché ni de IA', async () => {
      expect(
        healer.events.filter((event) => event.level === 'cache' || event.level === 'ai'),
        'Proyectar locators sin resolución no debe generar eventos de nivel cache ni ai',
      ).toHaveLength(0);
    });
  });

  test('HL-06: proyectar diez ausencias no agota el presupuesto de gobernanza', async ({ healer, loginPage, page }) => {
    const specsAusentes: LocatorSpec[] = [
      loginLocators.logoutLink,
      loginLocators.deleteAccountLink,
    ];
    const totalIteraciones = 10;

    await test.step('Dado que estoy en la página de inicio de sesión sin sesión', async () => {
      await expect(page, 'Debo estar en la página de inicio de sesión sin sesión').toHaveURL(/\/login$/);
    });

    await test.step('Cuando proyecto diez veces los locators ausentes con su candidato css', async () => {
      for (let iteracion = 0; iteracion < totalIteraciones; iteracion++) {
        const spec = specsAusentes[iteracion % specsAusentes.length];
        await expect(
          healer.locator(spec, cssCandidateIndex(spec)),
          `La iteración ${iteracion + 1} debe confirmar que "${spec.key}" está ausente sin gastar el presupuesto de gobernanza`,
        ).toHaveCount(0);
      }
    });

    await test.step('Entonces ninguna proyección registró un evento de curación', async () => {
      expect(
        healer.events,
        'Diez proyecciones sobre elementos ausentes no deben registrar eventos de healing ni consumir curaciones',
      ).toHaveLength(0);
    });
  });
});
