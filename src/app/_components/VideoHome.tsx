"use client";

import convertFile from "@/lib/convert";
import loadFfmpeg from "@/lib/load-ffmpeg";
import { cn } from "@/lib/utils";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Upload, UploadIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import VideoProcessed from "./VideoProcessed";
const font = Poppins({ subsets: ["latin"], weight: ["600"] });
const normalfont = Poppins({ subsets: ["latin"], weight: ["400"] });

export default function VideoHome() {

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
                return; // Handle error appropriately
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
                return; // Handle error appropriately
            }

            const newChunks = fixTimestamps(data.chunks as { timestamp: [number, number]; text: string }[]);
            data.chunks = newChunks;
            const endTIme = Date.now();
            toast.success("Transcription completed successfully, took " + ((endTIme - startTime) / 1000).toFixed(2) + " seconds to transcribe the video.");
            console.log("Time taken to transcribe: ", ((endTIme - startTime) / 1000).toFixed(2), " seconds");
            setTanscriptState(data);
            setVideoProcessed(true);

            // call /api/project with the following body:
            // const body = {
            //     userId: "616a5b7b8f0a3e001f7f2f1c",
            //     videoFileName: videoFile.name,
            //     videoFileSize: videoFile.size,
            //     audioFileName: output,
            //     audioFileSize: output2.length,
            //     transcription: JSON.stringify(data),
            //     processingTime: (endTIme - startTime) / 1000
            // };

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
        let lastEnd = 0; // Track the last end timestamp

        return chunks.map(chunk => {
            let [start, end] = chunk.timestamp;

            // If the start timestamp is lower than the last end, adjust it
            if (start < lastEnd) {
                const duration = end - start;
                start = lastEnd;
                end = start + duration;
            }

            lastEnd = end; // Update the last end timestamp

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
        <div className="mt-3">
            {!videoProcessed && <>
                {videoFile ? (
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
                ) : (
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
            </>}

            {videoProcessed && videoFile && transcriptState && (
                <VideoProcessed videoFile={videoFile} transcript={transcriptState} />
            )}
        </div>
    );
}