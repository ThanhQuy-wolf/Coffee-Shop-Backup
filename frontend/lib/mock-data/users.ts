import type { User } from "../types";

export interface MockAccount extends User {
  /** Plain text only because this is mock data; the backend stores a hash (NFR-02) */
  password: string;
}

/** Demo staff and manager accounts. Customers come from the real login API. */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 1,
    role: "MANAGER",
    fullName: "Phạm Quản Lý",
    username: "admin",
    phone: null,
    password: "admin",
    avatarUrl: null,
    departmentId: null,
  },
  {
    id: 2,
    role: "STAFF",
    fullName: "Nguyễn Văn An",
    username: "an",
    phone: null,
    password: "123456",
    avatarUrl: null,
    departmentId: 1,
  },
  {
    id: 3,
    role: "STAFF",
    fullName: "Trần Thị Bình",
    username: "binh",
    phone: null,
    password: "123456",
    avatarUrl: null,
    departmentId: 3,
  },
  {
    id: 4,
    role: "STAFF",
    fullName: "Lê Văn Cường",
    username: "cuong",
    phone: null,
    password: "123456",
    avatarUrl: null,
    departmentId: 2,
  },
  {
    id: 10,
    role: "CUSTOMER",
    fullName: "Khách hàng demo",
    username: null,
    phone: "0987654321",
    password: "user1",
    avatarUrl: null,
    departmentId: null,
  },
];

/** Shown on the register page while SMS is mocked */
export const MOCK_OTP = "123456";
