"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCookie } from "cookies-next";

const HomePage = () => {
    const router = useRouter();
    const token = getCookie("access_token");
    const role = getCookie("user_role");
    useEffect(() => {
        if (!token || !role) {
            router.push("/login");
            return;
        }
        if (role === "admin") {
            router.push("/admin");
        } else if (role === "lecturer") {
            router.push("/lecturer");
        } else {
            router.push("/user");
        }
    }, [token, role, router]);
    return <></>;
};

export default HomePage;
