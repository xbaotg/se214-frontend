"use client";

import { SearchOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space, Form, InputNumber } from "antd";
import type { InputRef, TableColumnType, FormProps } from "antd";
import { getCookie } from "cookies-next";

import {
    IApiResponse,
    IListUserResponse,
    ITeacher,
    SignUpFormValues,
    SignUpResponse,
    UserRoles,
} from "@/types";
import { useRouter } from "next/navigation";
import Highlighter from "react-highlight-words";
import AddModal from "@/components/admin/AddModal";
import { Plus } from "lucide-react";

type DataIndex = keyof ITeacher;

const AdminTeacherPage = () => {
    const router = useRouter();
    const token = getCookie("refresh_token");
    const [teachers, setTeachers] = useState<ITeacher[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }
        const fetchTeachers = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/list?role=${UserRoles.Lecturer}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data: IApiResponse<IListUserResponse[]> =
                    await response.json();
                if (response.ok) {
                    const fetch_teachers = data.data.map((teacher) => ({
                        key: teacher.id,
                        id: teacher.id,
                        username: teacher.username,
                        email: teacher.email,
                        user_fullname: teacher.user_fullname,
                        year: teacher.year,
                    }));
                    setTeachers(fetch_teachers);
                } else {
                    message.error("Failed to fetch teachers");
                }
            } catch (error) {
                console.error("Failed to fetch teachers: ", error);
                message.error("Failed to fetch teachers");
            }
        };
        fetchTeachers();
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
    ): TableColumnType<ITeacher> => ({
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

        // @ts-expect-error - Not sure why antd is throwing an error here
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
            title: "Username",
            dataIndex: "username",
            key: "username",
            render: (text: string) => (
                <span className="text-blue-300 font-semibold">{text}</span>
            ),
            ...getColumnSearchProps("username"),
        },
        {
            title: "Họ tên",
            dataIndex: "user_fullname",
            key: "user_fullname",
            ...getColumnSearchProps("user_fullname"),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
        },
        {
            title: "Năm sinh",
            dataIndex: "year",
            key: "year",
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

    const onFinish: FormProps["onFinish"] = async (
        values: SignUpFormValues
    ) => {
        const {
            username,
            email,
            password,
            retypePassword,
            user_fullname,
            year,
        } = values;

        if (password !== retypePassword) {
            errorMessage({
                content: "Passwords do not match!",
            });
            return;
        }

        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        user_fullname: user_fullname,
                        year: year,
                        user_role: UserRoles.Lecturer,
                        user_email: email,
                    }),
                }
            );

            const data: IApiResponse<SignUpResponse> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Account created successfully for ${data.data.username}`,
                    duration: 1,
                });

                setOpen(false);
                setTeachers((prev) => [
                    ...prev,
                    {
                        key: data.data.username,
                        id: data.data.id,
                        username: data.data.username,
                        email: email,
                        user_fullname: user_fullname,
                        year: year,
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

    const formItems = (
        <>
            <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[
                    {
                        required: true,
                        message: "Please input your username!",
                    },
                ]}
            >
                <Input autoFocus />
            </Form.Item>

            <Form.Item
                label="Họ tên"
                name="user_fullname"
                rules={[
                    {
                        required: true,
                        message: "Please input your username!",
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Email"
                name="email"
                rules={[
                    {
                        required: true,
                        message: "Please input your email!",
                        type: "email",
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                    {
                        required: true,
                        message: "Please input your password!",
                    },
                    () => ({
                        validator(_, value) {
                            if (!value || value.length >= 6) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error(
                                    "Password must be at least 6 characters!"
                                )
                            );
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Nhập lại mật khẩu"
                name="retypePassword"
                dependencies={["password"]}
                rules={[
                    {
                        required: true,
                        message: "Please retype your password!",
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(
                                new Error("Passwords do not match!")
                            );
                        },
                    }),
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Year"
                name="year"
                rules={[
                    {
                        required: true,
                        message: "Please input your year!",
                    },
                ]}
            >
                <InputNumber max={new Date().getFullYear()} />
            </Form.Item>
        </>
    );

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">
                    Giảng viên
                </span>
                <AddModal
                    open={open}
                    setOpen={setOpen}
                    onFinish={onFinish}
                    form={form}
                    onFinishFailed={onFinishFailed}
                    buttonIcon={<Plus size={16} />}
                    buttonContent="Thêm giảng viên"
                    formTitle="Thêm giảng viên mới"
                    formItems={formItems}
                    submitButtonContent="Đăng ký giảng viên"
                />
            </div>
            <Table<ITeacher> dataSource={teachers} columns={columns} />
        </div>
    );
};

export default AdminTeacherPage;
