"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statuses = ["new", "reviewing", "preparing-proposal", "awaiting-approval", "in-progress", "completed", "cancelled"] as const;

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase || !email || !password) redirect("/admin/login?error=configuration");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/admin/login?error=credentials");
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateInquiry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const internalNotes = String(formData.get("internalNotes") ?? "").slice(0, 5000);
  const requirements = String(formData.get("requirements") ?? "").slice(0, 5000);
  const quotedRaw = String(formData.get("quotedAmountCents") ?? "");
  const quotedAmountCents = quotedRaw === "" ? null : Number(quotedRaw);
  const supplierName = String(formData.get("supplierName") ?? "").trim().slice(0, 200);
  const supplierConfirmationReference = String(formData.get("supplierConfirmationReference") ?? "").trim().slice(0, 300);
  const approvalDueAt = toIsoOrNull(String(formData.get("approvalDueAt") ?? ""));
  const deadlineAt = toIsoOrNull(String(formData.get("deadlineAt") ?? ""));
  const supplierConfirmedAt = toIsoOrNull(String(formData.get("supplierConfirmedAt") ?? ""));
  const followUpAt = toIsoOrNull(String(formData.get("followUpAt") ?? ""));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !statuses.includes(status as typeof statuses[number])) redirect("/admin?error=invalid");
  if (quotedAmountCents !== null && (!Number.isSafeInteger(quotedAmountCents) || quotedAmountCents < 0)) redirect("/admin?error=invalid");
  if (supplierConfirmedAt && !supplierConfirmationReference) redirect("/admin?error=confirmation-reference-required");
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin?error=configuration");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=unauthorized");
  const { error } = await supabase.from("inquiries").update({
    status, internal_notes: internalNotes, requirements, quoted_amount_cents: quotedAmountCents,
    approval_due_at: approvalDueAt, deadline_at: deadlineAt, supplier_name: supplierName || null,
    supplier_confirmation_reference: supplierConfirmationReference || null,
    supplier_confirmed_at: supplierConfirmedAt, follow_up_at: followUpAt,
  }).eq("id", id);
  if (error) redirect("/admin?error=save");
  redirect("/admin");
}

function toIsoOrNull(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
