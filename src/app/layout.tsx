import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import 'react-chat-elements/dist/main.css'
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Renew Chat Bot",
  description: "Renew Chat Bot form renew.org",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
