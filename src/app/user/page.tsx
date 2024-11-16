'use client';
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    return (
    <div className="place-items-center justify-center p-5 grid grid-cols-1 gap-4">
        <h1 className="text-4xl font-bold">Welcome to DKHP</h1>
        <Button 
            type="primary"
            className="flex w-1/3"
            onClick={() => {
                router.push("/user/dkhp");
            }}
        >DKHP</Button>
    </div>  
    );
}
