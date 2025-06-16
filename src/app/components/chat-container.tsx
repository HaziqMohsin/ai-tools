"use client";
import { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "@/components/ui/textarea";

const ChatContainer = () => {
    const [prompt, setPrompt] = useState("");
    const [responseText, setResponseText] = useState("");

    const handleSubmit = async () => {
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { value, done: readerDone }: any =
                        await reader?.read();
                    done = readerDone;
                    const chunk = decoder.decode(value, { stream: true }); // Decode the chunk
                    setResponseText((prev) => prev + chunk); // Append the chunk to the response
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="w-full">
                <Markdown remarkPlugins={[remarkGfm]}>{responseText}</Markdown>
            </div>
            <div className="flex gap-4 max-w-lg w-full mx-auto">
                <Textarea
                    placeholder="ask anything"
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <PrimaryButton handleClick={handleSubmit} text={`Submit`} />
            </div>
        </div>
    );
};

export default ChatContainer;
