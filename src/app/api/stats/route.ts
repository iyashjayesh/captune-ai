import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("test");
        const stats = await db.collection("project_stats").findOne({ type: "totalVideoDuration" });
        return NextResponse.json({ value: stats?.value || 0 });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { duration } = await req.json();

        const client = await clientPromise;
        const db = client.db("test");
        const result = await db.collection("project_stats").updateOne(
            { type: "totalVideoDuration" },
            {
                $inc: { value: duration },
                $setOnInsert: { type: "totalVideoDuration" }
            },
            { upsert: true }
        );

        console.log("Stats updated:", result);      

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating stats:", error);
        return NextResponse.json({ error: "Failed to update stats" }, { status: 500 });
    }
} 