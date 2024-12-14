import { CreateDepartmentFormValues, ICourse, ITuition, PayTuitionFormValues, TuStatus } from "@/types";
import { Modal, message, Input, Divider, InputNumber, Table } from "antd";
import { useState } from "react";

const TuitionModal = ({
    courses,
    tuition,
    isModalOpen,
    setIsModalOpen,
}: {
    isModalOpen: boolean;
    tuition: Number;
    setIsModalOpen: (isOpen: boolean) => void;
    courses: ICourse[];
}) => {
    const [messageApi, contextHolder] = message.useMessage();

    const handleOk = async () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const columns = [
        {
            title: "Mã môn",
            dataIndex: "course_name",
            key: "course_name",
            render: (text: string) => (
                <span className="text-blue-300 font-semibold">{text}</span>
            ),
        },
        {
            title: "Tên môn",
            dataIndex: "course_fullname",
            key: "course_fullname",
        },
        {
            title: "Phòng học",
            dataIndex: "course_room",
            key: "course_room",
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
    ];

    const formattedAmount = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    })
    const modify = (value: string) => (
        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    );    

    return (
        <div>
            {contextHolder}
            <Modal
                title={null}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={
                    window.innerWidth > 768
                        ? "50%"
                        : window.innerWidth > 425
                        ? "80%"
                        : "100%"
                }
            >
                <div className="p-4">
                    <span className="flex text-blue-400 font-semibold text-lg justify-center">
                        Học phí
                    </span>
                    <Divider />
                    <label className="text-red-500 font-semibold">
                        Số tiền cần thanh toán:
                    </label>
                    <Input
                        size="middle"
                        placeholder="Số tiền"
                        value={modify(formattedAmount.format(tuition as number))}
                        style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
                        disabled
                    />
        
            
                    <label className="text-red-500 font-semibold">
                        Danh sách môn học:
                    </label>
                </div>
                <Table<ICourse> 
                dataSource={courses} 
                columns={columns} 

                />
            </Modal>

        </div>
    );
};

export default TuitionModal;
