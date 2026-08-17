"use client";

import { useEffect } from "react";
import { HiCheckCircle, HiXCircle, HiX } from "react-icons/hi";

export default function Toast({ type = "success", message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3500);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) {
        return null;
    }

    const isSuccess = type === "success";

    return (
        <div className="fixed right-5 top-5 z-50 w-[calc(100%-2.5rem)] max-w-sm">
            <div
                className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${
                    isSuccess ? "border-green-200" : "border-red-200"
                }`}
            >
                <div className="mt-0.5 shrink-0">
                    {isSuccess ? (
                        <HiCheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                        <HiXCircle className="h-6 w-6 text-red-600" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p
                        className={`text-sm font-medium ${
                            isSuccess ? "text-green-800" : "text-red-800"
                        }`}
                    >
                        {isSuccess ? "Success" : "Error"}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">{message}</p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 text-gray-400 transition hover:text-gray-700"
                    aria-label="Close notification"
                >
                    <HiX className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}