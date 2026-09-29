import { test, expect } from '../../../src/fixtures/base';

test.describe('Login', () => {
  test('Login satisfactorio con credenciales correctas', async ({ loginPage, page }) => {
    const email = 'locanto@mail.com';
    const password = 'Hola1234*';
    
    await loginPage.login(email, password);
    const value = await loginPage.logiAs();
    expect(value).toContain('Logged in as Locanto')
  })

  test('Login fallido con credenciales erroneas', async ({ loginPage, page }) => {
    const email = 'locanto@mail.com';
    const password = 'Hola1234*';

    await loginPage.login(email, password);
    const error = await loginPage.loginError();
    expect(error).toContain("Your email or password is incorrect!")
  })
})



