import { test, expect } from '../../../src/fixtures/base';
import { type NavbarOption } from '../../../src/constant/navbar.options';
import { navbarLocator } from '../../../src/locators/navbar.locators';
import { loginLocators } from '../../../src/locators/login.locators';
import { cssCandidateIndex } from '../../../src/healing';
import { SEEDED_USER } from '../../../src/constant/test-data';

const LOGGED_IN_OPTIONS: NavbarOption[] = [
  'home',
  'products',
  'cart',
  'testCases',
  'apiTesting',
  'videoTutorials',
  'contactUs',
];

test.describe('Navbar con sesión', () => {
  // El clic de Logout de NB-02 invalida la sesión del storageState en el sitio:
  // NB-03 corre antes y el test serial garantiza el orden con una sola sesión.
  test.describe.configure({ mode: 'serial' });

  test('NB-03: con sesión, el menú no ofrece la opción Signup / Login', async ({ healer, page }) => {
    await test.step('Dado que accedo al sitio con mi sesión de prueba', async () => {
      await page.goto('/');
    });

    await test.step('Entonces el menú no muestra la opción de registrarme o iniciar sesión', async () => {
      const signup = navbarLocator.option('signupLogin');
      await expect(healer.locator(signup, cssCandidateIndex(signup)), 'Con sesión no debe aparecer "Signup / Login"')
        .toHaveCount(0);
    });
  });

  test('NB-02: con sesión, el menú muestra las opciones internas, Logout, Delete Account y el nombre del usuario', async ({ navbar, healer, page }) => {
    await test.step('Dado que accedo al sitio con mi sesión de prueba', async () => {
      await page.goto('/');
    });

    await test.step('Entonces veo las 7 opciones internas del menú', async () => {
      await navbar.expectOptionsVisible(LOGGED_IN_OPTIONS);
    });

    await test.step('Y veo mi sesión activa con mi nombre y las opciones de cuenta', async () => {
      await navbar.expectLoggedInAs(SEEDED_USER.name);
      await navbar.expectLoggedInNav();
    });

    await test.step('Y las opciones de sesión tienen rol, nombre y destino correctos', async () => {
      const logout = await healer.resolve(loginLocators.logoutLink);
      await expect.soft(logout, 'Logout debe ser un enlace').toHaveRole('link');
      await expect.soft(logout, 'Logout debe exponer el nombre accesible "Logout"').toHaveAccessibleName(/Logout/);
      await expect.soft(logout, 'Logout debe apuntar a /logout').toHaveAttribute('href', '/logout');

      const deleteAccount = await healer.resolve(loginLocators.deleteAccountLink);
      await expect.soft(deleteAccount, 'Delete Account debe ser un enlace').toHaveRole('link');
      await expect.soft(deleteAccount, 'Delete Account debe exponer el nombre accesible "Delete Account"').toHaveAccessibleName(/Delete Account/);
      await expect.soft(deleteAccount, 'Delete Account debe apuntar a /delete_account').toHaveAttribute('href', '/delete_account');
    });

    await test.step('Cuando cierro sesión desde el menú', async () => {
      await navbar.logout();
    });

    await test.step('Entonces vuelvo al formulario de acceso y desaparecen las opciones de sesión', async () => {
      await expect(page, 'Tras cerrar sesión debo volver a la página de inicio de sesión').toHaveURL(/\/login$/);
      await navbar.expectLoggedOutNav();
    });
  });
});
