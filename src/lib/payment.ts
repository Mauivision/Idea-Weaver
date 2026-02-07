/**
 * Payment integration placeholder
 * Replace with real Stripe Checkout (or Gumroad / Lemon Squeezy) when ready.
 *
 * Stripe setup steps:
 * 1. Create Stripe account, get publishable + secret keys
 * 2. Add backend (e.g. Next.js API route, Vercel serverless, or Express):
 *    POST /api/create-checkout-session
 *    - Create Stripe Checkout Session with price (e.g. $1.99 one-time)
 *    - Return { sessionId }
 * 3. Redirect: stripe.redirectToCheckout({ sessionId })
 * 4. On success URL: verify payment, set premium flag (localStorage + backend)
 * 5. Webhook: Stripe -> your /api/webhook to confirm payment
 */

export const PREMIUM_PRICE_CENTS = 199;
export const PREMIUM_PRICE_DISPLAY = '$1.99';

export async function initiateCheckout(): Promise<{ success: boolean; error?: string }> {
  // TODO: Replace with real Stripe Checkout
  // const response = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount: PREMIUM_PRICE_CENTS }),
  // });
  // const { sessionId } = await response.json();
  // const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  // await stripe.redirectToCheckout({ sessionId });
  console.log(`Would redirect to Stripe Checkout for ${PREMIUM_PRICE_DISPLAY}`);
  return { success: false, error: 'Payment not configured' };
}
