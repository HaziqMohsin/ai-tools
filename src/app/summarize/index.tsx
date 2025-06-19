"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { markdownComponents } from "./page";

export default function Index() {
    const [url, setUrl] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [parsedOutput, setParsedOutput] = useState<{
        summary: string;
        key_points: string[];
        keywords: string[];
    } | null>(null);
    const [streamText, setStreamText] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setSummary("");
        console.log("here");
        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.message || `HTTP error! status: ${res.status}`
                );
            }

            let rawText = "";

            if (res) {
                const reader = res?.body?.getReader();
                const decoder = new TextDecoder("utf-8");

                let done = false;

                while (!done) {
                    const { value, done: readerDone } =
                        (await reader?.read()) || {};
                    done = readerDone || false;
                    const chunk = decoder.decode(value, { stream: true }); // Decode the chunk
                    rawText += chunk;
                    setSummary((prev) => prev + chunk); // Append the chunk to the response
                    const match = rawText.match(/"summary"\s*:\s*"([^"]*)/);
                    if (match && match[1]) {
                        setStreamText(match[1]);
                    }
                }

                try {
                    const jsonStart = rawText.indexOf("{");
                    const jsonEnd = rawText.lastIndexOf("}") + 1;
                    const jsonString = rawText.slice(jsonStart, jsonEnd);
                    const json = JSON.parse(jsonString);

                    if (json.summary && json.key_points && json.keywords) {
                        setParsedOutput(json);
                    }
                } catch (err) {
                    console.error("Failed to parse streamed JSON:", err);
                }
            }

            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto py-10">
            <div className="mb-4">
                <Link className="text-blue-500" href="/summarize?history=true">
                    History
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Web Page Summarizer</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <Input
                            type="url"
                            placeholder="Enter article URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Summarizing..." : "Summarize"}
                        </Button>
                    </form>

                    {parsedOutput ? (
                        <div className="bg-muted p-4 rounded space-y-4">
                            <p className="mb-4">{parsedOutput.summary}</p>

                            <p className="font-bold mb-4">Key Point</p>
                            <ul className="list-disc list-inside text-muted-foreground">
                                {parsedOutput.key_points.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>

                            <p className="font-bold mb-4">Keywords</p>
                            <div className="flex flex-wrap gap-2 text-xs text-blue-600 font-medium">
                                {parsedOutput.keywords.map((kw, i) => (
                                    <span
                                        key={i}
                                        className="bg-blue-100 px-2 py-1 rounded-full border border-blue-300"
                                    >
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : streamText ? (
                        <div className="bg-muted p-4 rounded space-y-4">
                            <Markdown
                                components={markdownComponents}
                                remarkPlugins={[remarkGfm]}
                            >
                                {streamText}
                            </Markdown>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
