export const NAVBAR_ITEMS = {
  home: 'Home',
  pricing: 'Products',
  Cart: 'Cart',
  SingupLogin: 'Sign Up / Login',
  TestCases: 'Test Cases',
  ApiTesting: 'API Testing',
} as const

export type NavbarOption = keyof typeof NAVBAR_ITEMS