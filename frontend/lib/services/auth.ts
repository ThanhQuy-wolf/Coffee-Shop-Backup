import type { User } from "../types";
import { apiPost } from "./client";

export function loginRequest(phone: string, password: string) {
  return apiPost<User>("/customer/login", { phone, password });
}
