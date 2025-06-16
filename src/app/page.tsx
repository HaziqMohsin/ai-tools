// import Image from "next/image";
import ChatContainer from "./components/chat-container";

export default function Home() {
    return (
        <div className="flex min-h-dvh p-4 w-full">
            <ChatContainer />
        </div>
    );
}
