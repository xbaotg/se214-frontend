import { dayOptions } from "@/constants";
import {
    CreateDepartmentFormValues,
    EditDepartmentFormValues,
    IDepartment,
    ITeacher,
} from "@/types";
import { Modal, message, Select, Input, InputNumber, Divider } from "antd";
import { useState } from "react";

const EditTeacherModal = ({
    icon,
    teacher,
    allTeachers,
    setTeachers,
    token,
}: {
    icon: React.ReactNode;
    teacher: ITeacher;
    allTeachers: ITeacher[];
    setTeachers: React.Dispatch<React.SetStateAction<ITeacher[]>>;
    token: string;
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [departmentUpdateForm, setDepartmentUpdateForm] =
        useState<CreateDepartmentFormValues>({
            department_name: department.department_name,
            department_code: department.department_code,
        });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/department/update`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(departmentUpdateForm),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update course");
            }
            const data = await response.json();
            if (data.status === "success") {
                messageApi.success("Updated course successfully");
                setDepartments(
                    allDepartments.map((d) =>
                        d.department_id === department.department_id
                            ? { ...d, ...departmentUpdateForm }
                            : d
                    )
                );
            }
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to update deparment");
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
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
                    <span className="flex text-blue-400 font-semibold text-lg justify-center">
                        Cập nhật khoa
                    </span>
                    <Divider />
                    <label className="text-red-500 font-semibold">
                        Tên khoa:
                    </label>
                    <Input
                        size="middle"
                        placeholder="Tên khoa"
                        value={departmentUpdateForm.department_name}
                        onChange={(e) =>
                            setDepartmentUpdateForm({
                                ...departmentUpdateForm,
                                department_name: e.target.value,
                            })
                        }
                        style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
                    />
                    <label className="text-red-500 font-semibold">
                        Mã khoa:
                    </label>
                    <Input
                        size="middle"
                        placeholder="Mã khoa"
                        value={departmentUpdateForm.department_code}
                        onChange={(e) =>
                            setDepartmentUpdateForm({
                                ...departmentUpdateForm,
                                department_code: e.target.value,
                            })
                        }
                        style={{ marginTop: "0.5rem" }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default EditTeacherModal;
