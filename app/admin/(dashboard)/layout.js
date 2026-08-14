import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <div className="ml-64 min-h-screen">
                <Header />

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}