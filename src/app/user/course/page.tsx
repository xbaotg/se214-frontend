"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type {
    FilterDropdownProps,
    TableRowSelection,
} from "antd/es/table/interface";
import { message, Table, Button, Input, Space, ConfigProvider } from "antd";
import type { InputRef, TableColumnType } from "antd";
import { getCookie } from "cookies-next";

import { IApiResponse, ICourse, ICourseResponse, IDepartment } from "@/types";
import { useRouter } from "next/navigation";
import Highlighter from "react-highlight-words";
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { generatePeriodString } from "@/utils";

type DataIndex = keyof ICourse;

interface IDepartmentFilter {
    department_id: string;
    department_name: string;
}

const DKHPPage = () => {
    const router = useRouter();
    const token = getCookie("refresh_token");
    const searchInput = useRef<InputRef>(null);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [departments, setDepartments] = useState<IDepartmentFilter[]>([]);

    const [loading, setLoading] = useState(false);

    const start = async () => {
        setLoading(true);
        const unSelectedCourses = selectedRowKeys.map((course_id) =>
            getCourseByKey(course_id as string)
        );
        try {
            const unSubResponse = await Promise.all(
                unSelectedCourses.map((course) => {
                    if (!course) return;
                    messageApi.info(`Unregister course ${course.course_name}`);
                    return fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/course/unregister`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                course_id: course.course_id,
                                course_year: course.course_year,
                                course_semester: course.course_semester,
                            }),
                        }
                    );
                })
            );
            const unSubResults = unSubResponse.map((res) => {
                return res?.ok;
            });

            const unSubSuccessfulIndexes = unSubResults.map((result, index) =>
                result ? index : -1
            );

            const unSubRegisteredCourses = unSubSuccessfulIndexes.map(
                (index) => unSelectedCourses[index]
            );

            unSubRegisteredCourses.forEach((course) => {
                const index = courses.findIndex(
                    (c) => c.course_id === course?.course_id
                );
                if (index !== -1) {
                    courses[index].course_size = `${
                        parseInt(course?.course_size.split("/")[0] || "0") - 1
                    }/${parseInt(course?.course_size.split("/")[1] || "0")}`;
                }
            });

            messageApi.success(
                `Hủy đăng ký thành công ${unSubRegisteredCourses.length} học phần`
            );

            const filteredCourses = courses.filter(
                (course) => !unSubRegisteredCourses.includes(course)
            );

            setSelectedRowKeys([]);
            setCourses(filteredCourses);
        } catch (error) {
            console.error("Failed to register courses: ", error);
            messageApi.error("Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<ICourse> = {
        selectedRowKeys,
        onChange: onSelectChange,
        type: "checkbox",
    };

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        const fetchData = async () => {
            try {
                const [response_fetch_departments, response_fetch_registered] =
                    await Promise.all([
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
                        // BCK code this for registered courses [
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/user/course/list?course_year=${process.env.NEXT_PUBLIC_CURRENT_YEAR}&course_semester=${process.env.NEXT_PUBLIC_CURRENT_SEMESTER}`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        ),
                        // BCK code this ]
                    ]);

                if (!response_fetch_departments.ok) {
                    message.error("Failed to fetch departments");
                }
                // BCK code this [
                if (!response_fetch_registered.ok) {
                    message.error("Failed to fetch registered courses");
                }
                // BCK code this ]

                const response_fetch_departments_data: IApiResponse<
                    IDepartment[]
                > = await response_fetch_departments.json();

                // BCK code this for registered courses [
                const response_fetch_registered_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_registered.json();

                const fetch_departments =
                    response_fetch_departments_data.data.map((department) => ({
                        department_id: department.department_id,
                        department_name: department.department_name,
                    }));

                const fetch_courses = response_fetch_registered_data.data.map(
                    (course) => ({
                        key: course.id,
                        course_id: course.id,
                        course_name: course.course_name,
                        course_teacher_id: course.course_teacher_id,
                        course_fullname: course.course_fullname,
                        course_room: course.course_room,
                        course_day: course.course_day,
                        course_time: generatePeriodString(
                            course.course_start_shift,
                            course.course_end_shift
                        ),
                        course_size: `${course.current_enroll}/${course.max_enroll}`,
                        course_department: course.course_department,
                        course_year: course.course_year,
                        course_semester: course.course_semester,
                        course_credit: course.course_credit,
                    })
                );

                messageApi.success({
                    content: "Lấy thông tin các môn đã đăng ký thành công",
                    duration: 1,
                });

                setDepartments(fetch_departments);
                setCourses(fetch_courses);
            } catch (error) {
                console.error("Failed to fetch courses: ", error);
                message.error("Failed to fetch courses");
            }
        };
        if (token) {
            fetchData();
        }
    }, [messageApi, token, router]);

    const getDepartmentName = (department_id: string | undefined) => {
        if (!department_id) return "";
        const department = departments.find(
            (department) => department.department_id === department_id
        );

        return department ? department.department_name : "";
    };

    const getCourseByKey = (key: string) => {
        return courses.find((course) => course.key === key);
    };

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

        // @ts-expect-error - ignore
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

    const rowStyle = (course_id: string) => {
        if (selectedRowKeys.includes(course_id)) {
            // blue color
            console.log("selectedRowKeys in style: ", selectedRowKeys);
            return { background: "red" };
        }

        return {};
    };

    const columns = [
        {
            title: "Mã môn",
            dataIndex: "course_name",
            key: "course_name",
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
            title: "Ngày học",
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
    ];

    return (
        <div className="w-[90%] max-w-7xl border shadow-sm rounded-lg mx-auto px-4 md:px-6">
            {contextHolder}
            <div className="flex flex-col md:flex-row flex-wrap justify-between md:justify-around items-center my-5 gap-4">
                <span className="text-lg md:text-xl text-red-500 font-bold text-center">
                    Quản lý môn học
                </span>
                <Button
                    onClick={start}
                    className="shadow-md"
                    // disabled={!hasSelected}
                    loading={loading}
                >
                    <span className="text-red-500">Hủy đăng ký</span>
                </Button>
            </div>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            rowSelectedBg: "#ffcccc",
                            rowSelectedHoverBg: "#ffcccc",
                        },
                    },
                    token: {},
                }}
            >
                <Table<ICourse>
                    rowSelection={rowSelection}
                    dataSource={courses}
                    columns={columns}
                    onRow={(record) => {
                        return {
                            style: rowStyle(record.course_id),
                        };
                    }}
                    scroll={{ x: "max-content", y: 55 * 10 }}
                    expandable={{
                        expandRowByClick: true,
                        expandedRowRender: (record) => {
                            return (
                                <div className="ml-10">
                                    <div>
                                        <div>
                                            <strong>Khoa: &nbsp;</strong>
                                            {getDepartmentName(
                                                record.course_department as string
                                            )}
                                        </div>
                                        <div>
                                            <strong>Năm: &nbsp;</strong>
                                            {record.course_year}
                                        </div>
                                        <div>
                                            <strong>Tín chỉ: &nbsp;</strong>
                                            {record.course_credit}
                                        </div>
                                        <div>
                                            <strong>Học kỳ: &nbsp;</strong>
                                            {record.course_semester}
                                        </div>
                                    </div>
                                </div>
                            );
                        },
                    }}
                />
            </ConfigProvider>
        </div>
    );
};

export default ProtectedRoute(DKHPPage);
