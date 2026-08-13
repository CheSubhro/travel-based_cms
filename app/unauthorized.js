import Link from "next/link";

export default function Unauthorized() {
    return (
        <main className="flex min-h-screen items-center justify-center px-6">
            <div className="text-center">
                <p className="text-sm font-semibold text-gray-500">Error 403</p>

                <h1 className="mt-2 text-4xl font-bold">Access Denied</h1>

                <p className="mt-4 text-gray-600">
                    You do not have permission to access this page.
                </p>

                <Link
                    href="/admin"
                    className="mt-6 inline-block rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800"
                >
                    Back to Admin
                </Link>
            </div>
        </main>
    );
}