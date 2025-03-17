"use client";

import { UploadV } from "./UploadV";

// {
//     "id": "51911faf-6882-48fb-b836-181296cc9f6a",
//         "user_id": "ad5fb932-d577-4d6c-a944-0c7f6190c4dc",
//             "project_id": "c7ef361a-388c-4dbd-85e4-6c12d59ebfc3",
//                 "video_name": "reel.mp4.mp4",
//                     "video_size": "6810720",
//                         "video_description": null,
//                             "audio_name": "c7ef361a-388c-4dbd-85e4-6c12d59ebfc3.mp3",
//                                 "audio_size": "525102",
//                                     "transcript_processing_time": null,
//                                         "transcript": { },
//     "transcript_updated_at": null,
//         "video_exported_at": null,
//             "video_exported_time": null,
//                 "created_at": "2025-02-13T20:55:40.947443+00:00",
//                     "updated_at": "2025-02-13T20:55:40.947443+00:00"
// }

// type SingleProject = {
//     id: string;
//     user_id: string;
//     project_id: string;
//     video_name: string;
//     video_size: string;
//     video_description: string;
//     video_thumbnail_url: string;
//     audio_name: string;
//     audio_size: string;
//     transcript_processing_time: string;
//     transcript: any;
//     transcript_updated_at: string;
//     video_exported_at: string;
//     video_exported_time: string;
//     created_at: string;
//     updated_at: string;
// };


export function ProjectGrid() {

    // const [loading, setLoading] = useState(true);
    // const [projects, setProjects] = useState<SingleProject[]>([]);

    // useEffect(() => {
    //     const fetchProjects = async () => {
    //         try {
    //             const projects = await getProjects();
    //             if (projects?.data) {
    //                 setProjects(projects.data);
    //             } else {
    //                 console.error('Error fetching projects:', projects?.error);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching projects:', error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchProjects();
    // }, [setProjects]);

    // const handleDeleteProject = (id: string) => async () => {
    //     toast.promise(
    //         fetch(`/api/project/${id}`, {
    //             method: "DELETE",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({ project_id: id }),
    //         }).then((res) => {
    //             if (!res.ok) throw new Error("Failed to delete project");

    //             // Update the state by filtering out the deleted project
    //             setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    //         }), {
    //         loading: "Deleting project...",
    //         success: "Project deleted successfully",
    //         error: "Failed to delete project"
    //     });
    // };


    // if (loading) {
    //     return (
    //         <div className="flex justify-center items-center h-96">
    //             <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    //         </div>
    //     )
    // }

    return (
        <div className="mt-3">
            <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-lg font-semibold text-gray-800">No projects available</p>
                <UploadV />
            </div>
        </div >
    );
}