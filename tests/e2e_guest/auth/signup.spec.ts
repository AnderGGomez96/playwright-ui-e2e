import { test, expect } from '../../../src/fixtures/base';
import { SEEDED_USER, buildUniqueUser, SIGNUP_COUNTRY, SIGNUP_DOB } from '../../../src/constant/test-data';

test.describe('Registro - paso 1 (validación nativa)', () => {

  test('R-01: sin nombre ni correo, el registro no envía y marca ambos campos inválidos', async ({ signupPage, page }) => {
    await test.step('Cuando intento registrarme sin completar los datos', async () => {
      await signupPage.submitSignup();
    });

    await test.step('Entonces ambos campos quedan inválidos', async () => {
      expect(await signupPage.signupFieldIsValid('name'), 'El nombre debe quedar inválido').toBe(false);
      expect(await signupPage.signupFieldIsValid('email'), 'El correo debe quedar inválido').toBe(false);
    });

    await test.step('Y el navegador pide completar ambos campos', async () => {
      expect(await signupPage.signupValidationMessage('name'), 'El nombre debe pedir que se complete')
        .toBe('Please fill out this field.');
      expect(await signupPage.signupValidationMessage('email'), 'El correo debe pedir que se complete')
        .toBe('Please fill out this field.');
    });

    await test.step('Y el foco queda en el nombre', async () => {
      expect(await signupPage.focusedField(), 'El foco debe quedar en el campo de nombre').toBe('signup-name');
    });

    await test.step('Y no avanzo al paso 2 del registro', async () => {
      await expect(page, 'Debo seguir en la página de registro').toHaveURL(/\/login$/);
      await signupPage.expectAccountInformationHidden();
    });
  });

  test('R-02: con el nombre cargado y el correo vacío, el registro enfoca el correo', async ({ signupPage, page }) => {
    await test.step('Dado que escribo mi nombre sin correo', async () => {
      await signupPage.fillSignupName('Locanto Prueba');
    });

    await test.step('Cuando envío el registro', async () => {
      await signupPage.submitSignup();
    });

    await test.step('Entonces el foco queda en el correo', async () => {
      expect(await signupPage.focusedField(), 'El foco debe quedar en el correo').toBe('signup-email');
    });

    await test.step('Y el correo pide que se complete y es inválido', async () => {
      expect(await signupPage.signupValidationMessage('email'), 'El correo debe pedir que se complete')
        .toBe('Please fill out this field.');
      expect(await signupPage.signupFieldIsValid('email'), 'El correo debe quedar inválido').toBe(false);
    });

    await test.step('Y no avanzo al paso 2 del registro', async () => {
      await expect(page, 'Debo seguir en la página de registro').toHaveURL(/\/login$/);
      await signupPage.expectAccountInformationHidden();
    });
  });

  test('R-03: con el correo cargado y el nombre vacío, el registro enfoca el nombre', async ({ signupPage, page }) => {
    await test.step('Dado que escribo mi correo sin nombre', async () => {
      await signupPage.fillSignupEmail('e2e.t03@mail.com');
    }, { subtitle: 'e2e.t03@mail.com' });

    await test.step('Cuando envío el registro', async () => {
      await signupPage.submitSignup();
    });

    await test.step('Entonces el foco queda en el nombre', async () => {
      expect(await signupPage.focusedField(), 'El foco debe quedar en el campo de nombre').toBe('signup-name');
    });

    await test.step('Y el nombre pide que se complete y es inválido', async () => {
      expect(await signupPage.signupValidationMessage('name'), 'El nombre debe pedir que se complete')
        .toBe('Please fill out this field.');
      expect(await signupPage.signupFieldIsValid('name'), 'El nombre debe quedar inválido').toBe(false);
    });

    await test.step('Y no avanzo al paso 2 del registro', async () => {
      await expect(page, 'Debo seguir en la página de registro').toHaveURL(/\/login$/);
      await signupPage.expectAccountInformationHidden();
    });
  });

  test('R-05: con un correo incompleto, el registro no envía y enfoca el correo', async ({ signupPage, page }) => {
    await test.step('Dado que escribo mi nombre y un correo incompleto', async () => {
      await signupPage.fillSignupName('Locanto Prueba');
      await signupPage.fillSignupEmail('locanto@');
    }, { subtitle: 'locanto@' });

    await test.step('Cuando envío el registro', async () => {
      await signupPage.submitSignup();
    });

    await test.step('Entonces el foco queda en el correo', async () => {
      expect(await signupPage.focusedField(), 'El foco debe quedar en el correo').toBe('signup-email');
    });

    await test.step('Y el correo queda inválido y marcado como incompleto', async () => {
      expect(await signupPage.signupFieldIsValid('email'), 'El correo incompleto debe quedar inválido').toBe(false);
      expect(await signupPage.signupFieldTypeMismatch('email'), 'El correo debe tener un formato incompleto').toBe(true);
    });

    await test.step('Y el aviso del navegador explica que falta el dominio', async () => {
      const message = await signupPage.signupValidationMessage('email');
      expect(message, 'El aviso debe mencionar el símbolo @').toContain("'@'");
      expect(message, 'El aviso debe indicar que el correo está incompleto').toContain('is incomplete');
    });

    await test.step('Y no avanzo al paso 2 del registro', async () => {
      await expect(page, 'Debo seguir en la página de registro').toHaveURL(/\/login$/);
      await signupPage.expectAccountInformationHidden();
    });
  });
});

