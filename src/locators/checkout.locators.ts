import type { LocatorSpec } from '../healing/types'

const SOURCE = 'src/locators/checkout.locators.ts'

/**
 * Locators del checkout autenticado, la pasarela de pago y la confirmación
 * (§5.4, anclajes verificados por sonda 2026-10-02).
 *
 * Los contenedores de direcciones y el resumen del pedido se anclan por id/clase
 * real (no tienen rol accesible); "Place Order" es un enlace real (`a[href="/payment"]`)
 * y el resto de inputs/botón exponen `data-qa` (no `data-testid`).
 */
export const checkoutLocators = {

  checkoutDeliveryAddress: {
    key: 'checkoutDeliveryAddress',
    description: 'Bloque "YOUR DELIVERY ADDRESS" del checkout',
    action: 'assert',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:checkoutDeliveryAddress
      { strategy: 'css', value: '#address_delivery' },
    ],
  } satisfies LocatorSpec,

  checkoutBillingAddress: {
    key: 'checkoutBillingAddress',
    description: 'Bloque "YOUR BILLING ADDRESS" del checkout',
    action: 'assert',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:checkoutBillingAddress
      { strategy: 'css', value: '#address_invoice' },
    ],
  } satisfies LocatorSpec,

  checkoutReview: {
    key: 'checkoutReview',
    description: 'Resumen "Review Your Order" del checkout',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:checkoutReview
      { strategy: 'css', value: '#cart_info' },
      { strategy: 'css', value: '.checkout-information' },
    ],
  } satisfies LocatorSpec,

  placeOrderButton: {
    key: 'placeOrderButton',
    description: 'Enlace "Place Order" que lleva a la pasarela de pago',
    action: 'click',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:placeOrderButton
      { strategy: 'role', role: 'link', name: 'Place Order', exact: true },
      { strategy: 'css', value: 'a[href="/payment"]' },
    ],
  } satisfies LocatorSpec,

  paymentNameOnCard: {
    key: 'paymentNameOnCard',
    description: 'Campo "Name on Card" del formulario de pago',
    action: 'fill',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:paymentNameOnCard
      { strategy: 'css', value: 'input[data-qa="name-on-card"]' },
    ],
  } satisfies LocatorSpec,

  paymentCardNumber: {
    key: 'paymentCardNumber',
    description: 'Campo "Card Number" del formulario de pago',
    action: 'fill',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:paymentCardNumber
      { strategy: 'css', value: 'input[data-qa="card-number"]' },
    ],
  } satisfies LocatorSpec,

  paymentCvc: {
    key: 'paymentCvc',
    description: 'Campo CVC del formulario de pago',
    action: 'fill',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:paymentCvc
      { strategy: 'css', value: 'input[data-qa="cvc"]' },
    ],
  } satisfies LocatorSpec,

  paymentExpiryMonth: {
    key: 'paymentExpiryMonth',
    description: 'Campo de mes de expiración del formulario de pago',
    action: 'fill',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:paymentExpiryMonth
      { strategy: 'css', value: 'input[data-qa="expiry-month"]' },
    ],
  } satisfies LocatorSpec,

  paymentExpiryYear: {
    key: 'paymentExpiryYear',
    description: 'Campo de año de expiración del formulario de pago',
    action: 'fill',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:paymentExpiryYear
      { strategy: 'css', value: 'input[data-qa="expiry-year"]' },
    ],
  } satisfies LocatorSpec,

  payConfirmButton: {
    key: 'payConfirmButton',
    description: 'Botón "Pay and Confirm Order" del formulario de pago',
    action: 'click',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:payConfirmButton
      { strategy: 'css', value: 'button[data-qa="pay-button"]' },
    ],
  } satisfies LocatorSpec,

  orderPlacedText: {
    key: 'orderPlacedText',
    description: 'Texto "ORDER PLACED!" de la confirmación de la orden',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:orderPlacedText
      { strategy: 'text', value: 'ORDER PLACED!' },
    ],
  } satisfies LocatorSpec,

  orderConfirmedText: {
    key: 'orderConfirmedText',
    description: 'Texto "Congratulations! Your order has been confirmed!" de la confirmación',
    action: 'read',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:orderConfirmedText
      { strategy: 'text', value: 'Congratulations! Your order has been confirmed!' },
    ],
  } satisfies LocatorSpec,

  downloadInvoiceLink: {
    key: 'downloadInvoiceLink',
    description: 'Enlace "Download Invoice" de la orden confirmada',
    action: 'click',
    sourceFile: SOURCE,
    candidates: [
      //@heal-target:downloadInvoiceLink
      { strategy: 'css', value: 'a[href^="/download_invoice/"]' },
    ],
  } satisfies LocatorSpec,

}
