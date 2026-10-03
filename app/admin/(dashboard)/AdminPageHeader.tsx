"use client";

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Search, X } from "lucide-react";

interface AdminPageHeaderProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
  hasSearch?: boolean;
}

export default function AdminPageHeader({
  icon,
  title,
  subtitle,
  actions,
  children,
  hasSearch = false,
}: AdminPageHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    if (!hasSearch || !searchOpen) return;

    const frame = window.requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(
        ".admin-page-header-wrap.is-mobile-search-open .admin-toolbar-search input"
      );

      input?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [hasSearch, searchOpen]);

  useEffect(() => {
    if (!hasSearch) {
      setSearchOpen(false);
    }
  }, [hasSearch]);
  useEffect(() => {
    if (!searchOpen || !hasSearch) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasSearch, searchOpen]);

  const headerClassName = [
    "admin-page-header-wrap",
    searchOpen && hasSearch
      ? "is-mobile-search-open"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const toolbarClassName = [
    "admin-page-toolbar",
    hasSearch ? "has-search" : "no-search",
    searchOpen && hasSearch
      ? "search-is-open"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClassName}>
      <div className="admin-page-header">
        <div className="admin-page-heading">
          {icon && (
            <div
              className="admin-page-heading__icon"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="admin-page-title">
              {title}
            </h1>

            {subtitle && (
              <p className="admin-page-subtitle">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="admin-header-actions">
            {actions}
          </div>
        )}
      </div>

      {/* =====================================================
          ROW 2
          Search + filters + tabs
          ===================================================== */}
      {children && (
        <div className={toolbarClassName}>
          {/* Mobile search trigger ONLY when this page
              actually has a search field. */}
          {hasSearch && (
            <button
              type="button"
              className="admin-mobile-search-toggle"
              aria-label={
                searchOpen
                  ? "Close search"
                  : "Open search"
              }
              aria-expanded={searchOpen}
              aria-controls="admin-page-toolbar-content"
              onClick={() =>
                setSearchOpen((current) => !current)
              }
            >
              {searchOpen ? (
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              ) : (
                <Search
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
            </button>
          )}
          {children}
        </div>
      )}
    </header>
  );
}