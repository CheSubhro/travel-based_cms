"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex h-18 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        onClick={closeMenu}
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-lg font-bold text-white">
                            T
                        </div>

                        <div>
                            <p className="text-lg font-bold leading-tight text-gray-900">
                                TravelBase
                            </p>
                            <p className="text-xs text-gray-500">
                                Explore • Discover • Travel
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 md:flex">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                        >
                            Home
                        </Link>

                        <Link
                            href="/destinations"
                            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                        >
                            Destinations
                        </Link>

                        <Link
                            href="/blogs"
                            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                        >
                            Blogs
                        </Link>

                        <Link
                            href="/categories"
                            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                        >
                            Categories
                        </Link>

                        <Link
                            href="/featured"
                            className="text-sm font-medium text-gray-700 transition hover:text-gray-900"
                        >
                            Featured
                        </Link>

                        <Link
                            href="/search"
                            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                            <span>⌕</span>
                            Search
                        </Link>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-50 md:hidden"
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <span className="text-xl">×</span>
                        ) : (
                            <span className="text-xl">☰</span>
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {menuOpen && (
                    <nav className="border-t border-gray-100 py-4 md:hidden">
                        <div className="flex flex-col">
                            <Link
                                href="/"
                                onClick={closeMenu}
                                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Home
                            </Link>

                            <Link
                                href="/destinations"
                                onClick={closeMenu}
                                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Destinations
                            </Link>

                            <Link
                                href="/blogs"
                                onClick={closeMenu}
                                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Blogs
                            </Link>

                            <Link
                                href="/categories"
                                onClick={closeMenu}
                                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Categories
                            </Link>

                            <Link
                                href="/featured"
                                onClick={closeMenu}
                                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Featured
                            </Link>

                            <Link
                                href="/search"
                                onClick={closeMenu}
                                className="mt-2 rounded-lg bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Search
                            </Link>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    );
}