import { test, expect } from '../../../src/fixtures/base';
import { TEST_CARD } from '../../../src/constant/product-data';

/**
 * CT-04: compra completa con sesión (checkout autenticado).
 *
 * La cuenta sembrada acumula carrito entre corridas: el fixture
 * `cartWithProduct` lo resetea y siembra `Blue Top` qty 1 (DEC-08), de modo
 * que los totales son deterministas. `proceedToCheckout()` navega a `/checkout`
 * y devuelve el `CheckoutPage`. Corre en serial con `E2E_WORKERS=1` porque la
 * cuenta es compartida (diseño §6).
 */
test.describe.serial('Checkout con sesión', () => {

  test('CT-04: con sesión pago mi pedido y descargo la factura', async ({ cartWithProduct, page }) => {
    let checkout!: Awaited<ReturnType<typeof cartWithProduct.proceedToCheckout>>;

    await test.step('Dado que estoy en el checkout con mi carrito reseteado y "Blue Top"', async () => {
      checkout = await cartWithProduct.proceedToCheckout();
      await checkout.expectAddresses();
      await checkout.expectReview('Blue Top', 'Rs. 500');
    });

    await test.step('Cuando confirmo el pedido e ingreso los datos de mi tarjeta', async () => {
      await checkout.placeOrder();
      await expect(page, 'Confirmar el pedido debe llevar a la pasarela de pago').toHaveURL(/\/payment/);
      await checkout.fillPayment(TEST_CARD);
      await checkout.payAndConfirm();
    });

    await test.step('Entonces veo la confirmación de mi orden', async () => {
      await expect(page, 'Tras pagar debo llegar a la página de orden confirmada').toHaveURL(/\/payment_done\/\d+/);
      await checkout.expectOrderPlaced();
    });

    await test.step('Y descargo la factura de mi pedido', async () => {
      const invoice = await checkout.downloadInvoice();
      expect(await invoice.failure(), 'La descarga de la factura no debe haber fallado').toBeNull();
    });
  });

});
