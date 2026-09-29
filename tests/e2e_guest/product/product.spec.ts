import { test, expect } from '../../../src/fixtures/base';
import { ProductPage } from '../../../src/pages/product.page';

test.describe('Product', () => {
  test('El producto debe mostrarse correctamente', async ({ productPage, page }) => {

    const palabra = 'Top'
    const productoEsperado = 'Winter Top'

    await productPage.searchProduct(palabra)
    const product = await productPage.getOfSearchResults(productoEsperado)

    expect(product).toContainText(productoEsperado)
  })


  test('Se despliegan las marcas correctamente', async ({ productPage, page }) => {
    const brands = ['Polo', 'H&M', 'Madames'];

    for (const brand of brands) {
      await test.step(`marca: ${brand}`, async () => {
        const brandName = await productPage.getBrand(brand)
        expect(brandName).toContain(brand)
      })
    }
  })

  test('Se despliegan las categorias correctamente', async ({productPage, page}) =>{
     const categorias = ['Kids', 'Women', 'Men']

     for(const categoria of categorias) {
      await test.step(`categoria: ${categoria}`, async() =>{
        const categoriaResult = (await productPage.getCategoria(categoria)).trim()
        expect(categoriaResult).toContain(categoria)
      })
     }
  })

  /*

  test('should display panel title correctly', async ({ productPage, page }) => {
    await expect(productPage.categoriaByName('WOMEN')).toBeVisible();
    await expect(productPage.categoriaByName('MEN')).toBeVisible();
    await expect(productPage.categoriaByName('KIDS')).toBeVisible();
  })
*/
})

