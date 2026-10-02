/**
 * Datos canónicos del módulo de producto (sonda 2026-10-02).
 *
 * `SAMPLE_PRODUCT` es la ficha real del producto `/product_details/1`
 * (`Blue Top`) y es el valor contra el que PR-05 afirma campo a campo.
 * Las marcas y categorías se ampliarán en la tarea 3 (BL-001).
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
