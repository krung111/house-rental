"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Home,
  DollarSign,
  BarChart2,
  Wrench,
  Settings,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";
import { JSX } from "react";

export type MenuType =
  | "dashboard"
  | "tenants"
  | "apartments"
  | "reports"
  | "maintenance"
  | "payments"
  | "expenses"
  | "settings";

const menuItems: { icon: JSX.Element; label: string; href: string }[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "dashboard",
    href: "/",
  },
  { icon: <Users className="w-5 h-5" />, label: "tenants", href: "/tenants" },
  {
    icon: <Home className="w-5 h-5" />,
    label: "apartments",
    href: "/apartments",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    label: "reports",
    href: "/reports",
  },
  {
    icon: <Wrench className="w-5 h-5" />,
    label: "maintenance",
    href: "/maintenance",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    label: "payments",
    href: "/payments",
  },
  {
    icon: <ReceiptText className="w-5 h-5" />,
    label: "expenses",
    href: "/expenses",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: "settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Apartment Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              {item.icon}
              <span className="capitalize text-[16px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition">
          Logout
        </button>
      </div>
    </aside>
  );
}
