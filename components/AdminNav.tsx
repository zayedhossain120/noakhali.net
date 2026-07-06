"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/admins", label: "Admins", superAdminOnly: true },
];

export default function AdminNav({
  adminName,
  role,
}: {
  adminName: string;
  role: "SUPER_ADMIN" | "ADMIN";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const visibleLinks = LINKS.filter(
    (l) => !l.superAdminOnly || role === "SUPER_ADMIN",
  );

  return (
    <>
      <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Header with hamburger and user info */}
        <div className="flex items-center justify-between gap-4 sm:flex-row flex-wrap">
          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="md:hidden flex flex-col gap-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-brand-dark transition-all ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-brand-dark transition-all ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-brand-dark transition-all ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

          {/* User Info - visible on all screens */}
          <div className="flex items-center gap-3 text-sm text-gray-600 ml-auto md:ml-0">
            <span className="hidden sm:inline">
              Signed in as{" "}
              <strong className="text-brand-dark">{adminName}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-brand-dark hover:bg-gray-50 whitespace-nowrap"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex md:gap-2 mt-4 md:mt-0">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                pathname.startsWith(link.href)
                  ? "bg-brand-dark text-white"
                  : "text-brand-dark hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Modal Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Modal Panel */}
          <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white w-full">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-brand-dark">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-brand-dark text-2xl font-bold hover:opacity-80"
              >
                ✕
              </button>
            </div>
            {/* Menu Items */}
            <div className="flex flex-col gap-2 p-4">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-md px-4 py-3 text-base font-medium ${
                    pathname.startsWith(link.href)
                      ? "bg-brand-dark text-white"
                      : "text-brand-dark hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
