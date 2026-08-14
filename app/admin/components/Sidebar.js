"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    FiHome,
    FiEdit3,
    FiMapPin,
    FiFolder,
    FiSettings,
} from "react-icons/fi";

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: FiHome,
    },
    {
        label: "Blogs",
        href: "/admin/blogs",
        icon: FiEdit3,
    },
    {
        label: "Destinations",
        href: "/admin/destinations",
        icon: FiMapPin,
    },
    {
        label: "Categories",
        href: "/admin/categories",
        icon: FiFolder,
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: FiSettings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
                <Link
                    href="/admin/dashboard"
                    className="text-xl font-bold text-gray-900"
                >
                    Travel CMS
                </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <Icon className="h-5 w-5 shrink-0" />

                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-gray-200 p-4">
                <p className="text-xs text-gray-500">Travel CMS</p>
                <p className="mt-1 text-xs text-gray-400">Admin Panel</p>
            </div>
        </aside>
    );
}