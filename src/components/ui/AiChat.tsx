"use client"

import * as React from "react"
import Link from "next/link"
import { Bot, Send } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/ui/avatar"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/ui/card"

import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { ScrollArea } from "./scroll-area"
import { useSocket } from "@/context/SocketContext"
import errorToast from "@/lib/toast/error.toast"
import ChatLoader from "../ChatLoader"

interface Message {
    role: "user" | "agent";
    content: string;
}

// Function to parse markdown-like links
const parseLinksInText = (text: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add the link as a Next.js Link
        parts.push(
            <Link
                key={`link-${match.index}`}
                href={match[2]}
                className="italic break-words contents hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
            >
                {match[1]}
            </Link>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add any remaining text after the last link
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};

export function AiChat() {
    const socket = useSocket()
    const [isThinking, setIsThinking] = React.useState(false)
    const [messages, setMessages] = React.useState<Message[]>([
        {
            role: "agent",
            content: "Hi, what brings you here today?",
        },
    ])
    const [input, setInput] = React.useState("")
    const [isStreaming, setIsStreaming] = React.useState(false)
    const [currentStreamingMessage, setCurrentStreamingMessage] = React.useState("")
    const inputLength = input.trim().length
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        // Scroll to the bottom of the chat
        scrollAreaRef.current?.scrollIntoView(false)
    }, [messages.length, currentStreamingMessage])

    React.useEffect(() => {
        if (!socket) return
        socket.on('response', (chunk: { message: string }) => {
            const message = chunk.message
            const responseEnded = message === " - Response Ended"
            if (message === "Relevant context retrieved and sent to OpenAI for processing.") {
                return
            }
            if (responseEnded) {
                if (currentStreamingMessage) {
                    setMessages(prev => [
                        ...prev,
                        { role: "agent", content: currentStreamingMessage }
                    ])
                    setCurrentStreamingMessage("")
                    setIsStreaming(false)
                    setIsThinking(false)
                    return
                }
            }
            setIsStreaming(true)
            setCurrentStreamingMessage(prev => prev + message)
            setIsThinking(false)
        })

        socket.on('response_end', () => {
            // When streaming is complete, add the full message to messages
            if (currentStreamingMessage) {
                setMessages(prev => [
                    ...prev,
                    { role: "agent", content: currentStreamingMessage }
                ])
                setCurrentStreamingMessage("")
                setIsStreaming(false)
            }
        })

        return () => {
            socket.off('response')
            socket.off('response_end')
        }
    }, [socket, currentStreamingMessage])

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!socket) {
            errorToast("Connection not established yet!")
            return
        }

        if (inputLength === 0) return
        setIsThinking(true)
        // Add user message
        const userMessage: Message = {
            role: "user",
            content: input,
        }
        setMessages(prev => [...prev, userMessage])

        // Send message via socket
        socket.emit('message', { query: input })

        // Reset input
        setInput("")
    }

    return (
        <Card className="h-full p-0 grid grid-rows-[auto_1fr_auto] shadow-none rounded-none border-none">
            <CardHeader className="flex flex-row items-center p-0 pb-3 border-b">
                <div className="flex items-center space-x-3">
                    <Avatar>
                        <AvatarImage src="/avatars/01.png" alt="Image" />
                        <AvatarFallback><Bot className="text-primary" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">Renew.org Assistant</p>
                        <p className="text-sm text-muted-foreground">renew.org</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-full p-0 pt-5 pt-auto overflow-y-auto flex flex-col justify-end">
                <ScrollArea className="">
                    <div className="space-y-3" ref={scrollAreaRef}>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm w-full break-words",
                                    message.role === "user"
                                        ? "ml-auto bg-primary text-black font-medium"
                                        : "bg-muted"
                                )}
                            >
                                {message.role === "agent"
                                    ? parseLinksInText(message.content)
                                    : message.content
                                }
                            </div>
                        ))}
                        {isStreaming && (
                            <div className="flex max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm w-full break-words bg-muted">
                                {parseLinksInText(currentStreamingMessage)}
                            </div>
                        )}
                    </div>
                </ScrollArea>
                {isThinking && <ChatLoader />}
            </CardContent>
            <CardFooter className="p-0 pb-0 pt-5 flex-col">
                <form
                    onSubmit={onSubmit}
                    className="flex w-full items-center space-x-2"
                >
                    <div className="flex items-center relative w-full">
                        <Input
                            id="message"
                            placeholder="Message"
                            className="w-full rounded-full h-12 pl-4 pr-14"
                            autoComplete="off"
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={inputLength === 0}
                            className="absolute right-2 rounded-full"
                        >
                            <Send />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </form>
            </CardFooter>
        </Card>
    )
}