'use client';

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import convertFile from "@/lib/convert";
import loadFfmpeg from "@/lib/load-ffmpeg";
import { cn } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus, SparklesIcon, Upload, UploadIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import VideoProcessed from "./VideoProcessed";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });
const normalfont = Poppins({ subsets: ["latin"], weight: ["400"] });

export default function MainUpload() {
    const [loading, setLoading] = useState(false);
    const [videoProcessed, setVideoProcessed] = useState(false);
    const ffmpegRef = useRef(new FFmpeg());
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [transcriptState, setTanscriptState] = useState<{ chunks: { timestamp: [number, number]; text: string }[] } | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [rateLimit, setRateLimit] = useState<{ remaining: number; total: number } | null>(null);

    useEffect(() => {
        load();
        checkRateLimit();
    }, []);

    const load = async () => {
        const ffmpeg_response: FFmpeg = await loadFfmpeg();
        ffmpegRef.current = ffmpeg_response;
    };

    const checkRateLimit = async () => {
        try {
            const response = await fetch("/api/rate-limit");
            if (response.ok) {
                const data = await response.json();
                setRateLimit(data);
            }
        } catch (error) {
            console.error("Error checking rate limit:", error);
        }
    };

    const handleFileSelection = (file: File) => {
        if (!file.type.startsWith('video/')) {
            return toast.error("Invalid file type. Please upload a video.");
        }

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            if (video.duration > 300) {
                toast.error("Video length exceeds 5 minutes!");
                setVideoFile(null);
                setVideoDuration(0);
            } else {
                setVideoFile(file);
                setVideoDuration(video.duration);
            }
        };
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) handleFileSelection(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) handleFileSelection(file);
    };

    const convert = async (): Promise<void> => {
        if (!videoFile) {
            toast.error("No video file selected!");
            return;
        }

        // Check rate limit before processing
        try {
            const response = await fetch("/api/rate-limit", {
                method: "POST"
            });

            if (!response.ok) {
                const data = await response.json();
                toast.error(data.message);
                return;
            }
        } catch (error) {
            console.error("Error checking rate limit:", error);
            toast.error("Failed to check rate limit");
            return;
        }

        setLoading(true);

        toast.promise(
            (async () => {
                try {
                    const { url, output } = await convertFile(ffmpegRef.current, {
                        file: videoFile,
                        to: 'mp3',
                        file_name: videoFile.name,
                        file_type: videoFile.type
                    });

                    if (!output) {
                        throw new Error("Error converting video to audio");
                    }

                    const startTime = Date.now();
                    const audioBuffer = await fetch(url).then((res) => res.arrayBuffer());
                    const output2 = Buffer.from(audioBuffer);
                    const base64Audio = output2.toString("base64");

                    const response = await fetch("/api/transcribe", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ base64Audio }),
                    });

                    const res = await response.json();
                    const data = res.body;

                    console.log("chunks", data);

                    const newChunks = fixTimestamps(data.chunks as { timestamp: [number, number]; text: string }[]);
                    data.chunks = newChunks;
                    const endTime = Date.now();
                    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

                    // video duration in seconds
                    const videoDurationInSeconds = videoDuration;

                    const body = {
                        videoFileName: videoFile.name,
                        videoFileSize: videoFile.size,
                        videoFileDuration: videoDurationInSeconds,
                        audioFileName: output,
                        audioFileSize: output2.length,
                        transcription: JSON.stringify(data),
                        processingTime: processingTime
                    };

                    const response2 = await fetch("/api/project", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(body),
                    });

                    const project = await response2.json();
                    console.log(project);

                    // Update total video duration stats
                    await fetch("/api/stats", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ duration: videoDurationInSeconds }),
                    });

                    setTanscriptState(data);
                    setVideoProcessed(true);
                    setProjectId(project.message);

                    // Update rate limit after successful processing
                    await checkRateLimit();

                    return { processingTime };
                } finally {
                    setLoading(false);
                }
            })(),
            {
                loading: 'Starting transcription...',
                success: (data) => `Transcription completed successfully in ${data.processingTime} seconds`,
                error: (err) => `Error: ${err.message || 'Failed to process video'}`
            }
        );
    }

    function fixTimestamps(chunks: { timestamp: [number, number]; text: string }[]) {
        let lastEnd = 0;

        return chunks.map(chunk => {
            let [start, end] = chunk.timestamp;

            if (start < lastEnd) {
                const duration = end - start;
                start = lastEnd;
                end = start + duration;
            }

            lastEnd = end;

            return {
                ...chunk,
                timestamp: [
                    parseFloat(start.toFixed(1)),
                    parseFloat(end.toFixed(1))
                ]
            };
        });
    }

    return (
        <div className="overflow-y-auto flex-1 flex flex-col justify-center items-center text-center mt-10">
            <Dialog>
                <DialogTrigger asChild>
                    <div className="p-4 md:p-0 md:py-4 mb-3">
                        <Card className="py-6 px-9 w-fit rounded-sm flex flex-row gap-1 items-center cursor-pointer hover:border hover:border-red-500 shadow-[0_0_20px_-5px_rgba(238,51,93,0.2)] hover:shadow-[0_0_20px_-5px_rgba(238,51,93,0.4)] transition-all duration-300 hover:scale-105">
                            <Plus className="size-5 text-red-500" />
                            <h1 className={cn("text-lg font-bold flex flex-row gap-1 items-center justify-center text-center text-red-500", font.className)}>
                                Generate Captions using AI <SparklesIcon className="size-5 text-red-500 fill-current" />
                            </h1>
                        </Card>
                    </div>
                </DialogTrigger>

                <DialogContent
                    className={cn(
                        "w-[95vw] md:w-full max-w-5xl md:min-w-[800px] p-4 md:p-6 rounded-2xl shadow-xl bg-white max-h-[90vh] overflow-auto",
                        font.className
                    )}
                >
                    <DialogTitle className={cn("text-base md:text-2xl font-bold text-center", font.className)}>
                        {rateLimit && (
                            <div className="text-xs md:text-sm text-gray-600 mb-2">
                                Remaining videos in this session: {rateLimit.remaining}/{rateLimit.total}
                            </div>
                        )}
                    </DialogTitle>
                    <div className="mt-3">
                        {videoFile && !videoProcessed && !transcriptState && (
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    disabled={loading || (rateLimit !== null && rateLimit.remaining === 0)}
                                    onClick={convert}
                                    className={cn(
                                        "flex flex-row items-center gap-1 w-fit text-white text-sm md:text-base font-semibold py-1.5 px-4 rounded-sm shadow-md cursor-pointer",
                                        loading || (rateLimit !== null && rateLimit.remaining === 0)
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-red-500 hover:bg-red-600",
                                        font.className
                                    )}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    ) : rateLimit !== null && rateLimit.remaining === 0 ? (
                                        "Rate Limit Exceeded"
                                    ) : (
                                        <>
                                            <UploadIcon className="size-4 md:size-5" /> Generate Captions
                                        </>
                                    )}
                                </button>
                                <video src={URL.createObjectURL(videoFile)} controls className="w-full md:w-fit h-fit max-h-[50vh] md:max-h-96 rounded-lg" />
                            </div>
                        )}

                        {!videoFile && (
                            <div className="border-2 border-dashed border-gray-600 bg-gray-100 rounded-lg p-4 md:p-8 flex flex-col items-center" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                                <label className="flex flex-col items-center cursor-pointer">
                                    <Upload className="size-7 md:size-9 text-red-400 mb-2" />
                                    <span className={cn("text-base md:text-lg text-gray-800", normalfont.className)}>
                                        Drop your video here
                                    </span>
                                    <span className={cn("flex flex-col md:flex-row justify-between gap-2 md:gap-3 mt-1 text-xs md:text-sm text-gray-400", normalfont.className)}>
                                        <p>Max length: 5.00 mins</p>
                                        <p>Max size: 50MB</p>
                                    </span>
                                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        )}

                        {videoProcessed && videoFile && transcriptState && (
                            <VideoProcessed videoFile={videoFile} transcript={transcriptState} projectId={projectId!} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
