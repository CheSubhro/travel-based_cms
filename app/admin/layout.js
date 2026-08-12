
export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white shadow">
            <div className="p-6">
            <h1 className="text-xl font-bold">Travel CMS</h1>
            </div>

            <nav className="px-4">
            <a
                href="/admin/dashboard"
                className="block rounded px-4 py-2 hover:bg-gray-100"
            >
                Dashboard
            </a>

            <a
                href="/admin/destinations"
                className="block rounded px-4 py-2 hover:bg-gray-100"
            >
                Destinations
            </a>

            <a
                href="/admin/blogs"
                className="block rounded px-4 py-2 hover:bg-gray-100"
            >
                Blogs
            </a>
            </nav>
        </aside>

        <main className="ml-64 p-8">{children}</main>
        </div>
    );
}