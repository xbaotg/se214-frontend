"use client";

import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import type { FilterDropdownProps } from "antd/es/table/interface";
import {
    Divider,
    message,
    Table,
    Button,
    Form,
    Input,
    Space,
    InputNumber,
    Select,
    Popconfirm,
} from "antd";
import type { InputRef, FormProps, TableColumnType } from "antd";

import {
    CreateCourseFormValues,
    IApiResponse,
    ICourse,
    ICourseResponse,
    ITeacher,
    IDepartment,
    UserRoles,
    ListSubjectResponse,
} from "@/types";
import Highlighter from "react-highlight-words";
import AddModal from "@/components/admin/AddModal";
import { Plus, Trash2, PenLine } from "lucide-react";
import { dayOptions, lessionOptions, semesterOptions } from "@/constants";
import { generatePeriodString } from "@/utils";
import EditCourseModal from "@/components/admin/EditCourseModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/auth";
import Loading from "@/components/Loading";

type DataIndex = keyof ICourse;

const LecturerCoursesPage = () => {
    const { refreshToken: token } = useAuth();
    const [form] = Form.useForm();
    const [loadingPage, setLoadingPage] = useState(true);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [messageApi, contextHolder] = message.useMessage();
    const [open, setOpen] = useState<boolean>(false);
    const [teacherOptions, setTeacherOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);

    const [departmentOptions, setDepartmentOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);

    const [courseOptions, setCourseOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);

    const updatedCourses = (courses: ICourse[]) => {
        setCourses(courses);
    };

    const [courseCreateForm, setCourseCreateForm] =
        useState<CreateCourseFormValues>({
            // course_code: "",
            course_id: "",
            course_teacher_id: null,
            course_department: null,
            course_name: null,
            course_fullname: "",
            course_credit: null,
            course_year: new Date().getFullYear(),
            course_semester: null,
            course_start_shift: null,
            course_end_shift: null,
            course_day: null,
            max_enroll: null,
            current_enroll: 0,
            course_room: "",
        });

    const resetCreateCourseForm = () => {
        setCourseCreateForm({
            // course_code: "",
            course_id: "",
            course_teacher_id: null,
            course_department: null,
            course_name: null,
            course_fullname: "",
            course_credit: null,
            course_year: new Date().getFullYear(),
            course_semester: null,
            course_start_shift: null,
            course_end_shift: null,
            course_day: null,
            max_enroll: null,
            current_enroll: 0,
            course_room: "",
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    response_fetch_courses,
                    response_fetch_teachers,
                    response_fetch_dapartments,
                    response_fetch_subjects,
                ] = await Promise.all([
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/lecturer/course/register/list`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/user/list?role=${UserRoles.Lecturer}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
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
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/subject/list`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);
                if (!response_fetch_courses.ok) {
                    message.error("Failed to fetch courses");
                }
                if (!response_fetch_teachers.ok) {
                    message.error("Failed to fetch teachers");
                }
                if (!response_fetch_dapartments.ok) {
                    message.error("Failed to fetch departments");
                }
                if (!response_fetch_subjects.ok) {
                    message.error("Failed to fetch subjects");
                }
                const response_fetch_courses_data: IApiResponse<
                    ICourseResponse[]
                > = await response_fetch_courses.json();

                const fetch_courses = response_fetch_courses_data.data.map(
                    (course) => ({
                        key: course.id,
                        course_code: course.course_code,
                        course_id: course.id,
                        course_name: course.course_name,
                        course_fullname: course.course_fullname,
                        course_room: course.course_room,
                        course_day: course.course_day,
                        course_time: generatePeriodString(
                            course.course_start_shift,
                            course.course_end_shift
                        ),
                        course_size: `${course.current_enroll}/${course.max_enroll}`,
                        course_teacher_id: course.course_teacher_id,
                        course_department: course.course_department,
                        max_enroll: course.max_enroll,
                        current_enroll: course.current_enroll,
                        course_start_shift: course.course_start_shift,
                        course_end_shift: course.course_end_shift,
                    })
                );

                const response_fetch_teachers_data: IApiResponse<ITeacher[]> =
                    await response_fetch_teachers.json();

                const fetch_teachers = response_fetch_teachers_data.data.map(
                    (teacher) => ({
                        value: teacher.id,
                        label: teacher.user_fullname,
                    })
                );

                const response_fetch_departments_data: IApiResponse<
                    IDepartment[]
                > = await response_fetch_dapartments.json();

                const fetch_departments =
                    response_fetch_departments_data.data.map((department) => ({
                        value: department.department_id,
                        label: department.department_name,
                    }));
                const response_fetch_subjects_data: IApiResponse<
                    ListSubjectResponse[]
                > = await response_fetch_subjects.json();

                const fetch_subjects = response_fetch_subjects_data.data.map(
                    (subject) => ({
                        value: subject.course_fullname,
                        label: subject.course_name,
                    })
                );

                messageApi.success({
                    content: "Lấy thông tin thành công.",
                    duration: 1,
                });
                setCourseOptions(fetch_subjects);
                setTeacherOptions(fetch_teachers);
                setDepartmentOptions(fetch_departments);
                setCourses(fetch_courses);
            } catch (error) {
                console.error("Failed to fetch courses: ", error);
                message.error("Failed to fetch courses");
            } finally {
                setLoadingPage(false);
            }
        };
        fetchData();
    }, [token, messageApi]);

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
        {
            title: "Thao tác",
            key: "action",
            // @ts-expect-error - Temporary fix
            render: (_, record: ICourse) => (
                <Space size="large">
                    <div className="flex gap-4">
                        <div className="cursor-pointer">
                            <Popconfirm
                                title="Xác nhận xóa ?"
                                onConfirm={() => {
                                    handleDeleteCourse(record.course_id);
                                }}
                            >
                                <Trash2 size={16} color="red" />
                            </Popconfirm>
                        </div>
                        <div className="cursor-pointer">
                            <EditCourseModal
                                icon={<PenLine size={16} />}
                                course={record}
                                allCourses={courses}
                                setCourses={updatedCourses}
                                departmentOptions={departmentOptions}
                                teacherOptions={teacherOptions}
                                lessionOptions={lessionOptions}
                                semesterOptions={semesterOptions}
                                courseOptions={courseOptions}
                                token={token as string}
                            />
                        </div>
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

    const onFinish = async () => {
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
        } = courseCreateForm;

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

                setCourseCreateForm({
                    // course_code: "",
                    course_id: "",
                    course_teacher_id: "",
                    course_department: "",
                    course_name: "",
                    course_fullname: "",
                    course_credit: 0,
                    course_year: new Date().getFullYear(),
                    course_semester: 0,
                    course_start_shift: 0,
                    course_end_shift: 0,
                    course_day: "",
                    max_enroll: 0,
                    current_enroll: 0,
                    course_room: "",
                });

                setOpen(false);
                setCourses((prev) => [
                    ...prev,
                    {
                        key: data.data.id,
                        course_id: data.data.id,
                        course_teacher_id: data.data.course_teacher_id,
                        course_name: data.data.course_name,
                        course_fullname: data.data.course_fullname,
                        course_room: data.data.course_room,
                        course_day: data.data.course_day,
                        course_time: generatePeriodString(
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

    const handleDeleteCourse = async (course_id: string) => {
        try {
            const result = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/course/delete/${course_id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const course = courses.find(
                (course) => course.course_id === course_id
            );

            const data: IApiResponse<ICourseResponse> = await result.json();
            if (result.ok) {
                successMessage({
                    content: `Xóa học phần ${
                        course?.course_code || ""
                    } thành công.`,
                    duration: 1,
                });

                setCourses((prev) =>
                    prev.filter((course) => course.key !== course_id)
                );
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

    const handleCourseNameChange = (value: string) => {
        const course = courseOptions.find((course) => course.value === value);
        if (course) {
            setCourseCreateForm((prev) => ({
                ...prev,
                course_fullname: course.value,
                course_name: course.label,
            }));
        }
    };
    const modalContent = (
        <>
            <div className="p-4">
                <div className="flex gap-8">
                    <div className="max-w-[50%] my-auto">
                        <span className="flex text-blue-400 font-semibold text-lg justify-center">
                            Thông Tin Môn Học
                        </span>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            size={"middle"}
                            placeholder="Mã môn"
                            value={courseCreateForm.course_name}
                            onChange={(value) => {
                                handleCourseNameChange(value);
                            }}
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                            }}
                            options={courseOptions}
                        />
                        <Input
                            disabled
                            size="middle"
                            placeholder="Tên môn"
                            value={
                                courseCreateForm.course_fullname
                            }
                          
                            style={{ marginTop: "1rem" }}
                        />
                        <Select
                            size={"middle"}
                            placeholder="Khoa"
                            value={courseCreateForm.course_department}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_department: value,
                                }));
                            }}
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                            }}
                            options={departmentOptions}
                        />
                        <InputNumber
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                                marginBottom: "1rem",
                            }}
                            placeholder="Số tín chỉ"
                            min={1}
                            max={10}
                            value={courseCreateForm.course_credit}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_credit: value,
                                }));
                            }}
                        />
                    </div>
                    <div className="max-w-[50%]">
                        <span className="flex text-blue-400 font-semibold text-lg justify-center">
                            Chi Tiết Môn Học
                        </span>
                        <Select
                            size={"middle"}
                            placeholder="Giảng viên"
                            value={courseCreateForm.course_teacher_id}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_teacher_id: value,
                                }));
                            }}
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                            }}
                            options={teacherOptions}
                        />
                        <Input
                            size="middle"
                            placeholder="Phòng học"
                            value={courseCreateForm.course_room}
                            onChange={(e) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_room: e.target.value,
                                }));
                            }}
                            style={{ marginTop: "1rem" }}
                        />
                        <Select
                            size={"middle"}
                            placeholder="Tiết bắt đầu"
                            value={courseCreateForm.course_start_shift}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_start_shift: value,
                                }));
                            }}
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                            }}
                            options={lessionOptions}
                        />
                        <Select
                            size={"middle"}
                            placeholder="Tiết kết thúc"
                            value={courseCreateForm.course_end_shift}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_end_shift: value,
                                }));
                            }}
                            // @ts-expect-error - temporary fix
                            status={`${
                                courseCreateForm.course_start_shift &&
                                courseCreateForm.course_end_shift &&
                                courseCreateForm.course_start_shift >
                                    courseCreateForm.course_end_shift
                                    ? "error"
                                    : undefined
                            }`}
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                            }}
                            options={lessionOptions}
                        />
                        <InputNumber
                            style={{
                                width: "100%",
                                marginTop: "1rem",
                                marginBottom: "1rem",
                            }}
                            placeholder="Sĩ số tối đa"
                            min={1}
                            max={1000}
                            value={courseCreateForm.max_enroll}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    max_enroll: value,
                                }));
                            }}
                        />
                    </div>
                </div>
                <Divider />
                <div className="flex justify-center gap-8 my-4">
                    <div className="w-[40%]">
                        <Select
                            size={"middle"}
                            placeholder="Học kỳ"
                            value={courseCreateForm.course_semester}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_semester: value,
                                }));
                            }}
                            style={{
                                width: "100%",
                            }}
                            options={semesterOptions}
                        />
                    </div>
                    <div>
                        <InputNumber
                            style={{
                                width: "100%",
                            }}
                            placeholder="Năm học"
                            min={1}
                            max={new Date().getFullYear()}
                            value={courseCreateForm.course_year}
                            onChange={(value) => {
                                setCourseCreateForm((prev) => ({
                                    ...prev,
                                    course_year: value,
                                }));
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-center">
                    <Select
                        size={"middle"}
                        placeholder="Ngày học"
                        value={courseCreateForm.course_day}
                        onChange={(value) => {
                            setCourseCreateForm((prev) => ({
                                ...prev,
                                course_day: value,
                            }));
                        }}
                        style={{
                            width: "80%",
                            marginBottom: "1rem",
                        }}
                        options={dayOptions}
                    />
                </div>
            </div>
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
                    Những môn đăng ký
                </span>
                <AddModal
                    open={open}
                    setOpen={setOpen}
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    buttonIcon={<Plus size={16} />}
                    buttonContent="Thêm môn học"
                    formTitle="Thêm môn"
                    submitButtonContent="Thêm môn mới"
                    modalContent={modalContent}
                    resetModalContentValues={resetCreateCourseForm}
                />
            </div>
            <Table<ICourse> dataSource={courses} columns={columns} />
        </div>
    );
};

export default ProtectedRoute(LecturerCoursesPage);
