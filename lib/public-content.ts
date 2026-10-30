import { demos, faqs, packages, services } from '@/lib/content';

/** Public site content is bundled locally; this app does not require a database. */
export async function getPublicContent() {
  return { services, packages, demos, faqs };
}
