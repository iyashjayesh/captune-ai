'use client';

// Server Actions must be async functions.

import { useEffect, useState } from "react";

// export default function SignIn() {
export default function VideoMinsCount() {
    const [totalSeconds, setTotalSeconds] = useState(0);

    useEffect(() => {
        const fetchTotalCount = async () => {
            try {
                const response = await fetch("/api/stats");
                const data = await response.json();
                const totalDuration = data.value || 0;
                setTotalSeconds(Math.floor(totalDuration));
            } catch (error) {
                console.error("Error fetching total count:", error);
            }
        }
        fetchTotalCount();
    }, []);

    return (
        <div className="text-center py-1.5 px-2 bg-indigo-50 rounded-lg w-fit mx-auto">
            <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-indigo-600">
                    {totalSeconds.toLocaleString()}
                </span>
                <span className="text-lg text-gray-600">seconds of videos captioned ✨</span>
            </div>
        </div>
    );
}