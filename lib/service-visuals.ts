export type ServiceVisual = {
  image: string;
  alt: string;
  context: string;
  workflow: string;
  steps: [string, string, string];
};

export const serviceVisuals: Record<string, ServiceVisual> = {
  executive: { image: '/images/services/executive.webp', alt: 'Laptop and notebook on a tidy work desk.', context: 'A fictional inbox is crowded and meetings overlap.', workflow: 'Executive support, in order', steps: ['Priority inbox', 'Calendar aligned', 'Actions tracked'] },
  flights: { image: '/images/services/flights.webp', alt: 'Airplane above the clouds.', context: 'Routes, fares, layovers and baggage rules need comparison.', workflow: 'Flight options, organized', steps: ['Route compared', 'Preferences noted', 'Approval requested'] },
  accommodation: { image: '/images/services/accommodation.webp', alt: 'Simple hotel room with a bed and desk.', context: 'Location, amenities, dates and cancellation terms vary.', workflow: 'Stay options, compared', steps: ['Locations reviewed', 'Terms summarized', 'Choice ready'] },
  travel: { image: '/images/services/travel.webp', alt: 'Open road winding through a rocky landscape.', context: 'Trip details are spread across suppliers and schedules.', workflow: 'One itinerary to review', steps: ['Travel connected', 'Meetings included', 'Confirmations tracked'] },
  ground: { image: '/images/services/ground.webp', alt: 'Quiet, empty road curving through a tree-lined landscape.', context: 'Pickup times, meeting points and provider details must line up.', workflow: 'Ground transport, clear', steps: ['Pickup planned', 'Meeting point clear', 'Provider details saved'] },
  personal: { image: '/images/services/personal.webp', alt: 'Calendar and notebook arranged on a desk.', context: 'Personal plans and reminders compete with the working day.', workflow: 'Personal plans, coordinated', steps: ['Appointments grouped', 'Preferences captured', 'Reminders set'] },
  reservations: { image: '/images/services/reservations.webp', alt: 'Prepared restaurant dining room.', context: 'Guest counts, timing and venue needs can change.', workflow: 'Reservations, ready to review', steps: ['Venue researched', 'Guest details checked', 'Confirmation tracked'] },
  visa: { image: '/images/services/visa.webp', alt: 'Blank notebook and paper clips on a light desk.', context: 'Destination requirements and deadlines can be hard to track.', workflow: 'Travel documents, organized', steps: ['Official sources linked', 'Checklist prepared', 'Dates visible'] },
  'lead-gen': { image: '/images/services/lead-gen.webp', alt: 'Quiet, empty modern office corridor.', context: 'Prospect information and follow-ups live in different places.', workflow: 'A clearer prospect pipeline', steps: ['Fit criteria noted', 'Source recorded', 'Next action assigned'] },
  'customer-support': { image: '/images/services/customer-support.webp', alt: 'Hands using a laptop in a digital workspace; no faces are shown.', context: 'Customer questions and follow-ups arrive throughout the day.', workflow: 'Customer requests, tracked', steps: ['Requests grouped', 'Drafts prepared', 'Follow-ups visible'] },
  operations: { image: '/images/services/operations.webp', alt: 'Modern office buildings in a business district.', context: 'Projects, owners and deadlines can be difficult to see together.', workflow: 'Operations, in view', steps: ['Owners recorded', 'Milestones visible', 'Updates prepared'] },
  marketing: { image: '/images/services/marketing.webp', alt: 'Video editing workspace with screen and production equipment.', context: 'Content ideas, production and publishing need coordination.', workflow: 'Content moving through review', steps: ['Draft edited', 'Voice-over coordinated', 'Approval before publish'] },
  automation: { image: '/images/services/automation.webp', alt: 'Close-up of a circuit board and electronic components.', context: 'Repeatable steps can be scattered across tools and handoffs.', workflow: 'A documented workflow', steps: ['Steps mapped', 'Review points kept', 'Handoff documented'] },
  research: { image: '/images/services/research.webp', alt: 'Research notes and laptop on a work table.', context: 'Useful information is spread across sources and documents.', workflow: 'Research, ready to use', steps: ['Sources collected', 'Findings summarized', 'Next decision supported'] },
  expenses: { image: '/images/services/expenses.webp', alt: 'Calculator, receipts and notebook on a desk.', context: 'Receipts and routine finance records need sorting.', workflow: 'Admin finance records, organized', steps: ['Receipts grouped', 'Summary prepared', 'Finance review supported'] },
  'health-wellness': { image: '/images/services/health-wellness.webp', alt: 'Stethoscope arranged on a clean surface, used as an illustrative health coordination image.', context: 'Appointments, reminders and routine records take coordination.', workflow: 'Wellness schedule, in view', steps: ['Visits scheduled', 'Reminders planned', 'Records organized'] },
};
