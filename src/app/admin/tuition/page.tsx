"use client";

import { DollarCircleOutlined, MoneyCollectTwoTone, SearchOutlined } from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space, Modal, DatePicker, Popconfirm, Form, InputNumber, Select, FormProps } from "antd";
import { InputRef, TableColumnType,  Divider } from "antd";

import {
    CalTuitionResponse,
    CreateTuitionFormValues,
    IApiResponse,
    ICourse,
    ITuition,
    ITuitionResponse,
    UpdateTuitionFormValues,
} from "@/types";
import Highlighter from "react-highlight-words";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";
import PayTuitionModal from "@/components/admin/TuitionModal";
import TypedInputNumber from "antd/es/input-number";
import { Info, PenLine, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import TuitionModal from "@/components/user/TuitionModal";

type DataIndex = keyof ITuition;

const TuitionPage = () => {
    const { refreshToken: token } = useAuth();
    const [form] = Form.useForm();
    const [loadingPage, setLoadingPage] = useState(true);
    const [tuitions, setTuitions] = useState<ITuition[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [createTuitionForm, setCreateTuitionForm] = useState<CreateTuitionFormValues>({
        year: new Date().getFullYear(),
        semester: 1,
        deadline: "",
    });
    const tuitionOptions = [
        {
            label: "Chưa đóng",
            value: "unpaid",
        },
        {
            label: "Đã đóng",
            value: "paid",
        },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [tuition, setTuition] = useState<number>(0);

    const fetchTuitions = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/list`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data: IApiResponse<ITuitionResponse[]> =
                await response.json();
            if (response.ok) {
                console.log(data.data);
                const fetch_tuitions = data.data.map((tuition) => ({
                    key: tuition.ID,
                    id: tuition.ID,
                    year: tuition.Year,
                    semester: tuition.Semester,
                    userID: tuition.UserID,
                    tuition: tuition.Tuition,
                    paid: tuition.Paid,
                    tuitionStatus: tuition.TuitionStatus,
                    tuitionDeadline: tuition.TuitionDeadline,
                    totalCredit: tuition.TotalCredit,
                    username: tuition.Username,
                }));
                messageApi.success({
                    content: "Lấy danh sách học phí thành công",
                    duration: 1,
                });
                setTuitions(fetch_tuitions);
            } else {
                message.error("Lấy danh sách học phí không thành công");
            }
        } catch (error) {
            console.error("Failed to fetch tuitions", error);
            message.error("Lấy danh sách học phí không thành công");
        } finally {
            setLoadingPage(false);
        }
    };
    useEffect(() => {
        fetchTuitions();
    }, [messageApi, token]);

    const fetchGetTuition = async (tuition: ITuition) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/get_tuition`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        semester: tuition.semester,
                        year: tuition.year,
                        user_id: tuition.userID,
                    }),
                }
            );
            const data: IApiResponse<CalTuitionResponse> = await response.json();
            if (response.ok) {
                messageApi.success({
                    content: "Lấy thông tin học phí thành công",
                    duration: 1,
                });
            } else {
                message.error("Lấy thông tin học phí thành công");
            }
            // setIsModalOpen(false);
            setCourses(data.data.courses.map((course) => ({
                       key: course.id,
                        course_id: course.id,
                        course_name: course.course_name,
                        course_teacher_id: course.course_teacher_id,
                        course_fullname: course.course_fullname,
                        course_room: course.course_room,
                        course_day: course.course_day,
                        course_time: `${course.course_start_shift}-${course.course_end_shift}`,
                        course_size: `${course.current_enroll}/${course.max_enroll}`,
                        course_department: course.course_department,
                        course_year: course.course_year,
                        course_semester: course.course_semester,
                        course_credit: course.course_credit,
                    })));
            setTuition(data.data.tuition);
            setIsTuitionModalOpen(true);
        } catch (error) {
            console.error("Failed to create tuition", error);
            message.error("Lấy thông tin học phí không thành công");
        }
    }

