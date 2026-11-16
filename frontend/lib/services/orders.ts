// O-1 → O-9, R-1, R-2 in docs/05-api.md.
import type {
  CreateOrderRequest,
  Order,
  OrderStatus,
  PaymentMethod,
  Review,
  ReviewList,
} from "../types";
import { apiFetch, apiRequest, getAccessToken, query } from "./client";

const GUEST_TOKEN = "X-Guest-Token";

/** Last O-2 answer per order, so a poll that gets 304 can reuse it. */
const orderCache = new Map<string, { etag: string; order: Order }>();

/**
 * Builds the guest header for O-2 and O-9.
 *
 * @param guestToken - token returned to a guest by O-1
 * @returns the header map, empty for signed-in callers
 */
function guestHeaders(guestToken?: string): Record<string, string> {
  return guestToken ? { [GUEST_TOKEN]: guestToken } : {};
}

export const orderService = {
  /**
   * Clock used for countdowns to `paymentDeadline`.
   *
   * @returns the current time
   */
  now(): Date {
    return new Date();
  },

  /**
   * O-1: places an order and starts its payment countdown. Repeating a call
   * with the same key and cart returns the first order (BR-24).
   *
   * @param req - cart lines with the prices the client showed, payment
   *   method, table and note
   * @param idempotencyKey - one key per checkout attempt
   * @returns the new order; guests also get `guestToken` to track it
   * @throws {ApiError} 403 `FORBIDDEN` when a staff account tries to order
   * @throws {ApiError} 422 `BR-24` when the key was used for a different cart
   * @throws {ApiError} 422 `BR-23` for an empty cart or a quantity out of range
   * @throws {ApiError} 422 `BR-21` with `errors[]` for items no longer on sale,
   *   or reason `OPTION_UNAVAILABLE` when a chosen option is sold out (BR-19)
   * @throws {ApiError} 422 `BR-18` with `errors[].line` when the options break
   *   a group's rules or belong to another product; for a combo unit the
   *   entry also has `componentNo` (FR-37)
   * @throws {ApiError} 409 `BR-22` with `errors[].currentPrice` when prices changed
   */
  create(req: CreateOrderRequest, idempotencyKey: string): Promise<Order> {
    return apiRequest<Order>("POST", "/v1/orders", req, {
      "Idempotency-Key": idempotencyKey,
    });
  },

  /**
   * O-2: reads one order. Sends the last ETag, so polling an unchanged order
   * costs a 304 without a body.
   *
   * @param orderId - order id
   * @param guestToken - needed when the caller is a guest
   * @returns the order, with the phone masked unless the caller owns it
   * @throws {ApiError} 404 `NOT_FOUND` when missing or not visible to the caller
   */
  async get(orderId: number, guestToken?: string): Promise<Order> {
    // The body depends on who asks (phone masked for others), the ETag does not
    const key = `${orderId}:${guestToken ?? ""}:${getAccessToken() ?? ""}`;
    const cached = orderCache.get(key);
    const res = await apiFetch("GET", `/v1/orders/${orderId}`, undefined, {
      ...guestHeaders(guestToken),
      ...(cached ? { "If-None-Match": cached.etag } : {}),
    });
    if (res.status === 304 && cached) return cached.order;
    const order = (await res.json()) as Order;
    const etag = res.headers.get("ETag");
    if (etag) orderCache.set(key, { etag, order });
    return order;
  },

  /**
   * O-3: the signed-in customer's orders, newest first.
   *
   * @returns the customer's orders
   * @throws {ApiError} 401/403 when the caller is not a customer
   */
  listMine(): Promise<Order[]> {
    return apiRequest<Order[]>("GET", "/v1/me/orders");
  },

  /**
   * O-4: the staff order queue for one business day, oldest first.
   *
   * @param filter - optional filters
   * @param filter.status - only these statuses; all when omitted
   * @param filter.q - part of an order code, case-insensitive
   * @param filter.date - business day `YYYY-MM-DD`; today when omitted
   * @returns matching orders
   * @throws {ApiError} 401/403 when the caller is not staff or manager
   * @throws {ApiError} 400 `VALIDATION` for a malformed date or status
   */
  listQueue(
    filter: { status?: OrderStatus[]; q?: string; date?: string } = {},
  ): Promise<Order[]> {
    return apiRequest<Order[]>(
      "GET",
      `/v1/orders${query({
        status: filter.status?.join(","),
        q: filter.q?.trim(),
        date: filter.date,
      })}`,
    );
  },

  /**
   * O-5: staff confirm that the customer paid; the order becomes PAID.
   *
   * @param orderId - order id
   * @param body - request body
   * @param body.method - how the customer actually paid
   * @param body.amount - amount received; must equal the order total (BR-26)
   * @param body.version - the version the staff member last saw (BR-27)
   * @returns the updated order
   * @throws {ApiError} 409 `BR-27` when the order changed in the meantime
   * @throws {ApiError} 409 `BR-26` when the order is no longer awaiting payment
   * @throws {ApiError} 422 `BR-26` when the amount differs from the total
   */
  confirmPayment(
    orderId: number,
    body: { method: PaymentMethod; amount: number; version: number },
  ): Promise<Order> {
    return apiRequest<Order>(
      "POST",
      `/v1/orders/${orderId}/payment/confirm`,
      body,
    );
  },

  /**
   * O-6: starts preparing a paid order (PAID → PREPARING).
   *
   * @param orderId - order id
   * @param version - the version the staff member last saw
   * @returns the updated order
   * @throws {ApiError} 409 `BR-27` (stale version) or `ORDER_STATE`
   */
  start(orderId: number, version: number): Promise<Order> {
    return apiRequest<Order>("POST", `/v1/orders/${orderId}/start`, {
      version,
    });
  },

  /**
   * O-7: marks an order ready for pickup (PREPARING → READY).
   *
   * @param orderId - order id
   * @param version - the version the staff member last saw
   * @returns the updated order
   * @throws {ApiError} 409 `BR-27` (stale version) or `ORDER_STATE`
   */
  markReady(orderId: number, version: number): Promise<Order> {
    return apiRequest<Order>("POST", `/v1/orders/${orderId}/ready`, {
      version,
    });
  },

  /**
   * O-8: hands the order over (READY → COMPLETED), which opens the review
   * window.
   *
   * @param orderId - order id
   * @param version - the version the staff member last saw
   * @returns the updated order
   * @throws {ApiError} 409 `BR-27` (stale version) or `ORDER_STATE`
   */
  complete(orderId: number, version: number): Promise<Order> {
    return apiRequest<Order>("POST", `/v1/orders/${orderId}/complete`, {
      version,
    });
  },

  /**
   * O-9: cancels an order. Who may cancel depends on the status
   * (docs/05-api.md §2.4): an unpaid order by its customer, guest or staff
   * (payment VOIDED); a paid or preparing one only by a manager with a reason
   * (payment REFUNDED, BR-29).
   *
   * @param orderId - order id
   * @param body - request body
   * @param body.version - the version the caller last saw
   * @param body.reason - required when the order was already paid
   * @param guestToken - needed when the caller is a guest
   * @returns the cancelled order
   * @throws {ApiError} 403 `BR-29` when a non-manager cancels a paid order
   * @throws {ApiError} 422 `BR-29` when a paid order is cancelled without a reason
   * @throws {ApiError} 409 `BR-27` (stale version) or `ORDER_STATE`
   */
  cancel(
    orderId: number,
    body: { version: number; reason?: string },
    guestToken?: string,
  ): Promise<Order> {
    return apiRequest<Order>(
      "POST",
      `/v1/orders/${orderId}/cancel`,
      body,
      guestHeaders(guestToken),
    );
  },
};

