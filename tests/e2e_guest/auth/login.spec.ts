import { test, expect } from '../../../src/fixtures/base';
import { SEEDED_USER, buildUniqueUser } from '../../../src/constant/test-data';
import { loginLocators } from '../../../src/locators/login.locators';

test.describe('Inicio de sesión', () => {

  test('L-01: inicio de sesión válido muestra la sesión activa', async ({ loginPage, healer, page }) => {
    await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);

    await expect(page).toHaveURL(/\/$/);
    expect(await loginPage.loggedInAsText()).toContain('Logged in as Locanto');
    const logoutLink = await healer.resolve(loginLocators.logoutLink);
    await expect(logoutLink).toBeVisible();
    await loginPage.expectNoLoginError();
  });

  test('L-07: con sesión activa, visitar /login redirige a Home', async ({ loginPage, page }) => {
    await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL(/\/$/);

    await loginPage.goto();

    await expect(page).toHaveURL(/\/$/);
    await loginPage.expectAuthFormsHidden();
  });

  test('L-02: email no registrado no inicia sesión y muestra el error genérico', async ({ loginPage, page }) => {
    const { email, password } = buildUniqueUser('l02');
    await loginPage.login(email, password);

    expect(await loginPage.loginErrorMessage()).toBe('Your email or password is incorrect!');
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoggedOutNav();
  });

  test('L-03: contraseña incorrecta muestra el mismo error genérico', async ({ loginPage, page }) => {
    await loginPage.login(SEEDED_USER.email, 'Incorrecta1*');

    expect(await loginPage.loginErrorMessage()).toBe('Your email or password is incorrect!');
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoggedOutNav();
  });

  test('L-04: email malformado bloquea el envío y enfoca el email', async ({ loginPage, page }) => {
    await loginPage.login('locanto@', 'x');

    expect(await loginPage.loginFieldIsValid('email')).toBe(false);
    expect(await loginPage.loginFieldTypeMismatch('email')).toBe(true);
    expect(await loginPage.focusedField()).toBe('login-email');
    const message = await loginPage.loginEmailValidationMessage();
    expect(message).toContain("'locanto@' is incomplete.");
    expect(message).toContain("'@'");

    await expect(page).toHaveURL(/\/login$/);
  });

  test('L-05: sin datos bloquea el envío y enfoca el email', async ({ loginPage, page }) => {
    await loginPage.login('', '');

    expect(await loginPage.loginFieldIsValid('email')).toBe(false);
    expect(await loginPage.loginFieldIsValid('password')).toBe(false);
    expect(await loginPage.loginEmailValidationMessage()).toBe('Please fill out this field.');
    expect(await loginPage.loginPasswordValidationMessage()).toBe('Please fill out this field.');
    expect(await loginPage.focusedField()).toBe('login-email');

    await expect(page).toHaveURL(/\/login$/);
  });

  test('L-06: el logout cierra la sesión y vuelve al formulario', async ({ loginPage, page }) => {
    await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
    await expect(page).toHaveURL(/\/$/);

    await loginPage.logout();

    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoginFormVisible();
    await loginPage.expectLoggedOutNav();
  });
});
