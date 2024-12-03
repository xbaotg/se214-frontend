"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space, Form } from "antd";
import type { InputRef, TableColumnType, FormProps } from "antd";
import { getCookie } from "cookies-next";

import { CreateDepartmentFormValues, IApiResponse, IDepartment } from "@/types";
import { useRouter } from "next/navigation";
import Highlighter from "react-highlight-words";
import AddModal from "@/components/admin/AddModal";
import { PenLine, Plus } from "lucide-react";
import EditModal from "@/components/admin/EditCourseModal";
import EditDepartmentModal from "@/components/admin/EditDepartmentModal";
import { formatDate } from "@/utils";

type DataIndex = keyof IDepartment;

const AdminDepartmentPage = () => {
    const router = useRouter();
    const token = getCookie("refresh_token");
    const [departments, setDepartments] = useState<IDepartment[]>([]);
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
        const fetchDepartments = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/department/list`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (response.ok) {
                    const data: IApiResponse<IDepartment[]> =
                        await response.json();

                    const fetch_departments = data.data.map((department) => ({
                        key: department.department_id,
                        department_id: department.department_id,
                        department_name: department.department_name,
                        department_code: department.department_code,
                        created_at: formatDate(department.created_at),
                        updated_at: formatDate(department.updated_at),
                    }));

                    setDepartments(fetch_departments);
                } else {
                    message.error("Failed to fetch departments");
                }
            } catch (error) {
                console.error("Failed to fetch departments: ", error);
                message.error("Failed to fetch departments");
            }
        };
        fetchDepartments();
    }, []);

    const updatedDepartments = (new_departments: IDepartment[]) => {
        setDepartments(new_departments);
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
    ): TableColumnType<IDepartment> => ({
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
            title: "Tên khoa",
            dataIndex: "department_name",
            key: "department_name",
            render: (text: string) => (
                <span className="text-blue-300 font-semibold">{text}</span>
            ),
            ...getColumnSearchProps("department_name"),
        },
        {
            title: "Mã khoa",
            dataIndex: "department_code",
            key: "department_code",
            ...getColumnSearchProps("department_code"),
        },
        {
            title: "Ngày tạo",
            dataIndex: "created_at",
            key: "created_at",
        },
        {
            title: "Ngày cập nhật",
            dataIndex: "updated_at",
            key: "updated_at",
        },
        {
            title: "Thao tác",
            key: "action",
            render: (text: string, record: IDepartment) => (
                <Space size="large">
                    <div className="cursor-pointer">
                        <EditDepartmentModal
                            icon={<PenLine size={16} />}
                            department={record}
                            setDepartments={updatedDepartments}
                            allDepartments={departments}
                            token={token as string}
                        />
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

    const onFinishFailed: FormProps["onFinishFailed"] = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    const onFinish: FormProps["onFinish"] = async (
        values: CreateDepartmentFormValues
    ) => {
        const { department_code, department_name } = values;

        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/department/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        department_code,
                        department_name,
                    }),
                }
            );

            const data: IApiResponse<IDepartment> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Department created successfully for ${data.data.department_name}`,
                    duration: 1,
                });

                setOpen(false);
                setDepartments((prev) => [
                    ...prev,
                    {
                        key: data.data.department_id,
                        department_id: data.data.department_id,
                        department_name: data.data.department_name,
                        department_code: data.data.department_code,
                        created_at: data.data.created_at,
                        updated_at: data.data.updated_at,
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
                label="Tên khoa"
                name="department_name"
                rules={[
                    {
                        required: true,
                        message: "Please input the department name!",
                    },
                ]}
            >
                <Input minLength={3} maxLength={100} />
            </Form.Item>
            <Form.Item
                label="Mã khoa"
                name="department_code"
                rules={[
                    {
                        required: true,
                        message: "Please input the department code!",
                    },
                ]}
            >
                <Input />
            </Form.Item>
        </>
    );

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="flex justify-around my-5">
                <span className="text-xl text-red-500 font-bold">Khoa</span>
                <AddModal
                    open={open}
                    form={form}
                    setOpen={setOpen}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    buttonIcon={<Plus size={16} />}
                    buttonContent="Thêm"
                    formTitle="Thêm khoa"
                    submitButtonContent="Thêm khoa mới"
                    formItems={formItems}
                />
            </div>
            <Table<IDepartment> dataSource={departments} columns={columns} />
        </div>
    );
};

export default AdminDepartmentPage;
