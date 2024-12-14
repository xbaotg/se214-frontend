"use client";

import { useEffect, useState } from "react";
import { IListUserResponse } from "@/types";
import { message } from "antd";

import ProtectedRoute from "@/components/ProtectedRoute";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/auth";

const ProfilePage = () => {
    const { refreshToken: refresh_token } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const [loadingPage, setLoadingPage] = useState(true);
    const [user, setUser] = useState<IListUserResponse>();
    useEffect(() => {
        try {
            if (refresh_token) {
                const fetchProfile = async () => {
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
                };
                fetchProfile();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoadingPage(false);
        }
    }, [refresh_token, messageApi]);

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="flex items-center justify-center p-5">
            {contextHolder}
            <div className="container p-5 items-center justify-center border border-gray-200 rounded-md w-1/3 shadow-lg shadow-slate-500">
                {/* <h1 className="text-center text-xl font-bold">Profile</h1> */}
                <h3 className="text-center text-xl font-bold p-3">
                    Thông tin tài khoản
                </h3>
                <div className="row">
                    <div className="col-md-6 offset-md-3">
                        <div className="card">
                            <div className="card-body">
                                <p className="mb-1">
                                    <strong>Tên đăng nhập:</strong>{" "}
                                    {user?.username}
                                </p>
                                <p className="mb-1">
                                    <strong>Email:</strong> {user?.email}
                                </p>
                                <p className="mb-1">
                                    <strong>Họ tên:</strong>{" "}
                                    {user?.user_fullname}
                                </p>
                                <p className="mb-1">
                                    <strong>Năm sinh:</strong> {user?.year}
                                </p>
                                {/* <p><strong>Department:</strong> {user?.department_name}</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtectedRoute(ProfilePage);
