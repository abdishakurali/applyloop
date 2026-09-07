import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  stripe ??= new Stripe(secret);
  return stripe;
}

export function billingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export function isFreeUser(email: string | null | undefined) {
  const freeEmail = process.env.FREE_USER_EMAIL?.trim().toLowerCase();
  return Boolean(freeEmail && email?.trim().toLowerCase() === freeEmail);
}
