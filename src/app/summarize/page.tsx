import { LucideHistory } from "lucide-react";
import Index from ".";
import History from "./history";

export const markdownComponents = {
    h1: ({ children }: any) => (
        <h1 className="text-3xl font-bold my-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="text-2xl font-semibold my-3">{children}</h2>
    ),
    p: ({ children }: any) => (
        <p className="text-base my-2 text-gray-800">{children}</p>
    ),
    a: ({ href, children }: any) => (
        <a
            href={href}
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noreferrer"
        >
            {children}
        </a>
    ),
    ul: ({ children }: any) => (
        <ul className="list-disc pl-5 my-2">{children}</ul>
    ),
    ol: ({ children }: any) => (
        <ol className="list-decimal pl-5 my-2">{children}</ol>
    ),
    li: ({ children }: any) => <li className="my-1">{children}</li>,
    code: ({ children }: any) => (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {children}
        </code>
    ),
    blockquote: ({ children }: any) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
            {children}
        </blockquote>
    ),
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const filters = await searchParams;
    const data = await fetch(`${process.env.API_URL}/api/summarize/history`);
    const { summaries } = await data.json();
    const allKeywords = Array.from(
        new Set(summaries.flatMap((s: any) => s.keywords || []))
    );

    console.log(allKeywords);

    if (filters.history) {
        return (
            <div>
                <History
                    summaries={summaries}
                    keywords={allKeywords as string[]}
                />
            </div>
        );
    }

    return (
        <div>
            <Index />
        </div>
    );
}
