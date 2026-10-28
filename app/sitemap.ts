import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!origin) return [];
  const paths = ['', '/about', '/services', '/travel', '/portfolio', '/packages', '/how-it-works', '/contact', '/faq', '/privacy', '/terms'];
  return paths.map((path) => ({ url: new URL(path, origin).toString(), changeFrequency: 'monthly', priority: path === '' ? 1 : 0.6 }));
}
