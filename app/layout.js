

import "./globals.css";

import siteConfig from "@/config/site";



export const metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ),

    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },

    description: siteConfig.description,

    keywords: [
        "travel",
        "travel destinations",
        "travel guides",
        "travel blogs",
        "tourism",
        "India travel",
        "travel inspiration",
    ],

    authors: [
        {
            name: siteConfig.name,
        },
    ],

    creator: siteConfig.name,

    robots: {
        index: true,
        follow: true,
    },

    openGraph: {
        type: "website",
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
        locale: "en_IN",
    },

    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>

                {children}

            </body>
        </html>
    );
}

