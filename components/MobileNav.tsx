import { primaryNavigation } from '@/lib/navigation';

export default function MobileNav() {
  return <details className="mobile-nav">
    <summary>Menu</summary>
    <nav aria-label="Mobile navigation">{primaryNavigation.map(({ label, href }) => <a key={href} href={href}>{label}</a>)}</nav>
  </details>;
}
