import { test, expect } from '../../../src/fixtures/base';
import { SEEDED_USER, buildUniqueUser, SIGNUP_COUNTRY, SIGNUP_DOB } from '../../../src/constant/test-data';

test.describe('Registro - paso 1 (validación nativa)', () => {

  test('R-01: sin datos el envío se bloquea y ambos campos quedan inválidos', async ({ signupPage, page }) => {
    await signupPage.submitSignup();

    expect(await signupPage.signupFieldIsValid('name')).toBe(false);
    expect(await signupPage.signupFieldIsValid('email')).toBe(false);
    expect(await signupPage.signupValidationMessage('name')).toBe('Please fill out this field.');
    expect(await signupPage.signupValidationMessage('email')).toBe('Please fill out this field.');
    expect(await signupPage.focusedField()).toBe('signup-name');

    await expect(page).toHaveURL(/\/login$/);
    await signupPage.expectAccountInformationHidden();
  });

  test('R-02: con nombre cargado y email vacío enfoca el email', async ({ signupPage, page }) => {
    await signupPage.fillSignupName('Locanto Prueba');
    await signupPage.submitSignup();

    expect(await signupPage.focusedField()).toBe('signup-email');
    expect(await signupPage.signupValidationMessage('email')).toBe('Please fill out this field.');
    expect(await signupPage.signupFieldIsValid('email')).toBe(false);

    await expect(page).toHaveURL(/\/login$/);
    await signupPage.expectAccountInformationHidden();
  });

  test('R-03: con email cargado y nombre vacío enfoca el nombre', async ({ signupPage, page }) => {
    await signupPage.fillSignupEmail('e2e.t03@mail.com');
    await signupPage.submitSignup();

    expect(await signupPage.focusedField()).toBe('signup-name');
    expect(await signupPage.signupValidationMessage('name')).toBe('Please fill out this field.');
    expect(await signupPage.signupFieldIsValid('name')).toBe(false);

    await expect(page).toHaveURL(/\/login$/);
    await signupPage.expectAccountInformationHidden();
  });

  test('R-05: email incompleto es typeMismatch y enfoca el email', async ({ signupPage, page }) => {
    await signupPage.fillSignupName('Locanto Prueba');
    await signupPage.fillSignupEmail('locanto@');
    await signupPage.submitSignup();

    expect(await signupPage.focusedField()).toBe('signup-email');
    expect(await signupPage.signupFieldIsValid('email')).toBe(false);
    expect(await signupPage.signupFieldTypeMismatch('email')).toBe(true);
    const message = await signupPage.signupValidationMessage('email');
    expect(message).toContain("'@'");
    expect(message).toContain('is incomplete');

    await expect(page).toHaveURL(/\/login$/);
    await signupPage.expectAccountInformationHidden();
  });
});

test.describe('Registro - email ya registrado (paso 1)', () => {

  test('R-04: email ya registrado es rechazado por el servidor sin crear cuenta', async ({ signupPage, page }) => {
    await signupPage.fillSignupName(SEEDED_USER.name);
    await signupPage.fillSignupEmail(SEEDED_USER.email);
    expect(await signupPage.signupFieldIsValid('name')).toBe(true);
    expect(await signupPage.signupFieldIsValid('email')).toBe(true);

    await signupPage.submitSignup();

    expect(await signupPage.signupErrorMessage()).toBe('Email Address already exist!');
    await expect(page).toHaveURL(/\/signup$/);
    await signupPage.expectAccountInformationHidden();
  });
});

test.describe('Registro - paso 2 (datos de la cuenta)', () => {

  test('R-06: transición al paso 2 con datos precargados y edición del nombre', async ({ signupPage, page }) => {
    const user = buildUniqueUser('r06');
    await signupPage.startSignup(user.name, user.email);

    await test.step('transición: el paso 2 muestra los datos precargados', async () => {
      await expect(page).toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
      expect(await signupPage.accountNameValue()).toBe(user.name);
      expect(await signupPage.accountEmailValue()).toBe(user.email);
    });

    await test.step('edición: el nombre cambia y el email sigue deshabilitado', async () => {
      await signupPage.fillAccountName('Nombre Editado');
      expect(await signupPage.accountNameValue()).toBe('Nombre Editado');
      expect(await signupPage.accountEmailDisabled()).toBe(true);
      expect(await signupPage.accountEmailValue()).toBe(user.email);

      await expect(page).toHaveURL(/\/signup$/);
    });
  });
});

