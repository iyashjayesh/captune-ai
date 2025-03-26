import client from "@/lib/db";
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

    const body = await req.json();

    await client.connect();
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
    await client.close();

    return NextResponse.json(
        { message: result.insertedId },
        { status: 200 }
    );
}