import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  return { rules: { userAgent: '*', allow: '/', disallow: '/admin/' }, ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}) };
}
