import { test, expect } from '../../../src/fixtures/base';
import { BRANDS } from '../../../src/constant/product-data';

/** Rastros de error interno que una página controlada no debe exponer. */
const SIN_RASTRO_DE_ERROR = /internal server error|sqlstate|uncaught|exception|stack trace|stacktrace/i;

test.describe('Marcas de producto', () => {

  test('PR-06: el sidebar lista las 8 marcas canónicas y cada filtro coincide con su conteo', async ({ productPage }) => {
    let counts: Record<string, number> = {};

    await test.step('Cuando abro el catálogo y leo el sidebar de marcas', async () => {
      counts = await productPage.brandSidebarCounts();
      expect.soft(Object.keys(counts).sort(), 'El sidebar debe listar exactamente las 8 marcas canónicas')
        .toEqual([...BRANDS].sort());
      expect(Object.keys(counts), 'El catálogo no debe anunciar la marca inexistente "Madames"')
        .not.toContain('Madames');
    });

    for (const brand of BRANDS) {
      await test.step(`Cuando abro el filtro de la marca ${brand}`, async () => {
        await productPage.openBrand(brand);
      }, { subtitle: brand });

      await test.step(`Entonces la página se rotula con la marca ${brand} y muestra su stock`, async () => {
        const title = (await productPage.searchResultsTitle()).toLowerCase();
        expect.soft(title, `El filtro de ${brand} debe rotularse "BRAND - ${brand.toUpperCase()} PRODUCTS"`)
          .toBe(`brand - ${brand} products`.toLowerCase());
        const cards = await productPage.resultCards();
        expect.soft(cards.length, `El filtro de ${brand} debe mostrar el stock contado en el sidebar`)
          .toBe(counts[brand]);
      }, { subtitle: brand });
    }
  });

  test('PR-07: cada producto de una marca declara la marca filtrada', async ({ productPage }) => {
    const brand = 'Polo';
    let detailUrls: string[] = [];

    await test.step(`Cuando abro el filtro de la marca ${brand}`, async () => {
      await productPage.openBrand(brand);
    }, { subtitle: brand });

    await test.step('Entonces el listado coincide con el stock del sidebar y expone cada ficha', async () => {
      const counts = await productPage.brandSidebarCounts();
      const cards = await productPage.resultCards();
      expect(cards.length, `El filtro de ${brand} no debe quedar vacío`).toBeGreaterThan(0);
      expect(cards.length, `El filtro de ${brand} debe mostrar el stock contado en el sidebar`).toBe(counts[brand]);
      detailUrls = await productPage.resultDetailUrls();
      expect(detailUrls.length, 'Cada tarjeta del filtro debe exponer su ficha de detalle').toBe(cards.length);
    });

    for (const href of detailUrls) {
      await test.step(`Y abro la ficha ${href} y verifico su marca`, async () => {
        await productPage.openProductDetailByUrl(href);
        const detail = await productPage.readProductDetail();
        expect.soft(detail.brand, `El producto "${detail.name}" del filtro ${brand} debe declarar la marca ${brand}`)
          .toBe(brand);
      }, { subtitle: href });
    }
  });

  test('PR-08: una marca inexistente responde 200 y no lista productos ajenos', async ({ productPage, page }) => {
    const fakeBrand = 'NoExisteXyz';

    await test.step('Cuando abro una marca que no existe', async () => {
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes(`/brand_products/${fakeBrand}`)),
        page.goto(`/brand_products/${fakeBrand}`),
      ]);
      expect(response.status(), 'La marca inexistente debe responder 200, nunca 5xx').toBe(200);
    }, { subtitle: fakeBrand });

    await test.step('Entonces el sitio muestra una página vacía controlada y sin errores', async () => {
      const title = (await productPage.searchResultsTitle()).toLowerCase();
      expect(title, `El título debe reflejar la marca pedida: "BRAND - ${fakeBrand.toUpperCase()} PRODUCTS"`)
        .toBe(`brand - ${fakeBrand} products`.toLowerCase());
      expect((await productPage.resultCards()).length, 'Una marca inexistente no debe listar productos').toBe(0);
      const body = (await page.evaluate(() => document.body.innerText)).toLowerCase();
      expect(body, 'La página no debe exponer errores ni trazas del servidor').not.toMatch(SIN_RASTRO_DE_ERROR);
    });
  });
});
