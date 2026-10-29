import type { CreateInquiryInput, ServiceCategory, TravelDetails } from "./types";

const categories: ServiceCategory[] = [
  "executive-support",
  "travel",
  "business-operations",
  "digital-workflows",
  "health-wellness",
  "other",
];
const validServiceSlugs = ["executive", "flights", "accommodation", "travel", "ground", "personal", "reservations", "visa", "lead-gen", "customer-support", "operations", "marketing", "automation", "research", "expenses", "health-wellness"];

export function validateInquiry(value: unknown): { data?: CreateInquiryInput; error?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Enter your request details." };
  const body = value as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim()) return { data: undefined };
  if (body.consent !== true) return { error: "Consent is required to process this inquiry." };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const submittedService = typeof body.service === "string" ? body.service.trim() : "";
  const serviceCategory = body.serviceCategory ?? (categories.includes(submittedService as ServiceCategory) ? submittedService : "other");
  if (name.length < 2 || name.length > 120) return { error: "Enter your name (2–120 characters)." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (typeof serviceCategory !== "string" || !categories.includes(serviceCategory as ServiceCategory)) return { error: "Choose a service category." };
  const selectedServices = Array.isArray(body.serviceSelections) ? body.serviceSelections : [];
  if (selectedServices.some((service) => typeof service !== "string" || !validServiceSlugs.includes(service))) return { error: "Choose valid services." };
  if (message.length < 10 || message.length > 5000) return { error: "Tell us a little more (10–5,000 characters)." };
  const details = body.travelDetails;
  const travelDetails: TravelDetails | undefined = details && typeof details === "object" && !Array.isArray(details)
    ? sanitizeTravelDetails(details as Record<string, unknown>)
    : undefined;
  const travelError = validateTravelDetails(travelDetails);
  if (travelError) return { error: travelError };
  return {
    data: {
      name,
      email,
      company: typeof body.company === "string" ? body.company.trim().slice(0, 160) : undefined,
      serviceCategory: serviceCategory as ServiceCategory,
      serviceSlug: typeof body.serviceSlug === "string" ? body.serviceSlug.trim().slice(0, 120) : submittedService ? submittedService.slice(0, 120) : undefined,
      serviceSlugs: [...new Set([...(validServiceSlugs.includes(submittedService) ? [submittedService] : []), ...selectedServices as string[]])].slice(0, 15),
      timezone: typeof body.timezone === "string" ? body.timezone.trim().slice(0, 80) : undefined,
      budget: typeof body.budget === "string" ? body.budget.trim().slice(0, 120) : undefined,
      contactMethod: typeof body.contactMethod === "string" ? body.contactMethod.trim().slice(0, 40) : undefined,
      message,
      travelDetails,
    },
  };
}

