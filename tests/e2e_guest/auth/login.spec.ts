import { test, expect } from '../../../src/fixtures/base';
import { SEEDED_USER, buildUniqueUser } from '../../../src/constant/test-data';
import { loginLocators } from '../../../src/locators/login.locators';

test.describe('Inicio de sesión', () => {

  test('L-01: con credenciales válidas, el cliente inicia sesión y ve su cuenta activa', async ({ loginPage, healer, page }) => {
    await test.step('Dado que inicio sesión con el usuario de prueba', async () => {
      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
    }, { subtitle: SEEDED_USER.email });

    await test.step('Entonces vuelvo a la página principal', async () => {
      await expect(page, 'Tras iniciar sesión debo quedar en Home').toHaveURL(/\/$/);
    });

    await test.step('Y veo mi sesión activa con la opción de cerrarla', async () => {
      expect(await loginPage.loggedInAsText(), 'El encabezado debe mostrar "Logged in as Locanto"')
        .toContain('Logged in as Locanto');
      await expect(await healer.resolve(loginLocators.logoutLink), 'El enlace Logout debe estar visible')
        .toBeVisible();
    });

    await test.step('Y no aparece ningún mensaje de error', async () => {
      await loginPage.expectNoLoginError();
    });
  });

  test('L-07: con una sesión activa, volver a /login me lleva de nuevo a Home', async ({ loginPage, page }) => {
    await test.step('Dado que inicio sesión con el usuario de prueba', async () => {
      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
    }, { subtitle: SEEDED_USER.email });

    await test.step('Y confirmo que estoy en Home', async () => {
      await expect(page, 'El inicio de sesión debe llevarme a Home').toHaveURL(/\/$/);
    });

    await test.step('Cuando vuelvo a abrir la página de inicio de sesión', async () => {
      await loginPage.goto();
    });

    await test.step('Entonces el sitio me redirige a Home', async () => {
      await expect(page, 'Con sesión activa, /login debe redirigirme a Home').toHaveURL(/\/$/);
    });

    await test.step('Y los formularios de acceso ya no están visibles', async () => {
      await loginPage.expectAuthFormsHidden();
    });
  });

  test('L-02: con un correo no registrado no puedo iniciar sesión y veo un error genérico', async ({ loginPage, page }) => {
    const { email, password } = buildUniqueUser('l02');

    await test.step('Cuando intento iniciar sesión con un correo que no existe', async () => {
      await loginPage.login(email, password);
    }, { subtitle: email });

    await test.step('Entonces el sitio muestra un error genérico', async () => {
      expect(await loginPage.loginErrorMessage(), 'El mensaje no debe revelar si el correo existe')
        .toBe('Your email or password is incorrect!');
    });

    await test.step('Y permanezco fuera de mi cuenta', async () => {
      await expect(page, 'Debo seguir en la página de inicio de sesión').toHaveURL(/\/login$/);
      await loginPage.expectLoggedOutNav();
    });
  });

  test('L-03: con una contraseña incorrecta veo el mismo error genérico', async ({ loginPage, page }) => {
    await test.step('Cuando intento iniciar sesión con la contraseña equivocada', async () => {
      await loginPage.login(SEEDED_USER.email, 'Incorrecta1*');
    }, { subtitle: SEEDED_USER.email });

    await test.step('Entonces el sitio muestra el mismo error genérico', async () => {
      expect(await loginPage.loginErrorMessage(), 'El error debe ser idéntico al del correo no registrado')
        .toBe('Your email or password is incorrect!');
    });

    await test.step('Y permanezco fuera de mi cuenta', async () => {
      await expect(page, 'Debo seguir en la página de inicio de sesión').toHaveURL(/\/login$/);
      await loginPage.expectLoggedOutNav();
    });
  });

  test('L-04: un correo incompleto bloquea el acceso y deja el foco en el correo', async ({ loginPage, page }) => {
    await test.step('Cuando intento iniciar sesión con un correo incompleto', async () => {
      await loginPage.login('locanto@', 'x');
    }, { subtitle: 'locanto@' });

    await test.step('Entonces el navegador bloquea el envío y marca el correo como inválido', async () => {
      expect(await loginPage.loginFieldIsValid('email'), 'El correo incompleto debe ser inválido').toBe(false);
      expect(await loginPage.loginFieldTypeMismatch('email'), 'El correo debe tener un formato incompleto').toBe(true);
    });

    await test.step('Y el foco queda en el campo de correo', async () => {
      expect(await loginPage.focusedField(), 'El foco debe quedar en el correo').toBe('login-email');
    });

    await test.step('Y el aviso del navegador explica que el correo está incompleto', async () => {
      const message = await loginPage.loginEmailValidationMessage();
      expect(message, 'El aviso debe señalar que falta la parte después de @').toContain("'locanto@' is incomplete.");
      expect(message, 'El aviso debe mencionar el símbolo @').toContain("'@'");
    });

    await test.step('Y sigo en la página de inicio de sesión', async () => {
      await expect(page, 'Debo seguir en la página de inicio de sesión').toHaveURL(/\/login$/);
    });
  });

  test('L-05: sin correo ni contraseña el acceso se bloquea y enfoca el correo', async ({ loginPage, page }) => {
    await test.step('Cuando intento iniciar sesión sin completar los datos', async () => {
      await loginPage.login('', '');
    });

    await test.step('Entonces ambos campos quedan inválidos', async () => {
      expect(await loginPage.loginFieldIsValid('email'), 'El correo vacío debe ser inválido').toBe(false);
      expect(await loginPage.loginFieldIsValid('password'), 'La contraseña vacía debe ser inválida').toBe(false);
    });

    await test.step('Y el navegador pide completar ambos campos', async () => {
      expect(await loginPage.loginEmailValidationMessage(), 'El correo debe pedir que se complete')
        .toBe('Please fill out this field.');
      expect(await loginPage.loginPasswordValidationMessage(), 'La contraseña debe pedir que se complete')
        .toBe('Please fill out this field.');
    });

    await test.step('Y el foco queda en el correo', async () => {
      expect(await loginPage.focusedField(), 'El foco debe quedar en el correo').toBe('login-email');
    });

    await test.step('Y sigo en la página de inicio de sesión', async () => {
      await expect(page, 'Debo seguir en la página de inicio de sesión').toHaveURL(/\/login$/);
    });
  });

  test('L-06: al cerrar sesión vuelvo al formulario y desaparece mi cuenta', async ({ loginPage, page }) => {
    await test.step('Dado que inicio sesión con el usuario de prueba', async () => {
      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
    }, { subtitle: SEEDED_USER.email });

    await test.step('Y confirmo que estoy en Home', async () => {
      await expect(page, 'El inicio de sesión debe llevarme a Home').toHaveURL(/\/$/);
    });

    await test.step('Cuando cierro sesión', async () => {
      await loginPage.logout();
    });

    await test.step('Entonces vuelvo al formulario de inicio de sesión', async () => {
      await expect(page, 'Tras cerrar sesión debo volver a la página de inicio de sesión').toHaveURL(/\/login$/);
      await loginPage.expectLoginFormVisible();
    });

    await test.step('Y ya no veo mi cuenta ni la opción de eliminarla', async () => {
      await loginPage.expectLoggedOutNav();
    });
  });
});
