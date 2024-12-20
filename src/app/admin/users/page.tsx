"use client";

import { SearchOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space, Form, InputNumber, Select } from "antd";
import type { InputRef, TableColumnType, FormProps } from "antd";

import {
    IApiResponse,
    IListUserResponse,
    ISignUpResponse,
    UserRoles,
    ISignUpFormValues,
    IUser,
} from "@/types";
import Highlighter from "react-highlight-words";
import AddModal from "@/components/admin/AddModal";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";

type DataIndex = keyof IUser;

const AdminUserPage = () => {
    const { refreshToken: token } = useAuth();
    const [loadingPage, setLoadingPage] = useState(true);
    const [users, setUsers] = useState<IUser[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/user/list`,
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
                    const fetch_users = data.data.map((teacher) => ({
                        key: teacher.id,
                        id: teacher.id,
                        username: teacher.username,
                        email: teacher.email,
                        userFullname: teacher.user_fullname,
                        year: teacher.year,
                        userRole: teacher.user_role,
                        createdAt: "", 
                        updatedAt: "",
                    }));
                    messageApi.success({
                        content: "Lấy danh sách người dùng thành công",
                        duration: 1,
                    });
                    setUsers(fetch_users);
                } else {
                    message.error("Lấy danh sách người dùng không thành công");
                }
            } catch (error) {
                console.error("Failed to fetch users: ", error);
                message.error("Lấy danh sách người dùng không thành công");
            } finally {
                setLoadingPage(false);
            }
        };
        fetchTeachers();
    }, [messageApi, token]);

    const fetchUpdateRole = async (record: IUser, role: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/update`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id: record.id,
                        user_role: role,
                        user_fullname: record.userFullname,
                        year: record.year,
                    }),
                }
            );
            // const data: IApiResponse<IListUserResponse[]> = await response.json();
            if (response.ok) {
                messageApi.success({
                    content: "Cập nhật quyền người dùng thành công",
                    duration: 1,
                });
            } else {
                message.error("Cập nhật quyền người dùng không thành công");
            }
        } catch (error) {
            console.error("Failed to update user role: ", error);
            message.error("Cập nhật quyền người dùng không thành công");
        }
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
    ): TableColumnType<IUser> => ({
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

    const getColumnSearchSelectProps = (
        dataIndex: DataIndex
    ): TableColumnType<IUser> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
        }) => (
        
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Select
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(value) => {
                        setSelectedKeys(value ? [value] : []);
                        handleSearch(
                            selectedKeys as string[],
                            confirm,
                            dataIndex
                        )}
                    }
                    style={{ marginBottom: 8, display: "block" }}
                >
                    <Select.Option value={UserRoles.Lecturer}>Giảng viên</Select.Option>
                    <Select.Option value={UserRoles.User}>Sinh viên</Select.Option>
                    <Select.Option value={UserRoles.Admin}>Admin</Select.Option>
                    <Select.Option value="">All</Select.Option>
                </Select>
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
            dataIndex: "userFullname",
            key: "userFullname",
            ...getColumnSearchProps("userFullname"),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
        },
        {
            title: "Quyền",
            dataIndex: "userRole",
            key: "userRole",
            ...getColumnSearchSelectProps("userRole"),
            render: (text: string, record: IUser) => (
                <Select
                    defaultValue={text}
                    style={{ width: 120 }}
                    onChange={(value) => fetchUpdateRole(
                        users.find((user) => user.id === record.id) as IUser,
                        value as string
                    )}
                    options={[
                        { label: "Giảng viên", value: UserRoles.Lecturer },
                        { label: "Sinh viên", value: UserRoles.User },
                        { label: "Admin", value: UserRoles.Admin },
                    ]}
                />
            ),
        },
        {
            title: "Năm sinh",
            dataIndex: "year",
            key: "year",
        },
        // {
        //     title: "Thao tác",
        //     key: "action",
        //     render: (text: string, record: ITeacher) => (
        //         <Space size="large">
        //             <div className="cursor-pointer">
        //                 <EditTeacherModal
        //                     icon={<PenLine size={16} />}
        //                     teacher={record}
        //                     allTeachers={users}
        //                     setUsers={setUsers}
        //                     token={token as string}
        //                 />
        //             </div>
        //         </Space>
        //     ),
        // },
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
        values: ISignUpFormValues
    ) => {
        const {
            username,
            email,
            password,
            retypePassword,
            user_fullname,
            year,
            user_role,
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
                        user_role: user_role,
                        user_email: email,

                    }),
                }
            );

            const data: IApiResponse<ISignUpResponse> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Đăng ký giảng viên ${data.data.username} thành công!`,
                    duration: 1,
                });

                setOpen(false);
                setUsers((prev) => [
                    ...prev,
                    {
                        key: data.data.username,
                        id: data.data.id,
                        username: data.data.username,
                        email: email,
                        userFullname: user_fullname,
                        userRole: user_role,
                        year: year,
                        createdAt: "",
                        updatedAt: "",
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

            <Form.Item
                label="Quyền"
                name="user_role"
                initialValue={UserRoles.Lecturer}
                rules={[
                    {
                        required: true,
                        message: "Please input your role!",
                    },
                ]}
            >
                <Select>
                    <Select.Option value={UserRoles.Lecturer}>
                        Giảng viên
                    </Select.Option>
                    <Select.Option value={UserRoles.User}>Sinh viên</Select.Option>
                    <Select.Option value={UserRoles.Admin}>Admin</Select.Option>
                </Select>
            </Form.Item>
        </>
    );

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">
                    Người dùng
                </span>
                <AddModal
                    open={open}
                    setOpen={setOpen}
                    onFinish={onFinish}
                    form={form}
                    onFinishFailed={onFinishFailed}
                    buttonIcon={<Plus size={16} />}
                    buttonContent="Thêm người dùng"
                    formTitle="Thêm người dùng mới"
                    formItems={formItems}
                    submitButtonContent="Đăng ký người dùng"
                />
            </div>
            <Table<IUser> dataSource={users} columns={columns} />
        </div>
    );
};

export default ProtectedRoute(AdminUserPage);