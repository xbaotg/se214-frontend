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
import React from "react";
import Loading from "@/components/Loading";
import ProtectedRoute from "@/components/ProtectedRoute";

type DataIndex = keyof ICourse;

const generatePeriodString = (a: number, b: number) => {
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
    const [alreadyRegisteredCourses, setAlreadyRegisteredCourses] = useState<
        React.Key[]
    >([]);
    const [departments, setDepartments] = useState<IDepartmentFilter[]>([]);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loading, setLoading] = useState(false);

    const start = async () => {
        setLoading(true);
        const selectedCourses = selectedRowKeys.map((course_id) =>
            getCourseByKey(course_id as string)
        );
        const unSelectedCourses = alreadyRegisteredCourses
            .map((course_id) => getCourseByKey(course_id as string))
            .filter((course) => !selectedCourses.includes(course));
        try {
            const response = await Promise.all(
                selectedCourses.map((course) => {
                    if (!course) return;
                    if (alreadyRegisteredCourses.includes(course.course_id)) {
                        messageApi.info(
                            `Course ${course.course_name} already registered`
                        );
                        return false;
                    }
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

            const unSubResponse = await Promise.all(
                unSelectedCourses.map((course) => {
                    if (!course) return;
                    if (!alreadyRegisteredCourses.includes(course.course_id)) {
                        messageApi.info(
                            `Course ${course.course_name} not registered`
                        );
                        return;
                    }
                    // messageApi.info(`Unregister course ${course.course_name}`);
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
            // // console.log("unSubResults: ", unSubResults);
            const unSubSuccessfulIndexes = unSubResults.map((result, index) =>
                result ? index : -1
            );

            const unSubUnSuccessfulIndexes = unSubResults.map((result, index) =>
                result ? -1 : index
            );

            const unSubSuccessfulCourses = unSubSuccessfulIndexes.map(
                (index) => unSelectedCourses[index]
            );

            const unSubUnSuccessfulCourses = unSubUnSuccessfulIndexes.map(
                (index) => unSelectedCourses[index]
            );

            unSubSuccessfulCourses.forEach((course) => {
                const index = courses.findIndex(
                    (c) => c.course_id === course?.course_id
                );
                if (index !== -1) {
                    messageApi.success(
                        `Unregister course ${course?.course_name} successfully`
                    );
                    courses[index].course_size = `${
                        parseInt(course?.course_size.split("/")[0] || "0") - 1
                    }/${parseInt(course?.course_size.split("/")[1] || "0")}`;
                    setAlreadyRegisteredCourses(
                        (keys) => keys.filter((key) => key !== courses[index].course_id)
                    );
                } 
            });

            unSubUnSuccessfulCourses.forEach((course) => {
                const index = courses.findIndex(
                    (c) => c.course_id === course?.course_id
                );
                if (index !== -1) {
                    messageApi.error(
                        `Failed to unregister course ${course?.course_name}`
                    );

                    setSelectedRowKeys(prev => 
                    [...prev, courses[index].course_id]
                    );

                }
            });

            // // Count number of successful requests
            const results = response.map((res) => {
                if (!res) return true;
                return res?.ok;
            });

            const successfulIndexes = results.map((result, index) => {
                return result ? index : -1;
            });

            const unSuccessfulIndexes = results.map((result, index) => {
                return result ? -1 : index;
            });

            const successfulCourses = successfulIndexes.map(
                (index) => selectedCourses[index]
            );

            const unSuccessfulCourses = unSuccessfulIndexes.map(
                (index) => selectedCourses[index]
            );


            unSuccessfulCourses.forEach((course) => {
                const index = courses.findIndex(
                    (c) => c.course_id === course?.course_id
                );
                console.log("index: ", index);
                if (index !== -1) {
                    messageApi.error(
                        `Failed to register course ${course?.course_name}`
                    );
                    setSelectedRowKeys((keys) => 
                        keys.filter((key) => key !== courses[index].course_id)
                    );
                }
            });

            successfulCourses.forEach((course) => {
                const index = courses.findIndex(
                    (c) => c.course_id === course?.course_id
                );
                if (index !== -1) {
                    if (alreadyRegisteredCourses.includes(courses[index].course_id)) {
                        return;
                    }
                    messageApi.success(
                        `Register course ${course?.course_name} successfully`
                    );
                    courses[index].course_size = `${
                        parseInt(course?.course_size.split("/")[0] || "0") + 1
                    }/${parseInt(course?.course_size.split("/")[1] || "0")}`;
                    // setSelectedRowKeys((keys) =>
                    //     keys.filter((key) => key !== course?.course_id)
                    // );
                    // console.log(alreadyRegisteredCourses, courses[index].course_id);
                    setAlreadyRegisteredCourses(prev => 
                        [...prev, courses[index].course_id]
                    );
                }
            });

            const successfulRequests = results.filter(
                (result) => result
            ).length;

            messageApi.success(
                `Đăng ký thành công ${successfulRequests} học phần.`
            );

            setCourses([...courses]);
            // setAlreadyRegisteredCourses(
            //     selectedRowKeys.filter(
            //         (key) =>
            //             !unSuccessfulCourses.includes(
            //                 getCourseByKey(key as string)
            //             )
            //     )
            // );
            // setSelectedRowKeys([...selectedRowKeys]);
        } catch (error) {
            console.error("Failed to register courses: ", error);
            messageApi.error("Đăng ký thất bại !!!");
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
        type: "checkbox",
    };

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        const fetchData = async () => {
            try {
                const [
                    response_fetch_courses,
                    response_fetch_departments,
                    response_fetch_registered,
                ] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/list`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
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
                        `${process.env.NEXT_PUBLIC_API_URL}/user/course/list?course_year=2024&course_semester=1`,
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
                if (!response_fetch_courses.ok) {
                    message.error("Failed to fetch courses");
                }
                if (!response_fetch_departments.ok) {
                    message.error("Failed to fetch departments");
                }
                // BCK code this [
                if (!response_fetch_registered.ok) {
                    message.error("Failed to fetch registered courses");
                }
                // BCK code this ]

                const response_fetch_courses_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_courses.json();

                const response_fetch_departments_data: IApiResponse<
                    IDepartment[]
                > = await response_fetch_departments.json();

                // BCK code this for registered courses [
                const response_fetch_registered_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_registered.json();

                const fetch_registered_courses_id =
                    response_fetch_registered_data.data.map(
                        (course) => course.id
                    );

                setSelectedRowKeys(fetch_registered_courses_id);
                setAlreadyRegisteredCourses(fetch_registered_courses_id);
                // BCK code this ]

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
                    content: "Lấy thông tin học phần thành công",
                    duration: 1,
                });
                setDepartments(fetch_departments);
                setCourses(fetch_courses);
            } catch (error) {
                console.error("Failed to fetch courses: ", error);
                messageApi.error("Lấy thông tin học phần thất bại");
            } finally {
                setLoadingPage(false);
            }
        };
        fetchData();
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
        const unSelectedCourses = alreadyRegisteredCourses.includes(course_id);
        if (unSelectedCourses) {
            // red color
            return { background: "#ffcccc" };
        }
        if (alreadyRegisteredCourses.includes(course_id)) {
            // green color
            return { background: "#ccffcc" };
        }
        if (selectedRowKeys.includes(course_id)) {
            // blue color
            return { background: "#cce6ff" };
        }

        return {};
    };

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

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto px-4">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">
                    Đăng ký học phần
                </span>
                <Button
                    onClick={start}
                    // disabled={!hasSelected}
                    loading={loading}
                >
                    Đăng ký
                </Button>
            </div>
            <Table<ICourse>
                rowSelection={rowSelection}
                dataSource={courses}
                columns={columns}
                onRow={(record) => {
                    return {
                        style: rowStyle(record.course_id),
                    };
                }}
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
        </div>
    );
};

export default ProtectedRoute(DKHPPage);
