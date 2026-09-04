

import connectDB from "@/lib/mongodb";
import Destination from "@/models/Destination";
import Blog from "@/models/Blog";

export default async function sitemap() {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    await connectDB();

    const [destinations, blogs] = await Promise.all([
        Destination.find({
            status: "published",
            isActive: { $ne: false },
        })
            .select("slug updatedAt")
            .lean(),

        Blog.find({
            status: "published",
            isActive: { $ne: false },
        })
            .select("slug updatedAt")
            .lean(),
    ]);

    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/destinations`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/featured`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];

    const destinationPages = destinations.map((destination) => ({
        url: `${baseUrl}/destinations/${destination.slug}`,
        lastModified: destination.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const blogPages = blogs.map((blog) => ({
        url: `${baseUrl}/blogs/${blog.slug}`,
        lastModified: blog.updatedAt || new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    return [
        ...staticPages,
        ...destinationPages,
        ...blogPages,
    ];
}

