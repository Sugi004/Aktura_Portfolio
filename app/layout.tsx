import type { Metadata } from 'next';
import { DM_Sans, Newsreader } from 'next/font/google';
import AppIntroCoordinator from '@/components/AppIntroCoordinator';
import './globals.css';
import './landing-redesign.css';
import './brand.css';

const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Altura Executive | Higher Standards of Executive Support',
  description: 'Thoughtful remote executive assistance, business coordination and travel support, shaped around agreed priorities.',
  openGraph: { title: 'Altura Executive | Higher Standards of Executive Support', description: 'Remote executive assistance, business coordination and travel support.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`(function(){try{var k='executive-portfolio-theme',v=localStorage.getItem(k);document.documentElement.dataset.theme=(v==='light'||v==='dark')?v:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){}try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&sessionStorage.getItem('altura-intro-seen')!=='1')document.documentElement.dataset.intro='pending'}catch(e){}})()`}} /></head><body className={`${newsreader.variable} ${dmSans.variable}`}><AppIntroCoordinator><a className="skip-link" href="#main-content">Skip to content</a>{children}</AppIntroCoordinator></body></html>;
}
