"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, ContactRound, FileText, Home, Images, MessageSquareQuote, Users, Briefcase } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true, icon: Home },
  { href: "/admin/business", label: "Business", icon: BriefcaseBusiness },
  { href: "/admin/services", label: "Services", icon: FileText },
  { href: "/admin/team", label: "Our Team", icon: Users },
  { href: "/admin/work", label: "Our Work", icon: Briefcase },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/hero-images", label: "Pictures", icon: Images },
  { href: "/admin/submissions", label: "Enquiries", icon: ContactRound },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="admin-nav shrink-0 border-b border-border bg-background/95 backdrop-blur">
      <div className="admin-content-width">
        <div className="flex items-around justify-around min-w-0 items-center gap-2 overflow-x-auto p-1">
          {LINKS.map((link) => {
            const active = "exact" in link ? pathname === link.href : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`admin-nav-item ${active ? "is-active" : ""}`} aria-label={link.label}
              >
                <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                <span className="admin-nav-label">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
