'use client';

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus, SparklesIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import VideoHome from "./VideoHome";

const font = Poppins({ subsets: ["latin"], weight: ["600"] });
export default function MainUpload() {

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

                {/* <DialogContent className="sm:max-w-[425px]"> */}
                <DialogTitle className={cn("text-lg md:text-2xl font-bold text-center", font.className)}>
                    {/* Upload your video */}
                </DialogTitle>
                <DialogContent
                    className={cn(
                        "w-full max-w-5xl min-w-[800px] p-6 rounded-2xl shadow-xl bg-white max-h-[90vh] overflow-auto",
                        font.className
                    )}
                >
                    <DialogTitle className={cn("text-lg md:text-2xl font-bold text-center", font.className)}>
                        {/* Upload your video */}
                    </DialogTitle>
                    <VideoHome />
                </DialogContent>
            </Dialog>
        </div>
    );
}
