"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const activeMenu =
    pathname === "/"
      ? "Dashboard"
      : pathname.replace("/", "").charAt(0).toUpperCase() +
        pathname.replace("/", "").slice(1);

  return (
    <header className="sticky top-4 mx-6 rounded-2xl bg-gradient-to-r from-white to-gray-50/90 backdrop-blur-md border border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm z-20">
      <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
        {activeMenu}
      </h2>
    </header>
  );
}
