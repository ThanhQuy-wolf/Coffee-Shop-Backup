// In-memory stand-in for the backend. Services in lib/services read and write
// this state and enforce the same business rules the real API will (BR-xx in
// docs/02-business-rules.md), so the UI already handles the real error codes.
// State resets on page reload.
import { ApiError, getAccessToken } from "../services/client";
import type {
  Combo,
  Department,
  MenuCategory,
  NotificationType,
  Order,
  OrderItemType,
  Product,
  Review,
  ShopInfo,
  ShopSettings,
  User,
  UserRole,
} from "../types";
import { MENU_CATEGORIES, MOCK_COMBOS, MOCK_PRODUCTS } from "./menu";
import { type AssignmentRow, MOCK_SHIFT_SEED, type ShiftRow } from "./shifts";
import {
  DEFAULT_SHOP_SETTINGS,
  MOCK_DEPARTMENTS,
  MOCK_SHOP_INFO,
} from "./shops";
import { MOCK_ACCOUNTS, type MockAccount } from "./users";

// ─── Clock ──────────────────────────────────────────────────────────────────
// The seed data sits around 10/04/2026, so mock time starts there at 09:00 and
// then moves forward in real time (payment timeouts still expire normally).
const MOCK_START = new Date(2026, 3, 10, 9, 0, 0).getTime();
const loadedAt = Date.now();

export function mockNow(): Date {
  return new Date(MOCK_START + (Date.now() - loadedAt));
}

export function iso(d: Date): string {
  return d.toISOString();
}

