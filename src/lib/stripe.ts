import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  stripe ??= new Stripe(secret);
  return stripe;
}

export type BillingPlan = "base" | "premium";

export function getPriceId(plan: BillingPlan = "base") {
  return plan === "premium" ? process.env.STRIPE_PREMIUM_PRICE_ID : process.env.STRIPE_PRICE_ID;
}

export function billingConfigured(plan: BillingPlan = "base") {
  return Boolean(process.env.STRIPE_SECRET_KEY && getPriceId(plan));
}

export function isFreeUser(email: string | null | undefined) {
  const freeEmail = process.env.FREE_USER_EMAIL?.trim().toLowerCase();
  return Boolean(freeEmail && email?.trim().toLowerCase() === freeEmail);
}
