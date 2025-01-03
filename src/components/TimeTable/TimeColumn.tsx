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
    const renderCourses = () => {
        const slots = Array(10).fill(null);

        courses.forEach((course) => {
            for (let i = course.startPeriod - 1; i < course.endPeriod; i++) {
                slots[i] = course;
            }
        });

        return slots.map((course, index) => {
            if (!course) {
                return (
                    <div
                        key={`empty-${day}-${index + 1}`}
                        className="h-16 border-b border-gray-200"
                    />
                );
            }

            if (index + 1 === course.startPeriod) {
                const span = course.endPeriod - course.startPeriod + 1;
                return (
                    <div
                        key={course.id}
                        className="relative border-b border-gray-200"
                        style={{ height: `${span * 4}rem` }}
                    >
                        <CourseCard
                            code={course.course_name}
                            name={course.course_fullname}
                            teacher={course.course_teacher}
                            room={course.course_room}
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
            <div className="flex flex-col">{renderCourses()}</div>
        </div>
    );
};
