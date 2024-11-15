"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type {
    FilterDropdownProps,
    TableRowSelection,
} from "antd/es/table/interface";
import { message, Table, Button, Input, Space } from "antd";
import type { InputRef, TableColumnType } from "antd";
import { getCookie } from "cookies-next";

import { IApiResponse, ICourse, ICourseResponse, IDepartment } from "@/types";
import { useRouter } from "next/navigation";
import Highlighter from "react-highlight-words";

type DataIndex = keyof ICourse;

const generateString = (a: number, b: number) => {
    return Array.from({ length: b - a + 1 }, (_, i) => a + i).join(",");
};

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
        const selectedCourses = selectedRowKeys.map((course_id) =>
            getCourseByKey(course_id as string)
        );
        try {
            const response = await Promise.all(
                selectedCourses.map((course) => {
                    if (!course) return;
                    return fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/course/register`,
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
            // Count number of successful requests
            const results = response.map((res) => {
                return res?.ok;
            });

            const successfulIndexes = results.map((result, index) =>
                result ? index : -1
            );

            const registeredCourses = successfulIndexes.map(
                (index) => selectedCourses[index]
            );

            registeredCourses.forEach((course) => {
                const index = courses.findIndex(
                    (c) => c.course_id === course?.course_id
                );
                if (index !== -1) {
                    courses[index].course_size = `${
                        parseInt(course?.course_size.split("/")[0] || "0") + 1
                    }/${parseInt(course?.course_size.split("/")[1] || "0")}`;
                }
            });

            const successfulRequests = results.filter(
                (result) => result
            ).length;

            messageApi.success(
                `Successfully registered ${successfulRequests} courses`
            );

            setCourses([...courses]);
            setSelectedRowKeys([]);
        } catch (error) {
            messageApi.error("Failed to register courses");
        } finally {
            setLoading(false);
        }
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection: TableRowSelection<ICourse> = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const hasSelected = selectedRowKeys.length > 0;

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        const fetchData = async () => {
            try {
                const [response_fetch_courses, response_fetch_departments] =
                    await Promise.all([
                        fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/course/list`,
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
                    ]);
                if (!response_fetch_courses.ok) {
                    message.error("Failed to fetch courses");
                }
                if (!response_fetch_departments.ok) {
                    message.error("Failed to fetch departments");
                }

                const response_fetch_courses_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_courses.json();

                const response_fetch_departments_data: IApiResponse<
                    IDepartment[]
                > = await response_fetch_departments.json();

                const fetch_departments =
                    response_fetch_departments_data.data.map((department) => ({
                        department_id: department.department_id,
                        department_name: department.department_name,
                    }));

                const fetch_courses = response_fetch_courses_data.data.map(
                    (course) => ({
                        key: course.id,
                        course_id: course.id,
                        course_name: course.course_name,
                        course_fullname: course.course_fullname,
                        course_room: course.course_room,
                        course_day: course.course_day,
                        course_time: generateString(
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

                setDepartments(fetch_departments);
                setCourses(fetch_courses);
            } catch (error) {
                message.error("Failed to fetch courses");
            }
        };
        fetchData();
    }, []);

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

        // @ts-ignore
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
    ];

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto px-4">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">
                    Đăng ký học phần
                </span>
                <Button
                    onClick={start}
                    disabled={!hasSelected}
                    loading={loading}
                >
                    Đăng ký
                </Button>
            </div>
            <Table<ICourse>
                rowSelection={rowSelection}
                dataSource={courses}
                columns={columns}
                expandable={{
                    expandRowByClick: true,
                    expandedRowRender: (record) => {
                        return (
                            <div className="ml-10">
                                <div>
                                    <div>
                                        <strong>Khoa: &nbsp;</strong>
                                        {getDepartmentName(
                                            record.course_department
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
        </div>
    );
};

export default DKHPPage;
