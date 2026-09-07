import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { billingConfigured, getPriceId, getStripe, type BillingPlan } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { plan?: BillingPlan };
  const plan: BillingPlan = body.plan === "premium" ? "premium" : "base";
  if (!billingConfigured(plan)) return NextResponse.json({ error: "This plan is not configured yet." }, { status: 503 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: getPriceId(plan)!, quantity: 1 }],
    customer_email: user.email ?? undefined,
    metadata: { user_id: user.id, plan },
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?cancelled=1`,
  });
  return NextResponse.json({ url: session.url });
}
