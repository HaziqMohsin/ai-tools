"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";

type Props = {
    summaries: any;
};

const History = ({ summaries }: Props) => {
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
            {summaries.map((summary: any) => (
                <Card key={summary.id}>
                    <CardHeader>
                        <CardTitle className="truncate text-sm text-muted-foreground">
                            {summary.url}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Markdown remarkPlugins={[remarkGfm]}>
                            {summary.summary}
                        </Markdown>
                        <p className="text-xs text-right text-muted-foreground mt-4">
                            {format(summary.created_at, "h.mmaaa dd/MM/yyyy")}
                        </p>
                    </CardContent>
                    <div className="p-6 flex gap-2 items-center">
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