//     {
//   "deadline": "string",
//   "semester": 0,
//   "year": 0
// }
    const fetchCreateTuition = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/create_tuition`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(createTuitionForm),
                }
            );
            const data: IApiResponse<ITuitionResponse> = await response.json();
            if (response.ok) {
                messageApi.success({
                    content: "Tạo học phí thành công",
                    duration: 1,
                });
                fetchTuitions();
            } else {
                message.error("Tạo học phí không thành công: " + data.message);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create tuition", error);
            message.error("Tạo học phí không thành công");
        }
    };

    const fetchDeleteTuition = async (tuitionID: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/delete?id=${tuitionID}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data: IApiResponse<ITuitionResponse> = await response.json();
            if (response.ok) {
                messageApi.success({
                    content: "Xóa học phí thành công",
                    duration: 1,
                });
                setTuitions(tuitions.filter((tuition) => tuition.id !== tuitionID));
            } else {
                message.error("Xóa học phí không thành công: " + data.message);
            }
        } catch (error) {
            console.error("Failed to delete tuition", error);
            message.error("Xóa học phí không thành công");
        }
    }

    const handleUpdateTuition: FormProps["onFinish"] = async (
        values: UpdateTuitionFormValues
    ) => {
        try {
            console.log(values);
            const {deadline, tuition, paid, tuition_status, id} = values;
            console.log(deadline, tuition, paid, tuition_status, id);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/update_tuition`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(
                        {
                            deadline: deadline,
                            tuition: tuition,
                            paid: paid,
                            tuition_status: tuition_status,
                            id: id,
                        }
                    ),
                }
            );
            const data: IApiResponse<ITuitionResponse> = await response.json();
            if (response.ok) {
                messageApi.success({
                    content: "Cập nhật học phí thành công",
                    duration: 1,
                });
                setIsUpdateModalOpen(false);
                fetchTuitions();
            } else {
                message.error("Cập nhật học phí không thành công: " + data.message);
            }
        } catch (error) {
            console.error("Failed to update tuition", error);
            message.error("Cập nhật học phí không thành công");
        }
    }


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
    ): TableColumnType<ITuition> => ({
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
    const formattedAmount = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    })
    const modify = (value: string) => (
        // return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );    
    


    const columns = [
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            ...getColumnSearchProps("username"),
        },
        {
            title: "Học phí",
            dataIndex: "tuition",
            key: "tuition",
            ...getColumnSearchProps("tuition"),
            render: (text: number) => (
                <div>
                    {modify(formattedAmount.format(text))}
                </div>
            ),
        },
        {
            title: "Đã đóng",
            dataIndex: "paid",
            key: "paid",
            ...getColumnSearchProps("paid"),
            render: (text: number) => (
                <div>
                    {modify(formattedAmount.format(text))}
                </div>
            ),
        },
        {
            title: "Năm học",
            dataIndex: "year",
            key: "year",
            ...getColumnSearchProps("year"),
        },
        {
            title: "Học kỳ",
            dataIndex: "semester",
            key: "semester",
            ...getColumnSearchProps("semester"),
        },
        {
            title: "Trạng thái",
            dataIndex: "tuitionStatus",
            key: "tuitionStatus",
            ...getColumnSearchProps("tuitionStatus"),

        },
        {
            title: "Thao tác",
            key: "action",
            render: (text: string, record: ITuition) => (
                <Space size="large">
                    <div className="flex gap-4">
                        <div className="cursor-pointer">
                            <PayTuitionModal
                                icon={<DollarCircleOutlined size={16} />}
                                tuition={record}
                                allTuition={tuitions}
                                setTuitions={setTuitions}
                                token={token as string}
                            />
                        </div>
                        <div className="cursor-pointer">
                            <Popconfirm
                                title="Bạn có chắc muốn xóa học phí này?"
                                onConfirm={() => fetchDeleteTuition(record.id)}
                                okText="Có"
                                cancelText="Không"
                            > 
                                <Trash2 size={16} color={"red"}/>
                            </Popconfirm>
                        </div>
                        <div className="cursor-pointer">
                            <PenLine
                                size={16}
                                onClick={() => {
                                    setIsUpdateModalOpen(true);
                                    form.setFieldsValue({
                                        deadline: dayjs(record.tuitionDeadline, "YYYY-MM-DD"),
                                        tuition: record.tuition,
                                        tuition_status: record.tuitionStatus,
                                        paid: record.paid,
                                        id: record.id,
                                    });
                                }} 
                            />
                        </div>
                        <div className="cursor-pointer">
                            <Info
                                size={16}
                                onClick={() => {
                                    fetchGetTuition(record);
                                    setIsTuitionModalOpen(true);
                                }} 
                            />
                        </div>
                    </div>
                </Space>
            ),
        },
    ];

    const formItems = (
        <>
            <Form.Item
                label="ID"
                name="id"
                hidden
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Deadline"
                name="deadline"
                rules={[{ required: true, message: "Nhập deadline" }]}
            >
                <DatePicker placeholder="Deadline" />
            </Form.Item>
            <Form.Item
                label="Học phí"
                name="tuition"
                rules={[{ required: true, message: "Nhập học phí" }]}
            >
                <InputNumber 
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    addonAfter="₫"
                />
            </Form.Item>
            <Form.Item
                label="Trạng thái"
                name="tuition_status"
                rules={[{ required: true, message: "Nhập trạng thái" }]}
            >
                <Select
                    placeholder="Chọn trạng thái"
                    options={tuitionOptions}
                    onChange={(value) => {
                        if (value === "paid") {
                            form.setFieldsValue({
                                paid: form.getFieldValue("tuition"),
                            });
                        } else if (value === "unpaid") {
                            form.setFieldsValue({
                                paid: 0,
                            });
                        }
                    }}
                />
            </Form.Item>
            <Form.Item
                label="Đã đóng"
                name="paid"
                rules={[{ required: true, message: "Nhập số tiền đã đóng" }]}
            >
                <InputNumber 
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                    addonAfter="₫"
                />
            </Form.Item>
        </>
    )

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="w-[90%] border shadow-sm rounded-lg mx-auto">
            <div>
                {contextHolder}
                <div className="flex justify-between items-center p-4">
                    <h1 className="text-2xl font-semibold">Quản lý học phí</h1>
                    <Button
                        type="primary"
                        icon={<MoneyCollectTwoTone />}
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                    >
                        Tạo học phí
                    </Button>
                </div>
                <Modal
                    title={null}
                    open={isModalOpen}
                    onOk={() => fetchCreateTuition()}
                    onCancel={() => setIsModalOpen(false)}
                >
                    <div className="p-4 grid grid-cols-1">
                        <span className="flex text-blue-400 font-semibold text-lg justify-center">
                            Tạo học phí
                        </span>                
                        <Divider />    
                        <label className="text-red-500 font-semibold">
                            Năm học:
                        </label>
                        <TypedInputNumber
                            required
                            size="middle"
                            placeholder="Năm học"
                            min={2022}
                            value={createTuitionForm.year}
                            onChange={(e) =>
                                setCreateTuitionForm({
                                    ...createTuitionForm,
                                    year: e as number,
                                })
                            }
                            style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
                        />
                        <label className="text-red-500 font-semibold">
                            Học kỳ:
                        </label>
                        <TypedInputNumber
                            required
                            size="middle"
                            placeholder="Học kỳ"
                            min={1}
                            max={3}
                            value={createTuitionForm.semester}
                            onChange={(e) =>
                                setCreateTuitionForm({
                                    ...createTuitionForm,
                                    semester: e as number,
                                })
                            }
                            style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
                        />
                        <label className="text-red-500 font-semibold">
                            Deadline:
                        </label>
                        <DatePicker
                            required
                            placeholder="Deadline"
                            value={createTuitionForm.deadline}
                            onChange={(date) =>
                                setCreateTuitionForm({
                                    ...createTuitionForm,
                                    deadline: date as string,
                                })
                            }
                            style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
                        />
                    </div>
                </Modal>
            </div>

            <Modal 
                title="Chỉnh sửa học phí"
                open={isUpdateModalOpen}
                onOk={form.submit} 
                onCancel={() => setIsUpdateModalOpen(false)}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="createTuition"
                    onFinish={handleUpdateTuition}
                >
                    {formItems}
                </Form>
            </Modal>

            <TuitionModal
                isModalOpen={isTuitionModalOpen}
                setIsModalOpen={setIsTuitionModalOpen}
                courses={courses}
                tuition={tuition}
            />

            <Table<ITuition> 
            columns={columns} 
            dataSource={tuitions} 
            expandable={{
                    expandRowByClick: true,
                    expandedRowRender: (record) => {
                        return (
                            <div className="ml-10">
                                <div>
                                    <div>
                                        <strong>Tín chỉ: &nbsp;</strong>
                                        {record.totalCredit}
                                    </div>
                                    <div>
                                        <strong>Deadline: &nbsp;</strong>
                                        {record.tuitionDeadline}
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

export default ProtectedRoute(TuitionPage);
