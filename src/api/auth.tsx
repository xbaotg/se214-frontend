import { authEndpoints } from "@/endpoints";
import {
    IApiResponse,
    ILoginFormValues,
    ILoginResponse,
    ISignUpFormValues,
    ISignUpResponse,
    IUser,
    IUserResponse,
    UserRoles,
} from "@/types";

export const login = async (body: ILoginFormValues) => {
    const response = await fetch(authEndpoints.login, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data: IApiResponse<ILoginResponse> = await response.json();
    if (!response.ok) {
        throw new Error(data.message);
    }

    return data.data;
};

export const register = async (body: ISignUpFormValues) => {
    const { username, email, password, user_fullname, year } = body;
    const response = await fetch(authEndpoints.register, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            password: password,
            user_fullname: user_fullname,
            year: year,
            user_role: UserRoles.User,
            user_email: email,
        }),
    });
    const data: IApiResponse<ISignUpResponse> = await response.json();

    if (!response.ok) {
        throw new Error(data.message);
    }

    return data.data;
};

export const me = async (token: string) => {
    const res = await fetch(authEndpoints.me, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data: IApiResponse<IUserResponse> = await res.json();

    if (!res.ok) {
        throw new Error(data.message);
    }

    const user: IUser = {
        id: data.data.id,
        username: data.data.username,
        email: data.data.email,
        userFullname: data.data.user_fullname,
        year: data.data.year,
        userRole: data.data.user_role,
        createdAt: data.data.created_at,
        updatedAt: data.data.updated_at,
    };

    return user;
};
