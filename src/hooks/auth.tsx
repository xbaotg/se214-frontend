"use client";
import { authApi } from "@/api";
import {
    IUser,
    ISignUpFormValues,
    ISignUpResponse,
    ILoginFormValues,
    ILoginResponse,
} from "@/types";
import { getCookie, setCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import {
    useState,
    useEffect,
    useContext,
    createContext,
    ReactNode,
} from "react";

interface AuthContextType {
    user: IUser | null;
    accessToken: string;
    refreshToken: string;
    login: (body: ILoginFormValues) => Promise<ILoginResponse>;
    logout: () => void;
    register: (body: ISignUpFormValues) => Promise<ISignUpResponse>;
    loading: boolean;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const redirectURL = encodeURIComponent(pathname);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const user_access_token = getCookie("access_token");
                const user_refresh_token = getCookie("refresh_token");
                if (!user_access_token || !user_refresh_token) {
                    throw new Error("Token not found");
                }

                // Optionally, call an endpoint to verify the token's validity
                const userData = await authApi.me(user_refresh_token);
                setUser(userData);
                setAccessToken(user_access_token);
                setRefreshToken(user_refresh_token);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Token verification failed:", error);
                setUser(null);
                setAccessToken("");
                setRefreshToken("");
                setIsAuthenticated(false);
                setIsLoggedOut(true);
            } finally {
                setLoading(false);
            }
        };

        const intervalId = setInterval(() => {
            verifyToken();
        }, 30000);

        return () => {
            clearInterval(intervalId);
        };
    }, [router, pathname]);

    useEffect(() => {
        if (isLoggedOut && pathname !== "/login") {
            router.push(`/login?redirect=${redirectURL}`);
            setIsLoggedOut(false);
        }
    }, [isLoggedOut, pathname, router, redirectURL]);

    useEffect(() => {
        async function loadUserFromToken() {
            try {
                const user_access_token = getCookie("access_token");
                const user_refresh_token = getCookie("refresh_token");
                if (!user_access_token || !user_refresh_token) {
                    throw new Error("Token not found");
                }
                const userData = await authApi.me(user_refresh_token);
                setAccessToken(user_access_token);
                setRefreshToken(user_refresh_token);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to verify token:", error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }
        loadUserFromToken();
    }, []);

    const login = async (body: ILoginFormValues) => {
        try {
            setLoading(true);
            const data = await authApi.login(body);

            setCookie("access_token", data.access_token, {
                maxAge: 30 * 60,
                path: "/",
            });

            setCookie("refresh_token", data.refresh_token, {
                maxAge: 30 * 60,
                path: "/",
            });

            setCookie("user_role", data.user_role, {
                maxAge: 30 * 60,
                path: "/",
            });

            const path = localStorage.getItem("redirectPath") || "/";
            const userData = await authApi.me(data.refresh_token);

            setUser(userData);
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            setIsAuthenticated(true);

            if (path === "/") {
                if (data.user_role === "admin") {
                    router.push("/admin");
                    // } else if (data.data.user_role === "lecturer") {
                    //     router.push("/lecturer");
                } else {
                    router.push("/user");
                }
            } else {
                router.push(path);
            }

            return data;
        } catch (err) {
            console.error("Error in login: ", err);
            throw new Error("Something wrong happened");
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setAccessToken("");
        setRefreshToken("");
        setLoading(false);
        setIsAuthenticated(false);
        setIsLoggedOut(true);
        setCookie("access_token", "", { maxAge: -1, path: "/" });
        setCookie("refresh_token", "", { maxAge: -1, path: "/" });
    };

    const register = async (body: ISignUpFormValues) => {
        try {
            const result = await authApi.register(body);
            return result;
        } catch (err) {
            console.error(
                "Register failed: ",
                err || "Something wrong happened !!!"
            );
            throw new Error("Something wrong happened");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                login,
                logout,
                register,
                loading,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
