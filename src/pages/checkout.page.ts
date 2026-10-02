import { type Page, type Download, expect } from "@playwright/test";
import { stat } from "node:fs/promises";
import type { Healer } from "../healing";
import { checkoutLocators } from "../locators/checkout.locators";
import type { TestCard } from "../constant/product-data";

/**
 * POM del checkout autenticado: direcciones, review, pago y factura.
 *
 * Acciones y presencias del camino feliz van por la escalera gobernada
 * (`healer.fill`/`click`/`resolve`); la factura se captura por el evento de
 * descarga (DEC-07), nunca navegando. No declara selectores literales.
 */
export class CheckoutPage {

    constructor(
        private readonly page: Page,
        private readonly healer: Healer,
    ) { }

    /** Verifica que el checkout muestre la dirección de entrega y la de facturación. */
    async expectAddresses(): Promise<void> {
        const delivery = await this.healer.resolve(checkoutLocators.checkoutDeliveryAddress);
        await expect(delivery, 'El checkout debe mostrar la dirección de entrega').toBeVisible();
        await expect(delivery, 'La dirección de entrega no debe estar vacía').not.toBeEmpty();

        const billing = await this.healer.resolve(checkoutLocators.checkoutBillingAddress);
        await expect(billing, 'El checkout debe mostrar la dirección de facturación').toBeVisible();
        await expect(billing, 'La dirección de facturación no debe estar vacía').not.toBeEmpty();
    }

    /**
     * Verifica el resumen real del pedido: el producto sembrado, su cantidad 1
     * y el monto. `#cart_info` es la tabla "Review Your Order" (sonda en vivo).
     */
    async expectReview(product: string, amount: string): Promise<void> {
        const review = await this.healer.resolve(checkoutLocators.checkoutReview);
        await expect(review, 'El checkout debe mostrar el resumen del pedido').toBeVisible();
        await expect(review, `El resumen del pedido debe incluir el producto "${product}"`).toContainText(product);
        await expect(review, 'El resumen del pedido debe mostrar cantidad 1 del producto').toContainText(/\b1\b/);
        await expect(review, `El resumen del pedido debe mostrar el monto "${amount}"`).toContainText(amount);
    }

    /** Confirma el pedido y espera la pasarela de pago. */
    async placeOrder(): Promise<void> {
        await this.healer.click(checkoutLocators.placeOrderButton);
        await this.page.waitForURL(/\/payment/);
    }

    /** Completa el formulario de pago con los datos de la tarjeta de prueba. */
    async fillPayment(card: TestCard): Promise<void> {
        await this.healer.fill(checkoutLocators.paymentNameOnCard, card.name);
        await this.healer.fill(checkoutLocators.paymentCardNumber, card.number);
        await this.healer.fill(checkoutLocators.paymentCvc, card.cvc);
        await this.healer.fill(checkoutLocators.paymentExpiryMonth, card.month);
        await this.healer.fill(checkoutLocators.paymentExpiryYear, card.year);
    }

    /** Paga y confirma la orden, esperando la página de confirmación. */
    async payAndConfirm(): Promise<void> {
        await this.healer.click(checkoutLocators.payConfirmButton);
        await this.page.waitForURL(/\/payment_done\//);
    }

    /** Verifica los mensajes de orden colocada y confirmada. */
    async expectOrderPlaced(): Promise<void> {
        const placed = await this.healer.resolve(checkoutLocators.orderPlacedText);
        await expect.soft(placed, 'La página debe confirmar "ORDER PLACED!"').toBeVisible();

        const confirmed = await this.healer.resolve(checkoutLocators.orderConfirmedText);
        await expect.soft(confirmed, 'La página debe confirmar "Congratulations! Your order has been confirmed!"').toBeVisible();
    }

    /**
     * Descarga la factura capturando el evento de descarga (no navega) y
     * verifica que el archivo descargado no esté vacío.
     */
    async downloadInvoice(): Promise<Download> {
        const link = await this.healer.resolve(checkoutLocators.downloadInvoiceLink);
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            link.click(),
        ]);
        const path = await download.path();
        const size = path ? (await stat(path)).size : 0;
        expect(size, 'La factura descargada no debe estar vacía').toBeGreaterThan(0);
        return download;
    }

}
