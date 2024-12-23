"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ISignUpFormValues, ISignUpResponse, UserRoles } from "@/types";
import { Button, Form, Input, FormProps, message, InputNumber } from "antd";

const SignUp: React.FC = () => {
    const router = useRouter();
    const [messageApi, contextHolder] = message.useMessage();

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

    const onFinish: FormProps["onFinish"] = async (
        values: ISignUpFormValues
    ) => {
        const {
            username,
            email,
            password,
            retypePassword,
            user_fullname,
            year,
        } = values;

        if (password !== retypePassword) {
            errorMessage({
                content: "Passwords do not match!",
            });
            return;
        }

        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        user_fullname: user_fullname,
                        year: year,
                        user_role: UserRoles.User,
                        user_email: email,
                    }),
                }
            );

            const data: ISignUpResponse = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Account created successfully for ${data.username}`,
                    duration: 1,
                });

                setTimeout(() => {
                    router.push("/login");
                }, 1000);
            } else {
                errorMessage({
                    content: data.detail || "Lỗi không xác định",
                });
            }
        } catch (error) {
            console.error(error);
            errorMessage({
                content: "Lỗi không xác định",
            });
        }
    };

    const onFinishFailed: FormProps["onFinishFailed"] = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <div style={styles.container}>
            {contextHolder}
            <div style={styles.formWrapper}>
                <h1 style={styles.header}>Đăng Ký Tài Khoản</h1>
                <Form
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    initialValues={{
                        remember: true,
                        year: new Date().getFullYear(),
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Tên đăng nhập"
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: "Please input your username!",
                            },
                        ]}
                    >
                        <Input autoFocus />
                    </Form.Item>

                    <Form.Item
                        label="Họ và tên"
                        name="user_fullname"
                        rules={[
                            {
                                required: true,
                                message: "Please input your username!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Please input your email!",
                                type: "email",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your password!",
                            },
                            () => ({
                                validator(_, value) {
                                    if (!value || value.length >= 6) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error(
                                            "Password must be at least 6 characters!"
                                        )
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="retypePassword"
                        dependencies={["password"]}
                        rules={[
                            {
                                required: true,
                                message: "Please retype your password!",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Passwords do not match!")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Năm sinh"
                        name="year"
                        rules={[
                            {
                                required: true,
                                message: "Please input your year!",
                            },
                        ]}
                    >
                        <InputNumber max={new Date().getFullYear()} />
                    </Form.Item>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                        }}
                    >
                        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                            <Button type="primary" htmlType="submit">
                                Đăng ký
                            </Button>
                        </Form.Item>
                        <div style={styles.footer}>
                            {"Đã có tài khoản? "}
                            <a
                                href="/login"
                                className="text-blue-500 block ml-4"
                            >
                                Đăng nhập
                            </a>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
};

// Styles object with TypeScript typing
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

export default SignUp;
