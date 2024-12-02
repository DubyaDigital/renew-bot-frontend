"use client"

import * as React from "react"
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

interface Message {
    role: "user" | "agent";
    content: string;
}

export function AiChat() {
    const socket = useSocket()
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


        socket.on('response', (chunk: {message: string}) => {
            const message = chunk.message
            let count = 0
            if (message === "Relevant context retrieved and sent to OpenAI for processing.") {
                return
            }
            if(message === "") {
                count = count + 1
            }
            if(count > 0 && message === "") {
                if (currentStreamingMessage) {
                    setMessages(prev => [
                        ...prev,
                        { role: "agent", content: currentStreamingMessage }
                    ])
                    setCurrentStreamingMessage("")
                    setIsStreaming(false)
                    return
                }
            } 
            setIsStreaming(true)
            setCurrentStreamingMessage(prev => prev + message)
        })


        socket.on('response_end', () => {
            debugger
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
                        <p className="text-sm font-medium leading-none">Renew AI</p>
                        <p className="text-sm text-muted-foreground">renew@ai.com</p>
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
                                        ? "ml-auto bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                {message.content}
                            </div>
                        ))}
                        {isStreaming && (
                            <div className="flex max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm w-full break-words bg-muted">
                                {currentStreamingMessage}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-0 pb-0 pt-5">
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
                            // disabled={isStreaming}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            // disabled={inputLength === 0 || isStreaming}
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