test.describe('Registro - email ya registrado (paso 1)', () => {

  test('R-04: un correo ya registrado es rechazado y no crea una cuenta', async ({ signupPage, page }) => {
    await test.step('Dado que ingreso el nombre y el correo del usuario de prueba', async () => {
      await signupPage.fillSignupName(SEEDED_USER.name);
      await signupPage.fillSignupEmail(SEEDED_USER.email);
    }, { subtitle: SEEDED_USER.email });

    await test.step('Y confirmo que los datos del formulario son válidos', async () => {
      expect(await signupPage.signupFieldIsValid('name'), 'El nombre debe ser válido').toBe(true);
      expect(await signupPage.signupFieldIsValid('email'), 'El correo debe ser válido').toBe(true);
    });

    await test.step('Cuando envío el registro', async () => {
      await signupPage.submitSignup();
    });

    await test.step('Entonces el sitio avisa que el correo ya existe', async () => {
      expect(await signupPage.signupErrorMessage(), 'El sitio debe rechazar un correo ya registrado')
        .toBe('Email Address already exist!');
    });

    await test.step('Y no avanzo al paso 2 ni se crea la cuenta', async () => {
      await expect(page, 'Debo seguir en la página de registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationHidden();
    });
  });
});

test.describe('Registro - paso 2 (datos de la cuenta)', () => {

  test('R-06: con un correo nuevo, el paso 2 muestra mis datos y deja editar el nombre', async ({ signupPage, page }) => {
    const user = buildUniqueUser('r06');

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Entonces llego al paso 2 con el nombre y el correo precargados', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
      expect(await signupPage.accountNameValue(), 'El nombre debe venir precargado').toBe(user.name);
      expect(await signupPage.accountEmailValue(), 'El correo debe venir precargado').toBe(user.email);
    });

    await test.step('Cuando cambio mi nombre', async () => {
      await signupPage.fillAccountName('Nombre Editado');
    }, { subtitle: 'Nombre Editado' });

    await test.step('Entonces el nombre cambia y el correo sigue deshabilitado e intacto', async () => {
      expect(await signupPage.accountNameValue(), 'El nombre debe reflejar el cambio').toBe('Nombre Editado');
      expect(await signupPage.accountEmailDisabled(), 'El correo no debe poder editarse').toBe(true);
      expect(await signupPage.accountEmailValue(), 'El correo precargado no debe alterarse').toBe(user.email);
      await expect(page, 'Sin enviar el paso 2 debo seguir en la misma página').toHaveURL(/\/signup$/);
    });
  });
});

test.describe('Registro - alta completa (R-07)', () => {

  test('R-07: el cliente se registra con todos sus datos, crea su cuenta y la elimina', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r07');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Y llego al paso 2 del registro', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Cuando completo todos mis datos personales', async () => {
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

    await test.step('Entonces se crea mi cuenta y veo la confirmación', async () => {
      await signupPage.createAccount();
      await expect(page, 'Tras el alta debo ver la página de cuenta creada').toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText(), 'Debe confirmarse que la cuenta se creó')
        .toContain('ACCOUNT CREATED!');
    });

    await test.step('Y continúo a Home con mi sesión iniciada', async () => {
      await signupPage.continueAfterCreation();
      await expect(page, 'Tras continuar debo volver a Home').toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText(), 'Debe verse mi nombre en la sesión')
        .toContain(`Logged in as ${user.name}`);
    });

    await test.step('Y al final elimino la cuenta y el sitio ya no me reconoce', async () => {
      await signupPage.deleteAccount();
      await expect(page, 'Debo ver la página de cuenta eliminada').toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText(), 'Debe confirmarse que la cuenta se eliminó')
        .toContain('ACCOUNT DELETED!');

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      expect(await loginPage.loginErrorMessage(), 'Una cuenta eliminada no debe permitir iniciar sesión')
        .toBe('Your email or password is incorrect!');
    });
  });
});