export function minutesAgo(min: number): Date {
  return new Date(mockNow().getTime() - min * 60_000);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fail(
  status: number,
  code: string,
  message: string,
  details: Record<string, unknown> = {},
): never {
  throw new ApiError(status, code, message, details);
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}

let nextIdValue = 10_000;
export function nextId() {
  return ++nextIdValue;
}

export function randomToken(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
}

// ─── Rows that differ from the API shape ────────────────────────────────────

export interface CategoryRow extends MenuCategory {
  deletedAt: string | null;
}
export interface ProductRow extends Product {
  deletedAt: string | null;
}
export type ComboRow = Omit<Combo, "sellable"> & { deletedAt: string | null };

export interface OrderItemRow {
  type: OrderItemType;
  id: number;
  name: string;
  categoryId: number | null;
  unitPrice: number;
  unitCost: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderRow extends Omit<
  Order,
  "items" | "review" | "customerPhone"
> {
  guestToken?: string;
  idempotencyKey: string;
  requestFingerprint: string;
  items: OrderItemRow[];
}

export interface NotificationRow {
  id: number;
  userId: number;
  type: NotificationType;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface OtpRow {
  phone: string;
  code: string;
  attempts: number;
  expiresAt: number;
  sentAt: number;
  consumed: boolean;
}

// ─── Seed ───────────────────────────────────────────────────────────────────

const categories: CategoryRow[] = MENU_CATEGORIES.map((c) => ({
  ...c,
  deletedAt: null,
}));
const products: ProductRow[] = MOCK_PRODUCTS.map((p) => ({
  ...p,
  deletedAt: null,
}));
const combos: ComboRow[] = MOCK_COMBOS.map(({ sellable: _, ...c }) => ({
  ...c,
  deletedAt: null,
}));

function seedOrder(
  id: number,
  seq: number,
  status: Order["status"],
  createdMinutesAgo: number,
  lines: [number, number][],
  extra: Partial<OrderRow> = {},
): OrderRow {
  const createdAt = minutesAgo(createdMinutesAgo);
  const items: OrderItemRow[] = lines.map(([productId, quantity]) => {
    const p = MOCK_PRODUCTS.find((x) => x.id === productId)!;
    return {
      type: "PRODUCT",
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      unitPrice: p.price,
      unitCost: p.costPrice,
      quantity,
      lineTotal: p.price * quantity,
    };
  });
  const total = items.reduce((s, i) => s + i.lineTotal, 0);
  const paid = status !== "PENDING_PAYMENT" && status !== "CANCELLED";
  const code = `DH-260410-${seq.toString().padStart(4, "0")}`;
  return {
    id,
    code,
    status,
    total,
    version: 1,
    tableLabel: null,
    note: null,
    customerId: null,
    guestToken: randomToken("gt"),
    paymentDeadline: iso(new Date(createdAt.getTime() + 15 * 60_000)),
    payment: {
      method: "CASH",
      status: paid ? "CONFIRMED" : "PENDING",
      amount: total,
      transferContent: code,
      confirmedAt: paid ? iso(new Date(createdAt.getTime() + 60_000)) : null,
    },
    items,
    createdAt: iso(createdAt),
    paidAt: paid ? iso(new Date(createdAt.getTime() + 60_000)) : null,
    completedAt:
      status === "COMPLETED"
        ? iso(new Date(createdAt.getTime() + 15 * 60_000))
        : null,
    cancelledAt: null,
    cancelReason: null,
    idempotencyKey: `seed-${id}`,
    requestFingerprint: "",
    ...extra,
  };
}

const DAY = 24 * 60;

function seedOrders(): OrderRow[] {
  return [
    seedOrder(
      1,
      1,
      "COMPLETED",
      3 * DAY,
      [
        [1, 2],
        [14, 1],
      ],
      { customerId: 10, guestToken: undefined },
    ),
    seedOrder(
      2,
      2,
      "COMPLETED",
      2 * DAY,
      [
        [5, 1],
        [6, 1],
      ],
      { customerId: 10, guestToken: undefined },
    ),
    seedOrder(3, 3, "COMPLETED", 10 * DAY, [[12, 1]], {
      customerId: 10,
      guestToken: undefined,
    }),
    seedOrder(
      4,
      4,
      "PENDING_PAYMENT",
      3,
      [
        [2, 1],
        [15, 1],
      ],
      { tableLabel: "B02" },
    ),
    seedOrder(5, 5, "PENDING_PAYMENT", 1, [[3, 2]], {
      payment: {
        method: "QR",
        status: "PENDING",
        amount: 64000,
        transferContent: "DH-260410-0005",
        confirmedAt: null,
      },
    }),
    seedOrder(
      6,
      6,
      "PAID",
      6,
      [
        [4, 1],
        [10, 1],
      ],
      { tableLabel: "A01" },
    ),
    seedOrder(7, 7, "PREPARING", 9, [[7, 2]], { note: "Ít đá" }),
    seedOrder(
      8,
      8,
      "READY",
      12,
      [
        [13, 1],
        [16, 1],
      ],
      { customerId: 10, guestToken: undefined },
    ),
  ];
}

const seedReviews: Review[] = [
  {
    id: 1,
    orderId: 1,
    orderCode: "DH-260410-0001",
    customerName: "Khách hàng demo",
    rating: 5,
    comment: "Cà phê đậm, phục vụ nhanh.",
    createdAt: iso(minutesAgo(3 * DAY - 30)),
  },
  {
    id: 2,
    orderId: 900,
    orderCode: "DH-260405-0012",
    customerName: "Minh Thư",
    rating: 4,
    comment: "Trà đào ngon, hơi ngọt.",
    createdAt: iso(minutesAgo(5 * DAY)),
  },
  {
    id: 3,
    orderId: 901,
    orderCode: "DH-260402-0031",
    customerName: "Hoàng Nam",
    rating: 3,
    comment: null,
    createdAt: iso(minutesAgo(8 * DAY)),
  },
];

// ─── State ──────────────────────────────────────────────────────────────────

export const db = {
  shop: clone(MOCK_SHOP_INFO) as ShopInfo,
  settings: { ...DEFAULT_SHOP_SETTINGS } as ShopSettings,
  departments: clone(MOCK_DEPARTMENTS) as Department[],
  accounts: clone(MOCK_ACCOUNTS) as MockAccount[],
  categories,
  products,
  combos,
  orders: seedOrders(),
  reviews: clone(seedReviews),
  shifts: clone(MOCK_SHIFT_SEED.shifts) as ShiftRow[],
  assignments: clone(MOCK_SHIFT_SEED.assignments) as AssignmentRow[],
  notifications: [] as NotificationRow[],
  otps: new Map<string, OtpRow>(),
  dailyCounter: new Map<string, number>([["2026-04-10", 8]]),
  failedLogins: new Map<number, { count: number; lockedUntil: number }>(),
};

// ─── Auth helpers ───────────────────────────────────────────────────────────

/** Mock access tokens look like "mock.<userId>". */
export function currentActor(): MockAccount | null {
  const token = getAccessToken();
  const match = token?.match(/^mock\.(\d+)$/);
  if (!match) return null;
  return db.accounts.find((a) => a.id === Number(match[1])) ?? null;
}

export function requireActor(roles?: UserRole[]): MockAccount {
  const actor = currentActor();
  if (!actor) fail(401, "UNAUTHENTICATED", "Vui lòng đăng nhập");
  if (roles && !roles.includes(actor.role))
    fail(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  return actor;
}

export function toUser(a: MockAccount): User {
  const { password: _, ...user } = a;
  return user;
}

export function notify(
  userId: number,
  type: NotificationType,
  message: string,
) {
  db.notifications.push({
    id: nextId(),
    userId,
    type,
    message,
    readAt: null,
    createdAt: iso(mockNow()),
  });
}

/** Start of a shift in mock time. */
export function shiftStart(s: Pick<ShiftRow, "date" | "startTime">): Date {
  return new Date(`${s.date}T${s.startTime}:00`);
}

// ─── Background jobs ────────────────────────────────────────────────────────
// The backend runs these every minute. The mock runs them before each call,
// which gives the same result because both jobs are idempotent.

export function runJobs() {
  const now = mockNow().getTime();

  // BR-28: cancel orders not paid in time
  for (const o of db.orders) {
    if (o.status !== "PENDING_PAYMENT") continue;
    if (new Date(o.paymentDeadline).getTime() > now) continue;
    o.status = "CANCELLED";
    o.cancelReason = "PAYMENT_TIMEOUT";
    o.cancelledAt = iso(new Date(now));
    o.payment.status = "VOIDED";
    o.version++;
  }

  // BR-48: an undecided leave request falls back to REGISTERED at shift start
  for (const a of db.assignments) {
    if (a.status !== "LEAVE_REQUESTED") continue;
    const shift = db.shifts.find((s) => s.id === a.shiftId);
    if (!shift || shiftStart(shift).getTime() > now) continue;
    a.status = "REGISTERED";
    notify(
      a.staffId,
      "LEAVE_EXPIRED",
      `Yêu cầu nghỉ ca ${shift.date} ${shift.startTime} chưa được duyệt nên bạn vẫn phải đi làm.`,
    );
  }
}
