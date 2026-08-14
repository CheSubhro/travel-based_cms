"use client";

import { useEffect, useState } from "react";

import DashboardCard from "../../components/DashboardCard";

export default function DashboardPage() {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await fetch("/api/admin/dashboard", {
                    cache: "no-store",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                            "Failed to fetch dashboard statistics",
                    );
                }

                setStatistics(result.data);
            } catch (error) {
                console.error("Dashboard statistics error:", error);

                setError(
                    error.message || "Failed to load dashboard statistics",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your Travel CMS
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-36 animate-pulse rounded-xl border border-gray-200 bg-white"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Overview of your Travel CMS
                    </p>
                </div>

                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

                <p className="mt-1 text-sm text-gray-500">
                    Overview of your Travel CMS
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Blogs"
                    value={statistics.blogs.total}
                    description="Total blog posts"
                    type="blogs"
                />

                <DashboardCard
                    title="Destinations"
                    value={statistics.destinations.total}
                    description="Total destinations"
                    type="destinations"
                />

                <DashboardCard
                    title="Categories"
                    value={statistics.categories.total}
                    description="Total categories"
                    type="categories"
                />

                <DashboardCard
                    title="Media"
                    value={statistics.media.total}
                    description="Total media files"
                    type="media"
                />
            </div>

            <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Statistics
                </h2>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-base font-semibold text-gray-900">
                            Blog Statistics
                        </h3>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Published
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.blogs.published}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Draft</p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.blogs.draft}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Archived
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.blogs.archived}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Featured
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.blogs.featured}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-base font-semibold text-gray-900">
                            Destination Statistics
                        </h3>

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Published
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.destinations.published}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Draft</p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.destinations.draft}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Archived
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.destinations.archived}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Featured
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.destinations.featured}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-base font-semibold text-gray-900">
                            Category Statistics
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Total</p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.categories.total}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Active</p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.categories.active}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Inactive
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.categories.inactive}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-5 text-base font-semibold text-gray-900">
                            Media Statistics
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Media
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.media.total}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Active Media
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {statistics.media.active}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}