
import { IApiResponse, IStateResponse, ITuitionTypeResponse,State, UpdateCalTuitionFormValues } from "@/types";
import { SettingOutlined } from "@ant-design/icons";
import { Modal, message, Divider, InputNumber, Select } from "antd";
import { useState } from "react";

const SettingModal = ({
    headerContent,
    token,
}: {
    headerContent: string;  
    token: string;
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [state, setState] = useState<State>();
    const [updateTuitionType, setUpdateTuitionType] = useState<UpdateCalTuitionFormValues>({
        cost: 0,
        type: "",
    });

    const stateOptions = [
        { value: State.Active, label: "Active" },
        { value: State.Freeze, label: "Freeze" },
        { value: State.Done, label: "Done" },
        { value: State.Setup, label: "Setup" },
    ];
    
    const tuitionTypeOptions = [
        { value: "buffet", label: "Buffet" },
        { value: "credit", label: "Credit" },
    ];

    const fetchState = async () => {
        try {
            const [responseState, responseTuitionType] = [await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/state`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            ), await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/global/tuition_type`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            )];
            if (!responseState.ok) {
                throw new Error(`Failed to fetch state ${responseState.statusText}`);
            }
            if (!responseTuitionType.ok) {
                throw new Error(`Failed to fetch tuition type ${responseTuitionType.statusText}`);
            }
            const data: IApiResponse<IStateResponse> = await responseState.json();
            const dataTuitionType: IApiResponse<ITuitionTypeResponse> = await responseTuitionType.json();

            const stateResponse = data.data.state;
            const tuitionTypeResponse = dataTuitionType.data;

            setUpdateTuitionType({
                cost: tuitionTypeResponse.cost,
                type: tuitionTypeResponse.type,
            });
            // console.log(stateResponse);
            setState(stateResponse);
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to fetch state");
        }
    };

    const fetchUpdateState = async () => {
        try {
            const [response, responseTuitionType] = [await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/global/state?state=${state}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            ), await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/global/tuition_type`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updateTuitionType),
                }
            )];
            if (!response.ok) {
                throw new Error(`Failed to update state ${response.statusText}`);
            }
            if (!responseTuitionType.ok) {
                throw new Error(`Failed to update tuition type ${responseTuitionType.statusText}`);
            }
            messageApi.success("Update tuition type successfully");
            messageApi.success("Update state successfully");
            setState(state);
            setUpdateTuitionType(updateTuitionType);
        } catch (error) {
            console.error(error);
            messageApi.error("Failed to update state");
        }
    }


    // const handleOk = async () => {
    //     try {
    //         if (payTuitionForm.pay === 0) {
    //             throw new Error("Pay must be greater than 0");
    //         }
    //         if (tuition.tuitionStatus === TuStatus.Paid) {
    //             throw new Error("Tuition has been paid");
    //         }
    //         const response = await fetch(
    //             `${process.env.NEXT_PUBLIC_API_URL}/tuition/pay`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify(
    //                     payTuitionForm,
    //                 ),
    //             }
    //         );
    //         if (!response.ok) {
    //             throw new Error(`Failed to pay tuition ${response.statusText}`);
    //         }
    //         messageApi.success(
    //             `Pay tuition ${tuition.id} successfully`
    //         );
    //         setTuitions(
    //             allTuition.map((t) =>
    //                 t.id === tuition.id
    //                     ? { 
    //                         ...t,
    //                         paid: t.paid + payTuitionForm.pay >= t.tuition ? t.tuition : t.paid + payTuitionForm.pay,
    //                         tuitionStatus: t.paid + payTuitionForm.pay >= t.tuition ? TuStatus.Paid : TuStatus.Unpaid
    //                      }
    //                     : t
    //             )
    //         );
    //     } catch (error) {
    //         console.error(error);
    //         messageApi.error("Failed to pay tuition");
    //     } finally {
    //         setIsModalOpen(false);
    //     }
    // };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const showModal = async () => {
        await fetchState();
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        await fetchUpdateState();
        handleCancel();
    };
    // console.log(headerContent);
    if (headerContent === "Admin") {
        return (
            <div>
                {contextHolder}
                <div 
                onClick={showModal}
                className="cursor-pointer rounded-full p-2 hover:bg-blue-200"
                >
                    <SettingOutlined 
                    style={{ fontSize: "20px" }} 
                    />
                </div>
                <Modal
                    title={null}
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                >
                    <span className="flex text-blue-400 font-semibold text-lg justify-center">
                        Setting
                    </span>
                    <div className="p-4">
                        <span className="text-xl font-bold">State</span>
                        <Select
                            className="w-full mt-2"
                            placeholder="State"
                            value={state}
                            options={stateOptions}
                            onChange={(value) => setState(value as State)}
                        />
                    </div>

                    <Divider />

                    <div className="p-4">

                        <span className="text-xl font-bold mt-4">
                            Cách tính
                        </span>
                        <Select
                            className="w-full mt-2"
                            placeholder="Type"
                            value={updateTuitionType.type}
                            onChange={(value) => setUpdateTuitionType({ ...updateTuitionType, type: value as string })}
                            options={tuitionTypeOptions}
                        />
                        <span className="text-xl font-bold">
                            Học phí
                        </span>
                        <InputNumber
                            className="w-full mt-2"
                            placeholder="Tuition"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                            value={updateTuitionType.cost}
                            onChange={(value) => setUpdateTuitionType({ ...updateTuitionType, cost: value as number })}
                            addonAfter="₫"
                        />
                    </div>
                </Modal>
            </div>
        );
    } 

    return (
        <div>
        </div>
    );
};

export default SettingModal;
