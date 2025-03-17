import { Separator } from "@/components/ui/separator";
import { DashboardTitle } from "../_components/DashboardTitle";
import { ProjectGrid } from "../_components/ProjectGrid";
import { UploadV } from "../_components/UploadV";

export default function DashboardPage() {
    return (
        <div className="grid max-w-5xl mx-auto">
            <DashboardTitle title="New Project" />
            <UploadV showUploadUI={true} />
            {/* <div className="py-4 mb-3">
                <Card className="py-6 px-9 w-fit rounded-sm flex flex-row gap-1 items-center cursor-pointer hover:border hover:border-red-500">
                    <Plus className="size-5 text-red-500" />
                    <h1 className={cn("text-lg text-red-500", font.className)}>
                        Generate Captions using AI
                    </h1>
                </Card>
            </div> */}

            <DashboardTitle title="All Project" showDropdown={false} />
            <Separator className="w-full my-3" />



            <ProjectGrid />
        </div >
    )
};
