// O-1 → O-9, R-1, R-2 in docs/05-api.md.
import {
  type OrderItemRow,
  type OrderRow,
  clone,
  currentActor,
  db,
  delay,
  fail,
  iso,
  mockNow,
  nextId,
  randomToken,
  requireActor,
  runJobs,
} from "../mock-data/db";
import type { MockAccount } from "../mock-data/users";
import type {
  CreateOrderRequest,
  Order,
  OrderStatus,
  PaymentMethod,
  Review,
  ReviewList,
} from "../types";
import { checkSelection, groupsOf } from "../utils/options";
import { productSellable } from "./catalog";

const REVIEW_COMMENT_MAX = 500; // BR-31

/**
 * Hides all but the last three digits of a phone number.
 * @param phone Full phone number, or null for guest orders.
 * @returns The masked number (`*******321`), or null.
 */
function maskPhone(phone: string | null) {
  return phone ? `*******${phone.slice(-3)}` : null;
}

/**
 * Converts a stored order row into the API shape. Strips internal fields
 * (idempotency data, unit costs, category ids) and attaches the review.
 * @param row The stored order.
 * @param viewer Who is reading; only the owning customer sees the full phone.
 * @param withGuestToken Include `guestToken`, only in the response to O-1.
 * @returns A detached copy of the order.
 */
function toOrder(
  row: OrderRow,
  viewer: MockAccount | null,
  withGuestToken = false,
): Order {
  const {
    guestToken,
    idempotencyKey: _k,
    requestFingerprint: _f,
    items,
    ...rest
  } = row;
  const customer = db.accounts.find((a) => a.id === row.customerId);
  const isOwner = !!viewer && viewer.id === row.customerId;
  return clone({
    ...rest,
    customerPhone: isOwner
      ? (customer?.phone ?? null)
      : maskPhone(customer?.phone ?? null),
    ...(withGuestToken && guestToken ? { guestToken } : {}),
    items: items.map(({ categoryId: _c, unitCost: _u, options, ...i }) => ({
      ...i,
      options: options.map(({ optionGroupId: _g, costDelta: _d, ...o }) => o),
    })),
    review: db.reviews.find((r) => r.orderId === row.id) ?? null,
  });
}

/**
 * Runs due background jobs, then looks up an order.
 * @param id Order id.
 * @returns The stored row (mutable).
 * @throws {ApiError} 404 `NOT_FOUND` when no order has this id.
 */
function findOrder(id: number): OrderRow {
  runJobs();
  const o = db.orders.find((x) => x.id === id);
  if (!o) fail(404, "NOT_FOUND", "Không tìm thấy đơn");
  return o;
}

/**
 * Who may read an order: its customer, the guest holding its token, or any
 * staff member. A wrong guest token gets 404 so it does not reveal the order.
 * @param o The order being read.
 * @param guestToken Token returned to a guest by O-1.
 * @returns The signed-in actor, or null for a guest with a valid token.
 * @throws {ApiError} 404 `NOT_FOUND` when the caller may not see the order.
 */
function authorizeRead(o: OrderRow, guestToken?: string): MockAccount | null {
  const actor = currentActor();
  if (actor?.role === "CUSTOMER" && actor.id === o.customerId) return actor;
  if (actor && actor.role !== "CUSTOMER") return actor;
  if (guestToken && o.guestToken === guestToken) return actor;
  fail(404, "NOT_FOUND", "Không tìm thấy đơn");
}

/**
 * Moves an order to a new status with optimistic locking (BR-27) and bumps
 * its version.
 * @param o The order to change.
 * @param version The version the client last saw.
 * @param from Statuses this move is allowed from.
 * @param to The new status.
 * @throws {ApiError} 409 `BR-27` with `currentVersion` when the version is stale.
 * @throws {ApiError} 409 `ORDER_STATE` when the current status is not in `from`.
 */
function transition(
  o: OrderRow,
  version: number,
  from: OrderStatus[],
  to: OrderStatus,
) {
  if (o.version !== version)
    fail(409, "BR-27", "Đơn vừa được người khác cập nhật", {
      currentVersion: o.version,
    });
  if (!from.includes(o.status))
    fail(409, "ORDER_STATE", "Trạng thái đơn không cho phép thao tác này");
  o.status = to;
  o.version++;
}

/**
 * Issues the next order code, `DH-YYMMDD-NNNN`, with the counter restarting
 * each business day (BR-25).
 * @returns The new code.
 */
