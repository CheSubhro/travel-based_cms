import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-2xl text-center">
                <p className="text-8xl font-bold tracking-tight text-gray-900">
                    404
                </p>

                <h1 className="mt-6 text-3xl font-bold text-gray-900 md:text-4xl">
                    Page Not Found
                </h1>

                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
                    Sorry, the page you are looking for does not exist or may
                    have been moved.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Go to Home
                    </Link>

                    <Link
                        href="/destinations"
                        className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                        Explore Destinations
                    </Link>

                    <Link
                        href="/blogs"
                        className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                        Read Blogs
                    </Link>
                </div>
            </div>
        </main>
    );
}