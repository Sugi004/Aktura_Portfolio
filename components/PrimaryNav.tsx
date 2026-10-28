import { primaryNavigation } from '@/lib/navigation';

export default function PrimaryNav() {
  return <nav aria-label="Main navigation" className="main-nav">
    {primaryNavigation.map(({ label, href }) => <a key={href} href={href}>{label}</a>)}
  </nav>;
}