function nextOrderCode() {
  const now = mockNow();
  const y = now.getFullYear().toString().slice(2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const key = `${now.getFullYear()}-${m}-${d}`;
  const seq = (db.dailyCounter.get(key) ?? 0) + 1;
  db.dailyCounter.set(key, seq);
  return `DH-${y}${m}${d}-${seq.toString().padStart(4, "0")}`;
}

export const orderService = {
  /**
   * Server clock, used for countdowns to `paymentDeadline`.
   * @returns The current (mock) server time.
   */
  now(): Date {
    return mockNow();
  },

  /**
   * O-1: places an order and starts its payment countdown. Repeating a call
   * with the same key and cart returns the first order (BR-24).
   * @param req Cart lines with the prices the client showed, payment method,
   *   table and note.
   * @param idempotencyKey One key per checkout attempt.
   * @returns The new order; guests also get `guestToken` to track it.
   * @throws {ApiError} 403 `FORBIDDEN` when a staff account tries to order.
   * @throws {ApiError} 422 `BR-24` when the key was used for a different cart.
   * @throws {ApiError} 422 `BR-23` for an empty cart or a quantity out of range.
   * @throws {ApiError} 422 `BR-21` with `errors[]` for items no longer on sale,
   *   or reason `OPTION_UNAVAILABLE` when a chosen option is sold out (BR-19).
   * @throws {ApiError} 422 `BR-18` with `errors[].line` when the options break
   *   a group's rules, belong to another product or are sent for a combo.
   * @throws {ApiError} 409 `BR-22` with `errors[].currentPrice` when prices changed.
   */
  async create(
    req: CreateOrderRequest,
    idempotencyKey: string,
  ): Promise<Order> {
    await delay(250);
    runJobs();
    const actor = currentActor();
    if (actor && actor.role !== "CUSTOMER")
      fail(
        403,
        "FORBIDDEN",
        "Nhân viên không đặt món bằng tài khoản nhân viên",
      );

    const fingerprint = JSON.stringify(req);
    const existing = db.orders.find((o) => o.idempotencyKey === idempotencyKey);
    if (existing) {
      if (existing.requestFingerprint !== fingerprint)
        fail(422, "BR-24", "Khoá đặt món đã dùng cho một giỏ hàng khác");
      return toOrder(existing, actor, true);
    }

    const settings = db.settings;
    if (req.items.length === 0) fail(422, "BR-23", "Giỏ hàng đang trống");

    // `line` is the index in req.items: one product can sit on several lines
    // with different options, so (itemType, id) alone does not say which.
    const unavailable: {
      line: number;
      itemType: string;
      id: number;
      optionValueId?: number;
      reason: string;
    }[] = [];
    const invalid: {
      line: number;
      itemType: string;
      id: number;
      groupId: number;
      message: string;
    }[] = [];
    const priceChanged: {
      line: number;
      itemType: string;
      id: number;
      currentPrice: number;
    }[] = [];
    const lines: OrderItemRow[] = [];

    for (const [line, item] of req.items.entries()) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > settings.maxItemQuantity
      )
        fail(
          422,
          "BR-23",
          `Số lượng mỗi món từ 1 đến ${settings.maxItemQuantity}`,
        );

      if (item.type === "PRODUCT") {
        const p = db.products.find((x) => x.id === item.id && !x.deletedAt);
        if (!p || !p.isAvailable) {
          unavailable.push({
            line,
            itemType: "PRODUCT",
            id: item.id,
            reason: "UNAVAILABLE",
          });
          continue;
        }
        const ids = item.optionValueIds ?? [];
        // Deleted values stay in the rows so an old cart gets BR-21, not BR-18.
        const groups = groupsOf(
          p,
          db.optionGroups.filter((g) => !g.deletedAt),
        );
        const chosen = groups.flatMap((g) =>
          g.values.filter((v) => ids.includes(v.id)).map((v) => ({ g, v })),
        );
        const soldOut = chosen.filter(({ v }) => v.deletedAt || !v.isAvailable);
        if (soldOut.length) {
          for (const { v } of soldOut)
            unavailable.push({
              line,
              itemType: "PRODUCT",
              id: p.id,
              optionValueId: v.id,
              reason: "OPTION_UNAVAILABLE",
            });
          continue;
        }
        const problems = checkSelection(groups, ids);
        if (problems.length) {
          for (const pr of problems)
            invalid.push({ line, itemType: "PRODUCT", id: p.id, ...pr });
          continue;
        }
        const options = chosen.map(({ g, v }) => ({
          optionValueId: v.id,
          optionGroupId: g.id,
          groupName: g.name,
          valueName: v.name,
          priceDelta: v.priceDelta,
          costDelta: v.costDelta,
        }));
        // BR-17: deltas are part of the price the customer saw (BR-22)
        const unitPrice = options.reduce((s, o) => s + o.priceDelta, p.price);
        if (unitPrice !== item.unitPrice)
          priceChanged.push({
            line,
            itemType: "PRODUCT",
            id: p.id,
            currentPrice: unitPrice,
          });
        lines.push({
          type: "PRODUCT",
          id: p.id,
          name: p.name,
          categoryId: p.categoryId,
          unitPrice,
          unitCost: options.reduce((s, o) => s + o.costDelta, p.costPrice),
          quantity: item.quantity,
          lineTotal: unitPrice * item.quantity,
          options,
        });
      } else {
        const c = db.combos.find((x) => x.id === item.id && !x.deletedAt);
        const sellable =
          !!c &&
          c.isAvailable &&
          c.items.every((i) =>
            productSellable(db.products.find((p) => p.id === i.productId)),
          );
        if (item.optionValueIds?.length) {
          invalid.push({
            line,
            itemType: "COMBO",
            id: item.id,
            groupId: 0,
            message: "Combo không chọn tuỳ chọn riêng",
          });
          continue;
        }
        if (!c || !sellable) {
          unavailable.push({
            line,
            itemType: "COMBO",
            id: item.id,
            reason: "UNAVAILABLE",
          });
          continue;
        }
        if (c.price !== item.unitPrice)
          priceChanged.push({
            line,
            itemType: "COMBO",
            id: c.id,
            currentPrice: c.price,
          });
        // BR-51: combo cost = sum of component costs at the time of sale
        const unitCost = c.items.reduce(
          (s, i) =>
            s +
            (db.products.find((p) => p.id === i.productId)?.costPrice ?? 0) *
              i.quantity,
          0,
        );
        lines.push({
          type: "COMBO",
          id: c.id,
          name: c.name,
          categoryId: null,
          unitPrice: c.price,
          unitCost,
          quantity: item.quantity,
          lineTotal: c.price * item.quantity,
          options: [],
        });
      }
    }

    if (unavailable.length)
      fail(
        422,
        "BR-21",
        `${new Set(unavailable.map((u) => u.line)).size} dòng trong giỏ có món hoặc tuỳ chọn đã ngừng bán`,
        { errors: unavailable },
      );
    if (invalid.length)
      fail(422, "BR-18", "Tuỳ chọn của một số món không hợp lệ", {
        errors: invalid,
      });
    if (priceChanged.length)
      fail(409, "BR-22", "Giá một số món đã thay đổi", {
        errors: priceChanged,
      });

    const now = mockNow();
    const code = nextOrderCode();
    const total = lines.reduce((s, l) => s + l.lineTotal, 0);
    const isCustomer = actor?.role === "CUSTOMER";
    const row: OrderRow = {
      id: nextId(),
      code,
      status: "PENDING_PAYMENT",
      total,
      version: 1,
      tableLabel: req.tableLabel?.trim() || null,
      note: req.note?.trim() || null,
      customerId: isCustomer ? actor.id : null,
      guestToken: isCustomer ? undefined : randomToken("gt"),
      paymentDeadline: iso(
        new Date(now.getTime() + settings.paymentTimeoutMinutes * 60_000),
      ),
      payment: {
        method: req.paymentMethod,
        status: "PENDING",
        amount: total,
        transferContent: code,
        confirmedAt: null,
      },
      items: lines,
      createdAt: iso(now),
      paidAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelReason: null,
      idempotencyKey,
      requestFingerprint: fingerprint,
    };
    db.orders.push(row);
    return toOrder(row, actor, true);
  },

  /**
   * O-2: reads one order.
   * @param orderId Order id.
   * @param guestToken Needed when the caller is a guest.
   * @returns The order, with the phone masked unless the caller owns it.
   * @throws {ApiError} 404 `NOT_FOUND` when missing or not visible to the caller.
   */
  async get(orderId: number, guestToken?: string): Promise<Order> {
    await delay(80);
    const o = findOrder(orderId);
    return toOrder(o, authorizeRead(o, guestToken));
  },

  /**
   * O-3: the signed-in customer's orders, newest first.
   * @returns The customer's orders.
   * @throws {ApiError} 401/403 when the caller is not a customer.
   */
  async listMine(): Promise<Order[]> {
    await delay();
    runJobs();
    const actor = requireActor(["CUSTOMER"]);
    return db.orders
      .filter((o) => o.customerId === actor.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((o) => toOrder(o, actor));
  },

  /**
   * O-4: the staff order queue, oldest first.
   * @param filter Optional filters.

   * @param filter.status Only these statuses; all when omitted.
   * @param filter.q Part of an order code, case-insensitive.
   * @returns Matching orders.
   * @throws {ApiError} 401/403 when the caller is not staff or manager.
   */
  async listQueue(
    filter: { status?: OrderStatus[]; q?: string } = {},
  ): Promise<Order[]> {
    await delay();
    runJobs();
    const actor = requireActor(["STAFF", "MANAGER"]);
    const q = filter.q?.trim().toUpperCase() ?? "";
    return db.orders
      .filter(
        (o) =>
          (!filter.status || filter.status.includes(o.status)) &&
          (!q || o.code.includes(q)),
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((o) => toOrder(o, actor));
  },

  /**
   * O-5: staff confirm that the customer paid; the order becomes PAID.
   * @param orderId Order id.
   * @param body Request body.

   * @param body.method How the customer actually paid.
   * @param body.amount Amount received; must equal the order total (BR-26).
   * @param body.version The version the staff member last saw (BR-27).
   * @returns The updated order.
   * @throws {ApiError} 409 `BR-27` when the order changed in the meantime.
   * @throws {ApiError} 409 `BR-26` when the order is no longer awaiting payment.
   * @throws {ApiError} 422 `BR-26` when the amount differs from the total.
   */
  async confirmPayment(
    orderId: number,
    body: { method: PaymentMethod; amount: number; version: number },
  ): Promise<Order> {
    await delay();
    const o = findOrder(orderId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    if (o.version !== body.version)
      fail(409, "BR-27", "Đơn vừa được người khác cập nhật", {
        currentVersion: o.version,
      });
    if (o.status !== "PENDING_PAYMENT")
      fail(409, "BR-26", "Đơn không còn chờ thanh toán");
    if (body.amount !== o.total)
      fail(422, "BR-26", "Số tiền xác nhận phải bằng tổng tiền của đơn");
    transition(o, body.version, ["PENDING_PAYMENT"], "PAID");
    const now = iso(mockNow());
    o.paidAt = now;
    o.payment = {
      ...o.payment,
      method: body.method,
      status: "CONFIRMED",
      confirmedAt: now,
    };
    return toOrder(o, actor);
  },

  /**
   * O-6: starts preparing a paid order (PAID → PREPARING).
   * @param orderId Order id.
   * @param version The version the staff member last saw.
   * @returns The updated order.
   * @throws {ApiError} 409 `BR-27` or `ORDER_STATE`, see {@link transition}.
   */
  async start(orderId: number, version: number): Promise<Order> {
    await delay();
    const o = findOrder(orderId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    transition(o, version, ["PAID"], "PREPARING");
    return toOrder(o, actor);
  },

  /**
   * O-7: marks an order ready for pickup (PREPARING → READY).
   * @param orderId Order id.
   * @param version The version the staff member last saw.
   * @returns The updated order.
   * @throws {ApiError} 409 `BR-27` or `ORDER_STATE`, see {@link transition}.
   */
  async markReady(orderId: number, version: number): Promise<Order> {
    await delay();
    const o = findOrder(orderId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    transition(o, version, ["PREPARING"], "READY");
    return toOrder(o, actor);
  },

  /**
   * O-8: hands the order over (READY → COMPLETED), which opens the review
   * window.
   * @param orderId Order id.
   * @param version The version the staff member last saw.
   * @returns The updated order.
   * @throws {ApiError} 409 `BR-27` or `ORDER_STATE`, see {@link transition}.
   */
  async complete(orderId: number, version: number): Promise<Order> {
    await delay();
    const o = findOrder(orderId);
    const actor = requireActor(["STAFF", "MANAGER"]);
    transition(o, version, ["READY"], "COMPLETED");
    o.completedAt = iso(mockNow());
    return toOrder(o, actor);
  },

  /**
   * O-9: cancels an order. Who may cancel depends on the status
   * (docs/05-api.md §2.4): an unpaid order by its customer, guest or staff
   * (payment VOIDED); a paid or preparing one only by a manager with a reason
   * (payment REFUNDED, BR-29).
   * @param orderId Order id.
   * @param body Request body.

   * @param body.version The version the caller last saw.
   * @param body.reason Required when the order was already paid.
   * @param guestToken Needed when the caller is a guest.
   * @returns The cancelled order.
   * @throws {ApiError} 403 `BR-29` when a non-manager cancels a paid order.
   * @throws {ApiError} 422 `BR-29` when a paid order is cancelled without a reason.
   * @throws {ApiError} 409 `BR-27` or `ORDER_STATE`, see {@link transition}.
   */
  async cancel(
    orderId: number,
    body: { version: number; reason?: string },
    guestToken?: string,
  ): Promise<Order> {
    await delay();
    const o = findOrder(orderId);
    const actor = authorizeRead(o, guestToken);
    const isStaff = !!actor && actor.role !== "CUSTOMER";

    if (o.status === "PAID" || o.status === "PREPARING") {
      if (actor?.role !== "MANAGER")
        fail(403, "BR-29", "Chỉ quản lý được huỷ đơn đã thanh toán");
      if (!body.reason?.trim())
        fail(422, "BR-29", "Phải nhập lý do khi huỷ đơn đã thanh toán");
      transition(o, body.version, ["PAID", "PREPARING"], "CANCELLED");
      o.payment.status = "REFUNDED";
    } else {
      transition(o, body.version, ["PENDING_PAYMENT"], "CANCELLED");
      o.payment.status = "VOIDED";
    }
    o.cancelledAt = iso(mockNow());
    o.cancelReason =
      body.reason?.trim() || (isStaff ? "Nhân viên huỷ" : "Khách huỷ");
    return toOrder(o, actor);
  },
};

export const reviewService = {
  /**
   * R-1: the customer reviews one of their completed orders, once, within the
   * review window.
   * @param orderId Order id.
   * @param body Request body.

   * @param body.rating 1 to 5 stars.
   * @param body.comment Optional, at most 500 characters.
   * @returns The saved review.
   * @throws {ApiError} 422 `BR-30` when the order is not the caller's, not
   *   completed, or past the review window.
   * @throws {ApiError} 422 `BR-31` for a second review, a bad rating or a long comment.
   */
  async create(
    orderId: number,
    body: { rating: number; comment?: string },
  ): Promise<Review> {
    await delay();
    const o = findOrder(orderId);
    const actor = requireActor(["CUSTOMER"]);
    if (o.customerId !== actor.id)
      fail(422, "BR-30", "Bạn chỉ đánh giá được đơn của mình");
    if (o.status !== "COMPLETED" || !o.completedAt)
      fail(422, "BR-30", "Chỉ đánh giá được đơn đã hoàn tất");
    const days = db.settings.reviewWindowDays;
    if (
      mockNow().getTime() - new Date(o.completedAt).getTime() >
      days * 86_400_000
    )
      fail(422, "BR-30", `Đã quá ${days} ngày kể từ khi hoàn tất đơn`);
    if (db.reviews.some((r) => r.orderId === orderId))
      fail(422, "BR-31", "Đơn này đã được đánh giá");
    if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5)
      fail(422, "BR-31", "Số sao từ 1 đến 5");
    const comment = body.comment?.trim() || null;
    if (comment && comment.length > REVIEW_COMMENT_MAX)
      fail(422, "BR-31", `Bình luận tối đa ${REVIEW_COMMENT_MAX} ký tự`);
    const review: Review = {
      id: nextId(),
      orderId,
      orderCode: o.code,
      customerName: actor.fullName,
      rating: body.rating,
      comment,
      createdAt: iso(mockNow()),
    };
    db.reviews.push(review);
    return clone(review);
  },

  /**
   * R-2: lists reviews for the manager, newest first, with overall stats.
   * @param filter Optional filters.

   * @param filter.rating Only this star rating.
   * @param filter.page Page number from 1 (default 1).
   * @param filter.size Page size (default 20).
   * @returns One page plus `average` and `countByRating` over all reviews.
   * @throws {ApiError} 401/403 when the caller is not the manager.
   */
  async list(
    filter: { rating?: number; page?: number; size?: number } = {},
  ): Promise<ReviewList> {
    await delay();
    requireActor(["MANAGER"]);
    const all = db.reviews;
    const countByRating = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    } as ReviewList["countByRating"];
    all.forEach((r) => countByRating[r.rating as 1 | 2 | 3 | 4 | 5]++);
    const filtered = all
      .filter((r) => !filter.rating || r.rating === filter.rating)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const page = filter.page ?? 1;
    const size = filter.size ?? 20;
    return {
      items: clone(filtered.slice((page - 1) * size, page * size)),
      page,
      size,
      total: filtered.length,
      average: all.length
        ? all.reduce((s, r) => s + r.rating, 0) / all.length
        : 0,
      countByRating,
    };
  },
};
