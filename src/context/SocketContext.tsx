"use client"

import errorToast from '@/lib/toast/error.toast';
import successToast from '@/lib/toast/success.toast';
import warningToast from '@/lib/toast/warning.toast';
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: PropsWithChildren) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SOCKET_CONNECTION_URL;

        if (!url) {
            errorToast('Socket URL is not defined');
            return;
        }

        const newSocket = io(url, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        newSocket.on('connect', () => {
            successToast('Socket connected');
        });

        // newSocket.on("response", (args) => {
        //     debugger
        //     console.log("in resposen");
            
        //     // ...
        // })

        newSocket.on('disconnect', () => {
            warningToast('Socket disconnected');
        });

        newSocket.on('connect_error', (error) => {
            errorToast(`Connection error: ${error.message}`);
        });

        setSocket(newSocket);

        // Closing the connection
        return () => {
            newSocket.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => {
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
}