test.describe('Registro - alta solo con obligatorios (R-08/R-12)', () => {

  test('R-08: el cliente se registra solo con los datos obligatorios y luego elimina su cuenta', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r08');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Y llego al paso 2 del registro', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Cuando completo solo mis datos obligatorios', async () => {
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

    await test.step('Entonces se crea mi cuenta y veo la confirmación', async () => {
      await signupPage.createAccount();
      await expect(page, 'Tras el alta debo ver la página de cuenta creada').toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText(), 'Debe confirmarse que la cuenta se creó')
        .toContain('ACCOUNT CREATED!');
    });

    await test.step('Y continúo a Home con mi sesión iniciada', async () => {
      await signupPage.continueAfterCreation();
      await expect(page, 'Tras continuar debo volver a Home').toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText(), 'Debe verse mi nombre en la sesión')
        .toContain(`Logged in as ${user.name}`);
    });

    await test.step('Y al final elimino la cuenta y el sitio ya no me reconoce', async () => {
      await signupPage.deleteAccount();
      await expect(page, 'Debo ver la página de cuenta eliminada').toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText(), 'Debe confirmarse que la cuenta se eliminó')
        .toContain('ACCOUNT DELETED!');

      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      expect(await loginPage.loginErrorMessage(), 'Una cuenta eliminada no debe permitir iniciar sesión')
        .toBe('Your email or password is incorrect!');
    });
  });

  test('R-12: el sitio acepta una contraseña de un carácter y el cliente limpia su cuenta', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r12');
    const oneCharPassword = 'x';
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Y llego al paso 2 del registro', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Cuando completo mis datos obligatorios con una contraseña de un carácter', async () => {
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
    }, { subtitle: oneCharPassword });

    await test.step('Entonces el sitio acepta la contraseña y crea mi cuenta', async () => {
      await signupPage.createAccount();
      await expect(page, 'Tras el alta debo ver la página de cuenta creada').toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText(), 'Debe confirmarse que la cuenta se creó')
        .toContain('ACCOUNT CREATED!');
    });

    await test.step('Y continúo a Home con mi sesión iniciada', async () => {
      await signupPage.continueAfterCreation();
      await expect(page, 'Tras continuar debo volver a Home').toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText(), 'Debe verse mi nombre en la sesión')
        .toContain(`Logged in as ${user.name}`);
    });

    await test.step('Y al final elimino la cuenta y el sitio ya no me reconoce', async () => {
      await signupPage.deleteAccount();
      await expect(page, 'Debo ver la página de cuenta eliminada').toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText(), 'Debe confirmarse que la cuenta se eliminó')
        .toContain('ACCOUNT DELETED!');

      await loginPage.goto();
      await loginPage.login(user.email, oneCharPassword);
      expect(await loginPage.loginErrorMessage(), 'Una cuenta eliminada no debe permitir iniciar sesión')
        .toBe('Your email or password is incorrect!');
    });
  });
});

test.describe('Registro - alta bloqueada sin obligatorios (R-09)', () => {

  test('R-09: si faltan los datos obligatorios, el alta no se crea y enfoca mi nombre', async ({ signupPage, page }) => {
    const user = buildUniqueUser('r09');

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Y llego al paso 2 del registro', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Cuando dejo mi nombre vacío', async () => {
      await signupPage.fillAccountName('');
    });

    await test.step('Y confirmo que el nombre quedó vacío', async () => {
      expect(await signupPage.accountNameValue(), 'El nombre debe quedar vacío').toBe('');
    });

    await test.step('Cuando intento crear la cuenta sin completar los obligatorios', async () => {
      await signupPage.createAccount();
    });

    await test.step('Entonces el alta se bloquea y sigo en el paso 2', async () => {
      await expect(page, 'El alta no debe avanzar del paso 2').toHaveURL(/\/signup$/);
      expect(await signupPage.focusedField(), 'El foco debe quedar en el nombre').toBe('name');
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Y cada campo obligatorio queda inválido', async () => {
      const requiredInputs = ['name', 'password', 'firstName', 'lastName', 'address', 'state', 'city', 'zipcode', 'mobileNumber'] as const;
      for (const field of requiredInputs) {
        expect.soft(await signupPage.accountFieldIsValid(field), `El campo obligatorio "${field}" debe quedar inválido`).toBe(false);
      }
    });

    await test.step('Y el navegador pide completar el nombre y la contraseña', async () => {
      expect(await signupPage.accountValidationMessage('name'), 'El nombre debe pedir que se complete')
        .toBe('Please fill out this field.');
      expect(await signupPage.accountValidationMessage('password'), 'La contraseña debe pedir que se complete')
        .toBe('Please fill out this field.');
    });

    await test.step('Y el país, precargado por el sitio, es válido y sin mensaje', async () => {
      expect(await signupPage.accountFieldIsValid('country'), 'El país precargado por el sitio debe ser válido').toBe(true);
      expect(await signupPage.accountValidationMessage('country'), 'El país precargado no debe tener mensaje').toBe('');
    });
  });
});