function validateTravelDetails(details: TravelDetails | undefined): string | undefined {
  if (!details?.tripType) return;
  const required: Record<NonNullable<TravelDetails["tripType"]>, string[]> = {
    flight: ["origin", "destination", "departureDate"],
    hotel: ["destination", "checkIn", "checkOut"],
    "complete-trip": ["origin", "departureDate"],
    reservation: ["location", "date"],
  };
  if (required[details.tripType].some((key) => !details[key]) || (details.tripType === "complete-trip" && !details.destination && !details.destinations)) return "Complete the required travel request details.";
  const dateKeys = details.tripType === "hotel" ? ["checkIn", "checkOut"] : details.tripType === "reservation" ? ["date"] : ["departureDate", "returnDate"];
  const dates = dateKeys.map((key) => details[key]).filter((value): value is string => typeof value === "string");
  if (dates.some((value) => !isRealDate(value))) return "Enter valid travel dates.";
  if (dates.length > 1 && dates[1] <= dates[0]) return details.tripType === "hotel" ? "Check-out must be after check-in." : "Return date must be after departure.";
  if (details.tripType === "flight" && !["one-way", "return"].includes(details.tripMode ?? "")) return "Choose a one-way or return journey.";
  if (details.tripType === "flight" && details.tripMode === "return" && !details.returnDate) return "Enter a return date or choose a one-way journey.";
  if ([details.passengers, details.travelers, details.guests, details.rooms, details.partySize].some((count) => count !== undefined && (!Number.isInteger(count) || count < 1))) return "Enter a valid traveler, guest, room or party count.";
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function sanitizeTravelDetails(raw: Record<string, unknown>): TravelDetails {
  const tripType = raw.tripType;
  if (!["flight", "hotel", "complete-trip", "reservation"].includes(String(tripType))) return {};
  const fields: Record<string, string[]> = {
    flight: ["origin", "destination", "departureDate", "returnDate", "tripMode", "passengers", "travelers", "cabin", "preferences", "requirements"],
    hotel: ["destination", "accommodationType", "checkIn", "checkOut", "guests", "rooms", "travelers", "accommodation", "preferences", "requirements"],
    "complete-trip": ["origin", "destination", "destinations", "departureDate", "returnDate", "components", "preferences", "requirements"],
    reservation: ["location", "destination", "occasion", "date", "departureDate", "time", "partySize", "preference", "preferences", "requirements"],
  };
  const output: TravelDetails = { tripType: tripType as TravelDetails["tripType"] };
  for (const key of fields[String(tripType)]) {
    const value = raw[key];
    if (key === "tripMode") {
      if (value === "one-way" || value === "return") output.tripMode = value;
      continue;
    }
    if (["departureDate", "returnDate", "checkIn", "checkOut", "date"].includes(key)) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) output[key] = value;
    } else if (["passengers", "guests", "rooms", "travelers", "partySize"].includes(key)) {
      const count = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
      const max = key === "partySize" ? 100 : 20;
      if (Number.isInteger(count) && Number(count) >= 1 && Number(count) <= max) output[key] = Number(count);
    } else if (key === "components" && Array.isArray(value)) {
      output.components = value.filter((item): item is string => typeof item === "string").slice(0, 8).map((item) => item.trim().slice(0, 80));
    } else if (key === "destinations" && Array.isArray(value)) {
      output.destinations = value.filter((item): item is string => typeof item === "string").slice(0, 12).map((item) => item.trim().slice(0, 160));
    } else if (typeof value === "string") {
      output[key] = value.trim().slice(0, key === "requirements" ? 1200 : 300);
    }
  }
  return output;
}

export async function notifyInquiry(input: CreateInquiryInput, inquiryId: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFICATION_EMAIL;
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!apiKey || !to || !from) return false;

  const details = input.travelDetails ? `\nTravel details: ${JSON.stringify(input.travelDetails, null, 2)}` : "";
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const send = (message: { to: string[]; subject: string; text: string }) => fetch("https://api.resend.com/emails", {
    method: "POST", headers, signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({ from, ...message }),
  });
  const [ownerNotice] = await Promise.allSettled([
    send({
      to: [to],
      subject: `New portfolio inquiry: ${input.serviceCategory}`,
      text: `Inquiry ${inquiryId}\n${input.name} <${input.email}>${input.company ? `\n${input.company}` : ""}\nCategory: ${input.serviceCategory}\nServices: ${input.serviceSlugs?.join(", ") || input.serviceSlug || "not specified"}\nTimezone: ${input.timezone ?? "not specified"}\nBudget: ${input.budget ?? "not specified"}\nPreferred contact: ${input.contactMethod ?? "not specified"}\n\n${input.message}${details}`,
    }),
    send({
      to: [input.email],
      subject: "We received your assistance inquiry",
      text: `Hello ${input.name},\n\nYour inquiry (${inquiryId}) has been received. I will review the requirements and follow up about scope and next steps. This request does not confirm a flight, hotel, reservation or other booking.\n\nPlease do not reply with payment card details or passport information.`,
    }),
  ]);
  return ownerNotice.status === "fulfilled" && ownerNotice.value.ok;
}
