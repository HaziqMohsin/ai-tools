"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

export default function Index() {
    const [url, setUrl] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

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

            if (res) {
                const reader = res?.body?.getReader();
                const decoder = new TextDecoder("utf-8");
                let done = false;

                while (!done) {
                    const { value, done: readerDone } =
                        (await reader?.read()) || {};
                    done = readerDone || false;
                    const chunk = decoder.decode(value, { stream: true }); // Decode the chunk
                    setSummary((prev) => prev + chunk); // Append the chunk to the response
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

                    {summary && (
                        <div className="mt-6 p-4 border rounded bg-muted text-muted-foreground whitespace-pre-wrap">
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {summary}
                            </Markdown>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
