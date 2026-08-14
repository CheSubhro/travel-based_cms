import { FiFileText, FiMapPin, FiFolder, FiImage } from "react-icons/fi";

const iconMap = {
    blogs: FiFileText,
    destinations: FiMapPin,
    categories: FiFolder,
    media: FiImage,
};

export default function DashboardCard({ title, value, description, type }) {
    const Icon = iconMap[type];

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>

                    <p className="mt-2 text-3xl font-bold text-gray-900">
                        {value}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">{description}</p>
        </div>
    );
}