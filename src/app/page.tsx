// import ChatContainer from "./components/chat-container";
import Link from "next/link";

export default function Home() {
    return (
        <div className="flex flex-col justify-center items-center min-h-dvh p-4 w-full">
            <h1 className="text-2xl font-bold">AI-tools</h1>
            <Link className="text-blue-500 hover:underline" href="/summarize">
                Web Page Summarizer
            </Link>

            {/* <ChatContainer /> */}
        </div>
    );
}