export const reviewService = {
  /**
   * R-1: the customer reviews one of their completed orders, once, within the
   * review window.
   *
   * @param orderId - order id
   * @param body - request body
   * @param body.rating - 1 to 5 stars
   * @param body.comment - optional, at most 500 characters
   * @returns the saved review
   * @throws {ApiError} 422 `BR-30` when the order is not the caller's, not
   *   completed, or past the review window
   * @throws {ApiError} 422 `BR-31` for a second review, a bad rating or a long comment
   */
  create(
    orderId: number,
    body: { rating: number; comment?: string },
  ): Promise<Review> {
    return apiRequest<Review>("POST", `/v1/orders/${orderId}/review`, body);
  },

  /**
   * R-2: lists reviews for the manager, newest first, with overall stats.
   *
   * @param filter - optional filters
   * @param filter.rating - only this star rating
   * @param filter.page - page number from 1 (default 1)
   * @param filter.size - page size (default 20)
   * @returns one page plus `average` and `countByRating` over all reviews
   * @throws {ApiError} 401/403 when the caller is not the manager
   */
  list(
    filter: { rating?: number; page?: number; size?: number } = {},
  ): Promise<ReviewList> {
    return apiRequest<ReviewList>("GET", `/v1/reviews${query(filter)}`);
  },
};
