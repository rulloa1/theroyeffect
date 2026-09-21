/**
 * Server-only: places outbound (cold) calls through Vapi.
 *
 * The calling number is configured two ways, in priority order:
 *  1. VAPI_PHONE_NUMBER_ID — a Vapi phone-number ID (uuid-like).
 *  2. VAPI_OUTBOUND_NUMBER — the raw calling number in E.164 (e.g. +15714459046);
 *     it is resolved to its Vapi phone-number ID via the Vapi API at call time.
 *
 * Also requires VAPI_PRIVATE_KEY and VAPI_OUTBOUND_ASSISTANT_ID
 * (falls back to VAPI_ASSISTANT_ID). All are read at call time, never at module scope.
 */

const VAPI_API = "https://api.vapi.ai";

export interface OutboundCallInput {
  businessName: string;
  phone: string;
  website?: string | null;
  talkingPoints?: string | null;
}

export interface OutboundCallResult {
  callId: string;
  status: string;
}

/** E.164 normalisation for US numbers typed the way people actually type them. */
export function normalisePhone(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) throw new Error("That phone number looks wrong.");
    return `+${digits}`;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  throw new Error("Enter a 10-digit US number or a full +country number.");
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured yet.`);
  return value;
}

/** Resolve the outbound caller number to its Vapi phone-number ID. */
async function resolveCallerNumberId(apiKey: string): Promise<string> {
  const explicitId = process.env["VAPI_PHONE_NUMBER_ID"];
  // A uuid-like ID can be used as-is; anything that looks like a phone number needs resolving.
  if (explicitId && !explicitId.trim().startsWith("+")) return explicitId.trim();

  const outboundNumber = explicitId?.trim().startsWith("+") ? explicitId.trim() : process.env["VAPI_OUTBOUND_NUMBER"]?.trim();
  if (!outboundNumber) {
    throw new Error("No calling number configured — set VAPI_OUTBOUND_NUMBER (or VAPI_PHONE_NUMBER_ID).");
  }

  const response = await fetch(`${VAPI_API}/phone-number`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Could not look up Vapi phone numbers (${response.status}): ${text.slice(0, 300)}`);
  }

  let numbers: Array<{ id?: string; number?: string }>;
  try {
    numbers = JSON.parse(text) as Array<{ id?: string; number?: string }>;
  } catch {
    throw new Error("Vapi returned an unreadable phone-number list.");
  }

  const match = numbers.find((n) => n.number === outboundNumber || n.number === outboundNumber.replace(/^\+1/, "").slice(-10));
  if (!match?.id) {
    throw new Error(`The calling number ${outboundNumber} is not set up in your Vapi account yet.`);
  }
  return match.id;
}

export async function placeColdCall(input: OutboundCallInput): Promise<OutboundCallResult> {
  const apiKey = requireEnv("VAPI_PRIVATE_KEY");
  const phoneNumberId = await resolveCallerNumberId(apiKey);
  const assistantId = process.env["VAPI_OUTBOUND_ASSISTANT_ID"] ?? requireEnv("VAPI_ASSISTANT_ID");

  const number = normalisePhone(input.phone);

  const response = await fetch(`${VAPI_API}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumberId,
      assistantId,
      customer: { number, name: input.businessName },
      assistantOverrides: {
        variableValues: {
          businessName: input.businessName,
          website: input.website ?? "",
          talkingPoints: input.talkingPoints ?? "",
        },
      },
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Vapi refused the call (${response.status}): ${text.slice(0, 300)}`);
  }

  let parsed: { id?: string; status?: string };
  try {
    parsed = JSON.parse(text) as { id?: string; status?: string };
  } catch {
    throw new Error("Vapi returned an unreadable response.");
  }
  if (!parsed.id) throw new Error("Vapi did not return a call id.");
  return { callId: parsed.id, status: parsed.status ?? "queued" };
}
