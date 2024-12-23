"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { IApiResponse, IStatsResponse } from "@/types";
import { Divider, Layout, message, Progress } from "antd";
import { getCookie } from "cookies-next";
import React, { useEffect } from "react";
import { Flex, Tooltip } from 'antd';

const AdminPage = () => {
    const { Header, Sider, Content } = Layout;
    const token = getCookie("refresh_token");
    const [messageApi, contextHolder] = message.useMessage();

    const [stats, setStats] = React.useState<IStatsResponse>({
//         {
//     "total_users": 6,
//     "total_teachers": 2,
//     "total_students": 2,
//     "total_courses": 3,
//     "total_subjects": 5,
//     "total_students_registered": 1,
//     "total_student_paid": 0,
//     "total_course_request": 0,
//     "total_money": 0
//   }
        total_users: 0,
        total_teachers: 0,
        total_students: 0,
        total_courses: 0,
        total_subjects: 0,
        total_students_registered: 0,
        total_student_paid: 0,
        total_course_request: 0,
        total_money: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/global/stats`, 
                     {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    messageApi.error("Không thể lấy dữ liệu từ máy chủ");
                    return;
                }
                const data: IApiResponse<IStatsResponse> = await response.json();

                const fetchedStats = data.data;

                setStats(fetchedStats);
            } catch (error) {
                console.log(error);
                messageApi.error("Không thể lấy dữ liệu từ máy chủ");
            }
        }

        fetchStats();
    }, []);


    const headerStyle: React.CSSProperties = {
        textAlign: 'center',
        height: 64,
        paddingInline: 48,
        lineHeight: '64px',
        backgroundColor: '#ffffff',
    };


    const layoutStyle = {
        borderRadius: 8,
        overflow: 'hidden',
        width: 'calc(90% - 8px)',
        maxWidth: 'calc(90% - 8px)',
    };

    const ContentModal = () => {
        return (
            <div className="container text-center p-4 rounded-lg gap-4">
                <div className="grid grid-cols-2 place-items-center bg-slate-100 rounded-lg shadow-lg p-4">
                    <div>
                        <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng người dùng: {stats.total_users}</p>
                        </div>
                        <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng giáo viên: {stats.total_teachers}</p>
                            {/* <h1 className="text-2xl font-semibold p-2">Số lượng giáo viên</h1> */}
                            {/* <Input value={stats.total_teachers} disabled /> */}
                        </div>
                        <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng học sinh: {stats.total_students}</p>
                            {/* <h1 className="text-2xl font-semibold p-2">Số lượng môn học</h1>
                            <Input value={stats.total_courses} disabled /> */}
                        </div>
                        {/* <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng môn học: {stats.total_courses}</p>
                        </div> */}
                    </div>
                    <div>
                        <Flex gap="small" vertical>
                            <Tooltip title={`
                                ${stats.total_students} học sinh
                                ${stats.total_teachers} giáo viên
                                ${stats.total_users - stats.total_students - stats.total_teachers} quản trị viên
                                `}>
                            <Progress percent={
                                Math.round((stats.total_students + stats.total_teachers )/ stats.total_users * 100)
                            } success={{ percent: Math.round(stats.total_teachers / stats.total_users * 100) }} type="circle" />
                            </Tooltip>
                        </Flex>
                    </div>
                </div>
                <Divider />
                <div className="grid grid-cols-2 place-items-center bg-slate-100 rounded-lg shadow-lg p-4">
                    <div>
                        <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng khóa học: {stats.total_courses}</p>
                        </div>
                        <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng môn học: {stats.total_subjects}</p>
                            {/* <h1 className="text-2xl font-semibold p-2">Số lượng giáo viên</h1> */}
                            {/* <Input value={stats.total_teachers} disabled /> */}
                        </div>
                        <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng khóa học chờ phê duyệt: {stats.total_course_request}</p>
                            {/* <h1 className="text-2xl font-semibold p-2">Số lượng môn học</h1>
                            <Input value={stats.total_courses} disabled /> */}
                        </div>
                        {/* <div className="grid place-items-center">
                            <p className="text-2xl p-2">Số lượng môn học: {stats.total_courses}</p>
                        </div> */}
                    </div>
                    <div>
                        <Flex gap="small" vertical>
                            <Tooltip title={`
                                ${stats.total_courses} khóa học
                                ${stats.total_course_request} khóa học chờ phê duyệt
                                `}>
                            <Progress percent={
                                100
                            } success={{ percent: Math.round(stats.total_course_request / (stats.total_courses + stats.total_course_request) * 100) }} type="circle" />

                            </Tooltip>
                        </Flex>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="flex justify-center p-4">
        {contextHolder}
        <div className="flex w-3/4 p-4 bg-white justify-center">
            <Layout style={layoutStyle}>
                <Header style={headerStyle} className="text-2xl font-semibold bg-white">Thống kê</Header>
                <Layout className="container mx-auto p-4 bg-white">
                    <Content className="w-2/3">   
                        <ContentModal />
                    </Content>
                    <Sider width={"30%"} className="p-4 bg-white">
                        <div className="container mx-auto text-center shadow-lg rounded-lg bg-slate-100">
                            <div className="p-4 grid place-items-center">
                                <h1 className="text-2xl font-semibold p-2">Đã đăng kí môn</h1>
                                <Progress type="circle" percent={
                                    stats.total_students_registered / stats.total_students * 100
                                } />
                            </div>
                            <div className="p-4 grid place-items-center">
                                <h1 className="text-2xl font-semibold p-2">Đã đóng học phí</h1>
                                <Progress type="circle" percent={
                                    stats.total_student_paid / stats.total_students * 100
                                } />
                            </div>
                        </div>
                    </Sider>
                </Layout>
            </Layout>  
        </div>
        </div>
    );
};

export default ProtectedRoute(AdminPage);
