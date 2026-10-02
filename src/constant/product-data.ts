/**
 * Datos canónicos del módulo de producto (sonda 2026-10-02).
 *
 * `SAMPLE_PRODUCT` es la ficha real del producto `/product_details/1`
 * (`Blue Top`) y es el valor contra el que PR-05 afirma campo a campo.
 * `BRANDS` y `CATEGORIES` son el canon del sidebar y del acordeón (tarea 3,
 * BL-001); el conteo de cada marca es stock dinámico y se lee en vivo.
 */
export interface ProductDetail {
  /** Nombre visible del producto. */
  name: string
  /** Categoría y subcategoría, separadas por ` > `. */
  category: string
  /** Marca del producto. */
  brand: string
  /** Texto de disponibilidad (p. ej. `In Stock`). */
  availability: string
  /** Condición del producto (p. ej. `New`). */
  condition: string
  /** Precio formateado tal como lo muestra el sitio (p. ej. `Rs. 500`). */
  price: string
  /** Cantidad por defecto del detalle. */
  quantity: number
}

/** Ficha de muestra de `/product_details/1` (`Blue Top`). */
export const SAMPLE_PRODUCT: ProductDetail = {
  name: 'Blue Top',
  category: 'Women > Tops',
  brand: 'Polo',
  availability: 'In Stock',
  condition: 'New',
  price: 'Rs. 500',
  quantity: 1,
}

/**
 * Marcas canónicas del sidebar, en el orden real del sitio.
 *
 * D-005/AC-06.2: la marca es `Madame`, nunca `Madames`.
 */
export const BRANDS = [
  'Polo',
  'H&M',
  'Madame',
  'Mast & Harbour',
  'Babyhug',
  'Allen Solly Junior',
  'Kookie Kids',
  'Biba',
] as const

/** Categoría/subcategoría del acordeón con su ruta y la cadena del detalle. */
export interface ProductCategory {
  /** Categoría padre del acordeón (p. ej. `Women`). */
  parent: string
  /** Etiqueta de la subcategoría (p. ej. `Dress`). */
  label: string
  /** Ruta del enlace del acordeón. */
  href: string
  /** Cadena que expone el detalle del producto (p. ej. `Women > Dress`). */
  detail: string
}

/** Las 7 categorías/subcategorías canónicas, en el orden real del acordeón. */
export const CATEGORIES: ProductCategory[] = [
  { parent: 'Women', label: 'Dress', href: '/category_products/1', detail: 'Women > Dress' },
  { parent: 'Women', label: 'Tops', href: '/category_products/2', detail: 'Women > Tops' },
  { parent: 'Women', label: 'Saree', href: '/category_products/7', detail: 'Women > Saree' },
  { parent: 'Men', label: 'Tshirts', href: '/category_products/3', detail: 'Men > Tshirts' },
  { parent: 'Men', label: 'Jeans', href: '/category_products/6', detail: 'Men > Jeans' },
  { parent: 'Kids', label: 'Dress', href: '/category_products/4', detail: 'Kids > Dress' },
  { parent: 'Kids', label: 'Tops & Shirts', href: '/category_products/5', detail: 'Kids > Tops & Shirts' },
]
