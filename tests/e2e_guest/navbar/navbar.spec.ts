import { test, expect } from '../../../src/fixtures/base';
import { NAVBAR_ITEMS, type NavbarOption } from '../../../src/constant/navbar.options';

const GUEST_OPTIONS: NavbarOption[] = [
  'home',
  'products',
  'cart',
  'signupLogin',
  'testCases',
  'apiTesting',
  'videoTutorials',
  'contactUs',
];

const INTERNAL_OPTIONS: NavbarOption[] = [
  'home',
  'products',
  'cart',
  'signupLogin',
  'testCases',
  'apiTesting',
  'contactUs',
];

test.describe('Navbar sin sesión', () => {
  test('NB-01: sin sesión, las 8 opciones del menú existen, muestran su destino real y las internas navegan', async ({ navbar, page }) => {
    await test.step('Dado que navego por el sitio como invitado', async () => {
      await page.goto('/');
    });

    await test.step('Entonces veo las 8 opciones del menú', async () => {
      await navbar.expectOptionsVisible(GUEST_OPTIONS);
    });

    await test.step('Y cada opción apunta al href real de su enlace', async () => {
      for (const key of GUEST_OPTIONS) {
        const href = await navbar.optionHref(key);
        expect(href, `El enlace "${NAVBAR_ITEMS[key].label}" debe apuntar a ${NAVBAR_ITEMS[key].href}`)
          .toBe(NAVBAR_ITEMS[key].href);
      }
    });

    await test.step('Y las 7 opciones internas me llevan a su destino real', async () => {
      for (const key of INTERNAL_OPTIONS) {
        const expectedPath = NAVBAR_ITEMS[key].href;
        await page.goto('/');
        await navbar.navbarOption(key);
        expect(new URL(page.url()).pathname, `El enlace "${NAVBAR_ITEMS[key].label}" debe llevar a ${expectedPath}`)
          .toBe(expectedPath);
      }
    });
  });

  test('NB-03: sin sesión, el menú no ofrece Logout, Delete Account ni el estado "Logged in as"', async ({ navbar, page }) => {
    await test.step('Dado que navego por el sitio como invitado', async () => {
      await page.goto('/');
    });

    await test.step('Entonces no veo opciones de una sesión iniciada', async () => {
      await navbar.expectLoggedOutNav();
    });
  });
});
