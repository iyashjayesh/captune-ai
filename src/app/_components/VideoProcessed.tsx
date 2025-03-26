import { Card } from "@/components/ui/card";
import loadFfmpeg from "@/lib/load-ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type VideoProcessedProps = {
    videoFile: File;
    transcript: { chunks: { timestamp: [number, number]; text: string }[] };
};

export default function VideoProcessed({ videoFile, transcript }: VideoProcessedProps) {
    const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const subtitleListRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const ffmpegRef = useRef<FFmpeg | null>(null);

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

    const handleExport = async () => {
        if (!ffmpegRef.current) {
            try {
                ffmpegRef.current = await loadFfmpeg();
            } catch (error) {
                console.log("Failed to load FFmpeg:", error);
                toast.error("Failed to load FFmpeg");
                return;
            }
        }

        setExporting(true);
        toast.info("Starting export process...");

        try {
            const ffmpeg = ffmpegRef.current;
            const videoData = await fetch(videoUrl).then(res => res.arrayBuffer());
            const videoBlob = new Blob([videoData], { type: videoFile.type });

            // Write video file to FFmpeg
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob));

            // Create SRT file content
            const srtContent = transcript.chunks.map((chunk, index) => {
                const startTime = formatTime(chunk.timestamp[0]);
                const endTime = formatTime(chunk.timestamp[1]);
                return `${index + 1}\n${startTime} --> ${endTime}\n${chunk.text}\n\n`;
            }).join('');

            // Write SRT file
            await ffmpeg.writeFile('subtitles.srt', srtContent);

            // Burn subtitles into video
            await ffmpeg.exec([
                '-i', 'input.mp4',
                '-vf', 'subtitles=subtitles.srt:force_style=\'FontSize=24,FontName=Arial\'',
                '-c:a', 'copy',
                '-report',
                'output.mp4'
            ]);

            // Read the output file
            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `captioned_${videoFile.name}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Video exported successfully!");
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Failed to export video");
        } finally {
            setExporting(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

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
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="text-white text-lg rounded-lg font-semibold px-4 py-2 bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {exporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Exporting...
                            </>
                        ) : (
                            'Export'
                        )}
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <video
                        src={videoUrl}
                        ref={videoRef}
                        controls
                        className="w-fit py-20 rounded-xl h-[40vh] md:h-[60vh] object-contain"
                    />
                </div>
            </Card>
        </div>
    );
}
