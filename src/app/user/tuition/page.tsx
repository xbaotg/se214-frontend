"use client";

import {
    DollarCircleOutlined,
    MoneyCollectTwoTone,
    SearchOutlined,
} from "@ant-design/icons";
import React, { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import { message, Table, Button, Input, Space, Modal } from "antd";
import { InputRef, TableColumnType, Divider } from "antd";

import {
    CalTuitionFormValues,
    CalTuitionResponse,
    IApiResponse,
    ICourse,
    ITuition,
    ITuitionResponse,
} from "@/types";
import Highlighter from "react-highlight-words";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";
import PayTuitionModal from "@/components/admin/TuitionModal";
import TuitionModal from "@/components/user/TuitionModal";
import { Info } from "lucide-react";

type DataIndex = keyof ITuition;

const TuitionPage = () => {
    const { refreshToken: token } = useAuth();
    const [loadingPage, setLoadingPage] = useState(true);
    const [tuitions, setTuitions] = useState<ITuition[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [tuition, setTuition] = useState<number>(0);
    const form: CalTuitionFormValues = {
        semester: 1,
        year: new Date().getFullYear(),
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTuitionModalOpen, setIsTuitionModalOpen] = useState(false);
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
                console.log(fetch_tuitions);
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
        if (token) {
            fetchTuitions();
        }
    }, [messageApi, token]);

    //     {
    //   "deadline": "string",
    //   "semester": 0,
    //   "year": 0
    // }
    const fetchCalTuition = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/cal_tuition`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        semester: form.semester,
                        year: form.year,
                    }),
                }
            );
            const data: IApiResponse<CalTuitionResponse> =
                await response.json();
            if (response.ok) {
                messageApi.success({
                    content: "Tạo học phí thành công",
                    duration: 1,
                });
            } else {
                message.error("Tạo học phí không thành công");
                return;
            }
            // setIsModalOpen(false);
            setCourses(
                data.data.courses.map((course) => ({
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
                }))
            );
            setTuition(data.data.tuition);
            setIsTuitionModalOpen(true);
        } catch (error) {
            console.error("Failed to create tuition", error);
            message.error("Tạo học phí không thành công");
        }
    };

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
            const data: IApiResponse<CalTuitionResponse> =
                await response.json();
            setTuition(data.data.tuition);
            if (response.ok) {
                messageApi.success({
                    content: "Lấy thông tin học phí thành công",
                    duration: 1,
                });
                setCourses(
                data.data.courses.map((course) => ({
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
            } else {
                message.error("Lấy thông tin học phí không thành công: " + data.message);
                setCourses([]);
            }
            // setIsModalOpen(false);
            
            setIsTuitionModalOpen(true);
        } catch (error) {
            console.error("Failed to create tuition", error);
            message.error("Lấy thông tin học phí không thành công");
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
    });
    const modify = (value: string) =>
        // return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

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
                <div>{modify(formattedAmount.format(text))}</div>
            ),
        },
        {
            title: "Đã đóng",
            dataIndex: "paid",
            key: "paid",
            ...getColumnSearchProps("paid"),
            render: (text: number) => (
                <div>{modify(formattedAmount.format(text))}</div>
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

    if (loadingPage) {
        return <Loading />;
    }

    return (
        <div className="w-[90%] max-w-7xl border shadow-sm rounded-lg mx-auto px-4 md:px-6">
            <div>
                {contextHolder}
                <div className="flex flex-col md:flex-row flex-wrap justify-between md:justify-around items-center my-5 gap-4">
                    <span className="text-lg md:text-xl text-red-500 font-bold text-center">
                        Quản lý học phí
                    </span>
                    <Button
                        type="primary"
                        icon={<MoneyCollectTwoTone />}
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                    >
                        Học phí hiện tại
                    </Button>
                </div>
                <TuitionModal
                    courses={courses}
                    tuition={tuition}
                    isModalOpen={isTuitionModalOpen}
                    setIsModalOpen={setIsTuitionModalOpen}
                />
                <Modal
                    title={null}
                    open={isModalOpen}
                    onOk={() => fetchCalTuition()}
                    onCancel={() => setIsModalOpen(false)}
                >
                    <div className="p-4">
                        <span className="flex text-blue-400 font-semibold text-lg justify-center">
                            Tính học phí
                        </span>
                        <Divider />
                        <label className="text-red-500 font-semibold">
                            Năm học:
                        </label>
                        <Input
                            size="middle"
                            placeholder="Năm học"
                            value={form.year}
                            style={{
                                marginBottom: "1rem",
                                marginTop: "0.5rem",
                            }}
                        />
                        <label className="text-red-500 font-semibold">
                            Học kỳ:
                        </label>
                        <Input
                            size="middle"
                            placeholder="Học kỳ"
                            value={form.semester}
                            style={{ marginTop: "0.5rem" }}
                        />
                    </div>
                </Modal>
            </div>

            <div className="overflow-x-auto">
                <Table<ITuition>
                    columns={columns}
                    dataSource={tuitions}
                    scroll={{ x: "max-content", y: 55 * 10 }}
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
        </div>
    );
};

export default ProtectedRoute(TuitionPage);
