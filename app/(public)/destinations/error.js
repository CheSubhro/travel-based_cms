"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error("Destinations error:", error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-2xl text-center">
                <h1 className="text-3xl font-bold text-gray-900">
                    Unable to Load Destinations
                </h1>

                <p className="mt-4 text-gray-600">
                    We could not load the destinations right now. Please try
                    again.
                </p>

                <div className="mt-8 flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </main>
    );
}