test.describe('Registro - alta completa (R-07)', () => {

  test('R-07: crea la cuenta con todos los datos y la elimina al final', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r07');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('paso 1: registro con datos únicos', async () => {
      await signupPage.startSignup(user.name, user.email);
      await expect(page).toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('datos de la cuenta: completar todos los campos', async () => {
      await signupPage.fillAccountInformation({
        password: user.password,
        title: 'Mr',
        day: SIGNUP_DOB.day,
        month: SIGNUP_DOB.month,
        year: SIGNUP_DOB.year,
        newsletter: true,
        offers: true,
        firstName: 'Ander',
        lastName: 'Gomez',
        company: 'ACME',
        address: 'Calle Falsa 123',
        address2: 'Depto 4',
        country: SIGNUP_COUNTRY,
        state: 'Ontario',
        city: 'Toronto',
        zipcode: 'M5V 2T6',
        mobileNumber: '1234567890',
      });
    });

    await test.step('alta: crear la cuenta', async () => {
      await signupPage.createAccount();
      await expect(page).toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText()).toContain('ACCOUNT CREATED!');

      await signupPage.continueAfterCreation();
      await expect(page).toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText()).toContain(`Logged in as ${user.name}`);
    });

    await test.step('limpieza: eliminar la cuenta y verificar el rechazo', async () => {
      await signupPage.deleteAccount();
      await expect(page).toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText()).toContain('ACCOUNT DELETED!');

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      expect(await loginPage.loginErrorMessage()).toBe('Your email or password is incorrect!');
    });
  });
});

test.describe('Registro - alta solo con obligatorios (R-08/R-12)', () => {

  test('R-08: crea la cuenta solo con campos obligatorios y la elimina', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r08');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('paso 1: registro con datos únicos', async () => {
      await signupPage.startSignup(user.name, user.email);
      await expect(page).toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('datos de la cuenta: solo obligatorios', async () => {
      await signupPage.fillAccountInformation({
        password: user.password,
        firstName: 'Ander',
        lastName: 'Gomez',
        address: 'Calle Falsa 123',
        country: SIGNUP_COUNTRY,
        state: 'Ontario',
        city: 'Toronto',
        zipcode: 'M5V 2T6',
        mobileNumber: '1234567890',
      });
    });

    await test.step('alta: crear la cuenta', async () => {
      await signupPage.createAccount();
      await expect(page).toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText()).toContain('ACCOUNT CREATED!');

      await signupPage.continueAfterCreation();
      await expect(page).toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText()).toContain(`Logged in as ${user.name}`);
    });

    await test.step('limpieza: eliminar la cuenta y verificar el rechazo', async () => {
      await signupPage.deleteAccount();
      await expect(page).toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText()).toContain('ACCOUNT DELETED!');

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      expect(await loginPage.loginErrorMessage()).toBe('Your email or password is incorrect!');
    });
  });

  test('R-12: acepta una contraseña de un carácter y limpia la cuenta', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r12');
    const oneCharPassword = 'x';
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('paso 1: registro con datos únicos', async () => {
      await signupPage.startSignup(user.name, user.email);
      await expect(page).toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('datos de la cuenta: obligatorios con contraseña de un carácter', async () => {
      await signupPage.fillAccountInformation({
        password: oneCharPassword,
        firstName: 'Ander',
        lastName: 'Gomez',
        address: 'Calle Falsa 123',
        country: SIGNUP_COUNTRY,
        state: 'Ontario',
        city: 'Toronto',
        zipcode: 'M5V 2T6',
        mobileNumber: '1234567890',
      });
    });

    await test.step('alta: el sitio acepta la contraseña de un carácter', async () => {
      await signupPage.createAccount();
      await expect(page).toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText()).toContain('ACCOUNT CREATED!');

      await signupPage.continueAfterCreation();
      await expect(page).toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText()).toContain(`Logged in as ${user.name}`);
    });

    await test.step('limpieza: eliminar la cuenta y verificar el rechazo', async () => {
      await signupPage.deleteAccount();
      await expect(page).toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText()).toContain('ACCOUNT DELETED!');

      await loginPage.goto();
      await loginPage.login(user.email, oneCharPassword);
      expect(await loginPage.loginErrorMessage()).toBe('Your email or password is incorrect!');
    });
  });
});

