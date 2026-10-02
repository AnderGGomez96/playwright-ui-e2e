import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/product.locators.ts'

/** Slug estable para las claves de los locators dinámicos por producto. */
function slug(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '-')
}

/** Selector CSS de la tarjeta que contiene el nombre del producto. */
function cardSelector(productName: string): string {
  return `div.product-image-wrapper:has-text(${JSON.stringify(productName)})`
}

/**
 * Locators del módulo de producto: búsqueda, resultados y detalle (§5.2).
 *
 * Primarios semánticos siempre que el sitio exponga rol/nombre accesible;
 * fallback `css` anclado en ids/clases reales. El botón de búsqueda no tiene
 * nombre accesible: su ancla real es el id `#submit_search` (DEC-03). El
 * enlace "Add to cart" de la tarjeta no tiene `href` (no es rol `link`), por
 * eso su primario es `text` acotado a la tarjeta (sonda 2026-10-02, DEC-05).
 */
export const productLocators = {

  searchBar: {
    key: 'productSearchBar',
    description: 'Barra de búsqueda del catálogo de productos',
    action: 'fill',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productSearchBar
      { strategy: 'placeholder', value: 'Search Product' },
      { strategy: 'css', value: '#search_product' },
    ],
  } satisfies LocatorSpec,

  searchButton: {
    key: 'productSearchBarButton',
    description: 'Botón que envía la búsqueda del catálogo (ancla real #submit_search)',
    action: 'click',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productSearchBarButton
      { strategy: 'css', value: '#submit_search' },
    ],
  } satisfies LocatorSpec,

  searchResultsTitle: {
    key: 'productSearchResultsTitle',
    description: 'Título del listado de productos: All Products o Searched Products',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productSearchResultsTitle
      { strategy: 'css', value: '.features_items h2.title' },
    ],
  } satisfies LocatorSpec,

  productCards: {
    key: 'productCards',
    description: 'Tarjetas de producto del listado (colección, DEC-02)',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productCards
      { strategy: 'css', value: 'div.product-image-wrapper' },
    ],
  } satisfies LocatorSpec,

  productCard(productName: string): LocatorSpec {
    return {
      key: `productCard.${slug(productName)}`,
      description: `Tarjeta del producto ${productName}`,
      action: 'read',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:productCard
        { strategy: 'css', value: cardSelector(productName) },
      ],
    } satisfies LocatorSpec
  },

  viewProductLink(productName: string): LocatorSpec {
    const card = cardSelector(productName)
    return {
      key: `productViewLink.${slug(productName)}`,
      description: `Enlace "View Product" de la tarjeta de ${productName}`,
      action: 'click',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:productViewLink
        { strategy: 'role', role: 'link', name: 'View Product', within: card },
        { strategy: 'css', value: `${card} a[href^="/product_details/"]` },
      ],
    } satisfies LocatorSpec
  },

  addToCartLink(productName: string): LocatorSpec {
    const card = cardSelector(productName)
    return {
      key: `productAddToCartLink.${slug(productName)}`,
      description: `Enlace "Add to cart" de la tarjeta de ${productName}`,
      action: 'click',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:productAddToCartLink
        { strategy: 'text', value: 'Add to cart', exact: true, within: card },
        { strategy: 'css', value: `${card} a:has-text("Add to cart")` },
      ],
    } satisfies LocatorSpec
  },

  continueShoppingButton: {
    key: 'productContinueShoppingButton',
    description: 'Botón "Continue Shopping" del modal de producto agregado',
    action: 'click',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productContinueShoppingButton
      { strategy: 'role', role: 'button', name: 'Continue Shopping', within: '.modal-footer' },
      { strategy: 'css', value: '.modal-footer button' },
    ],
  } satisfies LocatorSpec,

  productSuccessAddtoCart: {
    key: 'productSuccessAddtoCart',
    description: 'Mensaje "Added!" del modal de confirmación de carrito',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productSuccessAddtoCart
      { strategy: 'text', value: 'Added!', within: '.modal-content' },
      { strategy: 'css', value: '.modal-content' },
    ],
  } satisfies LocatorSpec,

  productDetailName: {
    key: 'productDetailName',
    description: 'Nombre del producto en su página de detalle',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailName
      { strategy: 'css', value: '.product-information h2' },
    ],
  } satisfies LocatorSpec,

  productDetailCategory: {
    key: 'productDetailCategory',
    description: 'Categoría del producto en su página de detalle',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailCategory
      { strategy: 'css', value: '.product-information p:has-text("Category:")' },
    ],
  } satisfies LocatorSpec,

  productDetailBrand: {
    key: 'productDetailBrand',
    description: 'Marca del producto en su página de detalle',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailBrand
      { strategy: 'css', value: '.product-information p:has-text("Brand:")' },
    ],
  } satisfies LocatorSpec,

  productDetailAvailability: {
    key: 'productDetailAvailability',
    description: 'Disponibilidad del producto en su página de detalle',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailAvailability
      { strategy: 'css', value: '.product-information p:has-text("Availability:")' },
    ],
  } satisfies LocatorSpec,

  productDetailCondition: {
    key: 'productDetailCondition',
    description: 'Condición del producto en su página de detalle',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailCondition
      { strategy: 'css', value: '.product-information p:has-text("Condition:")' },
    ],
  } satisfies LocatorSpec,

  productDetailPrice: {
    key: 'productDetailPrice',
    description: 'Precio del producto en su página de detalle (sin clase .price)',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailPrice
      { strategy: 'css', value: '.product-information span span' },
    ],
  } satisfies LocatorSpec,

  productDetailQuantity: {
    key: 'productDetailQuantity',
    description: 'Cantidad por defecto del producto en su página de detalle',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailQuantity
      { strategy: 'css', value: '#quantity' },
    ],
  } satisfies LocatorSpec,

  brandLinks: {
    key: 'brandLinks',
    description: 'Enlaces del sidebar de marcas (colección, para leer el conteo en vivo)',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:brandLinks
      { strategy: 'css', value: '.brands-name a' },
    ],
  } satisfies LocatorSpec,

  brands(brand: string): LocatorSpec {
    return {
      key: `brand.${slug(brand)}`,
      description: `Enlace de la marca ${brand} en el sidebar`,
      action: 'click',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:brands
        { strategy: 'role', role: 'link', name: brand, within: '.brands-name' },
        { strategy: 'css', value: `.brands-name a:has-text(${JSON.stringify(brand)})` },
      ],
    } satisfies LocatorSpec
  },

  categoryLinks: {
    key: 'categoryLinks',
    description: 'Enlaces de categorías del acordeón (colección)',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:categoryLinks
      { strategy: 'css', value: '#accordian a[href^="/category_products/"]' },
    ],
  } satisfies LocatorSpec,

  categoryToggle(parent: string): LocatorSpec {
    return {
      key: `categoryToggle.${slug(parent)}`,
      description: `Encabezado ${parent} del acordeón de categorías`,
      action: 'click',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:categoryToggle
        // El nombre accesible del encabezado viene con espacio inicial (badge)
        // y "Men" colisiona con "Women": se ancla en el href estable (DEC-03, sonda).
        { strategy: 'css', value: `#accordian .panel-heading a[href="#${parent}"]` },
      ],
    } satisfies LocatorSpec
  },

  categoryLink(href: string): LocatorSpec {
    const id = href.split('/').filter(Boolean).pop() ?? href
    return {
      key: `category.${slug(id)}`,
      description: `Enlace de la categoría ${href} en el acordeón`,
      action: 'click',
      sourceFile: SOURCE,
      candidates: [
        //@heal-target:categoryLink
        { strategy: 'css', value: `a[href="${href}"]`, within: '#accordian' },
      ],
    } satisfies LocatorSpec
  },

  productDetailLinks: {
    key: 'productDetailLinks',
    description: 'Enlaces "View Product" de todas las tarjetas del listado (colección)',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:productDetailLinks
      { strategy: 'css', value: 'div.product-image-wrapper a[href^="/product_details/"]' },
    ],
  } satisfies LocatorSpec,

}
