import { Card } from "@/components/ui/card";
import { useEffect, useMemo, useRef, useState } from "react";

type VideoProcessedProps = {
    videoFile: File;
    transcript: { chunks: { timestamp: [number, number]; text: string }[] };
};

export default function VideoProcessed({ videoFile, transcript }: VideoProcessedProps) {
    const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
    const subtitleListRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Memoize video URL to avoid re-generating on every render
    const videoUrl = useMemo(() => URL.createObjectURL(videoFile), [videoFile]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !transcript) return;

        const updateSubtitles = () => {
            const currentTime = video.currentTime;
            const activeIndex = transcript.chunks.findIndex(
                (chunk) => currentTime >= chunk.timestamp[0] && currentTime <= chunk.timestamp[1]
            );

            // Only update when the index changes
            if (activeIndex !== -1 && activeIndex !== activeSubtitleIndex) {
                setActiveSubtitleIndex(activeIndex);

                // Auto-scroll to active subtitle
                const subtitleContainer = subtitleListRef.current;
                const activeSubtitle = document.getElementById(`subtitle-${activeIndex}`);
                if (subtitleContainer && activeSubtitle) {
                    subtitleContainer.scrollTo({
                        top: activeSubtitle.offsetTop - subtitleContainer.offsetTop - 20,
                        behavior: "smooth",
                    });
                }
            } else if (activeIndex === -1 && activeSubtitleIndex !== null) {
                setActiveSubtitleIndex(null);
            }
        };

        video.addEventListener("timeupdate", updateSubtitles);
        return () => video.removeEventListener("timeupdate", updateSubtitles);
    }, [transcript, activeSubtitleIndex]);

    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 w-full">
            <Card className="flex-1 basis-1/2 p-2 md:p-6 shadow-lg rounded-2xl overflow-auto">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-red-500">Subtitles</h2>
                <div ref={subtitleListRef} className="flex flex-col overflow-y-auto h-[calc(90vh-200px)]">
                    {transcript?.chunks.map((chunk, index) => (
                        <div
                            key={index}
                            id={`subtitle-${index}`}
                            className={`m-2 flex flex-col gap-2 p-2 rounded-lg ${activeSubtitleIndex === index ? "bg-red-300 text-white" : ""
                                }`}
                        >
                            <div className="flex flex-row justify-between">
                                <p className="bg-red-400 w-fit px-2 rounded-lg text-white">
                                    {chunk.timestamp[0]} - {chunk.timestamp[1]}
                                </p>
                                <p className="text-sm md:text-base font-bold bg-red-400 w-fit px-2 rounded-lg text-white">
                                    {index + 1}
                                </p>
                            </div>
                            <p className="text-sm md:text-base">{chunk.text}</p>
                        </div>
                    ))}
                </div>
            </Card>
            <Card className="flex-1 basis-1/2 p-2 md:p-6 shadow-lg rounded-2xl flex flex-col items-center overflow-hidden">
                <div className="flex flex-row justify-between w-full mb-2">
                    <h2 className="text-xl md:text-2xl font-bold text-red-500">Video Preview</h2>
                    <button className="text-white text-lg rounded-lg font-semibold px-4 py-2 bg-red-500 hover:bg-red-600 transition-all">
                        Export
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <video
                        src={videoUrl}
                        ref={videoRef}
                        controls
                        // max height 200px
                        className="w-fit py-20 rounded-xl h-[40vh] md:h-[60vh] object-contain"
                    />
                </div>
            </Card>
        </div>
    );
}
