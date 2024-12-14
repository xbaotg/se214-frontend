import { ITuition, PayTuitionFormValues, TuStatus } from "@/types";
import { Modal, message, Divider, InputNumber } from "antd";
import { useState } from "react";

const PayTuitionModal = ({
    icon,
    tuition,
    allTuition,
    setTuitions,
    token,
}: {
    icon: React.ReactNode;
    tuition: ITuition;
    allTuition: ITuition[];
    setTuitions: (departments: ITuition[]) => void;
    token: string;
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [payTuitionForm, setPayTuitionForm] =
        useState<PayTuitionFormValues>({
            pay: 0,
            semester: tuition.semester,
            tuition_id: tuition.id,
            year: tuition.year,
        });

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            if (payTuitionForm.pay === 0) {
                throw new Error("Pay must be greater than 0");
            }
            if (tuition.tuitionStatus === TuStatus.Paid) {
                throw new Error("Tuition has been paid");
            }
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/tuition/pay`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(
                        payTuitionForm,
                    ),
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to pay tuition ${response.statusText}`);
            }
            messageApi.success(
                `Pay tuition ${tuition.id} successfully`
            );
            setTuitions(
                allTuition.map((t) =>
                    t.id === tuition.id
                        ? { 
                            ...t,
                            paid: t.paid + payTuitionForm.pay >= t.tuition ? t.tuition : t.paid + payTuitionForm.pay,
                            tuitionStatus: t.paid + payTuitionForm.pay >= t.tuition ? TuStatus.Paid : TuStatus.Unpaid
                         }
                        : t
                )
            );
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to pay tuition");
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
                        Đóng học phí
                    </span>
                    <Divider />
                    <label className="text-red-500 font-semibold">
                        Số tiền
                    </label>
                    <InputNumber
                        size="middle"
                        placeholder="Số tiền"
                        value={payTuitionForm.pay}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                        min={1}
                        onChange={(value) =>
                            setPayTuitionForm({
                                ...payTuitionForm,
                                pay: value as number,
                            })
                        }
                        style={{ marginBottom: "1rem", marginTop: "0.5rem" }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default PayTuitionModal;
