"use client";

import { useState, useEffect } from "react";
import { TimeTable } from "@/components/TimeTable/TimeTable";
import { message } from "antd";
import { ICourseResponse, ITimeTableData } from "@/types";
import { daysMapping } from "@/constants";
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";

const TKBPage = () => {
    // const token = getCookie("refresh_token");
    const { refreshToken: token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [messageApi, contextHolder] = message.useMessage();
    const [courses, setCourses] = useState<ITimeTableData>({});

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/course/list?course_year=2024&course_semester=1`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch courses");
                }
                const data: ICourseResponse[] = (await response.json()).data;

                const coursesData: ITimeTableData = {};
                data.forEach((course) => {
                    const day = daysMapping[course.course_day];
                    if (!coursesData[day]) {
                        coursesData[day] = [];
                    }
                    coursesData[day].push({
                        id: course.id,
                        course_name: course.course_name,
                        course_fullname: course.course_fullname,
                        course_teacher: course.course_teacher_name || "",
                        course_room: course.course_room,
                        startPeriod: course.course_start_shift,
                        endPeriod: course.course_end_shift,
                    });
                });
                messageApi.success({
                    content: "Lấy thông tin thành công.",
                    duration: 1,
                });
                setCourses(coursesData);
            } catch (error) {
                console.error(error);
                messageApi.error("Lấy thông tin thất bại.");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="flex justify-center w-full mx-auto">
            {contextHolder}
            <div className="container mx-auto p-4">
                <TimeTable courses={courses} />
            </div>
        </div>
    );
};

export default ProtectedRoute(TKBPage);
