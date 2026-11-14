// Domain types. Field names follow docs/04-erd.md in camelCase, and the
// request/response shapes follow docs/05-api.md.

// Common
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// Account (app_user)
export type UserRole = "CUSTOMER" | "STAFF" | "MANAGER";

export interface User {
  id: number;
  role: UserRole;
  fullName: string;
  phone: string | null;
  username: string | null;
  avatarUrl: string | null;
  departmentId: number | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export type NotificationType =
  | "SHIFT_CANCELLED"
  | "ASSIGNMENT_REMOVED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "LEAVE_EXPIRED";

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
  readAt: string | null;
  createdAt: string;
}

// Shop (shop_info, single row)
export interface SocialLinks {
  facebook?: string;
  tiktok?: string;
  website?: string;
}

/** The one shop the system serves (A-5) */
export interface ShopInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  coverImageUrl: string;
  openHours: string;
  wifiName: string;
  wifiPassword: string;
  socialLinks: SocialLinks;
}

export interface ShopSettings {
  paymentTimeoutMinutes: number; // P-06
  maxItemQuantity: number; // P-08
  reviewWindowDays: number; // P-09
  shiftCancelHours: number; // P-10
  attendanceEditDays: number; // P-11
  shiftBookingDays: number; // P-12
}

// Menu (category, product, combo, combo_item)
export interface MenuCategory {
  id: number;
  name: string;
  /** FontAwesome class, e.g. "fa-solid fa-mug-hot" */
  icon: string;
  sortOrder: number;
  productCount?: number;
}

export type CategoryInput = Pick<MenuCategory, "name" | "icon" | "sortOrder">;

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  /** 0 = not declared yet (BR-10) */
  costPrice: number;
  imageUrl: string;
  isAvailable: boolean;
  /** product_option_group, in display order */
  optionGroupIds: number[];
}

export type ProductInput = Omit<Product, "id">;

export interface ComboItem {
  productId: number;
  quantity: number;
}

export interface Combo {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  items: ComboItem[];
  /** isAvailable and every component product is available (BR-13) */
  sellable: boolean;
}

export type ComboInput = Omit<Combo, "id" | "sellable">;

// ===== OPTIONS (option_group, option_value) =====
export type OptionSelectionType = "SINGLE" | "MULTIPLE";

export interface OptionValue {
  id: number;
  name: string;
  priceDelta: number;
  costDelta: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

/** Shared across products, e.g. Size, Mức đường, Topping (BR-16) */
export interface OptionGroup {
  id: number;
  name: string;
  selectionType: OptionSelectionType;
  /** ≥ 1 means the group is required */
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  values: OptionValue[];
  /** C-15 only: products using this group */
  productCount?: number;
}

export interface OptionGroupInput extends Omit<
  OptionGroup,
  "id" | "values" | "productCount"
> {
  /** A value without id is new; a missing one is deleted (C-17) */
  values: (Omit<OptionValue, "id" | "isAvailable"> & { id?: number })[];
}

/** GET /menu — only what is on sale */
export interface Menu {
  categories: MenuCategory[];
  products: Product[];
  combos: Combo[];
  /** Groups used by the products above; values that ran out have isAvailable false */
  optionGroups: OptionGroup[];
}

// Order (customer_order, order_item, payment)
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "QR";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "VOIDED" | "REFUNDED";
export type OrderItemType = "PRODUCT" | "COMBO";

/** order_item_option: names and price copied at order time (BR-17) */
export interface OrderItemOption {
  optionValueId: number;
  groupName: string;
  valueName: string;
  priceDelta: number;
  /** COMBO lines only: which unit of the combo, from 1 (FR-37) */
  componentNo?: number;
  /** COMBO lines only: product name of that unit when ordered */
  componentName?: string;
}

export interface OrderItem {
  type: OrderItemType;
  id: number;
  name: string;
  /** Already includes the option price deltas */
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  options: OrderItemOption[];
}

export interface Payment {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  /** Bank transfer content for QR = order code (BR-25) */
  transferContent: string;
  confirmedAt: string | null;
}

export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  total: number;
  version: number;
  tableLabel: string | null;
  note: string | null;
  customerId: number | null;
  /** Staff only see the last 3 digits (NFR-07) */
  customerPhone: string | null;
  /** Returned only to the guest who placed the order */
  guestToken?: string;
  paymentDeadline: string;
  payment: Payment;
  items: OrderItem[];
  review: Review | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
}

