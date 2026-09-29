import { type Page, type Locator, expect } from "@playwright/test";
import type { Healer } from "../healing";
import { productLocators } from "../locators/product.locators";
import { NavbarComponent } from "../components/navbar.component";

export class ProductPage {

    /*readonly page: Page;
    readonly healer: Healer;
    searchProduct: Locator;
    buttonSearch: Locator;
    categoria: Locator;
    brands: Locator;
    cards: Locator;
    continueShoppingButton: Locator;
    cartLink: Locator;

    constructor(page: Page, healer: Healer) {
        this.page = page;
        this.healer=healer;
        this.searchProduct = page.getByRole('textbox', { name: 'search' });
        this.buttonSearch = page.locator('#submit_search');
        this.categoria = page.locator('.panel-title');
        this.brands = page.getByRole('listitem');
        this.cards = page.locator('.product-image-wrapper');
        this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
        this.cartLink = page.getByRole('link', { name: /cart/i });
    }*/
    constructor(
        private readonly page: Page,
        private readonly healer: Healer,
        readonly navbar: NavbarComponent
    ) {
    }

    async goto() {
        await this.page.goto('/products');
    }

    async searchProduct(product: string) {
        await this.healer.fill(productLocators.searchBar, product)
        await this.healer.click(productLocators.searchButton)
    }

    async getOfSearchResults(product: string): Promise<Locator> {
        return await this.healer.resolve(productLocators.productCard(product))
    }

    async getBrand(brandName: string): Promise<String> {
        return await this.healer.text(productLocators.brands(brandName))
    }

    async getCategoria(categoriaName: string): Promise<String> {
        return await this.healer.text(productLocators.categorias(categoriaName))
    }


    async addProductToCart(productName: string) {
        await this.searchProduct(productName);
        const product = await this.getOfSearchResults(productName);
        await product.getByText('Add to cart').first().click();

        const confirmation = await this.healer.resolve(productLocators.successMessage)
        await expect(confirmation).toBeVisible()

        await this.healer.click(productLocators.continueShoppingButton)
    }
    
}