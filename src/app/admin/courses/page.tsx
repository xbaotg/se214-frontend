"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import {
    message,
    Table,
    Button,
    Input,
    Space,
    Form,
    Divider,
    InputNumber,
} from "antd";
import type {
    InputRef,
    TableColumnType,
    FormProps,
    InputNumberProps,
} from "antd";
import { getCookie } from "cookies-next";

import {
    CreateCourseFormValues,
    IApiResponse,
    ICourse,
    ICourseResponse,
} from "@/types";
import { useRouter } from "next/navigation";
import Highlighter from "react-highlight-words";
import AddModal from "@/components/admin/AddModal";
import { Plus } from "lucide-react";

type DataIndex = keyof ICourse;

const generateString = (a: number, b: number) => {
    return Array.from({ length: b - a + 1 }, (_, i) => a + i).join(",");
};

const AdminCoursesPage = () => {
    const router = useRouter();
    const token = getCookie("refresh_token");
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState<boolean>(false);
    const [courseCreateForm, setCourseCreateForm] =
        useState<CreateCourseFormValues>({
            course_teacher_id: "",
            course_department: "",
            course_name: "",
            course_fullname: "",
            course_credit: 0,
            course_year: 0,
            course_semester: 0,
            course_start_shift: 0,
            course_end_shift: 0,
            course_day: "",
            max_enroll: 0,
            current_enroll: 0,
            course_room: "",
        });

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        const fetchCourses = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/course/list`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.ok) {
                    const data: IApiResponse<ICourseResponse[]> =
                        await response.json();

                    const fetch_courses = data.data.map((course) => ({
                        key: course.course_teacher_id,
                        course_id: course.course_teacher_id,
                        course_name: course.course_name,
                        course_code: course.course_fullname,
                        course_room: course.course_room,
                        course_day: course.course_day,
                        course_time: generateString(
                            course.course_start_shift,
                            course.course_end_shift
                        ),
                        course_size: `${course.current_enroll}/${course.max_enroll}`,
                    }));

                    setCourses(fetch_courses);
                } else {
                    message.error("Failed to fetch courses");
                }
            } catch (error) {
                message.error("Failed to fetch courses");
            }
        };
        fetchCourses();
    }, []);

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
            dataIndex: "course_id",
            key: "course_id",
            render: (text: string) => (
                <span className="text-blue-300 font-semibold">{text}</span>
            ),
            ...getColumnSearchProps("course_id"),
        },
        {
            title: "Tên môn",
            dataIndex: "course_name",
            key: "course_name",
            ...getColumnSearchProps("course_name"),
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

    const onFinishFailed: FormProps["onFinishFailed"] = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    const onFinish = async (values: CreateCourseFormValues) => {
        const {
            course_teacher_id,
            course_department,
            course_name,
            course_fullname,
            course_credit,
            course_year,
            course_semester,
            course_start_shift,
            course_end_shift,
            course_day,
            max_enroll,
            current_enroll,
            course_room,
        } = values;

        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/course/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        course_teacher_id,
                        course_department,
                        course_name,
                        course_fullname,
                        course_credit,
                        course_year,
                        course_semester,
                        course_start_shift,
                        course_end_shift,
                        course_day,
                        max_enroll,
                        current_enroll,
                        course_room,
                    }),
                }
            );

            const data: IApiResponse<ICourseResponse> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Courses created successfully for ${data.data.course_name}`,
                    duration: 1,
                });

                setOpen(false);
                setCourses((prev) => [
                    ...prev,
                    {
                        key: data.data.id,
                        course_id: data.data.id,
                        course_name: data.data.course_name,
                        course_room: data.data.course_room,
                        course_day: data.data.course_day,
                        course_time: generateString(
                            data.data.course_start_shift,
                            data.data.course_end_shift
                        ),
                        course_size: `${data.data.current_enroll}/${data.data.max_enroll}`,
                    },
                ]);
            } else {
                errorMessage({
                    content: data.message || "An unexpected error occurred",
                });
            }
        } catch (error) {
            console.error(error);
            errorMessage({
                content: "An unexpected error occurred",
            });
        }
    };

    const onChange: InputNumberProps["onChange"] = (value) => {
        console.log("changed", value);
    };

    const modalContent = (
        <>
            <div className="flex">
                <div className="flex flex-col">
                    <div>
                        <span>Thông tin môn học</span>
                        <Input size="large" placeholder="Mã môn" />
                        <Input size="large" placeholder="Tên môn" />
                        <Input size="large" placeholder="Khoa" />
                        <InputNumber
                            min={1}
                            max={10}
                            value={courseCreateForm.course_credit}
                            onChange={onChange}
                        />
                        ;
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">Môn học</span>
                <AddModal
                    open={open}
                    setOpen={setOpen}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    buttonIcon={<Plus size={16} />}
                    buttonContent="Thêm môn học"
                    formTitle="Thêm môn"
                    submitButtonContent="Thêm môn mới"
                    modalContent={modalContent}
                />
            </div>
            <Table<ICourse> dataSource={courses} columns={columns} />
        </div>
    );
};

export default AdminCoursesPage;
