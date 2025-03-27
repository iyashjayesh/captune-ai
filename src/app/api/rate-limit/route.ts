import clientPromise from "@/lib/db";
import { getSession } from "@/lib/getSession";
import { NextResponse } from "next/server";

const RATE_LIMIT = 3; // 2 videos
const RATE_LIMIT_WINDOW = 30 * 60 * 1000; // 30 minutes in milliseconds

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db("test");
        const collection = db.collection("rate_limits");

        // to get  user's video processing attempts in the last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - RATE_LIMIT_WINDOW);
        const attempts = await collection.countDocuments({
            userId: session.user?.id,
            timestamp: { $gte: thirtyMinutesAgo }
        });

        return NextResponse.json({
            remaining: Math.max(0, RATE_LIMIT - attempts),
            total: RATE_LIMIT
        });
    } catch (error) {
        console.error("Error checking rate limit:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const client = await clientPromise;
        const db = client.db("test");
        const collection = db.collection("rate_limits");

        // to get the user's video processing attempts in the last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - RATE_LIMIT_WINDOW);
        const attempts = await collection.countDocuments({
            userId: session.user?.id,
            timestamp: { $gte: thirtyMinutesAgo }
        });

        if (attempts >= RATE_LIMIT) {
            return NextResponse.json(
                { message: "Rate limit exceeded. Please wait before processing more videos." },
                { status: 429 }
            );
        }

        // recording the attempt
        await collection.insertOne({
            userId: session.user?.id,
            timestamp: new Date()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording rate limit:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
} 