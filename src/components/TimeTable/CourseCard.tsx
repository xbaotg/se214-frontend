// CourseCard.tsx
interface CourseCardProps {
    code: string;
    name: string;
    teacher: string;
    room: string;
}

export const CourseCard = ({ code, name, teacher, room }: CourseCardProps) => {
    return (
        <div className="h-full text-center bg-slate-100 border border-slate-300 content-center">
            <div className="text-sm font-bold mb-1">{code}</div>
            <div className="text-sm mb-1">{name}</div>
            <div className="text-sm mb-1 font-bold">{teacher}</div>
            <div className="text-sm text-gray-600 mb-1 font-medium">{room}</div>
        </div>
    );
};
