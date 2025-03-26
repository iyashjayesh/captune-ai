import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import loadFfmpeg from "@/lib/load-ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { debounce } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type VideoProcessedProps = {
    videoFile: File;
    transcript: { chunks: { timestamp: [number, number]; text: string }[] };
    onNewVideo?: () => void;
    projectId: string;
};

export default function VideoProcessed({ videoFile, transcript: initialTranscript, onNewVideo, projectId }: VideoProcessedProps) {
    const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exported, setExported] = useState(false);
    const [transcript, setTranscript] = useState(initialTranscript);
    const subtitleListRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const ffmpegRef = useRef<FFmpeg | null>(null);

    // Memoize video URL to avoid re-generating on every render
    const videoUrl = useMemo(() => URL.createObjectURL(videoFile), [videoFile]);

    // Debounced function to update timestamps in the database
    const updateTimestamps = useMemo(
        () =>
            debounce(async (chunks: { timestamp: [number, number]; text: string }[]) => {
                try {
                    const response = await fetch(`/api/project/${projectId}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            transcription: JSON.stringify({ chunks }),
                        }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to update timestamps");
                    }

                    toast.success("Timestamps updated successfully");
                } catch (error) {
                    console.error("Error updating timestamps:", error);
                    toast.error("Failed to update timestamps");
                }
            }, 1000),
        [projectId]
    );

    const handleTimestampChange = (index: number, isStart: boolean, value: string) => {
        const newTranscript = { ...transcript };
        const timestamp = parseFloat(value);

        if (isNaN(timestamp)) {
            toast.error("Please enter a valid number");
            return;
        }

        // Get video duration
        const video = videoRef.current;
        if (!video) return;
        const videoDuration = video.duration;

        // Validate timestamp is within video duration
        if (timestamp < 0 || timestamp > videoDuration) {
            toast.error(`Timestamp must be between 0 and ${videoDuration.toFixed(1)} seconds`);
            return;
        }

        if (isStart) {
            // Validate start time
            const currentEndTime = newTranscript.chunks[index].timestamp[1];
            if (timestamp >= currentEndTime) {
                toast.error("Start time must be less than end time");
                return;
            }

            // Check for overlap with previous chunk
            if (index > 0) {
                const prevEndTime = newTranscript.chunks[index - 1].timestamp[1];
                if (timestamp < prevEndTime) {
                    toast.error("Start time cannot overlap with previous subtitle");
                    return;
                }
            }

            newTranscript.chunks[index].timestamp[0] = timestamp;
        } else {
            // Validate end time
            const currentStartTime = newTranscript.chunks[index].timestamp[0];
            if (timestamp <= currentStartTime) {
                toast.error("End time must be greater than start time");
                return;
            }

            // Check for overlap with next chunk
            if (index < newTranscript.chunks.length - 1) {
                const nextStartTime = newTranscript.chunks[index + 1].timestamp[0];
                if (timestamp > nextStartTime) {
                    toast.error("End time cannot overlap with next subtitle");
                    return;
                }
            }

            newTranscript.chunks[index].timestamp[1] = timestamp;
        }

        // Round timestamps to 1 decimal place for consistency
        newTranscript.chunks[index].timestamp = [
            parseFloat(newTranscript.chunks[index].timestamp[0].toFixed(1)),
            parseFloat(newTranscript.chunks[index].timestamp[1].toFixed(1))
        ];

        // Update local state immediately
        setTranscript(newTranscript);

        // Update database with debounced function
        updateTimestamps(newTranscript.chunks);

        // Show immediate feedback
        toast.success("Timestamps updated");
    };

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

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

    const handleExportSRT = async () => {
        try {
            const srtContent = transcript.chunks.map((chunk, index) => {
                const startTime = formatTime(chunk.timestamp[0]);
                const endTime = formatTime(chunk.timestamp[1]);
                return `${index + 1}\n${startTime} --> ${endTime}\n${chunk.text}\n\n`;
            }).join('');

            const srtBlob = new Blob([srtContent], { type: 'text/plain' });
            const srtUrl = URL.createObjectURL(srtBlob);
            const srtLink = document.createElement('a');
            srtLink.href = srtUrl;
            srtLink.download = 'subtitles.srt';
            srtLink.click();
            URL.revokeObjectURL(srtUrl);
        } catch (error) {
            console.log("Failed to export SRT file:", error);
            toast.error('Failed to export SRT file');
        }
    };

    const handleExportVideo = async () => {
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

        toast.promise(
            (async () => {
                try {
                    const ffmpeg = ffmpegRef.current as FFmpeg;
                    const videoData = await fetch(videoUrl).then(res => res.arrayBuffer());
                    const videoBlob = new Blob([videoData], { type: videoFile.type });

                    await ffmpeg.writeFile('input.mp4', await fetchFile(videoBlob));

                    console.log("Transcript:", transcript);

                    // Use the current transcript state to ensure we have the latest timestamps
                    const currentTranscript = transcript;
                    const srtContent = currentTranscript.chunks.map((chunk, index) => {
                        const startTime = formatTime(chunk.timestamp[0]);
                        const endTime = formatTime(chunk.timestamp[1]);
                        return `${index + 1}\n${startTime} --> ${endTime}\n${chunk.text}\n\n`;
                    }).join('');

                    await ffmpeg.writeFile('subtitles.srt', srtContent);

                    // Use subtitle filter to burn subtitles into the video
                    await ffmpeg.exec([
                        '-i', 'input.mp4',
                        '-i', 'subtitles.srt',
                        '-c', 'copy',
                        '-c:s', 'mov_text',
                        'output.mp4'
                    ]);

                    await ffmpeg.deleteFile('subtitles.srt');
                    await ffmpeg.deleteFile('input.mp4');

                    const data = await ffmpeg.readFile('output.mp4');
                    const blob = new Blob([data], { type: 'video/mp4' });
                    const url = URL.createObjectURL(blob);

                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `captioned_${videoFile.name}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    setExported(true);
                    return { name: videoFile.name };
                } finally {
                    setExporting(false);
                }
            })(),
            {
                loading: 'Starting video export process...',
                success: (data) => `Successfully exported ${data.name}`,
                error: 'Failed to export video',
            }
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {exported && (
                <div className="flex justify-center w-full">
                    <button
                        onClick={onNewVideo}
                        className="text-white text-lg rounded-lg font-semibold px-6 py-3 bg-green-500 hover:bg-green-600 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Upload New Video
                    </button>
                </div>
            )}
            
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
                                <div className="flex flex-row justify-between items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={chunk.timestamp[0]}
                                            onChange={(e) => handleTimestampChange(index, true, e.target.value)}
                                            className="w-20 bg-red-400 text-white border-none"
                                        />
                                        <span className="text-white">-</span>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={chunk.timestamp[1]}
                                            onChange={(e) => handleTimestampChange(index, false, e.target.value)}
                                            className="w-20 bg-red-400 text-white border-none"
                                        />
                                    </div>
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
                    <div className="flex flex-col gap-4 w-full mb-2">
                        <h2 className="text-xl md:text-2xl font-bold text-red-500">Video Preview</h2>
                        <div className="flex flex-row gap-4 justify-end">
                            <button
                                onClick={handleExportSRT}
                                disabled={exporting}
                                className="text-white text-lg rounded-lg font-semibold px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Export SRT
                            </button>
                            <button
                                onClick={handleExportVideo}
                                // disabled={exporting || exported}
                                className={`text-white text-lg rounded-lg font-semibold px-4 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${exported
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                {exporting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Exporting...
                                    </>
                                ) : exported ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Exported Successfully
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        Export Video
                                    </>
                                )}
                            </button>
                        </div>
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
        </div>
    );
}
