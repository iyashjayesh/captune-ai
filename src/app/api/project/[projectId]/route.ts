import client from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";


export async function PATCH(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        // const { id } = params;
        const url = new URL(req.url);
        const projectId = url.pathname.split("/").pop(); // Get last segment of the path

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }
        const body = await req.json();
        const { transcription } = body;

        if (!transcription) {
            return NextResponse.json(
                { error: "Transcription data is required" },
                { status: 400 }
            );
        }

        await client.connect();
        const db = client.db("test");
        const collection = db.collection("projects");

        const result = await collection.updateOne(
            {
                _id: new ObjectId(projectId),
                userId: session?.user?.id // Ensure user can only update their own projects
            },
            {
                $set: {
                    transcription,
                    updatedAt: new Date(),
                },
            }
        );

        await client.close();

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: "Project not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Project updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}
