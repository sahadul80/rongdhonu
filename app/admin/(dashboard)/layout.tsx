import Link from "next/link";
import { redirect } from "next/navigation";
import { Globe, LucideLogOut } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "@/app/components/ThemeToggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="admin-shell bg-surface">
      <header className="admin-header shrink-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="admin-content-width flex min-h-14 items-center justify-between gap-3 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <ThemeToggle />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-foreground">Content Management System</h1>
              <p className="truncate text-[10px] text-muted">{session.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link href="/" target="_blank" className="admin-icon-button" title="Open website">
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">View site</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <AdminNav />
      <main className="admin-main min-h-0">
        <div className="admin-content-width h-full min-h-full px-3 py-3 sm:px-4 sm:py-4 lg:px-5">
          {children}
        </div>
      </main>

      <footer className="admin-footer border-t border-border bg-surface/95 px-3 py-1.5 text-center text-[10px] font-extrabold text-foreground backdrop-blur-xl sm:px-4">
        <Link href="https://thebizaid.com" target="_blank">
          by Business Aid
        </Link>
      </footer>
    </div>
  );
}
