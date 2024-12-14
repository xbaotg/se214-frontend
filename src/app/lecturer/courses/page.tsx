"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space } from "antd";
import type { InputRef, TableColumnType } from "antd";

import { IApiResponse, ICourse, ICourseResponse } from "@/types";
import Highlighter from "react-highlight-words";
import { User } from "lucide-react";
import { generatePeriodString } from "@/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";
import ListUserModal from "@/components/admin/ListUserModal";

type DataIndex = keyof ICourse;

const LecturerCoursesPage = () => {
    const { refreshToken: token } = useAuth();
    const [loadingPage, setLoadingPage] = useState(true);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response_fetch_courses = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/lecturer/course/list`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response_fetch_courses.ok) {
                    message.error("Failed to fetch courses");
                }
                const response_fetch_courses_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_courses.json();

                if (!response_fetch_courses_data.data) {
                    message.error("Chưa có môn học nào.");
                    setCourses([]);
                    return;
                }

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

                messageApi.success({
                    content: "Lấy thông tin thành công.",
                    duration: 1,
                });
                setCourses(fetch_courses);
            } catch (error) {
                console.error("Failed to fetch courses: ", error);
                message.error("Failed to fetch courses");
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
                            <ListUserModal
                                icon={<User size={16} />}
                                token={token as string}
                                course={record}
                            />
                        </div>
                    </div>
                </Space>
            ),
        },
    ];

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">Môn học</span>
            </div>
            <Table<ICourse> dataSource={courses} columns={columns} />
        </div>
    );
};

export default ProtectedRoute(LecturerCoursesPage);
