import { test, expect } from '../../../src/fixtures/base';
import { SAMPLE_PRODUCT } from '../../../src/constant/product-data';

/** Rastros de error interno que una respuesta hostil o vacía no debe exponer. */
const SIN_RASTRO_DE_ERROR = /internal server error|sqlstate|uncaught|exception|stack trace|stacktrace/i;

test.describe('Búsqueda y detalle de producto', () => {

  test('PR-01: una búsqueda real muestra su tarjeta y el detalle navega a su ficha', async ({ productPage, page }) => {
    await test.step('Cuando busco "Winter Top" en el catálogo', async () => {
      await productPage.searchProduct('Winter Top');
    }, { subtitle: 'Winter Top' });

    await test.step('Entonces veo al menos una tarjeta con el producto buscado', async () => {
      const cards = await productPage.resultCards();
      expect(cards.length, 'La búsqueda "Winter Top" debe devolver al menos una tarjeta').toBeGreaterThan(0);
      expect(await cards[0].textContent(), 'La tarjeta resultante debe mostrar "Winter Top"').toContain('Winter Top');
    });

    await test.step('Y al abrir "View Product" llego a la ficha del producto', async () => {
      await productPage.openProductDetail('Winter Top');
      await expect(page, 'View Product debe navegar a /product_details/<id>').toHaveURL(/\/product_details\/\d+/);
    });
  });

  test('PR-02: una búsqueda vacía muestra el catálogo completo', async ({ productPage, page }) => {
    await test.step('Cuando busco con el campo vacío', async () => {
      await productPage.searchProduct('');
    });

    await test.step('Entonces el sitio me muestra todo el catálogo', async () => {
      await expect(page, 'La búsqueda vacía debe llevar al listado con filtro vacío').toHaveURL(/\/products\?search=/);
      expect((await productPage.searchResultsTitle()).toLowerCase(), 'El listado completo debe rotularse "ALL PRODUCTS"')
        .toContain('all products');
      const cards = await productPage.resultCards();
      expect(cards.length, 'El catálogo completo no debe quedar vacío').toBeGreaterThan(0);
    });
  });

  test('PR-03: un dato hostil no rompe el buscador ni expone errores', async ({ productPage, page }) => {
    const payloads = ["' OR '1'='1", "'; DROP TABLE products;--"];

    for (const payload of payloads) {
      await test.step(`Cuando envío el dato hostil ${payload} como texto de búsqueda`, async () => {
        const [response] = await Promise.all([
          page.waitForResponse((r) => r.url().includes('/products?search=')),
          productPage.searchProduct(payload),
        ]);
        expect(response.status(), `La búsqueda con "${payload}" debe responder 200, nunca 5xx`).toBe(200);
      }, { subtitle: payload });

      await test.step('Entonces no se listan productos ni se filtra un error interno', async () => {
        expect((await productPage.searchResultsTitle()).toLowerCase(), 'El sitio debe rotular la búsqueda como "SEARCHED PRODUCTS"')
          .toContain('searched products');
        expect((await productPage.resultCards()).length, 'Un dato hostil no debe devolver productos').toBe(0);
        const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
        expect(body, 'La página no debe exponer mensajes de error ni stacktrace').not.toMatch(SIN_RASTRO_DE_ERROR);
      });
    }

    await test.step('Y el buscador sigue operativo con una búsqueda real', async () => {
      await productPage.searchProduct('Winter Top');
      expect((await productPage.resultCards()).length, 'Tras un dato hostil, una búsqueda real debe volver a devolver resultados')
        .toBeGreaterThan(0);
    });
  });

  test('PR-04: una búsqueda inexistente responde 200 y no lista productos', async ({ productPage, page }) => {
    await test.step('Cuando busco un producto que no existe', async () => {
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/products?search=')),
        productPage.searchProduct('zzzznotfoundxyz'),
      ]);
      expect(response.status(), 'La búsqueda inexistente debe responder 200, nunca 500').toBe(200);
    }, { subtitle: 'zzzznotfoundxyz' });

    await test.step('Entonces el listado está vacío y sin errores', async () => {
      expect((await productPage.searchResultsTitle()).toLowerCase(), 'El sitio debe rotular la búsqueda como "SEARCHED PRODUCTS"')
        .toContain('searched products');
      expect((await productPage.resultCards()).length, 'Un producto inexistente no debe devolver tarjetas').toBe(0);
      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      expect(body, 'La página no debe exponer errores ni trazas del servidor').not.toMatch(SIN_RASTRO_DE_ERROR);
    });
  });

  test('PR-05: el detalle de "Blue Top" expone todos sus atributos de ficha', async ({ productPage, page }) => {
    await test.step('Dado que abro la ficha del producto de muestra', async () => {
      await page.goto('/product_details/1');
    });

    await test.step('Entonces cada campo coincide con la ficha esperada', async () => {
      const detail = await productPage.readProductDetail();
      expect.soft(detail.name, `El nombre debe ser "${SAMPLE_PRODUCT.name}"`).toBe(SAMPLE_PRODUCT.name);
      expect.soft(detail.category, `La categoría debe ser "${SAMPLE_PRODUCT.category}"`).toBe(SAMPLE_PRODUCT.category);
      expect.soft(detail.brand, `La marca debe ser "${SAMPLE_PRODUCT.brand}"`).toBe(SAMPLE_PRODUCT.brand);
      expect.soft(detail.availability, `La disponibilidad debe ser "${SAMPLE_PRODUCT.availability}"`).toBe(SAMPLE_PRODUCT.availability);
      expect.soft(detail.condition, `La condición debe ser "${SAMPLE_PRODUCT.condition}"`).toBe(SAMPLE_PRODUCT.condition);
      expect.soft(detail.price, `El precio debe ser "${SAMPLE_PRODUCT.price}"`).toBe(SAMPLE_PRODUCT.price);
      expect.soft(detail.quantity, `La cantidad por defecto debe ser ${SAMPLE_PRODUCT.quantity}`).toBe(SAMPLE_PRODUCT.quantity);
    });
  });
});
