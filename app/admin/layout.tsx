import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-app">
      <header className="admin-app-header">
        <Link href="/admin" className="wordmark">
          <span className="mark">TP</span>
          <span>Private workspace</span>
        </Link>
        <div>
          <Link href="/" className="admin-site-link">
            Open website
          </Link>
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
