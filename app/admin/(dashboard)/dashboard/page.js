import connectDB from "@/lib/mongodb";

import Blog from "@/models/Blog";
import Destination from "@/models/Destination";
import Category from "@/models/Category";
import Media from "@/models/Media";

import DashboardCard from "../../components/DashboardCard";

export default async function DashboardPage() {
    await connectDB();

    const [blogs, destinations, categories, media] = await Promise.all([
        Blog.countDocuments(),
        Destination.countDocuments(),
        Category.countDocuments(),
        Media.countDocuments(),
    ]);

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
                    value={blogs}
                    description="Total blog posts"
                    type="blogs"
                />

                <DashboardCard
                    title="Destinations"
                    value={destinations}
                    description="Total destinations"
                    type="destinations"
                />

                <DashboardCard
                    title="Categories"
                    value={categories}
                    description="Total categories"
                    type="categories"
                />

                <DashboardCard
                    title="Media"
                    value={media}
                    description="Total media files"
                    type="media"
                />
            </div>
        </div>
    );
}