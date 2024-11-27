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



export function Chat() {

    const [messages, setMessages] = React.useState([
        {
            role: "agent",
            content: "Hi, what brings you here today?",
        },
    ])
    const [input, setInput] = React.useState("")
    const inputLength = input.trim().length
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        // Scroll to the bottom of the chat
        scrollAreaRef.current?.scrollIntoView(false)
    }, [messages.length])

    const onSubmit = (event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (inputLength === 0) return
        setMessages([
            ...messages,
            {
                role: "user",
                content: input,
            },
        ])
        setInput("")
        
    }
    return (
        <Card className="h-full p-0 grid grid-rows-[auto_1fr_auto] shadow-none rounded-none border-none">
            <CardHeader className="flex flex-row items-center p-0 pb-3 border-b">
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src="/avatars/01.png" alt="Image" />
                        <AvatarFallback><Bot  className="text-primary"/></AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">Syed Zayn</p>
                        <p className="text-sm text-muted-foreground">zayn@axmple.com</p>
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
