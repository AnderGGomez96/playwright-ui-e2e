import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/product.locators.ts'

export const productLocators = {

    searchBar: {
        key: 'productSearchBar',
        description: 'Barra de busqueda para productos',
        action: 'fill',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:productSearchBar
            { strategy: 'placeholder', value: 'Search Product', within: '#advertisement' },
            { strategy: 'testid', value: 'search_product' },
            { strategy: 'css', value: 'input[name="search"]' }
        ]
    } satisfies LocatorSpec,

    searchButton: {
        key: 'productSearchBarButton',
        description: 'Boton que inicia la busqueda en la barra de busqueda',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:productSearchBarButton
            { strategy: 'role', role: 'button', value: 'submit_search', within: '#advertisement' },

        ]
    } satisfies LocatorSpec,

    continueShoppingButton: {
        key: 'productContinueShoppingButton',
        description: 'Boton para continuar con la compra',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:productContinueShoppingButton
            { strategy: 'role', role: 'button', name: 'Continue Shopping', within: 'div[class="modal-footer"]' },
        ]
    } satisfies LocatorSpec,

    cartLink: {
        key: 'productCartLink',
        description: 'Enlace al carrito de compras',
        action: 'click',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:productCartLink
            { strategy: 'role', name: 'link', value: 'View Cart', within: 'div[class="modal-body"]' },
            { strategy: 'css', value: 'a[href="/view_cart"]' }
        ]
    } satisfies LocatorSpec,

    productCard(productName: string): LocatorSpec {
        const slug = productName.toLowerCase().trim().replace(/\s+/g, '-')
        return {
            key: 'productCard',
            description: `Tarjeta del producto ${productName}`,
            action: 'read',
            sourceFile: SOURCE,
            candidates: [
                //@heal-target:productCard
                { strategy: 'css', value: `div[class="product-image-wrapper"]:has-text(${JSON.stringify(productName)})` }
            ]
        } satisfies LocatorSpec
    },

    brands(brandName: string): LocatorSpec {
        const slug = brandName.toLowerCase().trim().replace(/\s+/g, '-')
        return {
            key: `productBrand.${slug}`,
            description: `Opcion de la marca ${brandName}`,
            action: 'click',
            sourceFile: SOURCE,
            candidates: [
                //@heal-target:brands
                { strategy: 'role', role: 'link', name: `${brandName}`, within: 'div[class="brands-name"]' },
            ]
        } satisfies LocatorSpec
    },

    categorias(categoriaName: string): LocatorSpec {
        const slug = categoriaName.toLowerCase().trim().replace(/\s+/g, '-')
        return {
            key: `productCategorie.${slug}`,
            description: `Opcion de la categoria ${categoriaName}`,
            action: 'click',
            sourceFile: SOURCE,
            candidates: [
                //@heal-target:categorias
                { strategy: 'text', value: `${categoriaName}`, exact: true, within: '#accordian' }
            ]
        } satisfies LocatorSpec
    },

    successMessage:{
        key: 'productSuccessAddtoCart',
        description: 'Mensaje de exito al añadir producto al carrito',
        action: 'read',
        sourceFile: SOURCE,
        candidates: [
            //@heal-target:productContinueShoppingButton
            { strategy: 'text', value:'Added!', within: '.modal-content' },
        ]
    } satisfies LocatorSpec,


}
