"use client";

import React, { useEffect, Suspense, useState } from "react";
import { setCookie } from "cookies-next";
import { Button, Form, Input, FormProps, message } from "antd";
import { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { useSearchParams, useRouter } from "next/navigation";
import { IApiResponse } from "@/types";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

interface LoginFormValues {
    username: string;
    password: string;
}

interface ILoginResponse {
    access_token: string;
    refresh_token: string;
    user_role: string;
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
    },
    formWrapper: {
        padding: "32px",
        border: "1px solid #d9d9d9",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        maxWidth: "800px",
        width: "100%",
    },
    header: {
        fontSize: "28px",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "32px",
        color: "rgb(239 68 68)",
    },
    footer: {
        textAlign: "right",
        marginTop: "16px",
    },
};

const SignInContent: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const redirectPath = searchParams?.get("redirect") || "/";
        localStorage.setItem("redirectPath", redirectPath);
    }, [searchParams]);

    const successMessage = ({
        content,
        duration,
    }: {
        content: string;
        duration?: number;
    }) => {
        messageApi.open({
            type: "success",
            content: content,
            duration: duration || 2,
        });
    };

    const errorMessage = ({
        content,
        duration,
    }: {
        content: string;
        duration?: number;
    }) => {
        messageApi.open({
            type: "error",
            content: content,
            duration: duration || 2,
        });
    };

    const onFinish: FormProps["onFinish"] = async (values: LoginFormValues) => {
        const { username, password } = values;
        setLoading(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                }
            );

            if (response.ok) {
                const data: IApiResponse<ILoginResponse> =
                    await response.json();

                setCookie("access_token", data.data.access_token, {
                    maxAge: 30 * 60,
                    path: "/",
                });

                setCookie("refresh_token", data.data.refresh_token, {
                    maxAge: 30 * 60,
                    path: "/",
                });

                setCookie("user_role", data.data.user_role, {
                    maxAge: 30 * 60,
                    path: "/",
                });

                successMessage({
                    content: "Login successful.",
                    duration: 1,
                });
                const path = localStorage.getItem("redirectPath") || "/";

                if (path === "/") {
                    if (data.data.user_role === "admin") {
                        router.push("/admin");
                        // } else if (data.data.user_role === "lecturer") {
                        //     router.push("/lecturer");
                    } else {
                        router.push("/user");
                    }
                }

                // setTimeout(() => router.push(path), 1000);
            } else if (response.status === 401) {
                errorMessage({
                    content: "Invalid username or password.",
                });
            } else {
                errorMessage({
                    content: "An unexpected error occurred. Please try again.",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            errorMessage({
                content: "An unexpected error occurred. Please try again.",
                duration: 1,
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed: FormProps["onFinishFailed"] = (
        errorInfo: ValidateErrorEntity<LoginFormValues>
    ) => {
        console.error("Failed:", errorInfo);
        errorMessage({
            content: `Some fields are missing or invalid, ${errorInfo.errorFields.map(
                (field) => field.name
            )}`,
        });
    };

    return (
        <div style={styles.container}>
            {contextHolder}
            <div style={styles.formWrapper}>
                <h1 style={styles.header}>Đăng nhập</h1>
                <Form
                    name="basic"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: "Please input your username!",
                            },
                        ]}
                        style={{
                            width: "80%",
                        }}
                    >
                        <Input
                            autoFocus
                            prefix={<UserOutlined />}
                            placeholder="Tên đăng nhập"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your password!",
                            },
                        ]}
                        style={{
                            width: "80%",
                        }}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-evenly",
                        }}
                    >
                        <Form.Item
                            wrapperCol={{ offset: 6, span: 18 }}
                            style={{
                                marginTop: "1rem",
                            }}
                        >
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>

                        <div style={styles.footer}>
                            Chưa có tài khoản?
                            <a
                                href="/register"
                                className="text-blue-500 block ml-4"
                            >
                                Đăng ký
                            </a>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

const SignIn: React.FC = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInContent />
        </Suspense>
    );
};

export default SignIn;
