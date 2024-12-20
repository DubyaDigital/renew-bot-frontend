"use client"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "./ui/button"
import {  useState } from "react"
import { BotMessageSquare, SendHorizontal } from "lucide-react"
import { AiChat } from "./ui/AiChat"
import Image from "next/image"
import { logoImg } from "@/constants/images"

export default function FloatingChatButton() {

    const [isOpen, setIsOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    
    return (
        <Popover open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
            <PopoverTrigger asChild className="fixed bottom-5 right-5 md:bottom-10 md:right-10">
                <Button asChild variant={"secondary"} className="w-12 h-12 text-2xl p-3 rounded-full bg-primary hover:bg-primary/80 text-white">
                    <BotMessageSquare className="w-auto rounded-full  cursor-pointer hover:animate-in" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                onInteractOutside={(e) => e.preventDefault()}
                className="h-[500px] mr-10 flex flex-col gap-5 min-w-[300px] md:min-w-[350px]"
                sideOffset={12}
            >
                {
                    !isChatOpen ?
                        <div className="flex flex-col h-full">
                            {/* <h1 className="font-semibold text-sm border p-2 rounded self-start">RENEW</h1> */}
                            <Image 
                                src={logoImg}
                                alt="Renew Logo"
                                className="w-[50px]"
                            />
                            <div className="flex flex-col leading-none pt-16 pb-5">
                                <h1 className="text-2xl text-gray-500 font-semibold">Hi &#128075;</h1>
                                <h2 className="text-2xl font-semibold">How can we help?</h2>
                            </div>
                            <Button 
                                className="shadow flex justify-between h-11 border  focus:ring-0 focus-visible:ring-0" 
                                variant={"outline"} 
                                onClick={() => setIsChatOpen(true)}
                            >
                                <span>Send us a message</span>
                                <SendHorizontal className="text-primary" />
                            </Button>
                        </div> :
                        <AiChat />
                }
            </PopoverContent>
        </Popover>
    )
}



