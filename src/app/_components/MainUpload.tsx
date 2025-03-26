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
    const [transcriptState, setTanscriptState] = useState<{ chunks: { timestamp: [number, number]; text: string }[] } | null>(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const ffmpeg_response: FFmpeg = await loadFfmpeg();
        ffmpegRef.current = ffmpeg_response;
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
            } else {
                setVideoFile(file);
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

        setLoading(true);
        toast.info("Starting transcription...");

        try {
            const { url, output } = await convertFile(ffmpegRef.current, {
                file: videoFile,
                to: 'mp3',
                file_name: videoFile.name,
                file_type: videoFile.type
            });

            if (!output) {
                console.error("Error converting video to audio:", output);
                return;
            }

            toast.success("Audio file generated successfully!");

            console.log("Audio file generated:", url);

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

            if (!data || typeof data !== "object" || data === null || !("chunks" in data)) {
                console.error("Invalid response structure:", data);
                return;
            }

            const newChunks = fixTimestamps(data.chunks as { timestamp: [number, number]; text: string }[]);
            data.chunks = newChunks;
            const endTIme = Date.now();
            toast.success("Transcription completed successfully, took " + ((endTIme - startTime) / 1000).toFixed(2) + " seconds to transcribe the video.");
            console.log("Time taken to transcribe: ", ((endTIme - startTime) / 1000).toFixed(2), " seconds");
            setTanscriptState(data);
            setVideoProcessed(true);

            const body = {
                videoFileName: videoFile.name,
                videoFileSize: videoFile.size,
                audioFileName: output,
                audioFileSize: output2.length,
                transcription: JSON.stringify(data),
                processingTime: (endTIme - startTime) / 1000
            };

            const response2 = await fetch("/api/project", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const project = await response2.json();
            console.log("Project created:", project);
        } catch (error) {
            console.error("Error converting video to audio:", error);
        } finally {
            setLoading(false);
        }
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
                        <Card className="py-6 px-9 w-fit rounded-sm flex flex-row gap-1 items-center cursor-pointer hover:border hover:border-red-500">
                            <Plus className="size-5 text-red-500" />
                            <h1 className={cn("text-lg flex flex-row gap-1 items-center justify-center text-center text-red-500", font.className)}>
                                Generate Captions using AI <SparklesIcon className="size-5 text-red-500 fill-current" />
                            </h1>
                        </Card>
                    </div>
                </DialogTrigger>

                <DialogContent
                    className={cn(
                        "w-full max-w-5xl min-w-[800px] p-6 rounded-2xl shadow-xl bg-white max-h-[90vh] overflow-auto",
                        font.className
                    )}
                >
                    <DialogTitle className={cn("text-lg md:text-2xl font-bold text-center", font.className)}>
                        {/* Upload your video */}
                    </DialogTitle>
                    <div className="mt-3">
                        {videoFile && !videoProcessed && !transcriptState && (
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    disabled={loading}
                                    onClick={convert}
                                    className={cn("flex flex-row items-center gap-1 w-fit bg-red-500 hover:bg-red-600 text-white text-base font-semibold py-1.5 px-4 rounded-sm shadow-md cursor-pointer", font.className)}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <UploadIcon className="size-5" /> Generate Captions
                                        </>
                                    )}
                                </button>
                                <video src={URL.createObjectURL(videoFile)} controls className="w-fit h-fit max-h-96 rounded-lg" />
                            </div>
                        )}
                        
                        {!videoFile && (
                            <div className="border-2 border-dashed border-gray-600 bg-gray-100 rounded-lg p-8 flex flex-col items-center" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                                <label className="flex flex-col items-center cursor-pointer">
                                    <Upload className="size-9 text-red-400 mb-2" />
                                    <span className={cn("text-lg text-gray-800", normalfont.className)}>
                                        Drop your video here
                                    </span>
                                    <span className={cn("flex flex-row justify-between gap-3 mt-1 text-sm text-gray-400", normalfont.className)}>
                                        <p>Max length: 5.00 mins</p>
                                        <p>Max size: 50MB</p>
                                    </span>
                                    <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        )}

                        {videoProcessed && videoFile && transcriptState && (
                            <VideoProcessed videoFile={videoFile} transcript={transcriptState} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
