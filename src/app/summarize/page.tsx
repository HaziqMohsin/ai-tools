import { LucideHistory } from "lucide-react";
import Index from ".";
import History from "./history";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const filters = await searchParams;
    const data = await fetch(`${process.env.API_URL}/api/summarize/history`);
    const { summaries } = await data.json();

    if (filters.history) {
        return (
            <div>
                <History summaries={summaries} />
            </div>
        );
    }

    return (
        <div>
            <Index />
        </div>
    );
}
