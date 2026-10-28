import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { validateInquiry, notifyInquiry } from "@/lib/inquiries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 16_000;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") return NextResponse.json({ error: "Send this request as JSON." }, { status: 415 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Inquiry delivery is not configured yet. Please try again later." }, { status: 503 });

  // Count every attempt, including malformed payloads, so bad requests cannot evade the IP limit.
  const ipHash = hashRateKey(`ip:${getClientIp(request)}`);
  const ipLimit = await supabase.rpc("check_inquiry_rate_limit", { p_ip_key_hash: ipHash, p_email_key_hash: null });
  if (ipLimit.error || typeof ipLimit.data !== "boolean") {
    console.error("Inquiry rate limiter unavailable", ipLimit.error?.code);
    return NextResponse.json({ error: "Inquiry delivery is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  if (!ipLimit.data) return rateLimited(3600);

  const parsed = await readJsonBody(request, MAX_BODY_BYTES);
  if (parsed.kind === "too-large") return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  if (parsed.kind === "invalid") return NextResponse.json({ error: "Send a valid JSON request." }, { status: 400 });

  const result = validateInquiry(parsed.value);
  // A filled honeypot silently succeeds to avoid teaching bots the field name.
  if (!result.data && !result.error) return NextResponse.json({ ok: true });
  if (!result.data) return NextResponse.json({ error: result.error }, { status: 400 });

  const input = result.data;
  const emailHash = hashRateKey(`email:${input.email}`);
  const emailLimit = await supabase.rpc("check_inquiry_rate_limit", { p_ip_key_hash: null, p_email_key_hash: emailHash });
  if (emailLimit.error || typeof emailLimit.data !== "boolean") {
    console.error("Inquiry email rate limiter unavailable", emailLimit.error?.code);
    return NextResponse.json({ error: "Inquiry delivery is temporarily unavailable. Please try again later." }, { status: 503 });
  }
  if (!emailLimit.data) return rateLimited(86_400);

  const { data, error } = await supabase.rpc("submit_public_inquiry", {
    p_name: input.name,
    p_email: input.email,
    p_company: input.company ?? null,
    p_service_category: input.serviceCategory,
    p_service_slug: input.serviceSlug ?? null,
    p_timezone: input.timezone ?? null,
    p_budget: input.budget ?? null,
    p_contact_method: input.contactMethod ?? null,
    p_message: input.message,
    p_travel_details: input.travelDetails ?? null,
    p_service_selections: input.serviceSlugs ?? [],
  });
  if (error || typeof data !== "string") {
    console.error("Inquiry persistence failed", error?.code);
    return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 502 });
  }

  let notificationSent = false;
  try { notificationSent = await notifyInquiry(input, data); }
  catch (error) { console.error("Inquiry notification failed", error); }
  return NextResponse.json({ ok: true, id: data, notificationSent });
}

async function readJsonBody(request: Request, limit: number): Promise<{ kind: "ok"; value: unknown } | { kind: "too-large" } | { kind: "invalid" }> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > limit) return { kind: "too-large" };
  if (!request.body) return { kind: "invalid" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        await reader.cancel();
        return { kind: "too-large" };
      }
      chunks.push(value);
    }
  } catch {
    return { kind: "invalid" };
  } finally {
    reader.releaseLock();
  }
  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { kind: "ok", value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { kind: "invalid" };
  }
}

function getClientIp(request: Request): string {
  // Trust these values only behind a proxy that overwrites them (for example Vercel).
  const forwarded = request.headers.get("x-vercel-forwarded-for")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return forwarded && forwarded.length <= 100 ? forwarded : "unknown-client";
}

function hashRateKey(value: string): string {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Rate-limit HMAC key is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

function rateLimited(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait before sending another inquiry." },
    { status: 429, headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" } },
  );
}
