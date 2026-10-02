import { type Page, type Locator, expect } from "@playwright/test";
import type { Healer } from "../healing";
import { candidateToLocator, cssCandidateIndex } from "../healing/locator-factory";
import { cartLocators } from "../locators/cart.locators";

/**
 * POM del carrito y su checkout invitado.
 *
 * Acciones y presencias del camino feliz van por la escalera gobernada
 * (`healer.click`/`resolve`); las ausencias se derivan del propio
 * `LocatorSpec` con `healer.locator` (traducción pura, sin gastar curaciones).
 */
export class CartPage {

    constructor(
        private readonly page: Page,
        private readonly healer: Healer,
    ) { }

    async goto(): Promise<void> {
        await this.page.goto('/view_cart');
    }

    /** Pulsa el control de checkout (invitado abre el aviso; con sesión navega). */
    async checkout(): Promise<void> {
        await this.healer.click(cartLocators.checkoutButton);
    }

    /** Devuelve la fila del producto indicado en la tabla del carrito. */
    async productRow(product: string): Promise<Locator> {
        return this.healer.resolve(cartLocators.product(product));
    }

    /**
     * Vacía el carrito clicando el aspa de cada fila hasta que no quede ninguna
     * (DEC-08), sin esperas fijas: cada clic espera a que baje el conteo.
     */
    async clearCart(): Promise<void> {
        const deletes = candidateToLocator(this.page, cartLocators.cartDeleteButton.candidates[0]);
        while ((await deletes.count()) > 0) {
            const remaining = await deletes.count();
            await this.healer.click(cartLocators.cartDeleteButton);
            await expect(deletes, 'Cada eliminación debe quitar una fila del carrito')
                .toHaveCount(remaining - 1);
        }
        const empty = await this.healer.resolve(cartLocators.cartEmptyMessage);
        await expect(empty, 'Al vaciar el carrito debe verse "Cart is empty!"').toBeVisible();
    }

    /** Invitado con el carrito vacío: mensaje de vacío y ningún control de checkout. */
    async expectEmpty(): Promise<void> {
        const empty = await this.healer.resolve(cartLocators.cartEmptyMessage);
        await expect(empty, 'El carrito vacío debe mostrar "Cart is empty!"').toBeVisible();
        const checkoutSpec = cartLocators.checkoutButton;
        await expect(
            this.healer.locator(checkoutSpec, cssCandidateIndex(checkoutSpec)),
            'Un carrito vacío no debe ofrecer ningún control de checkout',
        ).toHaveCount(0);
    }

    /** Invitado: el checkout muestra el aviso para iniciar sesión y su enlace a /login. */
    async expectCheckoutLoginPrompt(): Promise<void> {
        const prompt = await this.healer.resolve(cartLocators.checkoutLoginPrompt);
        await expect(prompt, 'Sin sesión debo ver el aviso para iniciar sesión desde el checkout').toBeVisible();

        const loginLink = await this.healer.resolve(cartLocators.checkoutLoginLink);
        await expect(loginLink, 'El aviso debe ofrecer el enlace "Register / Login"').toBeVisible();
        expect(await loginLink.getAttribute('href'), 'El enlace "Register / Login" debe llevar a /login').toBe('/login');
    }

    /** Con sesión: el aviso de iniciar sesión no debe mostrarse (proyección pura, H-01). */
    async expectCheckoutLoginPromptHidden(): Promise<void> {
        const spec = cartLocators.checkoutLoginPrompt;
        await expect(
            this.healer.locator(spec, cssCandidateIndex(spec)),
            'Con sesión no debe aparecer el aviso de iniciar sesión en el checkout',
        ).toHaveCount(0);
    }

    /** "Continue On Cart" cierra el aviso sin avanzar el checkout. */
    async expectContinueOnCartClosesModal(): Promise<void> {
        await this.healer.click(cartLocators.continueOnCart);
        const spec = cartLocators.checkoutLoginPrompt;
        await expect(
            this.healer.locator(spec, cssCandidateIndex(spec)),
            '"Continue On Cart" debe cerrar el aviso de checkout',
        ).not.toBeVisible();
    }

    /** Carrito vacío: sigue el enlace "here" hacia el catálogo. */
    async followEmptyCartLink(): Promise<void> {
        await this.healer.click(cartLocators.cartEmptyHereLink);
        await this.page.waitForURL(/\/products/);
    }

    /** Aviso de checkout invitado: sigue el enlace "Register / Login". */
    async followCheckoutLogin(): Promise<void> {
        await this.healer.click(cartLocators.checkoutLoginLink);
        await this.page.waitForURL(/\/login/);
    }

}
