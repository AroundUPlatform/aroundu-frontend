import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/layout/AuthProvider";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
    title: "AroundU Portal",
    description: "AroundU connects clients and workers with a secure, role-based experience",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={manrope.variable}>
                <AuthProvider>
                    <main className="min-h-screen">{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}
