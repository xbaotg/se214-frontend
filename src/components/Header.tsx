"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { setCookie } from "cookies-next";
import { message } from "antd";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { INavItem } from "@/types";
import SettingModal from "./admin/SettingModal";
import { useAuth } from "@/hooks/auth";
import { MenuOutlined } from "@ant-design/icons";

const Header = ({
    icon,
    headerContent,
    navItems,
}: {
    icon: React.ReactNode;
    headerContent: string;
    navItems: INavItem[];
}) => {
    const { refreshToken: token } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();
    const pathname = usePathname();

    const successMessage = ({
        content,
        duration = 1,
    }: {
        content: string;
        duration?: number;
    }) => {
        messageApi.open({
            type: "success",
            content,
            duration,
        });
    };

    const errorMessage = ({
        content,
        duration = 1,
    }: {
        content: string;
        duration?: number;
    }) => {
        messageApi.open({
            type: "error",
            content,
            duration,
        });
    };

    const isActive = (path: string) => {
        if (pathname === "/") return false;
        return pathname == path;
    };

    const handleLogout = async () => {
        try {
            setCookie("access_token", "", { expires: new Date(0) });
            successMessage({ content: "Logout successfully!" });
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (error) {
            errorMessage({ content: "Logout failed!" });
            console.error(error);
        }
    };

    const handleHome = () => {
        if (headerContent === "Admin") {
            router.push("/admin");
            return;
        }
        if (headerContent === "Lecturer") {
            router.push("/lecturer/courses");
            return;
        }
        if (headerContent === "User") {
            router.push("/user");
            return;
        }
    };

    return (
        <>
            {contextHolder}
            <header className="bg-white shadow-sm h-16 mb-4">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={handleHome}
                    >
                        {icon}
                        <span className="font-bold text-xl">
                            {headerContent}
                        </span>
                    </div>
                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`px-3 py-2 relative font-semibold text-xs lg:text-lg text-center ${
                                    isActive(item.path)
                                        ? "text-blue-500 font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500"
                                        : "text-gray-600 hover:bg-blue-500 hover:text-white hover:rounded-lg transition-all duration-300"
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Dropdown for small screens */}
                    <div className="md:hidden relative">
                        <button
                            className="flex items-center justify-center text-gray-600 hover:text-blue-500"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <MenuOutlined className="text-2xl" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-10">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`block px-4 py-2 text-gray-600 hover:bg-blue-500 hover:text-white ${
                                            isActive(item.path)
                                                ? "font-bold text-blue-500"
                                                : ""
                                        }`}
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center space-x-10">
                        <SettingModal
                            headerContent={headerContent}
                            token={token}
                        />

                        <Button
                            className="ml-auto border-2 text-red-500 shadow-md"
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </Button>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
