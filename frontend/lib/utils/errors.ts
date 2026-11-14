import { ApiError } from "../services/client";

/**
 * Messages chosen by error code, as docs/05-api.md §3 asks. Codes not listed
 * fall back to the server's own message.
 */
const MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  "BR-03": "Bạn chỉ thao tác được trên dữ liệu của quán mình.",
  "BR-27": "Dữ liệu vừa được người khác cập nhật. Đã tải lại bản mới nhất.",
  "BR-43": "Ca đã đủ người.",
  "BR-44": "Bạn đã có trong ca này.",
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status >= 500)
      return "Hệ thống đang gặp sự cố, vui lòng thử lại sau.";
    return MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof TypeError) return "Không kết nối được máy chủ.";
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

export function errorCode(err: unknown): string | null {
  return err instanceof ApiError ? err.code : null;
}
