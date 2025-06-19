import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { createClient } from "../../../../utils/supabase/server";

const SummarizeSchema = z.object({
    url: z.string().url("Must be a valid URL"),
});

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const body = await req.json();

    const parsed = SummarizeSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { url } = parsed.data;

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
        // 1. Scrape text from the URL
        const html = await fetch(url).then((res) => res.text());
        const $ = cheerio.load(html);
        const text = $("body").text().replace(/\s+/g, " ").slice(0, 5000); // Limit length

        const streamResult = await ai.models.generateContentStream({
            model: "gemini-1.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: `Summarize this web page:\n\n${text}` }],
                },
            ],
            config: {
                // Use generationConfig
                // systemInstruction:
                //     "You are a comedian like Adam Sandler. Your name is Hamo.",
                maxOutputTokens: 150,
                temperature: 0.1, // Increased temperature for comedian-like responses
            },
        });

        let fullText = "";

        const customStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of streamResult) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        fullText += chunkText;
                        controller.enqueue(chunkText);
                    }
                }

                await supabase.from("summaries").insert({
                    url,
                    summary: fullText,
                });

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

        // 2. Load Gemini model and generate summary
        // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // const result = await model.generateContent(
        //     `Summarize this web page:\n\n${text}`
        // );
        // const response = result.response;
        // const summary = response.text();

        // return NextResponse.json({ summary });
    } catch (err) {
        console.error("Gemini Error:", err);
        return NextResponse.json(
            { error: "Failed to summarize" },
            { status: 500 }
        );
    }
}
