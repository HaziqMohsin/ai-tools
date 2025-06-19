"use client";
import { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "@/components/ui/textarea";
// import { useGeneralStore } from "@/providers/general-store-provider";

const ChatContainer = () => {
    // const { modelCapabilities, setModelCapabilities } = useGeneralStore(
    //     (state) => state
    // );
    const [prompt, setPrompt] = useState("");
    const [responseText, setResponseText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<boolean | null>(false);

    const handleSubmit = async () => {
        setResponseText("");
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/gemini-chat-stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
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
                    setResponseText((prev) => prev + chunk); // Append the chunk to the response
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            setError(error.message || "An unexpected error occurred.");
            console.log(error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div>Select Capabilites</div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="w-full">
                <Markdown remarkPlugins={[remarkGfm]}>{responseText}</Markdown>
            </div>
            <div className="flex gap-4 max-w-lg w-full mx-auto">
                <Textarea
                    placeholder="ask anything"
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <PrimaryButton
                    handleClick={handleSubmit}
                    text={`Submit`}
                    disabled={loading || !prompt.trim()}
                />
            </div>
        </div>
    );
};

export default ChatContainer;
