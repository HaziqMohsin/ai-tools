import { NextResponse } from "next/server";
import { fetchRSSArticles } from "@/lib/rss";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "../../../../../utils/supabase/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function GET() {
    const RSS_FEED_URL = "https://techcrunch.com/feed";
    const supabase = await createClient();
    const ai = new GoogleGenAI({ apiKey });

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

    const articles = await fetchRSSArticles(RSS_FEED_URL);

    for (const article of articles.slice(0, 5)) {
        try {
            const result = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `
                                            Summarize the following article and return ONLY valid JSON.
                                            Do not include any markdown, backticks, or extra text.

                                            Use this format exactly:
                                            {
                                                "title": ${article.title}
                                                "summary": "short summary",
                                                "key_points": ["1st takeaway or fact",
                                                                "2nd insight",
                                                                "3rd point"],
                                                "keywords": ["k1", "k2", "k3"]
                                            }

                                            Article:
                                            Title: ${article.title}
                                            Link: ${article.link}
                                        `,
                            },
                        ],
                    },
                ],
                config: {
                    temperature: 0.4,
                    systemInstruction:
                        "You are a data API that returns strict JSON. Do not wrap output with any markdown or formatting. Always return summary, 3 key_points, and 5 keywords. Never omit a field.",
                },
            });

            const responseText = result.text;
            const json = JSON.parse(responseText as string);

            const saveData = {
                url: article.link,
                summary: json.summary,
                keywords: json.keywords,
                key_points: json.key_points,
            };

            await supabase.from("summaries").insert(saveData);
        } catch (err) {
            console.warn("Failed to summarize:", article.link);
        }
    }

    return NextResponse.json({ message: "success" });
}
