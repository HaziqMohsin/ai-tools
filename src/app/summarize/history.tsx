"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { markdownComponents } from "./page";

type HistoryProps = {
    id: string;
    url: string;
    summary: string;
    key_points?: string[]; // Optional for legacy data
    keywords?: string[];
    created_at: string;
    feedback: "up" | "down";
};

type Props = {
    summaries: HistoryProps[];
};

const History = ({ summaries }: Props) => {
    console.log(summaries);
    const hanldeFeedback = async (id: string, feedback: "up" | "down") => {
        await fetch(`/api/summarize/feedback`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ id, feedback }),
        });

        window.location.reload();
    };
    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
            <div className="mb-4">
                <Link href={"/summarize"} className="text-blue-500">
                    Back
                </Link>
            </div>
            {summaries.map((summary) => (
                <Card key={summary.id} className="gap-4">
                    <CardHeader>
                        <CardTitle className="truncate text-sm text-muted-foreground">
                            {summary.url}
                        </CardTitle>
                    </CardHeader>

                    {summary.keywords !== null &&
                    summary.key_points !== null ? (
                        <CardContent>
                            <div className="flex-1 mt-2 p-4 border rounded bg-muted text-muted-foreground">
                                <p className="mb-4">{summary.summary}</p>

                                <p className="font-bold mb-4">Key Point</p>
                                {summary.key_points &&
                                    summary.key_points.length > 0 && (
                                        <ul className="list-disc list-inside mb-4 text-muted-foreground">
                                            {summary.key_points.map(
                                                (point, i) => (
                                                    <li key={i}>{point}</li>
                                                )
                                            )}
                                        </ul>
                                    )}

                                <p className="font-bold mb-4">Keywords</p>
                                {summary.keywords &&
                                    summary.keywords.length > 0 && (
                                        <div className="flex flex-wrap gap-2 text-xs text-blue-600 font-medium mb-4">
                                            {summary.keywords.map((kw, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-blue-100 px-2 py-1 rounded-full border border-blue-300"
                                                >
                                                    #{kw}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    ) : (
                        <CardContent>
                            <div className="flex-1 mt-6 p-4 border rounded bg-muted text-muted-foreground prose prose-ul:list-disc">
                                <Markdown
                                    components={markdownComponents}
                                    remarkPlugins={[remarkGfm]}
                                >
                                    {summary.summary}
                                </Markdown>
                            </div>
                        </CardContent>
                    )}

                    <div className="px-6">
                        <p className="text-xs text-right text-muted-foreground mt-4">
                            {format(summary.created_at, "h.mmaaa dd/MM/yyyy")}
                        </p>
                    </div>
                    <div className="px-6 flex gap-2 items-center">
                        <button
                            className="cursor-pointer"
                            onClick={() => hanldeFeedback(summary.id, "up")}
                        >
                            <ThumbsUp
                                size={"16"}
                                color={
                                    summary.feedback === "up"
                                        ? "#2f840b"
                                        : "#000"
                                }
                            />
                        </button>
                        <button
                            className="cursor-pointer"
                            onClick={() => hanldeFeedback(summary.id, "down")}
                        >
                            <ThumbsDown
                                size={"16"}
                                color={
                                    summary.feedback === "down"
                                        ? "#710909"
                                        : "#000"
                                }
                            />
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default History;
