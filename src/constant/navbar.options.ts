/**
 * Opciones reales de la barra de navegación del sitio (sonda 2026-10-02).
 * `label` es el nombre accesible del enlace y `href` su destino.
 */
export interface NavbarItem {
  label: string
  href: string
}

/** Claves canónicas del navbar (guest y logged). */
export type NavbarOption =
  | 'home'
  | 'products'
  | 'cart'
  | 'signupLogin'
  | 'testCases'
  | 'apiTesting'
  | 'videoTutorials'
  | 'contactUs'

/** Etiquetas y destinos reales de cada opción del navbar. */
export const NAVBAR_ITEMS: Record<NavbarOption, NavbarItem> = {
  home: { label: 'Home', href: '/' },
  products: { label: 'Products', href: '/products' },
  cart: { label: 'Cart', href: '/view_cart' },
  signupLogin: { label: 'Signup / Login', href: '/login' },
  testCases: { label: 'Test Cases', href: '/test_cases' },
  apiTesting: { label: 'API Testing', href: '/api_list' },
  videoTutorials: {
    label: 'Video Tutorials',
    href: 'https://www.youtube.com/c/AutomationExercise',
  },
  contactUs: { label: 'Contact us', href: '/contact_us' },
}
