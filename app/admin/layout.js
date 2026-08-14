import Sidebar from "./components/Sidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <main className="ml-64 min-h-screen">{children}</main>
        </div>
    );
}