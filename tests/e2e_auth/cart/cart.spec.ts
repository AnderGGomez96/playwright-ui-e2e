import { test, expect } from '../../../src/fixtures/base';

test.describe('Cart', () => {
  test('Carrito de compras con login', async ({ cartWithProduct, page }) => {
    await expect(cartWithProduct.checkoutButton).toBeVisible();
    await cartWithProduct.checkoutButton.click();
    await expect(page.getByText('Register / Login account to proceed on checkout.')).not.toBeVisible();
  })

})

