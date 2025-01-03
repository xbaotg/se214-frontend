import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "@/styles/globals.css";
import { UserRound } from "lucide-react";
import { userNavItems } from "@/constants";
import { AuthProvider } from "@/hooks/auth";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "User - DKHP",
};

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} flex flex-col h-full`}>
                <AuthProvider>
                    <Header
                        headerContent="User"
                        navItems={userNavItems}
                        icon={<UserRound size={32} />}
                    />
                    <div className="flex-grow">{children}</div>
                </AuthProvider>
            </body>
        </html>
    );
}
