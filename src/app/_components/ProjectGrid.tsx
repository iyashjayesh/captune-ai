"use client";

import { useEffect, useState } from "react";
import { UploadV } from "./UploadV";

export function ProjectGrid() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="mt-3">
            <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-lg font-semibold text-gray-800">No projects available</p>
                <UploadV />
            </div>
        </div >
    );
}