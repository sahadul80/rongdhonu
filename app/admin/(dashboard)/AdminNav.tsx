"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, ContactRound, FileText, Home, Images, MessageSquareQuote, Users, Briefcase } from "lucide-react";

type NotificationCounts = { pendingReviews: number; newEnquiries: number };
const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true, icon: Home },
  { href: "/admin/business", label: "Business", icon: BriefcaseBusiness },
  { href: "/admin/services", label: "Services", icon: FileText },
  { href: "/admin/team", label: "Our Team", icon: Users },
  { href: "/admin/work", label: "Our Work", icon: Briefcase },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, notification: "reviews" as const },
  { href: "/admin/hero-images", label: "Pictures", icon: Images },
  { href: "/admin/submissions", label: "Enquiries", icon: ContactRound, notification: "enquiries" as const },
] as const;

export default function AdminNav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<NotificationCounts>({ pendingReviews: 0, newEnquiries: 0 });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/admin/notifications", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setCounts({ pendingReviews: Number(data.pendingReviews) || 0, newEnquiries: Number(data.newEnquiries) || 0 });
      } catch { /* navigation remains usable when notifications are temporarily unavailable */ }
    };
    void load();
    const interval = window.setInterval(load, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [pathname]);

  return <nav aria-label="Admin sections" className="admin-nav shrink-0 border-b border-border bg-background/95 backdrop-blur">
    <div className="admin-content-width"><div className="flex items-around justify-around min-w-0 items-center gap-2 overflow-x-auto p-1">
      {LINKS.map((link) => {
        const active = "exact" in link ? pathname === link.href : pathname.startsWith(link.href);
        const Icon = link.icon;
        const badge = "notification" in link ? (link.notification === "reviews" ? counts.pendingReviews : counts.newEnquiries) : 0;
        return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} aria-label={link.label} className={`relative admin-nav-item ${active ? "is-active" : ""}`}>
          <span className="relative"><Icon className="h-6 w-6 shrink-0" aria-hidden="true" />{badge > 0 && <span className="absolute -right-2 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-rd-red px-1 text-[8px] font-black text-white ring-2 ring-background" aria-label={`${badge} new ${link.label.toLowerCase()}`}>{badge > 99 ? "99+" : badge}</span>}</span><span className="admin-nav-label">{link.label}</span>
        </Link>;
      })}
    </div></div>
  </nav>;
}
