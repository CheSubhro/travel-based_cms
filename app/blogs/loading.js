export default function Loading() {
    return (
        <main className="min-h-screen bg-gray-50">
            <section className="bg-gray-900 px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />

                    <div className="mt-5 h-12 w-72 animate-pulse rounded bg-gray-700" />

                    <div className="mt-5 h-5 max-w-2xl animate-pulse rounded bg-gray-700" />
                </div>
            </section>

            <section className="px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="overflow-hidden rounded-xl bg-white shadow-sm"
                            >
                                <div className="h-64 animate-pulse bg-gray-200" />

                                <div className="p-6">
                                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-4 h-7 w-4/5 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-200" />
                                    <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-200" />

                                    <div className="mt-6 h-4 w-28 animate-pulse rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}