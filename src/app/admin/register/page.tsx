"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space, Popconfirm } from "antd";
import type { InputRef, TableColumnType } from "antd";

import {
    IApiResponse,
    ICourse,
    ICourseResponse,
    ITeacher,
    IDepartment,
    UserRoles,
    ListSubjectResponse,
} from "@/types";
import Highlighter from "react-highlight-words";
import { Trash2, PenLine, Check } from "lucide-react";
import { lessionOptions, semesterOptions } from "@/constants";
import { generatePeriodString } from "@/utils";
import EditCourseModal from "@/components/admin/EditCourseModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";

type DataIndex = keyof ICourse;

const RegistingCoursesPage = () => {
    const { refreshToken: token } = useAuth();
    const [loadingPage, setLoadingPage] = useState(true);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [teacherOptions, setTeacherOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);

    const [departmentOptions, setDepartmentOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);
    const [courseOptions, setCourseOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);


    const updatedCourses = (courses: ICourse[]) => {
        setCourses(courses);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    response_fetch_courses,
                    response_fetch_teachers,
                    response_fetch_dapartments,
                    response_fetch_subjects,
                ] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/lecturer/course/register/list`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/list?role=${UserRoles.Lecturer}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/department/list`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subject/list`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);
                if (!response_fetch_courses.ok) {
                    message.error("Failed to fetch courses");
                }
                if (!response_fetch_teachers.ok) {
                    message.error("Failed to fetch teachers");
                }
                if (!response_fetch_dapartments.ok) {
                    message.error("Failed to fetch departments");
                }
                if (!response_fetch_subjects.ok) {
                    message.error("Failed to fetch subjects");
                }
                const response_fetch_courses_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_courses.json();

                const fetch_courses = response_fetch_courses_data.data.map(
                    (course) => ({
                        key: course.id,
                        course_code: course.course_code,
                        course_id: course.id,
                        course_name: course.course_name,
                        course_fullname: course.course_fullname,
                        course_room: course.course_room,
                        course_day: course.course_day,
                        course_time: generatePeriodString(
                            course.course_start_shift,
                            course.course_end_shift
                        ),
                        course_size: `${course.current_enroll}/${course.max_enroll}`,
                        course_teacher_id: course.course_teacher_id,
                        course_department: course.course_department,
                        max_enroll: course.max_enroll,
                        current_enroll: course.current_enroll,
                        course_start_shift: course.course_start_shift,
                        course_end_shift: course.course_end_shift,
                    })
                );

                const response_fetch_teachers_data: IApiResponse<ITeacher[]> =
                    await response_fetch_teachers.json();

                const fetch_teachers = response_fetch_teachers_data.data.map(
                    (teacher) => ({
                        value: teacher.id,
                        label: teacher.user_fullname,
                    })
                );

                const response_fetch_departments_data: IApiResponse<
                    IDepartment[]
                > = await response_fetch_dapartments.json();

                const fetch_departments =
                    response_fetch_departments_data.data.map((department) => ({
                        value: department.department_id,
                        label: department.department_name,
                    }));

                const response_fetch_subjects_data: IApiResponse<
                    ListSubjectResponse[]
                > = await response_fetch_subjects.json();

                const fetch_subjects = response_fetch_subjects_data.data.map(
                    (subject) => ({
                        value: subject.course_fullname,
                        label: subject.course_name,
                    })
                );
                messageApi.success({
                    content: "Lấy thông tin thành công.",
                    duration: 1,
                });
                setCourseOptions(fetch_subjects);
                setTeacherOptions(fetch_teachers);
                setDepartmentOptions(fetch_departments);
                setCourses(fetch_courses);
            } catch (error) {
                console.error("Failed to fetch courses: ", error);
                // message.error("Failed to fetch courses");
                message.error("Lỗi không xác định");
            } finally {
                setLoadingPage(false);
            }
        };
        fetchData();
    }, [token, messageApi]);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps["confirm"],
        dataIndex: DataIndex
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (
        dataIndex: DataIndex
    ): TableColumnType<ICourse> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(
                            selectedKeys as string[],
                            confirm,
                            dataIndex
                        )
                    }
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(
                                selectedKeys as string[],
                                confirm,
                                dataIndex
                            )
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined
                style={{ color: filtered ? "#1677ff" : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                      .toString()
                      .toLowerCase()
                      .includes((value as string).toLowerCase())
                : false,

        // @ts-expect-error - Not sure why this is throwing an error
        filterDropdownProps: {
            onOpenChange(open: boolean) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },

        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: "Mã môn",
            dataIndex: "course_name",
            key: "course_name",
            render: (text: string) => (
                <span className="text-blue-300 font-semibold">{text}</span>
            ),
            ...getColumnSearchProps("course_name"),
        },
        {
            title: "Tên môn",
            dataIndex: "course_fullname",
            key: "course_fullname",
            ...getColumnSearchProps("course_fullname"),
        },
        {
            title: "Phòng học",
            dataIndex: "course_room",
            key: "course_room",
            ...getColumnSearchProps("course_room"),
        },
        {
            title: "Thứ",
            dataIndex: "course_day",
            key: "course_day",
        },
        {
            title: "Tiết học",
            dataIndex: "course_time",
            key: "course_time",
        },
        {
            title: "Sĩ số",
            dataIndex: "course_size",
            key: "course_size",
        },
        {
            title: "Thao tác",
            key: "action",
            // @ts-expect-error - Temporary fix
            render: (_, record: ICourse) => (
                <Space size="large">
                    <div className="flex gap-4">
                        <div className="cursor-pointer">
                            <Popconfirm
                                title="Xác nhận xóa ?"
                                onConfirm={() => {
                                    handleDeleteCourse(record.course_id);
                                }}
                            >
                                <Trash2 size={16} color="red" />
                            </Popconfirm>
                        </div>
                        <div className="cursor-pointer">
                            <EditCourseModal
                                icon={<PenLine size={16} />}
                                course={record}
                                allCourses={courses}
                                setCourses={updatedCourses}
                                departmentOptions={departmentOptions}
                                teacherOptions={teacherOptions}
                                lessionOptions={lessionOptions}
                                semesterOptions={semesterOptions}
                                courseOptions={courseOptions}
                                token={token as string}
                            />
                        </div>
                        <div className="cursor-pointer">
                            <Popconfirm
                                title="Xác nhận duyệt học phần ?"
                                onConfirm={() => {
                                    handleConfirmCourse(record.course_id);
                                }}
                            >
                                <Check size={16} color="green" />
                            </Popconfirm>
                        </div>
                    </div>
                </Space>
            ),
        },
    ];

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

    const handleDeleteCourse = async (course_id: string) => {
        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/course/delete/${course_id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const course = courses.find(
                (course) => course.course_id === course_id
            );

            const data: IApiResponse<ICourseResponse> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Xóa học phần ${
                        course?.course_code || ""
                    } thành công.`,
                    duration: 1,
                });

                setCourses((prev) =>
                    prev.filter((course) => course.key !== course_id)
                );
            } else {
                errorMessage({
                    content: data.message || "Lỗi không xác định",
                });
            }
        } catch (error) {
            console.error(error);
            errorMessage({
                content: "Lỗi không xác định",
            });
        }
    };

    const handleConfirmCourse = async (course_id: string) => {
        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/course/confirm?course_id=${course_id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data: IApiResponse<ICourseResponse> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Xác nhận học phần ${
                        data.data.course_code || ""
                    } thành công.`,
                    duration: 1,
                });

                setCourses((prev) =>
                    prev.filter((course) => course.key !== course_id)
                );
            } else {
                errorMessage({
                    content: data.message || "Lỗi không xác định",
                });
            }
        } catch (error) {
            console.error(error);
            errorMessage({
                content: "Lỗi không xác định",
            });
        }
    };

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">
                    Các lớp cần duyệt
                </span>
            </div>
            <Table<ICourse> dataSource={courses} columns={columns} />
        </div>
    );
};

export default ProtectedRoute(RegistingCoursesPage);
