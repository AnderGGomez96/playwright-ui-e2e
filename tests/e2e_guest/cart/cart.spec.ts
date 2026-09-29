import { test, expect } from '../../../src/fixtures/base';

test.describe('Cart', () => {
  test('Carrito de compras sin login', async ({ cartWithProduct, page }) => {
    await cartWithProduct.checkout();
    await expect(page.getByText('Register / Login account to proceed on checkout.')).toBeVisible();
  })

})

