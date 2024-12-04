import dayjs from "dayjs";

export const formatDate = (inputDate: string) => {
    const normalizedDate =
        inputDate.split(" ")[0] + "T" + inputDate.split(" ")[1];
    const formattedDate = dayjs(normalizedDate).format("YYYY-MM-DD HH:mm:ss");
    return formattedDate;
};

export const generatePeriodString = (a: number, b: number) => {
    return Array.from({ length: b - a + 1 }, (_, i) => a + i).join(",");
};
