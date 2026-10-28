import { createSupabaseServerClient } from "@/lib/supabase/server";
import { demos as fallbackDemos, faqs as fallbackFaqs, packages as fallbackPackages, services as fallbackServices } from "@/lib/content";

export async function getPublicContent() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { services: fallbackServices, packages: fallbackPackages.map((item) => ({ ...item, draft: true })), faqs: fallbackFaqs, demos: fallbackDemos };

  const [serviceResult, packageResult, faqResult, demoResult] = await Promise.all([
    supabase.from("services").select("*").eq("active", true).order("sort_order"),
    supabase.from("packages").select("*").eq("active", true).eq("is_draft", false).order("sort_order"),
    supabase.from("faqs").select("*").eq("active", true).order("sort_order"),
    supabase.from("demonstration_projects").select("*").eq("active", true).order("sort_order"),
  ]);

  return {
    services: serviceResult.error || !serviceResult.data?.length ? fallbackServices : serviceResult.data.map((row) => ({
      id: row.slug,
      group: groupName(row.category),
      title: row.name,
      summary: row.description,
      delivers: Array.isArray(row.deliverables) ? row.deliverables as string[] : [],
      benefit: row.client_benefit,
    })),
    // Local starter figures stay labeled as drafts; database publishing requires is_draft=false.
    packages: packageResult.error || !packageResult.data?.length ? fallbackPackages.map((item) => ({ ...item, draft: true })) : packageResult.data.map((row) => ({
      name: row.name,
      price: `$${(row.starting_price_cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
      cadence: "per month",
      audience: row.audience,
      scope: Array.isArray(row.scope) ? row.scope as string[] : [],
      note: row.note,
      draft: false,
    })),
    faqs: faqResult.error || !faqResult.data?.length ? fallbackFaqs : faqResult.data.map((row) => [row.question, row.answer] as [string, string]),
    demos: demoResult.error || !demoResult.data?.length ? fallbackDemos : demoResult.data.map((row) => ({
      name: row.title,
      kind: row.is_demonstration ? "Demonstration workflow" : "Project",
      text: row.summary,
    })),
  };
}

function groupName(category: string): string {
  return ({
    "executive-support": "Executive support",
    travel: "Travel desk",
    "business-operations": "Business operations",
    "digital-workflows": "Digital support",
    other: "Other support",
  } as Record<string, string>)[category] ?? "Other support";
}
