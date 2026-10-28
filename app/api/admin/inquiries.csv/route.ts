import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function csv(value: unknown) {
  let safe = String(value ?? "").replace(/[\r\n]+/g, " ");
  if (/^[=+\-@\t]/.test(safe)) safe = `'${safe}`;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Not configured." }, { status: 503 });
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const { data, error } = await supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(5000);
  if (error) return NextResponse.json({ error: "Could not export inquiries." }, { status: 500 });
  const columns = ["id", "created_at", "name", "email", "company", "service_category", "service_slug", "service_selections", "timezone", "budget", "contact_method", "message", "status", "requirements", "quoted_amount_cents", "approval_due_at", "deadline_at", "supplier_name", "supplier_confirmation_reference", "supplier_confirmed_at", "internal_notes", "follow_up_at", "travel_details"];
  const lines = [columns.map(csv).join(","), ...(data ?? []).map((row) => columns.map((key) => csv(row[key as keyof typeof row])).join(","))];
  return new NextResponse(lines.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=inquiries.csv", "Cache-Control": "private, no-store" } });
}
