import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/cart.locators.ts'

/**
 * Locators del carrito y de su checkout invitado (§5.3).
 *
 * Primarios semánticos (`role`/`text` con `within` real) y fallback `css`
 * anclado en ids/clases verificados por sonda. El control "Proceed To
 * Checkout" es un `<a>` sin `href` ni rol accesible: su primario es el texto
 * exacto (consistente con `addToCartLink`) y el css `.check_out` respalda la
 * proyección de ausencia.
 */
export const cartLocators = {

    checkoutButton: {
        key: 'checkoutButton',
        description: 'Control para proceder con el checkout del carrito',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:checkoutButton
            { strategy: 'text', value: 'Proceed To Checkout', exact: true },
            { strategy: 'css', value: 'a.check_out' },
        ],
    } satisfies LocatorSpec,

    product(product: string): LocatorSpec {
        const slug = product.toLowerCase().trim().replace(/\s+/g, '-')
        return {
            key: `cartProduct.${slug}`,
            description: `Fila del producto "${product}" en la tabla del carrito`,
            action: 'read',
            sourceFile: SOURCE,
            candidates: [
                //@heal-target:cartProduct
                { strategy: 'role', role: 'row', name: product, within: '#cart_info_table' },
                { strategy: 'css', value: `tr[id^="product-"]:has-text(${JSON.stringify(product)})` },
            ],
        } satisfies LocatorSpec
    },

    checkoutLoginPrompt: {
        key: 'checkoutLoginPrompt',
        description: 'Aviso del checkout que pide iniciar sesión para continuar (invitado)',
        action: 'assert',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:checkoutLoginPrompt
            { strategy: 'text', value: 'Register / Login account to proceed on checkout.', within: '.modal-body' },
            { strategy: 'css', value: '.modal-body p:has-text("Register / Login account to proceed on checkout.")' },
        ],
    } satisfies LocatorSpec,

    checkoutLoginLink: {
        key: 'checkoutLoginLink',
        description: 'Enlace "Register / Login" del aviso de checkout para iniciar sesión',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:checkoutLoginLink
            { strategy: 'role', role: 'link', name: 'Register / Login', within: '.modal-body' },
            { strategy: 'css', value: '.modal-body a[href="/login"]' },
        ],
    } satisfies LocatorSpec,

    continueOnCart: {
        key: 'continueOnCart',
        description: 'Botón "Continue On Cart" que cierra el aviso de checkout sin avanzar',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:continueOnCart
            { strategy: 'role', role: 'button', name: 'Continue On Cart' },
            { strategy: 'css', value: '.modal-footer button', within: '#checkoutModal' },
        ],
    } satisfies LocatorSpec,

    cartDeleteButton: {
        key: 'cartDeleteButton',
        description: 'Enlace de eliminar una fila del carrito (aspa)',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:cartDeleteButton
            { strategy: 'css', value: '#cart_info_table a.cart_quantity_delete' },
        ],
    } satisfies LocatorSpec,

    cartEmptyMessage: {
        key: 'cartEmptyMessage',
        description: 'Mensaje "Cart is empty!" del carrito sin productos',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:cartEmptyMessage
            { strategy: 'text', value: 'Cart is empty!', within: '#cart_info' },
        ],
    } satisfies LocatorSpec,

    cartEmptyHereLink: {
        key: 'cartEmptyHereLink',
        description: 'Enlace "here" del carrito vacío que lleva al catálogo',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:cartEmptyHereLink
            { strategy: 'role', role: 'link', name: 'here', within: '#cart_info' },
            { strategy: 'css', value: '#cart_info a[href="/products"]' },
        ],
    } satisfies LocatorSpec,

}
