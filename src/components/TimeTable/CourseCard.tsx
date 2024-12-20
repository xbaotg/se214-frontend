// CourseCard.tsx
interface CourseCardProps {
    code: string;
    name: string;
    teacher: string;
    room: string;
}

export const CourseCard = ({ code, name, teacher, room }: CourseCardProps) => {
    return (
        <div className="h-full p-2 rounded text-center mr-1 bg-slate-100">
            <div className="text-sm font-bold mb-1">{code}</div>
            <div className="text-sm mb-1">{name}</div>
            <div className="text-sm mb-1">{teacher}</div>
            <div className="text-sm text-gray-600 mb-1 font-medium">{room}</div>
        </div>
    );
};
