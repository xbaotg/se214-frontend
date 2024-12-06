// TimeColumn.tsx
import { CourseCard } from "./CourseCard";

interface Course {
    id: string;
    course_name: string;
    course_fullname: string;
    course_teacher: string;
    course_room: string;
    startPeriod: number;
    endPeriod: number;
}

interface TimeColumnProps {
    day: number;
    courses: Course[];
}

export const TimeColumn = ({ day, courses }: TimeColumnProps) => {
    // Tạo mảng 10 phần tử để đại diện cho 10 tiết học
    const periods = Array(10).fill(null);

    // Sắp xếp các khóa học vào đúng vị trí tiết học
    const renderCourses = () => {
        return periods.map((_, index) => {
            const period = index + 1;
            const course = courses.find(
                (c) => period >= c.startPeriod && period <= c.endPeriod
            );

            if (!course) {
                return (
                    <div
                        key={`empty-${day}-${period}`}
                        className="h-16 border-b border-gray-200"
                    />
                );
            }

            // Chỉ render CourseCard ở tiết đầu tiên của môn học
            if (period === course.startPeriod) {
                const heightClass = `h-${
                    (course.endPeriod - course.startPeriod + 1) * 16
                }`;

                return (
                    <div
                        key={course.id}
                        className={`${heightClass} relative border-b border-gray-200`}
                        style={{
                            gridRow: `span ${
                                course.endPeriod - course.startPeriod + 1
                            }`,
                        }}
                    >
                        <CourseCard
                            code={course.course_name}
                            name={course.course_fullname}
                            teacher={course.course_teacher}
                            room={course.course_room}
                            // startDate={course.startDate}
                            // endDate={course.endDate}
                        />
                    </div>
                );
            }

            return null;
        });
    };

    return (
        <div className="border-r border-gray-200">
            <div className="h-12 border-b border-gray-200 p-2">
                <div className="text-sm font-medium text-center text-red-500">
                    Thứ {day}
                </div>
            </div>
            <div className="grid grid-rows-10">{renderCourses()}</div>
        </div>
    );
};
