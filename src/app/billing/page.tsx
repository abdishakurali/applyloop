import { BillingActions } from "@/components/BillingActions";
import { WorkspaceShell } from "@/components/WorkspaceShell";
import { billingConfigured } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentUser();
  return <WorkspaceShell active="billing" userName={user?.user_metadata?.full_name ?? "Your workspace"}>
    <div className="mx-auto w-full max-w-[980px] px-7 py-10">
      <div className="max-w-[620px]"><div className="text-[11px] font-bold uppercase tracking-[.16em] text-accent">Pricing</div><h1 className="mt-2 text-[32px] font-semibold tracking-[-.05em]">Paid plans built for sustainable matching.</h1><p className="mt-3 text-[14px] leading-relaxed text-muted">Every active workspace helps cover job-source access, AI generation, and document processing. Choose the level of application volume you need.</p></div>
      <div className="mt-8 grid max-w-[860px] gap-4 md:grid-cols-2"><div className="rounded-2xl border border-border bg-white p-6"><div className="text-[12px] font-bold uppercase tracking-[.12em] text-muted">Base</div><div className="mt-3 text-3xl font-semibold">€12<span className="text-sm font-medium text-muted">/month</span></div><p className="mt-2 text-[12px] text-muted">For a focused search with the essentials.</p><ul className="mt-5 space-y-2 text-[12px] text-muted"><li>✓ Role and location preferences</li><li>✓ Source-backed job board</li><li>✓ Résumé and draft review</li></ul><div className="mt-5"><BillingActions configured={billingConfigured("base")} plan="base" /></div></div><div className="rounded-2xl border-2 border-accent bg-white p-6 shadow-[0_14px_36px_rgba(43,63,232,.12)]"><div className="flex items-center justify-between"><div className="text-[12px] font-bold uppercase tracking-[.12em] text-accent">Premium</div><span className="rounded-full bg-accent-tint px-2.5 py-1 text-[10px] font-bold text-accent">Best for volume</span></div><div className="mt-3 text-3xl font-semibold">€39<span className="text-sm font-medium text-muted">/month</span></div><p className="mt-2 text-[12px] text-muted">For multiple roles, more preparation, and a higher-throughput workflow.</p><ul className="mt-5 space-y-2 text-[12px] text-muted"><li>✓ Multiple role-specific résumés</li><li>✓ Bulk draft and cover-letter preparation</li><li>✓ Application tracking and exports</li></ul><div className="mt-5"><BillingActions configured={billingConfigured("premium")} plan="premium" /></div></div></div>
      <p className="mt-8 max-w-[760px] text-[11px] leading-relaxed text-faint">Payments use Stripe Checkout. Before charging customers in the EU or US, configure your tax registrations and Stripe Tax settings.</p>
    </div>
  </WorkspaceShell>;
}
