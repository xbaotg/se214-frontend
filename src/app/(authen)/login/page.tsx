"use client";

import React, { useEffect, Suspense, useState } from "react";
import { Button, Form, Input, FormProps, message } from "antd";
import { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { useSearchParams } from "next/navigation";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/auth";

interface LoginFormValues {
    username: string;
    password: string;
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
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
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
        setLoading(true);

        try {
            await login(values);
            successMessage({
                content: "Đăng nhập thành công!",
                duration: 5,
            });
        } catch (error) {
            console.error("Login error:", error);
            errorMessage({
                content: "Đăng nhập thất bại, vui lòng thử lại!",
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
                                message: "Nhập tên đăng nhập!",
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
                                message: "Nhập mật khẩu!",
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
