import { dayOptions } from "@/constants";
import { CreateCourseFormValues, ICourse } from "@/types";
import { generatePeriodString } from "@/utils";
import { Modal, message, Select, Input, InputNumber, Divider } from "antd";
import { useState } from "react";

const EditCourseModal = ({
    icon,
    course,
    allCourses,
    departmentOptions,
    teacherOptions,
    lessionOptions,
    semesterOptions,
    courseOptions,
    setCourses,
    token,
}: {
    icon: React.ReactNode;
    course: ICourse;
    allCourses: ICourse[];
    departmentOptions: {
        value: string;
        label: string;
    }[];
    teacherOptions: {
        value: string;
        label: string;
    }[];
    lessionOptions: {
        value: number;
        label: string;
    }[];
    semesterOptions: {
        value: number;
        label: string;
    }[];
    courseOptions: {
        value: string;
        label: string;
    }[];
    setCourses: (courses: ICourse[]) => void;
    token: string;
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [courseUpdateForm, setCourseUpdateForm] =
        useState<CreateCourseFormValues>({
            // course_code: course.course_code || "",
            course_id: course.course_id,
            course_teacher_id: course.course_teacher_id || null,
            course_department: course.course_department || "",
            course_name: course.course_name || "",
            course_fullname: course.course_fullname || "",
            course_credit: course.course_credit || 1,
            course_year: course.course_year || new Date().getFullYear(),
            course_semester: course.course_semester || 1,
            course_start_shift: course.course_start_shift || null,
            course_end_shift: course.course_end_shift || null,
            course_day: course.course_day || "",
            max_enroll: course.max_enroll || 0,
            current_enroll: course.current_enroll || 0,
            course_room: course.course_room,
        });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/course/edit`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(courseUpdateForm),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update course");
            }
            messageApi.success({
                content: `Updated ${courseUpdateForm.course_name} successfully`,
                duration: 1,
            });
            setTimeout(() => {
                setCourses(
                    allCourses.map((c) =>
                        c.course_id === course.course_id
                            ? {
                                  ...courseUpdateForm,
                                  course_time: generatePeriodString(
                                      courseUpdateForm.course_start_shift as number,
                                      courseUpdateForm.course_end_shift as number
                                  ),
                                  course_size: `${courseUpdateForm.current_enroll}/${courseUpdateForm.max_enroll}`,
                              }
                            : c
                    )
                );
            }, 500);
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to update course");
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleCourseNameChange = (value: string) => {
        const course = courseOptions.find((course) => course.value === value);
        if (course) {
            setCourseUpdateForm((prev) => ({
                ...prev,
                course_fullname: course.value,
                course_name: course.label,
            }));
        }
    };
    return (
        <div>
            {contextHolder}
            <div onClick={showModal}>{icon}</div>
            <Modal
                title={null}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div className="p-4">
                    <div className="flex gap-8">
                        <div className="max-w-[50%] my-auto">
                            <span className="flex text-blue-400 font-semibold text-lg justify-center">
                                Cập nhật thông tin
                            </span>
                        <Select
                            showSearch
                            optionFilterProp="label"
                            size={"middle"}
                            placeholder="Mã môn"
                            value={courseUpdateForm.course_name}
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
                                courseUpdateForm.course_fullname
                            }
                          
                            style={{ marginTop: "1rem" }}
                        />
                            <Select
                                showSearch
                                size={"middle"}
                                placeholder="Khoa"
                                value={courseUpdateForm.course_department}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
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
                                value={courseUpdateForm.course_credit}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
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
                                showSearch
                                size={"middle"}
                                placeholder="Giảng viên"
                                value={courseUpdateForm.course_teacher_id}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
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
                                value={courseUpdateForm.course_room}
                                onChange={(e) => {
                                    setCourseUpdateForm((prev) => ({
                                        ...prev,
                                        course_room: e.target.value,
                                    }));
                                }}
                                style={{ marginTop: "1rem" }}
                            />
                            <Select
                                showSearch
                                size={"middle"}
                                placeholder="Tiết bắt đầu"
                                value={courseUpdateForm.course_start_shift}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
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
                                showSearch
                                size={"middle"}
                                placeholder="Tiết kết thúc"
                                value={courseUpdateForm.course_end_shift}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
                                        ...prev,
                                        course_end_shift: value,
                                    }));
                                }}
                                // @ts-expect-error - temporary fix
                                status={`${
                                    courseUpdateForm.course_start_shift &&
                                    courseUpdateForm.course_end_shift &&
                                    courseUpdateForm.course_start_shift >
                                        courseUpdateForm.course_end_shift
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
                                value={courseUpdateForm.max_enroll}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
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
                                showSearch
                                size={"middle"}
                                placeholder="Học kỳ"
                                value={courseUpdateForm.course_semester}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
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
                                value={courseUpdateForm.course_year}
                                onChange={(value) => {
                                    setCourseUpdateForm((prev) => ({
                                        ...prev,
                                        course_year: value,
                                    }));
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Select
                            showSearch
                            size={"middle"}
                            placeholder="Ngày học"
                            value={courseUpdateForm.course_day}
                            onChange={(value) => {
                                setCourseUpdateForm((prev) => ({
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
            </Modal>
        </div>
    );
};

export default EditCourseModal;
