import { TimeSlot } from "./TimeSlot";
import { TimeColumn } from "./TimeColumn";
import { ITimeTableData } from "@/types";

const timeSlots = [
    { period: 1, time: "7:30 - 8:15" },
    { period: 2, time: "8:15 - 9:00" },
    { period: 3, time: "9:00 - 9:45" },
    { period: 4, time: "10:00 - 10:45" },
    { period: 5, time: "10:45 - 11:30" },
    { period: 6, time: "13:00 - 13:45" },
    { period: 7, time: "13:45 - 14:30" },
    { period: 8, time: "14:30 - 15:15" },
    { period: 9, time: "15:30 - 16:15" },
    { period: 10, time: "16:15 - 17:00" },
];

// Mock data cho các khóa học
const coursesData = {
    4: [
        // Thứ 4
        {
            id: "1",
            course_name: "AI002.P11-VN",
            course_fullname: "Tự duy Trí tuệ nhân tạo",
            course_teacher: "Ngô Đức Thành",
            course_room: "C312",
            startPeriod: 1,
            endPeriod: 3,
        },
    ],
    // Thêm data cho các ngày khác
};

interface TimeTableProps {
    courses: ITimeTableData;
}

export const TimeTable = ({ courses }: TimeTableProps) => {
    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-7 gap-1">
                {/* Cột thời gian */}
                <div className="border-r border-gray-300 bg-gray-100">
                    <div className="h-12 border-b border-gray-300 p-2 flex items-center justify-center">
                        <div className="text-sm font-medium">Thứ / Tiết</div>
                    </div>
                    {timeSlots.map((slot) => (
                        <TimeSlot
                            key={slot.period}
                            period={slot.period}
                            time={slot.time}
                        />
                    ))}
                </div>

                {/* Các cột thứ 2-7 */}
                {[2, 3, 4, 5, 6, 7].map((day) => (
                    <TimeColumn
                        key={day}
                        day={day}
                        courses={courses[day] || []}
                    />
                ))}
            </div>
        </div>
    );
};
