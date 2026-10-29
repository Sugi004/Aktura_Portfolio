import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveContent } from "./actions";

export const dynamic = "force-dynamic";

const datasets = [
  ["services", "Services", "Use category values: executive-support, travel, business-operations, digital-workflows, health-wellness, other."],
  ["packages", "Packages", "Set is_draft=false only when the price and scope are approved for public display."],
  ["faqs", "FAQs", "Questions and answers shown on the public site."],
  ["demonstration_projects", "Demonstration projects", "Keep is_demonstration=true so sample work is never presented as a client engagement."],
] as const;

export default async function ContentAdmin({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main id="main-content" className="admin-shell"><h1>Content is not configured</h1></main>;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=unauthorized");
  const [{ error, saved }, ...results] = await Promise.all([
    searchParams,
    supabase.from("services").select("*").order("sort_order"),
    supabase.from("packages").select("*").order("sort_order"),
    supabase.from("faqs").select("*").order("sort_order"),
    supabase.from("demonstration_projects").select("*").order("sort_order"),
  ]);
  return <main id="main-content" className="admin-shell">
    <header className="admin-header"><div><p className="admin-kicker">Private workspace</p><h1>Public content</h1><p>Edit JSON records for services, packages, FAQs and demonstration projects.</p></div><a href="/admin">Back to inquiries</a></header>
    {error && <p role="alert">{errorMessage(error)}</p>}{saved && <p role="status">Saved {saved.replaceAll("_", " ")}.</p>}
    <p>Each editor replaces that collection: add or edit rows in the array; remove a row from the array to delete it. Keep the object fields shown in each collection.</p>
    {datasets.map(([table, title, hint], index) => {
      const result = results[index];
      return <section className="content-editor" key={table}><h2>{title}</h2><p>{hint}</p>{result.error ? <p role="alert">Could not load this collection.</p> : <form action={saveContent}><input type="hidden" name="table" value={table}/><label className="content-json-label">{title} JSON<textarea name="rows" rows={Math.min(24, Math.max(12, (result.data?.length ?? 0) * 8))} defaultValue={JSON.stringify(result.data ?? [], null, 2)} spellCheck={false}/></label><button type="submit">Save {title.toLowerCase()}</button></form>}</section>;
    })}
  </main>;
}

function errorMessage(code: string) {
  const messages: Record<string, string> = {
    json: "The JSON is not valid. Correct it and save again.", shape: "Enter a JSON array with no more than 200 records.",
    fields: "A record is missing required fields.", category: "A service has an unsupported category.", active: "Each content record needs an active boolean.",
    package: "Packages need an active flag, draft flag and non-negative integer price in cents.",
    demonstration: "Demonstration projects must remain labeled as demonstrations.", save: "The collection could not be saved. Review unique IDs and values.",
    configuration: "Supabase is not configured.", table: "Unknown content collection.",
    size: "The editor payload is too large. Split the content into a smaller set of records.",
    load: "The current collection could not be checked, so no content changes were applied. Try again later.",
  };
  return messages[code] ?? "The request could not be completed.";
}
