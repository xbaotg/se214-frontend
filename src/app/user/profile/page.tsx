"use client";

import { useEffect, useState } from "react";
import { IListUserResponse } from "@/types";
import { message, Input, Button } from "antd";

import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/auth";

const ProfilePage = () => {
    const { refreshToken: refresh_token } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const [loadingPage, setLoadingPage] = useState(true);
    const [user, setUser] = useState<IListUserResponse>();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (refresh_token) {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/info`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${refresh_token}`,
                            },
                        }
                    );
                    const data = await res.json();
                    messageApi.success({
                        content: "Lấy thông tin tài khoản thành công",
                        duration: 1,
                    });
                    setUser(data.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingPage(false);
            }
        };

        fetchProfile();
    }, [refresh_token, messageApi]);

    const handleChangePassword = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/change-pass`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${refresh_token}`,
                    },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Đã xảy ra lỗi!");
            }

            messageApi.success("Thay đổi mật khẩu thành công!");
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            const errMessage = (error as Error).message;
            console.error(error);
            messageApi.error(errMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="flex items-center justify-center p-5">
            {contextHolder}
            <div className="container p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-md shadow-lg shadow-slate-500">
                <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="text-center text-xl font-bold mb-3">
                        Thông tin tài khoản
                    </h3>
                    <div className="card">
                        <div className="card-body">
                            <p className="mb-1">
                                <strong>Tên đăng nhập:</strong> {user?.username}
                            </p>
                            <p className="mb-1">
                                <strong>Email:</strong> {user?.email}
                            </p>
                            <p className="mb-1">
                                <strong>Họ tên:</strong> {user?.user_fullname}
                            </p>
                            <p className="mb-1">
                                <strong>Năm sinh:</strong> {user?.year}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-md">
                    <h3 className="text-center text-xl font-bold mb-3">
                        Thay đổi mật khẩu
                    </h3>
                    <div className="card">
                        <div className="card-body">
                            <div className="mb-3">
                                <label
                                    htmlFor="old-password"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Mật khẩu cũ
                                </label>
                                <Input.Password
                                    id="old-password"
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(e.target.value)
                                    }
                                    placeholder="Nhập mật khẩu cũ"
                                />
                            </div>
                            <div className="mb-3">
                                <label
                                    htmlFor="new-password"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Mật khẩu mới
                                </label>
                                <Input.Password
                                    id="new-password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                            <Button
                                type="primary"
                                onClick={handleChangePassword}
                                loading={isSubmitting}
                                disabled={!oldPassword || !newPassword}
                                className="w-full"
                            >
                                Thay đổi mật khẩu
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtectedRoute(ProfilePage);
