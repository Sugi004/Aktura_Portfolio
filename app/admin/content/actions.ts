"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const contentTables = {
  services: { required: ["slug", "name", "category", "description", "deliverables", "client_benefit"] },
  packages: { required: ["name", "starting_price_cents", "audience", "scope", "note"] },
  faqs: { required: ["question", "answer"] },
  demonstration_projects: { required: ["title", "summary", "services", "is_demonstration"] },
} as const;
type ContentTable = keyof typeof contentTables;

export async function saveContent(formData: FormData) {
  const table = String(formData.get("table") ?? "") as ContentTable;
  if (!Object.hasOwn(contentTables, table)) redirect("/admin/content?error=table");
  const rawRows = String(formData.get("rows") ?? "");
  if (rawRows.length > 300_000) redirect(`/admin/content?error=size&table=${table}`);
  let rows: unknown;
  try { rows = JSON.parse(rawRows); }
  catch { redirect(`/admin/content?error=json&table=${table}`); }
  if (!Array.isArray(rows) || rows.length > 200) redirect(`/admin/content?error=shape&table=${table}`);

  const required = contentTables[table].required as readonly string[];
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) redirect(`/admin/content?error=shape&table=${table}`);
    const item = row as Record<string, unknown>;
    if (required.some((key) => !(key in item))) redirect(`/admin/content?error=fields&table=${table}`);
    if (table === "services" && !["executive-support", "travel", "business-operations", "digital-workflows", "other"].includes(String(item.category))) redirect(`/admin/content?error=category&table=${table}`);
    if (["services", "packages", "faqs", "demonstration_projects"].some((key) => key === table) && typeof item.active !== "boolean" && table !== "packages") redirect(`/admin/content?error=active&table=${table}`);
    if (table === "packages" && (typeof item.active !== "boolean" || typeof item.is_draft !== "boolean" || !Number.isInteger(item.starting_price_cents) || Number(item.starting_price_cents) < 0)) redirect(`/admin/content?error=package&table=${table}`);
    if (table === "demonstration_projects" && item.is_demonstration !== true) redirect(`/admin/content?error=demonstration&table=${table}`);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/content?error=configuration");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=unauthorized");

  const { data: existing, error: existingError } = await supabase.from(table).select("id");
  if (existingError || !existing) {
    console.error("Admin content load before save failed", table, existingError?.code);
    redirect(`/admin/content?error=load&table=${table}`);
  }
  let savedIds: string[] = [];
  if (rows.length) {
    const upsertOptions = table === "services" ? { onConflict: "slug" } : undefined;
    const { data: savedRows, error } = await supabase.from(table).upsert(rows as Record<string, unknown>[], upsertOptions).select("id");
    if (error) {
      console.error("Admin content save failed", table, error.message);
      redirect(`/admin/content?error=save&table=${table}`);
    }
    savedIds = (savedRows ?? []).map((row) => row.id);
  }
  const retainedIds = new Set([...savedIds, ...rows.map((row) => (row as Record<string, unknown>).id).filter((id): id is string => typeof id === "string")]);
  const removedIds = existing.map((row) => row.id).filter((id) => !retainedIds.has(id));
  if (removedIds.length) {
    const { error } = await supabase.from(table).delete().in("id", removedIds);
    if (error) redirect(`/admin/content?error=save&table=${table}`);
  }
  redirect(`/admin/content?saved=${table}`);
}
