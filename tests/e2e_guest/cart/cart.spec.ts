import { test, expect } from '../../../src/fixtures/base';
import { SEEDED_USER } from '../../../src/constant/test-data';

test.describe('Carrito invitado', () => {

  test('CT-01: con el carrito vacío no puedo pagar y el aviso me lleva al catálogo', async ({ cartPage, page }) => {
    await test.step('Entonces veo que el carrito está vacío y no tengo cómo pagar', async () => {
      await cartPage.expectEmpty();
    });

    await test.step('Y el enlace para comprar me lleva al catálogo de productos', async () => {
      await cartPage.followEmptyCartLink();
      await expect(page, 'El enlace "here" del carrito vacío debe llevar a /products').toHaveURL(/\/products/);
    });
  });

  test('CT-02: como invitado agrego un producto y el checkout me pide iniciar sesión', async ({ cartWithProduct, page }) => {
    await test.step('Dado que agregué "Blue Top" desde el catálogo, veo su fila en el carrito', async () => {
      const row = await cartWithProduct.productRow('Blue Top');
      await expect.soft(row, 'La fila del carrito debe mostrar el producto "Blue Top"').toContainText('Blue Top');
      await expect.soft(row, 'La fila del carrito debe indicar la categoría "Women > Tops"').toContainText('Women > Tops');
      await expect.soft(row, 'La fila del carrito debe mostrar el precio "Rs. 500"').toContainText('Rs. 500');
      await expect.soft(row, 'La fila del carrito debe mostrar cantidad 1').toContainText(/\b1\b/);
    });

    await test.step('Cuando intento pagar sin haber iniciado sesión', async () => {
      await cartWithProduct.checkout();
    });

    await test.step('Entonces el sitio me pide iniciar sesión para continuar', async () => {
      await cartWithProduct.expectCheckoutLoginPrompt();
    });

    await test.step('Y si elijo continuar en el carrito, el aviso se cierra sin avanzar', async () => {
      await cartWithProduct.expectContinueOnCartClosesModal();
      await expect(page, 'Al continuar en el carrito debo seguir en /view_cart').toHaveURL(/\/view_cart/);
    });
  });

  test('CT-03: tras iniciar sesión desde el checkout el carrito conserva el producto', async ({ cartWithProduct, loginPage, page }) => {
    await test.step('Dado que como invitado el aviso de checkout me ofrece iniciar sesión', async () => {
      await cartWithProduct.goto();
      await cartWithProduct.checkout();
      await cartWithProduct.expectCheckoutLoginPrompt();
    });

    await test.step('Cuando sigo el enlace "Register / Login" e inicio sesión con mi cuenta', async () => {
      await cartWithProduct.followCheckoutLogin();
      await loginPage.login(SEEDED_USER.email, SEEDED_USER.password);
    });

    await test.step('Entonces mi carrito conserva el producto y el checkout ya no me pide iniciar sesión', async () => {
      await cartWithProduct.goto();
      const row = await cartWithProduct.productRow('Blue Top');
      await expect(row, 'El carrito debe conservar "Blue Top" tras iniciar sesión').toBeVisible();

      await cartWithProduct.checkout();
      await cartWithProduct.expectCheckoutLoginPromptHidden();
      await expect(page, 'Con sesión, el checkout debe continuar a /checkout').toHaveURL(/\/checkout/);
    });
  });

});
