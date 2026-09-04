"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                    !
                </div>

                <h1 className="mt-6 text-3xl font-bold text-gray-900">
                    Something Went Wrong
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-gray-600">
                    Sorry, something went wrong while loading this page. Please
                    try again.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
                        Go to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}