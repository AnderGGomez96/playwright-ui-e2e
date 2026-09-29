import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/cart.locators.ts'

export const cartLocators = {

    checkoutButton:{
        key:'checkoutButton',
        description: 'Boton para proceder con el checkout',
        action: 'click',
        sourceFile: SOURCE,
        candidates:[
            //@heal-target:checkoutButton
            {strategy: 'role', role:'button', name:'Proceed To Checkout'},
            {strategy: 'text', value:'Proceed To Checkout'}
        ]
    } satisfies LocatorSpec,

    product (product: string): LocatorSpec{
        const slug = product.toLowerCase().trim().replace(/s+/g,'-')
        return {
            key: `cartProduct.${slug}`,
            description: `Fila del producto "${product}" en la tabla del carrito`,
            action: 'read',
            sourceFile: SOURCE,
            candidates:[
                //@heal-target:cartProduct
                {strategy: 'role', role:'row', name: product, within:'#cart_info_table'},
                {strategy: 'css', value: `tr[id^="product-"](${JSON.stringify(product)})`},
            ]
        } satisfies LocatorSpec
    } 
}
