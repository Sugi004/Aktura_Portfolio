import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Inquiry } from "@/lib/types";
import { signOut } from "./actions";
import { updateInquiry } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ status?: string; service?: string }> }) {
  const filters = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return <main id="main-content" className="admin-shell"><h1>Admin is not configured</h1><p>Add Supabase environment variables to enable the private inquiry dashboard.</p></main>;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!admin) return <main id="main-content" className="admin-shell"><h1>Access not enabled</h1><p>This account is not authorized to view inquiries.</p><form action={signOut}><button type="submit">Sign out</button></form></main>;

  let inquiriesQuery = supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200);
  const statuses = ["new", "reviewing", "preparing-proposal", "awaiting-approval", "in-progress", "completed", "cancelled"];
  if (filters?.status && statuses.includes(filters.status)) inquiriesQuery = inquiriesQuery.eq("status", filters.status);
  if (filters?.service && /^[a-z0-9-]{1,120}$/.test(filters.service)) inquiriesQuery = inquiriesQuery.or(`service_slug.eq.${filters.service},service_selections.cs.["${filters.service}"]`);
  const { data, error } = await inquiriesQuery;
  const inquiries = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id, createdAt: row.created_at, updatedAt: row.updated_at,
    name: row.name, email: row.email, company: row.company,
    serviceCategory: row.service_category, serviceSlug: row.service_slug,
    serviceSlugs: Array.isArray(row.service_selections) ? row.service_selections : row.service_slug ? [row.service_slug] : [],
    timezone: row.timezone, budget: row.budget, contactMethod: row.contact_method,
    message: row.message, status: row.status, requirements: row.requirements,
    quotedAmountCents: row.quoted_amount_cents, approvalDueAt: row.approval_due_at,
    deadlineAt: row.deadline_at, supplierName: row.supplier_name,
    supplierConfirmationReference: row.supplier_confirmation_reference,
    supplierConfirmedAt: row.supplier_confirmed_at, internalNotes: row.internal_notes,
    followUpAt: row.follow_up_at, travelDetails: row.travel_details,
  })) as Inquiry[];
  return (
    <main id="main-content" className="admin-shell">
      <header className="admin-header"><div><p className="admin-kicker">Private workspace</p><h1>Inquiries</h1><p>Requests are coordination inquiries. Supplier confirmation is recorded separately.</p><a href="/admin/content">Edit public content</a></div><form action={signOut}><button type="submit">Sign out</button></form></header>
      {error && <p role="alert">Could not load inquiries. Check the database migration and access policy.</p>}
      <div className="admin-toolbar"><span>{inquiries.length} matching recent requests</span><a href="/api/admin/inquiries.csv">Export CSV</a></div>
      <form method="get" className="admin-toolbar" aria-label="Filter inquiries">
        <label>Status <select name="status" defaultValue={filters?.status ?? ""}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("-", " ")}</option>)}</select></label>
        <label>Service <input name="service" defaultValue={filters?.service ?? ""} placeholder="e.g. flights" /></label>
        <button type="submit">Filter</button><a href="/admin">Clear filters</a>
      </form>
      <div className="inquiry-list">
        {inquiries.length === 0 && !error && <p>No inquiries yet.</p>}
        {inquiries.map((inquiry) => <article className="inquiry-row" key={inquiry.id}>
          <div className="inquiry-main"><div className="inquiry-title"><h2>{inquiry.name}</h2><span>{inquiry.status}</span></div><p><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>{inquiry.company ? ` · ${inquiry.company}` : ""}</p><p>{inquiry.message}</p></div>
          <dl><div><dt>Service</dt><dd>{inquiry.serviceSlugs.length ? inquiry.serviceSlugs.join(", ") : inquiry.serviceCategory}</dd></div><div><dt>Received</dt><dd>{new Date(inquiry.createdAt).toLocaleDateString()}</dd></div>{inquiry.timezone && <div><dt>Timezone</dt><dd>{inquiry.timezone}</dd></div>}{inquiry.budget && <div><dt>Budget</dt><dd>{inquiry.budget}</dd></div>}{inquiry.contactMethod && <div><dt>Contact by</dt><dd>{inquiry.contactMethod}</dd></div>}{inquiry.supplierConfirmationReference && <div><dt>Supplier confirmation</dt><dd>{inquiry.supplierConfirmationReference}</dd></div>}</dl>
          {inquiry.travelDetails && Object.entries(inquiry.travelDetails).some(([key, value]) => key !== "tripType" && value !== null && value !== "") && <section className="travel-request"><h3>Travel request · {inquiry.travelDetails.tripType ?? "details"}</h3><dl>{Object.entries(inquiry.travelDetails).filter(([, value]) => value !== null && value !== "").map(([key, value]) => <div key={key}><dt>{formatTravelLabel(key)}</dt><dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd></div>)}</dl></section>}
          <form action={updateInquiry} className="inquiry-edit">
            <input type="hidden" name="id" value={inquiry.id} />
            <label>Status<select name="status" defaultValue={inquiry.status}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label>Requirements<textarea name="requirements" defaultValue={inquiry.requirements ?? ""} maxLength={5000} /></label>
            <label>Quoted amount (cents)<input name="quotedAmountCents" type="number" min="0" step="1" defaultValue={inquiry.quotedAmountCents ?? ""} /></label>
            <label>Approval due<input name="approvalDueAt" type="datetime-local" defaultValue={toLocalDateTime(inquiry.approvalDueAt)} /></label>
            <label>Deadline<input name="deadlineAt" type="datetime-local" defaultValue={toLocalDateTime(inquiry.deadlineAt)} /></label>
            <label>Supplier<input name="supplierName" defaultValue={inquiry.supplierName ?? ""} maxLength={200} /></label>
            <label>Supplier confirmation reference<input name="supplierConfirmationReference" defaultValue={inquiry.supplierConfirmationReference ?? ""} maxLength={300} /></label>
            <label>Supplier confirmed at<input name="supplierConfirmedAt" type="datetime-local" defaultValue={toLocalDateTime(inquiry.supplierConfirmedAt)} /></label>
            <label>Follow up<input name="followUpAt" type="datetime-local" defaultValue={toLocalDateTime(inquiry.followUpAt)} /></label>
            <label>Internal notes<textarea name="internalNotes" defaultValue={inquiry.internalNotes ?? ""} maxLength={5000} /></label>
            <button type="submit">Save inquiry</button>
          </form>
        </article>)}
      </div>
    </main>
  );
}

function toLocalDateTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function formatTravelLabel(key: string): string {
  const labels: Record<string, string> = {
    tripType: "Trip type", departureDate: "Departure date", returnDate: "Return date",
    checkIn: "Check-in", checkOut: "Check-out", partySize: "Party size",
    accommodationType: "Accommodation type", components: "Trip includes",
  };
  return labels[key] ?? key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`).replace(/^./, (letter) => letter.toUpperCase());
}
