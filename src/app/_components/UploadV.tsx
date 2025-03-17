'use client';

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
// import { createClientSupabase } from "@/utils/supabase/client";
import { Plus, SparklesIcon, Upload } from "lucide-react";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import VideoHome from "./VideoHome";


const font = Poppins({ subsets: ["latin"], weight: ["600"] });

interface iAppProps {
    showUploadUI?: boolean;
}

export function UploadV({ showUploadUI = false }: iAppProps) {

    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {showUploadUI ? (
                    <div className="p-4 md:p-0 md:py-4 mb-3">
                        <Card className="py-6 px-9 w-fit rounded-sm flex flex-row gap-1 items-center cursor-pointer hover:border hover:border-red-500">
                            <Plus className="size-5 text-red-500" />
                            <h1 className={cn("text-lg flex flex-row gap-1 items-center justify-center text-center text-red-500", font.className)}>
                                Generate Captions using AI <SparklesIcon className="size-5 text-red-500 fill-current" />
                            </h1>
                        </Card>
                    </div>
                ) : (
                    <button className={cn("w-fit flex flex-row gap-1 items-center bg-red-500 hover:bg-red-600 text-white text-base font-semibold py-1 px-2 rounded-sm shadow-md cursor-pointer", font.className)}>
                        <Upload className="size-4 text-white" /> Upload Your Video
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogTitle className={cn("text-lg md:text-2xl font-bold text-center", font.className)}>
                    {loading ? "Uploading" : "Upload"} your video
                </DialogTitle>

                <VideoHome />
            </DialogContent>
        </Dialog>
    );
}
