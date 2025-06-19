import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

type Props = {
    summaries: any;
};

const History = ({ summaries }: Props) => {
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
                            {new Date(summary.created_at).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default History;
