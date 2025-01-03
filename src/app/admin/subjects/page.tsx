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
    Modal,
    Form,
    Popconfirm,
    Select,
} from "antd";
import type { FormProps, InputRef, TableColumnType } from "antd";

import {
    CreatePrerequisiteFormValues,
    CreateSubjectFormValues,
    IApiResponse,
    // ICourseResponse,
    ISubject,
    ListSubjectResponse,
} from "@/types";
import Highlighter from "react-highlight-words";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";
import { ArrowDownWideNarrow, NotebookText, PenLine, Trash2 } from "lucide-react";
import ListPrerequisite from "@/components/admin/PrerequisiteModal";

type DataIndex = keyof ISubject;

const AdminCoursesPage = () => {
    const { refreshToken: token } = useAuth();
    const [form] = Form.useForm();
    const [loadingPage, setLoadingPage] = useState(true);
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [subjectsOptions, setSubjectsOptions] = useState<
    {
        value: string;
        label: string;
    }[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [reFetch, setReFetch] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState<boolean>(false);
    const [isPrequisiteModalOpen, setIsPrequisiteModalOpen] = useState<boolean>(false);
    const [subject, setSubject] = useState<ISubject>({
        course_name: "",
        course_fullname: "",
        department_code: "",
    });
 

    const resetCreateCourseForm = () => {
        form.resetFields();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    response_fetch_subjects,

                ] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subject/list`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    })
           
                ]);
                if (!response_fetch_subjects.ok) {
                    message.error("Failed to fetch courses");
                }
    
   
                const response_fetch_subjects_data: IApiResponse<ListSubjectResponse[]> = await response_fetch_subjects.json();

                const fetch_subjects = response_fetch_subjects_data.data.map(
                    (subject) => ({
                        course_name: subject.course_name,
                        course_fullname: subject.course_fullname,
                        department_code: subject.department_code,
                    })
                );

            
                messageApi.success({
                    content: "Lấy thông tin thành công.",
                    duration: 1,
                });
                setSubjectsOptions(fetch_subjects.map((subject) => ({
                    value: subject.course_fullname,
                    label: subject.course_name,
                })));
                setSubjects(fetch_subjects);
            } catch (error) {
                console.error("Failed to fetch courses: ", error);
                // message.error("Failed to fetch courses");
                message.error("Failed to fetch courses");
            } finally {
                setLoadingPage(false);
            }
        };
        if (token) {
            fetchData();
            setReFetch(false);
        }
    }, [token, messageApi, reFetch]);

    useEffect(() => {
        form.setFieldsValue({
        course_id: subject?.course_name || "", 
        });
    }, [subject, form]);

    const handleDeleteSubject = async (course_name: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/subject/delete?course_name=${course_name}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                message.error("Failed to delete subject");
            }

            messageApi.success({
                content: "Xóa môn học thành công.",
                duration: 1,
            });

            setReFetch(true);
        } catch (error) {
            console.error("Failed to delete subject: ", error);
            message.error("Failed to delete subject");
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
    ): TableColumnType<ISubject> => ({
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
            title: "Khoa",
            dataIndex: "department_code",
            key: "department_code",
            ...getColumnSearchProps("department_code"),
            render: (text: string) => (
                text ? (
                    <span className="text-blue-300 font-semibold">{text}</span>
                ) : (
                    <span className="text-red-300 font-semibold">Chưa cập nhật</span>
                )
            ),
        },
        {
            title: "Action",
            key: "action",
            render: (text:string, record: ISubject) => (
                <Space size="middle">
                    <div className="flex gap-4">
                        <div className="cursor-pointer">
                            <Popconfirm
                                title="Xác nhận xóa ?"
                                onConfirm={() => {
                                    handleDeleteSubject(record.course_name);
                                }}
                            >
                                <Trash2 size={16} color="red" />
                            </Popconfirm>
                        </div>
                        <div className="cursor-pointer">
                            <ArrowDownWideNarrow
                                size={16}
                                 onClick={() => {
                                    setSubject(record);
                                    setIsPrequisiteModalOpen(true);
                                }}
                            />
                        </div>
                        <div className="cursor-pointer">
                            <ListPrerequisite
                                icon = {<NotebookText size={16}/>}
                                token = {token}
                                course = {record}
                                setReFetch={setReFetch}
                            />
                        </div>
                        <div className="cursor-pointer">
                            <PenLine
                                size={16}
                                onClick={() => {
                                    form.setFieldsValue({
                                        course_name: record.course_name,
                                        course_fullname: record.course_fullname,
                                        department_code: record.department_code,
                                    });
                                    setIsUpdateOpen(true);
                                }}
                            />
                        </div>
                    </div>
                </Space>
            ),
        }
    ];

    if (loadingPage) {
        return <Loading />;
    }

    const handleCreateSubject: FormProps["onFinish"] = async (
        values: CreateSubjectFormValues
    ) => {
        try {
            const { course_fullname	, course_name } = values;
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subject/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(
                    {
                        course_fullname,
                        course_name,
                    }
                ),
            });

            if (!response.ok) {
                message.error("Failed to create subject");
            }

            // const response_data: IApiResponse<ICourseResponse> = await response.json();

            messageApi.success({
                content: "Tạo môn học thành công.",
                duration: 1,
            });

            setReFetch(true);
            setIsOpen(false);
            setIsUpdateOpen(false);
            resetCreateCourseForm();
        } catch (error) {
            console.error("Failed to create subject: ", error);
            message.error("Failed to create subject");
        }
    }

    const SubjectCreateModal = () => {
        return (
            <Modal
                title="Tạo môn học"
                open={isOpen}
                onCancel={() => {
                    setIsOpen(false);
                    resetCreateCourseForm();
                }}
                onOk={
                   form.submit
                }
                okText="Tạo"
                cancelText="Hủy"
            >
                    <div className="p-4">
                        <div className="mb-4">
                            
                            <Form
                                name="basic"
                                onFinish={handleCreateSubject}
                                form={form}
                                autoComplete="off"
                                >
                                <>
                                <Form.Item
                                    label="Mã môn"
                                    name="course_name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Mã môn không được để trống",
                                        },
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>

                                <Form.Item
                                    label="Tên môn"
                                    name="course_fullname"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Tên môn không được để trống",
                                        },
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                                </>
                            </Form>
                        </div>
                    </div>
            </Modal>    
        )};

    const SubjectUpdateModal = () => {
        return (
            <Modal
                title="Cập nhật môn học"
                open={isUpdateOpen}
                onCancel={() => {
                    setIsUpdateOpen(false);
                    resetCreateCourseForm();
                }}
                onOk={
                   form.submit
                }
                okText="Tạo"
                cancelText="Hủy"
            >
                    <div className="p-4">
                        <div className="mb-4">
                            
                            <Form
                                name="basic"
                                onFinish={handleCreateSubject}
                                form={form}
                                autoComplete="off"
                                >
                                <>
                                <Form.Item
                                    label="Mã môn"
                                    name="course_name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Mã môn không được để trống",
                                        },
                                    ]}
                                >
                                    <Input disabled/>
                                </Form.Item>

                                <Form.Item
                                    label="Tên môn"
                                    name="course_fullname"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Tên môn không được để trống",
                                        },
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                                </>
                            </Form>
                        </div>
                    </div>
            </Modal>    
        )};

    const PrequisiteModal = () => {
        return (
            <Modal
                title="Thêm môn học tiên quyết"
                open={isPrequisiteModalOpen}
                onCancel={() => {
                    setIsPrequisiteModalOpen(false);
                }}
                onOk={
                    form.submit
                }
                okText="Tạo"
                cancelText="Hủy"
            >
                    <div className="p-4">
                        <div className="mb-4">
                            
                            <Form
                                name="basic"
                                onFinish={handleAddPrequisite}
                                form={form}
                                autoComplete="off"
                                >
                                <>
                                <Form.Item
                                    label="Mã môn"
                                    name="course_id"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Mã môn không được để trống",
                                        },
                                    ]}
                                >
                                    <Input
                                        disabled
                                        placeholder="Chọn môn"
                                        defaultValue={subject.course_name}
                                        value={subject.course_name}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Mã môn tiên quyết"
                                    name="prerequisite_id"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Tên môn không được để trống",
                                        },
                                    ]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Chọn môn"
                                        optionFilterProp="label"
                                        options={subjectsOptions}
                                    />
                                </Form.Item>
                                </>
                            </Form>
                        </div>
                    </div>
            </Modal>    
        )};

    const handleAddPrequisite = async (
        values: CreatePrerequisiteFormValues
    ) => {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/subject/add_prerequisite`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    course_id: subject.course_name,
                    prerequisite_id: subjectsOptions.find(
                        (subject) => subject.value === values.prerequisite_id
                    )?.label
                }),
            }
        );
        // console.log(response.ok);
        const data = await response.json();

        if (response.ok) {
            messageApi.success("Added prerequisite successfully");
        } else {
            messageApi.error(data.message || "Lỗi không xác định");
        }
    };

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            {contextHolder}
            <div className="p-4">
                <h1 className="text-2xl font-semibold text-center">
                    Danh sách môn học
                </h1>
                <div className="flex justify-end">
                    <Button
                        type="primary"
                        onClick={() => setIsOpen(true)}
                    >
                        Tạo môn học
                    </Button>
                </div>
            </div>

            <SubjectCreateModal />
            <PrequisiteModal />
            <SubjectUpdateModal />
     
            <Table<ISubject>
                columns={columns}
                dataSource={subjects}
                rowKey={(record) => record.course_name}
                pagination={{ pageSize: 10 }}
        
            />
        </div>
    );
};

export default ProtectedRoute(AdminCoursesPage);
