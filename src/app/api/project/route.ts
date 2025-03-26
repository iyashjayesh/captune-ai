import clientPromise from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const client = await clientPromise;
        const db = client.db("test");
        const collection = db.collection("projects");

        const result = await collection.insertOne({
            userId: session?.user?.id,
            videoFileName: body.videoFileName,
            videoFileSize: body.videoFileSize,
            videoFileDuration: body.videoFileDuration,
            audioFileName: body.audioFileName,
            audioFileSize: body.audioFileSize,
            transcription: body.transcription,
            processingTime: body.processTime,
            createdAt: new Date()
        });

        console.log("Project created:", result);
        return NextResponse.json(
            { message: result.insertedId },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Failed to create project" },
            { status: 500 }
        );
    }
}