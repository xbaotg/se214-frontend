import { Inter } from "next/font/google";
import Header from "@/components/admin/Header";
import "@/styles/globals.css";
import { Settings } from "lucide-react";
import { adminNavItems } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} flex flex-col h-full`}>
                <Header
                    navItems={adminNavItems}
                    icon={<Settings size={32} />}
                />
                <div className="flex-grow">{children}</div>
            </body>
        </html>
    );
}
