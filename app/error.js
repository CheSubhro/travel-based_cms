
"use client";

export default function Error({ error, reset }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>

            <p className="mt-2 text-gray-600">{error.message}</p>

            <button
                onClick={() => reset()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
            >
                Try Again
            </button>
        </div>
    );
}