"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Warehouse,
  Package,
  Archive,
  Truck,
  FileChartColumn,
  Settings as Cog,
} from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  const menu = [
    { label: "Skladlar", href: "/settings/sklad", icon: Warehouse },
    { label: "Maxsulotlar", href: "/settings/products", icon: Package },
    { label: "Kirimlar", href: "/settings/incomes", icon: Archive },
    { label: "Sarf", href: "/settings/usage", icon: Truck },
    { label: "Qoldiq", href: "/settings/balance", icon: FileChartColumn },
    { label: "Sozlamalar", href: "/settings", icon: Cog },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 mt-2 bg-white border-r shadow-sm p-4 flex flex-col gap-1">
        <h2 className="text-xl font-bold mb-3">⚙️ Settings</h2>

        {menu.map((item) => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer border
                transition
                ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                }
              `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </aside>

      {/* CHILD CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
