type CourseDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

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

export enum TuStatus {
  Unpaid = "unpaid",
  Paid = "paid",
}

export enum State {
  Active = "active",
  Freeze = "freeze",
  Done = "done",
  Setup = "setup",
}

export interface IStateResponse {
  state: State;
}

export interface ITuitionTypeResponse {
  cost: number;
  type: string;
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
  course_code?: string;
  course_teacher_id: string | null;
  course_name: string;
  course_department?: string | null;
  course_year?: number | null | string;
  course_semester?: number | null | string;
  course_credit?: number | null | string;
  course_fullname: string;
  course_room: string;
  course_start_shift?: number | null | string;
  course_end_shift?: number | null | string;
  course_day: CourseDay | null | string;
  max_enroll?: number | null | string;
  current_enroll?: number | null;
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
  course_teacher_name?: string | undefined;
  course_department: string;
  course_name: string;
  course_fullname: string;
  course_credit: number;
  course_year: number;
  course_semester: number;
  course_start_shift: number;
  course_end_shift: number;
  course_day: CourseDay;
  max_enroll: number;
  current_enroll: number;
  course_room: string;
}

export interface IUserResponse {
  id: string;
  email: string;
  username: string;
  user_fullname: string;
  year: number;
  user_role: UserRoles;
  created_at: string;
  updated_at: string;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  userFullname: string;
  year: number;
  userRole: UserRoles;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginFormValues {
  username: string;
  password: string;
}

export interface ILoginResponse {
  session_id: string;
  user_role: UserRoles;
  access_token: string;
  access_token_expires_in: Date;
  refresh_token: string;
  refresh_token_expires_in: Date;
}

export interface ISignUpFormValues {
  username: string;
  email: string;
  password: string;
  retypePassword: string;
  user_fullname: string;
  user_role: UserRoles;
  year: number;
}

export interface ISignUpResponse {
  id: string;
  username: string;
  detail?: string;
}

export interface CreateDepartmentFormValues {
  department_name: string;
  department_code: string;
}

// {
//   "pay": 0,
//   "semester": 0,
//   "tuition_id": "string",
//   "year": 0
// }
export interface PayTuitionFormValues {
  pay: number;
  semester: number;
  tuition_id: string;
  year: number;
}
export interface CreateTuitionFormValues {
  deadline: string;
  semester: number;
  year: number;
}
export interface CalTuitionFormValues {
  semester: number;
  year: number;
}
export interface UpdateCalTuitionFormValues {
  type: string;
  cost: number;
}

export interface CalTuitionResponse {
  tuition: number;
  credit: number;
  courses: ICourseResponse[];
}

export interface EditDepartmentFormValues {
  department_name: string;
  department_code: string;
  department_id: string;
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
  course_day: CourseDay | null | string;
  max_enroll: number | null | string;
  current_enroll: number;
  course_room: string;
}

export interface IListUserResponse {
  id: string;
  email: string;
  username: string;
  user_fullname: string;
  user_role: UserRoles;
  year: number;
}

export type ICourseCard = {
  id: string;
  course_name: string;
  course_fullname: string;
  course_teacher: string;
  course_room: string;
  startPeriod: number;
  endPeriod: number;
};

export type ITimeTableData = {
  [day: number]: ICourseCard[];
};

//   "ID": "9681d061-b6f2-11ef-b94e-0242ac11000a",
//   "UserID": "c47f4415-b161-11ef-9192-0242ac11000a",
//   "Tuition": -1,
//   "Paid": 0,
//   "TotalCredit": 0,
//   "Year": 2024,
//   "Semester": 1,
//   "TuitionStatus": "unpaid",
//   "TuitionDeadline": "2024-12-31T17:00:00-07:00",
//   "CreatedAt": "2024-12-10T05:30:49.520773-07:00",
//   "UpdatedAt": "2024-12-10T05:30:49.520773-07:00"
export interface ITuitionResponse {
  ID: string;
  UserID: string;
  Tuition: number;
  Paid: number;
  TotalCredit: number;
  Year: number;
  Semester: number;
  TuitionStatus: TuStatus;
  TuitionDeadline: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ITuition {
  key?: string;
  id: string;
  userID: string;
  tuition: number;
  paid: number;
  totalCredit: number;
  year: number;
  semester: number;
  tuitionStatus: TuStatus;
  tuitionDeadline: string;
}
