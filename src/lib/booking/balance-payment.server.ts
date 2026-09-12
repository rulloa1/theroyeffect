import type { StripeEnv } from "@/lib/stripe.server";

export interface BalanceSettlement {
  settled: boolean;
  reason?: string;
}

/**
 * Settles the remaining balance on a deposit commission after a Stripe
 * balance checkout completes. Idempotent: safe for webhook retries and for
 * the client-side confirmation call that runs on the portal return URL.
 *
 * Nothing about the session is trusted beyond what is checked here: it must be
 * a balance payment, made in the environment the order was placed in, for at
 * least the balance owed — and, from the portal, by the client who owns it.
 */
export async function settleCommissionBalance(input: {
  sessionId: string;
  amountTotal: number;
  env: StripeEnv;
  livemode: boolean;
  metadata: Record<string, string | undefined>;
  /** The signed-in client when settling from the portal; the payment must be theirs. */
  expectedUserId?: string;
}): Promise<BalanceSettlement> {
  if (input.metadata["purpose"] !== "commission_balance") {
    return { settled: false, reason: "That payment was not a balance payment" };
  }
  if (input.livemode !== (input.env === "live")) {
    return { settled: false, reason: "That payment was not made in this environment" };
  }
  if (input.expectedUserId && input.metadata["user_id"] !== input.expectedUserId) {
    return { settled: false, reason: "That payment belongs to a different account" };
  }

  const orderId = input.metadata["order_id"];
  if (!orderId) return { settled: false, reason: "That payment is not linked to an order" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, balance_status, balance_due_cents")
    .eq("id", orderId)
    .eq("environment", input.env)
    .maybeSingle();

  if (!order) return { settled: false, reason: "Order not found" };
  if (order.balance_status === "paid") return { settled: true };

  const due = Number(order.balance_due_cents ?? 0);
  if (input.amountTotal < due) {
    console.error(
      `Balance session ${input.sessionId} paid ${input.amountTotal} against ${due} owed on order ${orderId}`,
    );
    return { settled: false, reason: "That payment does not cover the balance owed" };
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      balance_status: "paid",
      balance_session_id: input.sessionId,
      balance_paid_at: new Date().toISOString(),
      balance_paid_cents: input.amountTotal,
    })
    .eq("id", orderId)
    .neq("balance_status", "paid");

  if (error) {
    console.error("Balance settlement failed:", error.message);
    return { settled: false, reason: "Recording the payment failed" };
  }
  return { settled: true };
}
