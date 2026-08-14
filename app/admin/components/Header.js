"use client";

import { FiBell, FiLogOut, FiMenu, FiUser } from "react-icons/fi";

export default function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Open menu"
                >
                    <FiMenu size={22} />
                </button>

                <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <p className="text-xs text-gray-500">
                        Manage your travel content
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Notifications"
                >
                    <FiBell size={21} />

                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <div className="hidden h-8 w-px bg-gray-200 sm:block" />

                <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white">
                        <FiUser size={18} />
                    </span>

                    <span className="hidden text-left sm:block">
                        <span className="block text-sm font-medium text-gray-900">
                            Admin
                        </span>

                        <span className="block text-xs text-gray-500">
                            Administrator
                        </span>
                    </span>
                </button>

                <button
                    type="button"
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                    aria-label="Logout"
                >
                    <FiLogOut size={20} />
                </button>
            </div>
        </header>
    );
}