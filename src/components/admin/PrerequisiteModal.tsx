import { SearchOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { Table, Button, Input, Space, Modal, Popconfirm, message } from "antd";
import type { InputRef, TableColumnType } from "antd";

import { IApiResponse, IPrerequisite, ISubject,ListPrerequisiteResponse } from "@/types";
import Highlighter from "react-highlight-words";
import { Trash2 } from "lucide-react";

type DataIndex = keyof IPrerequisite;

const ListPrerequisite = ({
    icon,
    token,
    course,
    setReFetch,
}: {
    icon: React.ReactNode;
    token: string;
    course: ISubject;
    setReFetch?: (reFetch: boolean) => void;
}) => {
    const [subjects, setSubjects] = useState<IPrerequisite[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const fetchUsers = async () => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/subject/prerequisite?course_name=${course.course_name}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!res.ok) {
            messageApi.error("Lỗi lấy dữ liệu");
            return;
        }

        const response_fetch_prerequisite_data: IApiResponse<ListPrerequisiteResponse[]> = await res.json();

        const fetch_prerequisite = response_fetch_prerequisite_data.data.map(
            (subject: ListPrerequisiteResponse) => ({
                key: subject.prerequisite_id,
                prerequisite_id: subject.prerequisite_id,
                course_fullname: subject.course_fullname,
            })
        );
        messageApi.success("Lấy dữ liệu thành công");

        setSubjects(fetch_prerequisite);
        setLoading(false);
    };

    const handleDelete = async (subject: IPrerequisite) => {
        // console.log(course);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/subject/delete_prerequisite`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    course_id: course.course_name,
                    prerequisite_id: subject.prerequisite_id,
                }),
            }
        );

        console.log(res.ok);

        if (!res.ok) {
            messageApi.error("Xóa thất bại");
            return;
        }

        messageApi.success("Xóa thành công");
        setSubjects(subjects.filter((s) => s.prerequisite_id !== subject.prerequisite_id));
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
    ): TableColumnType<IPrerequisite> => ({
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
            title: "Môn tiên quyết",
            dataIndex: "prerequisite_id",
            key: "prerrequisite_id",

            ...getColumnSearchProps("prerequisite_id"),
        },
        {
            title: "Tên môn học",
            dataIndex: "course_fullname",
            key: "course_fullname",
            ...getColumnSearchProps("course_fullname"),
        },
        {
            title: "Action",
            key: "action",
            render: (text: string, record: IPrerequisite) => (
                <Popconfirm
                    title="Bạn có chắc chắn muốn xóa môn tiên quyết này không?"
                    onConfirm={() => handleDelete(record)}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button type="primary" danger>
                        <Trash2 size={16} />
                    </Button>
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
                <h1 className="text-center text-2xl font-bold">Danh sách môn tiên quyết</h1>
                <Table
                    columns={columns}
                    dataSource={subjects}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Modal>
        </div>
    );
};

export default ListPrerequisite;
