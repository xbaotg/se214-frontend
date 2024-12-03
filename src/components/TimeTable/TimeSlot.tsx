// TimeSlot.tsx
interface TimeSlotProps {
    period: number;
    time: string;
}

export const TimeSlot = ({ period, time }: TimeSlotProps) => {
    return (
        <div className="h-16 border-b border-gray-200 p-2">
            <div className="text-sm text-gray-600 text-center font-bold">Tiết {period}</div>
            <div className="text-xs text-gray-500 text-center font-semibold">({time})</div>
        </div>
    );
};
