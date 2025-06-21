import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { createClient } from "../../../../utils/supabase/server";

const SummarizeSchema = z.object({
    url: z.string().url("Must be a valid URL"),
});

const SummarizeJsonSchema = z.object({
    summary: z.string(),
    key_points: z.array(z.string()),
    keywords: z.array(z.string()),
    title: z.string(),
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
                    parts: [
                        {
                            text: `Summarize the web page and return ONLY a JSON object with this structure:

                                    {
                                    "title": "a meaningfull title.",
                                    "summary": "A one-paragraph summary of the page.",
                                    "key_points": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
                                    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
                                    }

                                    Only return valid JSON. No explanation. No markdown.

                                    Here is the content:

                                    ${text}`,
                        },
                    ],
                },
            ],
            config: {
                // Use generationConfig
                // systemInstruction:
                //     "You are a comedian like Adam Sandler. Your name is Hamo.",
                maxOutputTokens: 300,
                temperature: 0.1, // Increased temperature for comedian-like responses
            },
        });

        let fullText = "";
        const encoder = new TextEncoder();

        const customStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of streamResult) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        fullText += chunkText;
                        controller.enqueue(encoder.encode(chunkText));
                    }
                }

                // Parse JSON (safe fallback)
                let parsedOutput: z.infer<typeof SummarizeJsonSchema> | null =
                    null;

                try {
                    const jsonStart = fullText.indexOf("{");
                    const jsonEnd = fullText.lastIndexOf("}") + 1;
                    const jsonString = fullText.slice(jsonStart, jsonEnd);
                    parsedOutput = SummarizeJsonSchema.parse(
                        JSON.parse(jsonString)
                    );

                    await supabase.from("summaries").insert({
                        url,
                        title: parsedOutput.title,
                        summary: parsedOutput.summary,
                        key_points: parsedOutput.key_points,
                        keywords: parsedOutput.keywords,
                    });
                } catch (err) {
                    console.error("Failed to parse Gemini output:", err);
                    return NextResponse.json(
                        { error: "Invalid LLM output" },
                        { status: 500 }
                    );
                }

                controller.close();
            },
        });

        return new Response(customStream, {
            headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            },
        });
    } catch (err) {
        console.error("Gemini Error:", err);
        return NextResponse.json(
            { error: "Failed to summarize" },
            { status: 500 }
        );
    }
}