test.describe('Registro - alta bloqueada sin obligatorios (R-09)', () => {

  test('R-09: sin campos obligatorios el alta se bloquea y enfoca el nombre', async ({ signupPage, page }) => {
    const user = buildUniqueUser('r09');

    await test.step('paso 1: registro con datos únicos', async () => {
      await signupPage.startSignup(user.name, user.email);
      await expect(page).toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('datos de la cuenta: vaciar el nombre', async () => {
      await signupPage.fillAccountName('');
      expect(await signupPage.accountNameValue()).toBe('');
    });

    await test.step('alta: el envío se bloquea sin obligatorios', async () => {
      await signupPage.createAccount();

      await expect(page).toHaveURL(/\/signup$/);
      expect(await signupPage.focusedField()).toBe('name');
      await signupPage.expectAccountInformationVisible();

      const requiredInputs = ['name', 'password', 'firstName', 'lastName', 'address', 'state', 'city', 'zipcode', 'mobileNumber'] as const;
      for (const field of requiredInputs) {
        expect.soft(await signupPage.accountFieldIsValid(field)).toBe(false);
      }
      expect(await signupPage.accountValidationMessage('name')).toBe('Please fill out this field.');
      expect(await signupPage.accountValidationMessage('password')).toBe('Please fill out this field.');

      // Comportamiento real del sitio: el select de país viene precargado (India)
      // y no permite vacío, por lo que es nativamente válido y sin mensaje.
      expect(await signupPage.accountFieldIsValid('country')).toBe(true);
      expect(await signupPage.accountValidationMessage('country')).toBe('');
    });
  });
});

test.describe('Registro - ciclo de vida de la sesión y la cuenta (R-10/R-11)', () => {

  test('R-10: permite volver a iniciar sesión tras cerrar sesión', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r10');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('paso 1: registro con datos únicos', async () => {
      await signupPage.startSignup(user.name, user.email);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('datos de la cuenta: solo obligatorios', async () => {
      await signupPage.fillAccountInformation({
        password: user.password,
        firstName: 'Ander',
        lastName: 'Gomez',
        address: 'Calle Falsa 123',
        country: SIGNUP_COUNTRY,
        state: 'Ontario',
        city: 'Toronto',
        zipcode: 'M5V 2T6',
        mobileNumber: '1234567890',
      });
    });

    await test.step('alta: crear la cuenta', async () => {
      await signupPage.createAccount();
      await expect(page).toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText()).toContain('ACCOUNT CREATED!');

      await signupPage.continueAfterCreation();
      await expect(page).toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText()).toContain(`Logged in as ${user.name}`);
    });

    await test.step('logout: cerrar la sesión', async () => {
      await loginPage.logout();
      await expect(page).toHaveURL(/\/login$/);
      await loginPage.expectLoggedOutNav();
    });

    await test.step('re-login: iniciar sesión de nuevo', async () => {
      await loginPage.login(user.email, user.password);
      await expect(page).toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText()).toContain(`Logged in as ${user.name}`);
    });

    await test.step('limpieza: eliminar la cuenta con su propia sesión', async () => {
      await signupPage.deleteAccount();
      await expect(page).toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText()).toContain('ACCOUNT DELETED!');
    });
  });

  test('R-11: una cuenta eliminada ya no permite iniciar sesión', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r11');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('paso 1: registro con datos únicos', async () => {
      await signupPage.startSignup(user.name, user.email);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('datos de la cuenta: solo obligatorios', async () => {
      await signupPage.fillAccountInformation({
        password: user.password,
        firstName: 'Ander',
        lastName: 'Gomez',
        address: 'Calle Falsa 123',
        country: SIGNUP_COUNTRY,
        state: 'Ontario',
        city: 'Toronto',
        zipcode: 'M5V 2T6',
        mobileNumber: '1234567890',
      });
    });

    await test.step('alta y borrado: crear y eliminar la cuenta', async () => {
      await signupPage.createAccount();
      await expect(page).toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText()).toContain('ACCOUNT CREATED!');

      await signupPage.continueAfterCreation();
      await expect(page).toHaveURL(/\/$/);
      await signupPage.deleteAccount();
      await expect(page).toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText()).toContain('ACCOUNT DELETED!');
    });

    await test.step('login tras borrado: el servidor rechaza', async () => {
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      expect(await loginPage.loginErrorMessage()).toBe('Your email or password is incorrect!');
    });
  });
});
