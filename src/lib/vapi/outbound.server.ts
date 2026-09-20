/**
 * Server-only: places outbound (cold) calls through Vapi.
 *
 * Requires VAPI_PRIVATE_KEY, VAPI_PHONE_NUMBER_ID and VAPI_OUTBOUND_ASSISTANT_ID
 * (falls back to VAPI_ASSISTANT_ID). All three are read at call time, never at
 * module scope.
 */

const VAPI_API = "https://api.vapi.ai/call";

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

export async function placeColdCall(input: OutboundCallInput): Promise<OutboundCallResult> {
  const apiKey = requireEnv("VAPI_PRIVATE_KEY");
  const phoneNumberId = requireEnv("VAPI_PHONE_NUMBER_ID");
  const assistantId =
    process.env["VAPI_OUTBOUND_ASSISTANT_ID"] ?? requireEnv("VAPI_ASSISTANT_ID");

  const number = normalisePhone(input.phone);

  const response = await fetch(VAPI_API, {
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
