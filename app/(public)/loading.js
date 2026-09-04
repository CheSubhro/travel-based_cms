export default function Loading() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                    Loading...
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Please wait while the page loads.
                </p>
            </div>
        </main>
    );
}