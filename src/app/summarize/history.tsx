"use client";
import React, { useState } from "react";
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
    title?: string;
    created_at: string;
    feedback: "up" | "down";
};

type Props = {
    summaries: HistoryProps[];
    keywords: string[];
};

const History = ({ summaries, keywords }: Props) => {
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords((prev) =>
            prev.includes(keyword)
                ? prev.filter((k) => k !== keyword)
                : [...prev, keyword]
        );
    };

    const filteredSummaries =
        selectedKeywords.length > 0
            ? summaries.filter((summary) =>
                  summary.keywords?.some((kw) => selectedKeywords.includes(kw))
              )
            : summaries;

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
        <div className="w-full py-10 px-4 space-y-6 flex flex-col">
            <div className="flex flex-col gap-4">
                <div className="max-w-7xl gap-2 flex flex-wrap mx-auto w-full">
                    {keywords.map((kw) => {
                        const isSelected = selectedKeywords.includes(kw);
                        return (
                            <button
                                key={kw}
                                onClick={() => toggleKeyword(kw)}
                                className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${
                                    isSelected
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                }`}
                            >
                                #{kw}
                            </button>
                        );
                    })}
                </div>
                <div className="flex justify-center items-center gap-4 mb-4 w-full">
                    {selectedKeywords.length > 0 && (
                        <button
                            onClick={() => setSelectedKeywords([])}
                            className="text-sm underline text-muted-foreground cursor-pointer"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
                <div className="flex flex-row gap-10 justify-center py-20 w-full flex-wrap">
                    {filteredSummaries.map((summary) => (
                        <Card
                            key={summary.id}
                            className="gap-4 max-w-1/3 w-full"
                        >
                            <CardHeader>
                                <div>
                                    <h3 className="font-bold text-2xl">
                                        {summary.title}
                                    </h3>
                                </div>
                                <CardTitle className="truncate text-sm text-muted-foreground">
                                    <div className="truncate">
                                        <Link
                                            className="underline text-blue-500 cursor-pointer"
                                            href={summary.url}
                                            target="_blank"
                                        >
                                            {summary.url}
                                        </Link>
                                    </div>
                                </CardTitle>
                            </CardHeader>

                            {summary.keywords !== null &&
                            summary.key_points !== null ? (
                                <CardContent>
                                    <div className="flex-1 mt-2 p-4 border rounded bg-muted text-muted-foreground">
                                        <p className="mb-4">
                                            {summary.summary}
                                        </p>

                                        <p className="font-bold mb-4">
                                            Key Point
                                        </p>
                                        {summary.key_points &&
                                            summary.key_points.length > 0 && (
                                                <ul className="list-disc list-inside mb-4 text-muted-foreground">
                                                    {summary.key_points.map(
                                                        (point, i) => (
                                                            <li key={i}>
                                                                {point}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}

                                        <p className="font-bold mb-4">
                                            Keywords
                                        </p>
                                        {summary.keywords &&
                                            summary.keywords.length > 0 && (
                                                <div className="flex flex-wrap gap-2 text-xs text-blue-600 font-medium mb-4">
                                                    {summary.keywords.map(
                                                        (kw, i) => (
                                                            <span
                                                                key={i}
                                                                className="bg-blue-100 px-2 py-1 rounded-full border border-blue-300"
                                                            >
                                                                #{kw}
                                                            </span>
                                                        )
                                                    )}
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
                            {/* <div className="px-6">
                        <p className="text-xs text-right text-muted-foreground mt-4">
                            {format(summary.created_at, "h.mmaaa dd/MM/yyyy")}
                        </p>
                    </div> */}
                            <div className="px-6 flex gap-2 items-center justify-end">
                                <button
                                    className="cursor-pointer"
                                    onClick={() =>
                                        hanldeFeedback(summary.id, "up")
                                    }
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
                                    onClick={() =>
                                        hanldeFeedback(summary.id, "down")
                                    }
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
            </div>
        </div>
    );
};

export default History;
