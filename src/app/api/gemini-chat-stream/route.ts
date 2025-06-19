import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { prompt } = await req.json();

    if (!prompt) {
        return NextResponse.json(
            { error: "Prompt is required" },
            { status: 400 }
        );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return new NextResponse(
            JSON.stringify({
                message: "Server configuration error: Gemini API key missing.",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
        const streamResult = await ai.models.generateContentStream({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                // Use generationConfig
                systemInstruction:
                    "You are a comedian like Adam Sandler. Your name is Hamo.",
                maxOutputTokens: 150,
                temperature: 0.8, // Increased temperature for comedian-like responses
            },
        });

        const customStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of streamResult) {
                    const chunkText = chunk.text;
                    console.log(chunkText);
                    if (chunkText) {
                        controller.enqueue(chunkText);
                    }
                }
                controller.close();
            },
        });

        return new Response(customStream, {
            headers: {
                "Content-Type": "text/plain", // Or 'text/event-stream' if you want SSE, but text/plain is simpler for basic streaming
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (error) {
        if (error instanceof SyntaxError) {
            // Handle non-JSON body errors
            return new Response(
                JSON.stringify({ message: "Invalid JSON in request body." }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
        console.error("Unhandled error in API route:", error);
        return new Response(
            JSON.stringify({ message: "An internal server error occurred." }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
