"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="button button-warning flex flex-row items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <p className="hidden sm:inline">{loading ? "Signing out…" : "Sign out"}</p>
    </button>
  );
}
