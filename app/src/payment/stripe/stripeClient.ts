import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'STRIPE_API_KEY is not configured. ' +
        'Please add STRIPE_API_KEY to your .env.server file. ' +
        'See: https://docs.opensaas.sh/guides/stripe-integration/'
      );
    }
    stripeInstance = new Stripe(apiKey, {
      // NOTE:
      // API version below should ideally match the API version in your Stripe dashboard.
      // If that is not the case, you will most likely want to (up/down)grade the `stripe`
      // npm package to the API version that matches your Stripe dashboard's one.
      // For more details and alternative setups check
      // https://docs.stripe.com/api/versioning .
      apiVersion: '2025-04-30.basil',
    });
  }
  return stripeInstance;
}

// Mantém compatibilidade com código existente
export const stripe = new Proxy({} as Stripe, {
  get: (_target, prop) => {
    return (getStripe() as any)[prop];
  },
});
