import DashboardCard from "../../components/DashboardCard";

export default function DashboardPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

                <p className="mt-1 text-sm text-gray-500">
                    Overview of your Travel CMS
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard
                    title="Blogs"
                    value="0"
                    description="Total blog posts"
                    type="blogs"
                />

                <DashboardCard
                    title="Destinations"
                    value="0"
                    description="Total destinations"
                    type="destinations"
                />

                <DashboardCard
                    title="Categories"
                    value="0"
                    description="Total categories"
                    type="categories"
                />

                <DashboardCard
                    title="Media"
                    value="0"
                    description="Total media files"
                    type="media"
                />
            </div>
        </div>
    );
}