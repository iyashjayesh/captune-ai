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

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    };

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

            // Create SRT file content with proper formatting
            const srtContent = transcript.chunks.map((chunk, index) => {
                const startTime = formatTime(chunk.timestamp[0]);
                const endTime = formatTime(chunk.timestamp[1]);
                return `${index + 1}\n${startTime} --> ${endTime}\n${chunk.text}\n\n`;
            }).join('');

            // Write SRT file to FFmpeg's virtual filesystem
            await ffmpeg.writeFile('subtitles.srt', srtContent);

            // // Create tmp directory and write font file
            // await ffmpeg.exec(['-i', 'input.mp4', '-f', 'null', '-']);
            // await ffmpeg.writeFile('tmp/arial.ttf', await fetchFile('/Arial.ttf'));

            // // List files in FFmpeg's virtual filesystem to verify
            // const files = await ffmpeg.listDir('/');
            // console.log('Files in FFmpeg filesystem:', files);

            // Burn subtitles into video with better styling
            // await ffmpeg.exec([
            //     '-i', 'input.mp4',
            //     '-vf', 'subtitles=subtitles.srt:force_style=\'FontName=/tmp/arial.ttf,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Shadow=1,MarginV=25\'',
            //     '-c:a', 'copy',
            //     '-preset', 'medium',
            //     '-crf', '23',
            //     'output.mp4',
            //     '-report'
            // ]);

            await ffmpeg.exec([
                '-i', 'input.mp4',
                '-i', 'subtitles.srt',
                '-c', 'copy',
                '-c:s', 'mov_text',
                'output.mp4'
            ]);

            // // List files in FFmpeg's virtual filesystem to verify
            // const newFiles = await ffmpeg.listDir('/');
            // console.log('Files in FFmpeg filesystem:', newFiles);

            // can we also downlpod all the file which has .log as extension?
            // const logFiles = newFiles.filter(file => file.name.endsWith('.log'));
            // logFiles.forEach(async (logFile) => {
            //     const logFileData = await ffmpeg.readFile(logFile.name);
            //     const logBlob = new Blob([logFileData], { type: 'text/plain' });
            //     const logUrl = URL.createObjectURL(logBlob);
            //     const logLink = document.createElement('a');
            //     logLink.href = logUrl;
            //     logLink.download = logFile.name;
            //     logLink.click();
            //     URL.revokeObjectURL(logUrl);
            // });

            const srtFile = await ffmpeg.readFile('subtitles.srt');
            const srtBlob = new Blob([srtFile], { type: 'text/plain' });
            const srtUrl = URL.createObjectURL(srtBlob);
            const srtLink = document.createElement('a');
            srtLink.href = srtUrl;
            srtLink.download = 'subtitles.srt';
            srtLink.click();
            URL.revokeObjectURL(srtUrl);

            // Clean up files from memory
            await ffmpeg.deleteFile('subtitles.srt');
            await ffmpeg.deleteFile('input.mp4');

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
