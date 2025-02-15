// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter'
});

export const metadata: Metadata = {
    title: "Oscar-Tracker.com",
    description: "Modern platform for tracking and predicting award nominations",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable}`}>
        <body className="min-h-screen bg-gray-50 text-gray-900 custom-scrollbar">
        {children}
        </body>
        </html>
    );
}