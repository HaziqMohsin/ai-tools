import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
    const { value } = await req.json();

    if (!value) {
        return NextResponse.json(
            { error: "Prompt is required" },
            { status: 400 }
        );
    }

    // const res = await ai.models.generateContentStream({
    //     model: "gemini-1.5-flash",
    //     contents: value,
    //     config: {
    //         maxOutputTokens: 150,
    //         temperature: 0.5,
    //         systemInstruction:
    //             "You are a comedian like adam sandler. Your name is sassy.",
    //     },
    // });

    const streamResult = await ai.models.generateContentStream({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: value }] }], // Correct format for contents
        config: {
            // Use generationConfig
            systemInstruction:
                "You are a comedian like Adam Sandler. Your name is Hamo.",
            maxOutputTokens: 150,
            temperature: 0.8, // Increased temperature for comedian-like responses
        },
    });

    // const response = await ai.models.generateContentStream({
    //     model: "gemini-2.0-flash",
    //     contents: "Explain how AI works",
    // });

    // Create a custom ReadableStream to send the chunks
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

    // Return the stream as a response
    return new Response(customStream, {
        headers: {
            "Content-Type": "text/plain", // Or 'text/event-stream' if you want SSE, but text/plain is simpler for basic streaming
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });

    return NextResponse.json({ text: "hello" });
}