test.describe('Registro - ciclo de vida de la sesión y la cuenta (R-10/R-11)', () => {

  test('R-10: tras cerrar sesión, el cliente puede volver a iniciar sesión', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r10');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Y llego al paso 2 del registro', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Cuando completo mis datos obligatorios', async () => {
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

    await test.step('Entonces se crea mi cuenta y veo la confirmación', async () => {
      await signupPage.createAccount();
      await expect(page, 'Tras el alta debo ver la página de cuenta creada').toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText(), 'Debe confirmarse que la cuenta se creó')
        .toContain('ACCOUNT CREATED!');
    });

    await test.step('Y continúo a Home con mi sesión iniciada', async () => {
      await signupPage.continueAfterCreation();
      await expect(page, 'Tras continuar debo volver a Home').toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText(), 'Debe verse mi nombre en la sesión')
        .toContain(`Logged in as ${user.name}`);
    });

    await test.step('Cuando cierro sesión', async () => {
      await loginPage.logout();
    });

    await test.step('Entonces vuelvo al formulario sin mi cuenta', async () => {
      await expect(page, 'Tras cerrar sesión debo volver al formulario').toHaveURL(/\/login$/);
      await loginPage.expectLoggedOutNav();
    });

    await test.step('Y puedo iniciar sesión de nuevo con mis credenciales', async () => {
      await loginPage.login(user.email, user.password);
      await expect(page, 'El re-login debe llevarme a Home').toHaveURL(/\/$/);
      expect(await loginPage.loggedInAsText(), 'Debe verse de nuevo mi nombre en la sesión')
        .toContain(`Logged in as ${user.name}`);
    });

    await test.step('Y al final elimino la cuenta con mi propia sesión', async () => {
      await signupPage.deleteAccount();
      await expect(page, 'Debo ver la página de cuenta eliminada').toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText(), 'Debe confirmarse que la cuenta se eliminó')
        .toContain('ACCOUNT DELETED!');
    });
  });

  test('R-11: una cuenta eliminada ya no permite iniciar sesión', async ({ signupPage, loginPage, page }, testInfo) => {
    const user = buildUniqueUser('r11');
    await testInfo.attach('created-user.json', {
      contentType: 'application/json',
      body: JSON.stringify({ name: user.name, email: user.email }),
    });

    await test.step('Dado que me registro con un correo nuevo', async () => {
      await signupPage.startSignup(user.name, user.email);
    }, { subtitle: user.email });

    await test.step('Y llego al paso 2 del registro', async () => {
      await expect(page, 'Debo llegar al paso 2 del registro').toHaveURL(/\/signup$/);
      await signupPage.expectAccountInformationVisible();
    });

    await test.step('Cuando completo mis datos obligatorios', async () => {
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

    await test.step('Entonces creo mi cuenta y veo la confirmación', async () => {
      await signupPage.createAccount();
      await expect(page, 'Tras el alta debo ver la página de cuenta creada').toHaveURL(/\/account_created$/);
      expect(await signupPage.accountCreatedText(), 'Debe confirmarse que la cuenta se creó')
        .toContain('ACCOUNT CREATED!');
    });

    await test.step('Y continúo a Home y luego elimino la cuenta', async () => {
      await signupPage.continueAfterCreation();
      await expect(page, 'Tras continuar debo volver a Home').toHaveURL(/\/$/);
      await signupPage.deleteAccount();
      await expect(page, 'Debo ver la página de cuenta eliminada').toHaveURL(/\/delete_account$/);
      expect(await signupPage.accountDeletedText(), 'Debe confirmarse que la cuenta se eliminó')
        .toContain('ACCOUNT DELETED!');
    });

    await test.step('Y ya no puedo iniciar sesión con esa cuenta eliminada', async () => {
      await loginPage.goto();
      await loginPage.login(user.email, user.password);
      expect(await loginPage.loginErrorMessage(), 'Una cuenta eliminada no debe permitir iniciar sesión')
        .toBe('Your email or password is incorrect!');
    });
  });
});