export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  tableLabel?: string;
  note?: string;
  items: {
    type: OrderItemType;
    id: number;
    quantity: number;
    /** Price the customer saw, checked against the current price (BR-22) */
    unitPrice: number;
    /** PRODUCT lines only (BR-18) */
    optionValueIds?: number[];
    /** COMBO lines only: options per unit of the combo (BR-18, FR-37) */
    components?: { no: number; optionValueIds: number[] }[];
  }[];
}

// Review (review)
export interface Review {
  id: number;
  orderId: number;
  orderCode: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewList extends Page<Review> {
  average: number;
  countByRating: Record<1 | 2 | 3 | 4 | 5, number>;
}

// Shift (department, shift, shift_assignment)
export interface Department {
  id: number;
  code: string;
  name: string;
  icon: string;
}

export interface StaffMember {
  id: number;
  fullName: string;
  role: UserRole;
  departmentId: number | null;
}

export type ShiftStatus = "OPEN" | "CANCELLED";

export type AssignmentStatus =
  | "REGISTERED"
  | "CANCELLED"
  | "LEAVE_REQUESTED"
  | "LEAVE_APPROVED"
  | "ATTENDED"
  | "ABSENT";

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  staffId: number;
  staffName: string;
  status: AssignmentStatus;
  leaveReason: string | null;
}

export interface Shift {
  id: number;
  departmentId: number;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:mm" */
  startTime: string;
  endTime: string;
  wage: number;
  maxStaff: number;
  allowCrossDepartment: boolean;
  status: ShiftStatus;
  version: number;
  /** Assignments that hold a seat (BR-43) */
  occupied: number;
  remaining: number;
  assignments: ShiftAssignment[];
}

export type ShiftInput = Pick<
  Shift,
  | "departmentId"
  | "date"
  | "startTime"
  | "endTime"
  | "wage"
  | "maxStaff"
  | "allowCrossDepartment"
>;

// Reports
export type AnalyticsPeriod = "day" | "week" | "month" | "year";

export interface RevenueDataPoint {
  label: string; // e.g. "01/04", "Tuần 1", "Tháng 1"
  revenue: number;
  orders: number;
}

export interface MetricComparison {
  current: number;
  previous: number;
  /** null when the previous period is 0 (BR-53) */
  changePercent: number | null;
}

/** RP-1 */
export interface ReportSummary {
  revenue: MetricComparison;
  orders: MetricComparison;
  grossProfit: MetricComparison;
  averageOrderValue: number;
}

export interface CategoryRevenue {
  /** null = combo lines (BR-51) */
  categoryId: number | null;
  name: string;
  revenue: number;
}

/** RP-2 */
export interface RevenueReport {
  series: RevenueDataPoint[];
  currentHalf: RevenueDataPoint[];
  previousHalf: RevenueDataPoint[];
  byCategory: CategoryRevenue[];
}

/** RP-3 row */
export interface ProductSalesStats {
  productId: number;
  name: string;
  categoryId: number;
  unitsSold: number;
  revenue: number;
  costPrice: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number; // %
  /** unit_cost = 0 on the sold lines (BR-10) */
  missingCost: boolean;
}

/** RP-4 */
export interface LaborCostReport {
  weekStart: string;
  total: number;
  byDepartment: { departmentId: number; name: string; total: number }[];
}
