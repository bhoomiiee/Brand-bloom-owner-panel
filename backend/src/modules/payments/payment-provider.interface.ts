export interface PaymentProvider {
  createPaymentIntent(amountCents: number, currency: string): Promise<{ clientSecret: string }>;
}
