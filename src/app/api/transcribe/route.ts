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
    const hf_token = process.env.HF_API_KEY;

    const response = await fetch(
        "https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo",
        {
            headers: {
                Authorization: 'Bearer ' + hf_token,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: body.base64Audio,
                parameters: { return_timestamps: true }
            }),
        }
    );

    const data = await response.json();

    return NextResponse.json(
        { body: data },
        { status: 200 }
    );
}