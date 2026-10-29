export type ServiceCategory =
  | "executive-support"
  | "travel"
  | "business-operations"
  | "digital-workflows"
  | "health-wellness"
  | "other";

export type InquiryStatus =
  | "new"
  | "reviewing"
  | "preparing-proposal"
  | "awaiting-approval"
  | "in-progress"
  | "completed"
  | "cancelled";

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  deliverables: string[];
  clientBenefit: string;
  active: boolean;
  sortOrder: number;
}

export interface Package {
  id: string;
  name: string;
  startingPriceCents: number;
  billingPeriod: "month";
  scope: string[];
  draft: boolean;
  active: boolean;
  sortOrder: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sortOrder: number;
}

export interface DemonstrationProject {
  id: string;
  title: string;
  summary: string;
  services: string[];
  isDemonstration: true;
  active: boolean;
  sortOrder: number;
}

export interface TravelDetails {
  tripType?: "flight" | "hotel" | "complete-trip" | "reservation";
  origin?: string;
  destination?: string;
  destinations?: string | string[];
  departureDate?: string;
  returnDate?: string;
  flexibleDates?: boolean;
  tripMode?: string;
  travelers?: number;
  passengers?: number;
  cabin?: string;
  accommodation?: string;
  accommodationType?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  components?: string[];
  location?: string;
  occasion?: string;
  date?: string;
  time?: string;
  partySize?: number;
  preference?: string;
  requirements?: string;
  preferences?: string;
  supplierName?: string;
  supplierConfirmationReference?: string;
  supplierConfirmedAt?: string;
  [key: string]: unknown;
}

export interface Inquiry {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  company: string | null;
  serviceCategory: ServiceCategory;
  serviceSlug: string | null;
  serviceSlugs: string[];
  timezone: string | null;
  budget: string | null;
  contactMethod: string | null;
  message: string;
  status: InquiryStatus;
  requirements: string | null;
  quotedAmountCents: number | null;
  approvalDueAt: string | null;
  deadlineAt: string | null;
  supplierName: string | null;
  supplierConfirmationReference: string | null;
  supplierConfirmedAt: string | null;
  internalNotes: string | null;
  followUpAt: string | null;
  travelDetails: TravelDetails | null;
}

export interface CreateInquiryInput {
  name: string;
  email: string;
  company?: string;
  serviceCategory: ServiceCategory;
  serviceSlug?: string;
  serviceSlugs?: string[];
  timezone?: string;
  budget?: string;
  contactMethod?: string;
  message: string;
  travelDetails?: TravelDetails;
  website?: string; // Honeypot: must remain empty.
}
