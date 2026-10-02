import { test, expect } from '../../../src/fixtures/base';
import { CATEGORIES } from '../../../src/constant/product-data';

/** Rastros de error interno que una página controlada no debe exponer. */
const SIN_RASTRO_DE_ERROR = /internal server error|sqlstate|uncaught|exception|stack trace|stacktrace/i;

test.describe('Categorías de producto', () => {

  test('PR-09: el acordeón lista exactamente las 7 categorías canónicas', async ({ productPage }) => {
    await test.step('Cuando abro el catálogo y leo el acordeón de categorías', async () => {
      const entries = await productPage.categorySidebar();
      expect.soft(entries.map((entry) => entry.href).sort(), 'El acordeón debe exponer exactamente los 7 enlaces canónicos')
        .toEqual(CATEGORIES.map((category) => category.href).sort());
      for (const category of CATEGORIES) {
        const entry = entries.find((candidate) => candidate.href === category.href);
        expect.soft(entry?.label, `La categoría ${category.parent} > ${category.label} debe mostrar su nombre`)
          .toBe(category.label);
      }
    });
  });

  test('PR-10: cada categoría muestra solo productos de su subcategoría', async ({ productPage }) => {
    // Recorre las 7 categorías y la ficha de cada producto: excede el default.
    test.setTimeout(120_000);

    for (const category of CATEGORIES) {
      const filterName = `${category.parent} > ${category.label}`;
      let detailUrls: string[] = [];

      await test.step(`Cuando abro el filtro ${filterName}`, async () => {
        await productPage.openCategory(category.href);
      }, { subtitle: category.href });

      await test.step(`Entonces el listado ${filterName} no está vacío`, async () => {
        const title = (await productPage.searchResultsTitle()).toLowerCase();
        expect.soft(title, `El filtro ${filterName} debe rotularse "${category.parent} - ${category.label} PRODUCTS"`)
          .toBe(`${category.parent} - ${category.label} products`.toLowerCase());
        const cards = await productPage.resultCards();
        expect(cards.length, `El filtro ${filterName} debe mostrar al menos un producto`).toBeGreaterThan(0);
        detailUrls = await productPage.resultDetailUrls();
        expect(detailUrls.length, 'Cada tarjeta del filtro debe exponer su ficha de detalle').toBe(cards.length);
      });

      for (const href of detailUrls) {
        await test.step(`Y abro la ficha ${href} y verifico su categoría`, async () => {
          await productPage.openProductDetailByUrl(href);
          const detail = await productPage.readProductDetail();
          expect.soft(detail.category, `El producto "${detail.name}" del filtro ${filterName} debe declarar la categoría ${category.detail}`)
            .toBe(category.detail);
        }, { subtitle: href });
      }
    }
  });

  test('PR-11: una categoría inexistente responde 200 y no lista resultados ajenos', async ({ productPage, page }) => {
    const fakeCategory = '/category_products/99999';

    await test.step('Cuando abro una categoría que no existe', async () => {
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes(fakeCategory)),
        page.goto(fakeCategory),
      ]);
      expect(response.status(), 'La categoría inexistente debe responder 200, nunca 5xx').toBe(200);
    }, { subtitle: fakeCategory });

    await test.step('Entonces el sitio muestra una página vacía controlada y sin errores', async () => {
      const title = (await productPage.searchResultsTitle()).replace(/\s+/g, ' ').trim().toLowerCase();
      expect(title, 'El título de una categoría inexistente debe quedar como "- PRODUCTS"').toBe('- products');
      expect((await productPage.resultCards()).length, 'Una categoría inexistente no debe listar productos').toBe(0);
      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      expect(body, 'La página no debe exponer errores ni trazas del servidor').not.toMatch(SIN_RASTRO_DE_ERROR);
    });
  });
});
