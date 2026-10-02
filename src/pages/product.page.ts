import { type Page, type Locator, expect } from "@playwright/test";
import type { Healer } from "../healing";
import { candidateToLocator, cssCandidateIndex } from "../healing/locator-factory";
import { productLocators } from "../locators/product.locators";
import { CATEGORIES, type ProductDetail } from "../constant/product-data";
import type { NavbarComponent } from "../components/navbar.component";

/** Quita la etiqueta (`Category:`, `Brand:`...) de un texto del detalle. */
function stripLabel(text: string, label: string): string {
    return text.replace(label, '').trim();
}

export class ProductPage {

    constructor(
        private readonly page: Page,
        private readonly healer: Healer,
        readonly navbar: NavbarComponent
    ) {
    }

    /** Navega al catálogo de productos. */
    async goto(): Promise<void> {
        await this.page.goto('/products');
    }

    /**
     * Busca un término en el catálogo y espera la navegación a los resultados.
     * El término se envía tal cual (texto plano), incluida la cadena vacía.
     */
    async searchProduct(term: string): Promise<void> {
        await this.healer.fill(productLocators.searchBar, term);
        await Promise.all([
            this.page.waitForURL(/\/products\?search=/),
            this.healer.click(productLocators.searchButton),
        ]);
    }

    /**
     * Devuelve todas las tarjetas del listado actual (DEC-02: proyección pura
     * del `LocatorSpec` a un `Locator` multi-match, sin selector literal).
     */
    async resultCards(): Promise<Locator[]> {
        const cards = candidateToLocator(this.page, productLocators.productCards.candidates[0]);
        await this.page.waitForLoadState('domcontentloaded');
        return cards.all();
    }

    /** Lee el título del listado (`All Products` / `Searched Products`). */
    async searchResultsTitle(): Promise<string> {
        return (await this.healer.text(productLocators.searchResultsTitle)).trim();
    }

    /** Navega al filtro de una marca desde el sidebar. */
    async openBrand(brand: string): Promise<void> {
        await this.healer.click(productLocators.brands(brand));
        await this.page.waitForURL(/\/brand_products\//);
    }

    /**
     * Navega al filtro de una categoría/subcategoría desde el acordeón.
     *
     * Las subcategorías viven en paneles colapsados: si el enlace destino no
     * está visible, se expande primero el encabezado de su categoría padre
     * (sonda 2026-10-02).
     */
    async openCategory(href: string): Promise<void> {
        const category = CATEGORIES.find((entry) => entry.href === href);
        const spec = productLocators.categoryLink(href);
        const link = this.healer.locator(spec, cssCandidateIndex(spec));
        if (category && !(await link.isVisible())) {
            await this.healer.click(productLocators.categoryToggle(category.parent));
        }
        await this.healer.click(spec);
        await this.page.waitForURL(/\/category_products\//);
    }

    /**
     * Lee el conteo declarado por cada marca en el sidebar del listado actual,
     * indexado por el nombre canónico de la marca (p. ej. `Polo` -> 6).
     */
    async brandSidebarCounts(): Promise<Record<string, number>> {
        const links = candidateToLocator(this.page, productLocators.brandLinks.candidates[0]);
        await this.page.waitForLoadState('domcontentloaded');
        const counts: Record<string, number> = {};
        for (const link of await links.all()) {
            const text = (await link.textContent()) ?? '';
            const count = Number(text.match(/\((\d+)\)/)?.[1]);
            const name = text.replace(/\(\d+\)/, '').trim();
            if (name && Number.isFinite(count)) {
                counts[name] = count;
            }
        }
        return counts;
    }

    /** Lee los enlaces del acordeón de categorías (`label` + `href`). */
    async categorySidebar(): Promise<{ label: string; href: string }[]> {
        const links = candidateToLocator(this.page, productLocators.categoryLinks.candidates[0]);
        await this.page.waitForLoadState('domcontentloaded');
        const entries: { label: string; href: string }[] = [];
        for (const link of await links.all()) {
            const href = await link.getAttribute('href');
            if (href) {
                entries.push({ label: ((await link.textContent()) ?? '').trim(), href });
            }
        }
        return entries;
    }

    /** Devuelve los `href` de las fichas de detalle de las tarjetas del listado. */
    async resultDetailUrls(): Promise<string[]> {
        const links = candidateToLocator(this.page, productLocators.productDetailLinks.candidates[0]);
        await this.page.waitForLoadState('domcontentloaded');
        const hrefs: string[] = [];
        for (const link of await links.all()) {
            const href = await link.getAttribute('href');
            if (href) {
                hrefs.push(href);
            }
        }
        return hrefs;
    }

    /** Abre la ficha de detalle por su URL (navegación de retorno dentro del POM). */
    async openProductDetailByUrl(href: string): Promise<void> {
        await this.page.goto(href);
        await this.page.waitForURL(/\/product_details\/\d+/);
    }

    /** Abre el detalle del producto por el enlace "View Product" de su tarjeta. */
    async openProductDetail(productName: string): Promise<void> {
        await this.healer.click(productLocators.viewProductLink(productName));
        await this.page.waitForURL(/\/product_details\/\d+/);
    }

    /** Lee y parsea los campos de la página de detalle abierta. */
    async readProductDetail(): Promise<ProductDetail> {
        const name = await this.healer.text(productLocators.productDetailName);
        const category = await this.healer.text(productLocators.productDetailCategory);
        const brand = await this.healer.text(productLocators.productDetailBrand);
        const availability = await this.healer.text(productLocators.productDetailAvailability);
        const condition = await this.healer.text(productLocators.productDetailCondition);
        const price = await this.healer.text(productLocators.productDetailPrice);
        const quantityInput = await this.healer.resolve(productLocators.productDetailQuantity);

        return {
            name: name.trim(),
            category: stripLabel(category, 'Category:'),
            brand: stripLabel(brand, 'Brand:'),
            availability: stripLabel(availability, 'Availability:'),
            condition: stripLabel(condition, 'Condition:'),
            price: price.trim(),
            quantity: Number((await quantityInput.inputValue()).trim()),
        };
    }

    /**
     * Agrega un producto al carrito desde su tarjeta: busca el producto, pulsa
     * "Add to cart", espera el modal `Added!` y lo cierra con "Continue Shopping".
     */
    async addProductToCart(productName: string): Promise<void> {
        await this.searchProduct(productName);
        await this.healer.click(productLocators.addToCartLink(productName));

        const confirmation = await this.healer.resolve(productLocators.productSuccessAddtoCart);
        await expect(confirmation).toBeVisible();

        await this.healer.click(productLocators.continueShoppingButton);
    }

}
