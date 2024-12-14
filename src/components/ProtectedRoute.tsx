"use client";
import { useAuth } from "@/hooks/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";
import { message } from "antd";

export default function ProtectedRoute<P extends object>(
    WrappedComponent: ComponentType<P>
) {
    return function WithProtectedRoute(props: P) {
        const [messageApi, contextHolder] = message.useMessage();
        const { isAuthenticated, loading, user } = useAuth();
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
            if (user) {
                if (
                    pathname.startsWith("/admin") &&
                    user.userRole !== "admin"
                ) {
                    messageApi.error(
                        "You are not authorized to access this page."
                    );
                    router.push("/");
                }
                if (
                    pathname.startsWith("/lecturer") &&
                    user.userRole !== "lecturer"
                ) {
                    messageApi.error(
                        "You are not authorized to access this page."
                    );
                    router.push("/");
                }
            }
            if (!loading) {
                if (!isAuthenticated && pathname !== "/login") {
                    messageApi.warning("Session expired. Please login again.");
                    router.push("/login");
                } else if (isAuthenticated && pathname === "/login") {
                    messageApi.warning("You are already logged in.");
                    router.push("/");
                }
            }
        }, [loading, isAuthenticated, router, pathname, user, messageApi]);

        return (
            <>
                {contextHolder}
                <WrappedComponent {...props} />
            </>
        );
    };
}
