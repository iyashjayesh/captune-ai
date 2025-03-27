'use client';

// Server Actions must be async functions.

import { useEffect, useState } from "react";
import { NumberTicker } from "./magicui/number-ticker";

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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <span className="text-2xl sm:text-4xl font-bold text-indigo-600">
                    <NumberTicker
                        value={totalSeconds}
                        startValue={111}
                        className="text-2xl sm:text-4xl font-bold tracking-tighter text-indigo-600"
                    />
                </span>
                <span className="text-sm sm:text-lg text-gray-600">seconds of videos captioned ✨</span>
            </div>
        </div>
    );
}