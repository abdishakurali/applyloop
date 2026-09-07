import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { billingConfigured, getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!billingConfigured()) return NextResponse.json({ error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID." }, { status: 503 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    customer_email: user.email ?? undefined,
    metadata: { user_id: user.id },
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?cancelled=1`,
  });
  return NextResponse.json({ url: session.url });
}
