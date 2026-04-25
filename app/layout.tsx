import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "../components/layout/AuthProvider";
import { ThemeProvider } from "../components/layout/ThemeProvider";
import { QueryProvider } from "../components/layout/QueryProvider";
import { FAVICON } from "../utils/assets";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
    title: "AroundU — Hyperlocal Service Marketplace",
    description: "AroundU connects clients and workers with a secure, role-based experience",
    icons: { icon: FAVICON },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
                <ThemeProvider>
                    <QueryProvider>
                        <AuthProvider>
                            <main className="min-h-screen">{children}</main>
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    className: "!bg-surface !text-text !border-border/70",
                                }}
                            />
                        </AuthProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
