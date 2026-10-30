export function createContactMailto(to: string, subject: string, body: string): string {
  // Encode spaces as %20 rather than + for mail clients that treat plus signs literally.
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
