import { ApiError } from "../services/client";

/** UI text per error code (docs/05-api.md §3). Other codes use the server text. */
const MESSAGES: Record<string, string> = {
  UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  "BR-27": "Dữ liệu vừa được người khác cập nhật. Đã tải lại bản mới nhất.",
  "BR-43": "Ca đã đủ người.",
  "BR-44": "Bạn đã có trong ca này.",
};

/**
 * Turns any thrown value into a sentence to show the user.
 *
 * @param err - value caught from a service call
 * @returns the text for `err.code` when known, the server message for other
 *   API errors, a generic text for 5xx, network and unknown errors
 */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status >= 500)
      return "Hệ thống đang gặp sự cố, vui lòng thử lại sau.";
    return MESSAGES[err.code] ?? err.message;
  }
  if (err instanceof TypeError) return "Không kết nối được máy chủ.";
  return "Có lỗi xảy ra, vui lòng thử lại.";
}

/**
 * Reads the business code of an API error, to branch on a specific rule.
 *
 * @param err - value caught from a service call
 * @returns e.g. `"BR-22"` or `"NOT_FOUND"`, or `null` when `err` is not an
 *   `ApiError`
 */
export function errorCode(err: unknown): string | null {
  return err instanceof ApiError ? err.code : null;
}
