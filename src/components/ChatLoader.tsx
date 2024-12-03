import React, { useState, useEffect } from 'react';

const ChatLoader = () => {
    const [dots, setDots] = useState('')

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prevDots => {
                if (prevDots.length < 3) {
                    return prevDots + '.'
                }
                return '';
            });
        }, 500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="self-start text-sm text-gray-400 pl-2 pt-3 animate-pulse-text">
            Thinking{dots}
        </div>
    )
}

export default ChatLoader;