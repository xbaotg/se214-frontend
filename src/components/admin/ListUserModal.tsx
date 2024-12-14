import { SearchOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { Table, Button, Input, Space, Modal, Popconfirm, message } from "antd";
import type { InputRef, TableColumnType } from "antd";

import { IApiResponse, ICourse, IUser, IUserResponse } from "@/types";
import Highlighter from "react-highlight-words";
import { Trash2 } from "lucide-react";

type DataIndex = keyof IUser;

const ListUserModal = ({
    icon,
    token,
    course,
    setReFetch,
}: {
    icon: React.ReactNode;
    token: string;
    course: ICourse;
    setReFetch?: (reFetch: boolean) => void;
}) => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const fetchUsers = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/lecturer/course/enroller/list?course_id=${course.course_id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            return;
        }

        const response_fetch_user_data: IApiResponse<IUserResponse[]> =
            await res.json();

        const fetch_user = response_fetch_user_data.data.map((user: IUserResponse) => (
            {
                id: user.id,
                username: user.username,
                userFullname: user.user_fullname,
                email: user.email,
                year: user.year,
                userRole: user.user_role,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            }
        ));
        console.log(fetch_user);
        setUsers(fetch_user);
        setLoading(false);
    };

    const handleDelete = async (user: IUser) => {
        // console.log(course);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user/course/unregister_admin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_id: user.id,
                    course_id: course.course_id,
                    course_year: course.course_year,
                    course_semester: course.course_semester,
                }),
            }
        );

        console.log(res.ok);

        if (!res.ok) {
            messageApi.error("Xóa thất bại");
            return;
        }

        messageApi.success("Xóa thành công");
        if (setReFetch) {
            setReFetch(true);
        }
        setUsers(users.filter((u: IUser) => u.id !== user.id));
    }


    const handleOpenModel = () => {
        fetchUsers();
        setIsModelOpen(true);
    };

    const handleCloseModel = () => {
        setIsModelOpen(false);
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
            title: "Username",
            dataIndex: "username",
            key: "username",
            render: (text: string) => (
                <span className="text-blue-300 font-semibold">{text}</span>
            ),
            ...getColumnSearchProps("username"),
        },
        {
            title: "Họ và tên",
            dataIndex: "user_fullname",
            key: "user_fullname",
            ...getColumnSearchProps("userFullname"),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ...getColumnSearchProps("email"),
        },
        {
            title: "Action",
            key: "action",
            render: (text: string, record: IUser) => (
                <Popconfirm
                    title="Bạn có chắc muốn xóa?"
                    onConfirm={() => handleDelete(record)}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button
                        type="primary"
                        danger
                        icon={<Trash2 size={20} />}
                    />
                </Popconfirm>
            ),
        }
    ];

    if (!setReFetch) {
        columns.pop();
    }

    return (
        <div>
            {contextHolder}
            <div onClick={handleOpenModel}>{icon}</div>
            <Modal
                title={null}
                open={isModelOpen}
                onOk={handleCloseModel}
                onCancel={handleCloseModel}
            >
                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Modal>
        </div>
    );
};

export default ListUserModal;
