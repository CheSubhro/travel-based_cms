

import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-14">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <Link
                            href="/"
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

                        <p className="mt-5 max-w-sm text-sm leading-6 text-gray-600">
                            Discover beautiful destinations, inspiring travel
                            stories, useful guides, and unforgettable
                            experiences from around the world.
                        </p>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                            Explore
                        </h3>

                        <ul className="mt-5 space-y-3">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/destinations"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Destinations
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/blogs"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Blogs
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/categories"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Categories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Discover */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                            Discover
                        </h3>

                        <ul className="mt-5 space-y-3">
                            <li>
                                <Link
                                    href="/featured"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Featured
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/search"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Search
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/destinations"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Popular Destinations
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/blogs"
                                    className="text-sm text-gray-600 transition hover:text-gray-900"
                                >
                                    Travel Stories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                            TravelBase
                        </h3>

                        <p className="mt-5 text-sm leading-6 text-gray-600">
                            Your place to explore destinations, discover new
                            experiences, and plan your next journey.
                        </p>

                        <Link
                            href="/destinations"
                            className="mt-5 inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Start Exploring →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-200">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                    <p>
                        © {new Date().getFullYear()} TravelBase. All rights
                        reserved.
                    </p>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/"
                            className="transition hover:text-gray-900"
                        >
                            Privacy
                        </Link>

                        <Link
                            href="/"
                            className="transition hover:text-gray-900"
                        >
                            Terms
                        </Link>

                        <Link
                            href="/"
                            className="transition hover:text-gray-900"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

