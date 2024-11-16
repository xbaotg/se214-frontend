export interface IApiResponse<T> {
    data: T;
    message: string;
    status: boolean;
}

export enum UserRoles {
    Admin = "admin",
    Lecturer = "lecturer",
    User = "user",
}

export interface INavItem {
    name: string;
    path: string;
}

export interface ITeacher {
    key?: string;
    id: string;
    username: string;
    email: string;
    user_fullname: string;
    year: number;
}

export interface IDepartment {
    key?: string;
    department_id: string;
    department_name: string;
    department_code: string;
    created_at: string;
    updated_at: string;
}

export interface ICourse {
    key?: string;
    course_id: string;
    course_name: string;
    course_department?: string;
    course_year?: number;
    course_semester?: number;
    course_credit?: number;
    course_fullname: string;
    course_room: string;
    course_day: string;
    course_time: string;
    course_size: string;
}

export interface ICourseMetadata {
    department_name: string;
    year: number;
    credit: number;
    semester: number;
}

export interface ICourseResponse {
    id: string;
    course_code: string;
    course_teacher_id: string;
    course_department: string;
    course_name: string;
    course_fullname: string;
    course_credit: number;
    course_year: number;
    course_semester: number;
    course_start_shift: number;
    course_end_shift: number;
    course_day: string;
    max_enroll: number;
    current_enroll: number;
    course_room: string;
}

export interface SignUpFormValues {
    username: string;
    email: string;
    password: string;
    retypePassword: string;
    user_fullname: string;
    year: number;
}

export interface CreateDepartmentFormValues {
    department_name: string;
    department_code: string;
}

export interface CreateCourseFormValues {
    course_code: string;
    course_id: string;
    course_teacher_id: string | null;
    course_department: string | null;
    course_name: string;
    course_fullname: string;
    course_credit: number | null | string;
    course_year: number | null | string;
    course_semester: number | null | string;
    course_start_shift: number | null | string;
    course_end_shift: number | null | string;
    course_day: string | null;
    max_enroll: number | null | string;
    current_enroll: number;
    course_room: string;
}

export interface IListUserResponse {
    id: string;
    email: string;
    username: string;
    user_fullname: string;
    year: number;
}

export interface SignUpResponse {
    id: string;
    username: string;
    detail?: string;
}
