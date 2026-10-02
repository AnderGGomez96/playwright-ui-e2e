import { test, expect } from '../../../src/fixtures/base';
import { TEST_CARD } from '../../../src/constant/product-data';

/**
 * CT-04: compra completa con sesión (checkout autenticado).
 *
 * La cuenta sembrada acumula carrito entre corridas: el fixture
 * `checkoutWithProduct` lo resetea y siembra `Blue Top` qty 1 (DEC-08), de modo
 * que los totales son deterministas. Corre en serial con `E2E_WORKERS=1` porque
 * la cuenta es compartida (diseño §6).
 */
test.describe.serial('Checkout con sesión', () => {

  test('CT-04: con sesión pago mi pedido y descargo la factura', async ({ checkoutWithProduct, page }) => {
    await test.step('Dado que estoy en el checkout con mi carrito reseteado y "Blue Top"', async () => {
      await checkoutWithProduct.expectAddresses();
      await checkoutWithProduct.expectReview('Blue Top', 'Rs. 500');
    });

    await test.step('Cuando confirmo el pedido e ingreso los datos de mi tarjeta', async () => {
      await checkoutWithProduct.placeOrder();
      await expect(page, 'Confirmar el pedido debe llevar a la pasarela de pago').toHaveURL(/\/payment/);
      await checkoutWithProduct.fillPayment(TEST_CARD);
      await checkoutWithProduct.payAndConfirm();
    });

    await test.step('Entonces veo la confirmación de mi orden', async () => {
      await expect(page, 'Tras pagar debo llegar a la página de orden confirmada').toHaveURL(/\/payment_done\/\d+/);
      await checkoutWithProduct.expectOrderPlaced();
    });

    await test.step('Y descargo la factura de mi pedido', async () => {
      const invoice = await checkoutWithProduct.downloadInvoice();
      expect(await invoice.failure(), 'La descarga de la factura no debe haber fallado').toBeNull();
    });
  });

});
