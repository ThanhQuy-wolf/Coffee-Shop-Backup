import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Ban,
  Banknote,
  Bell,
  Blend,
  Brush,
  Cake,
  Calculator,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarMinus,
  CalendarPlus,
  CalendarX,
  Candy,
  Carrot,
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartPie,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  Clock,
  Coffee,
  Columns3,
  ConciergeBell,
  Cookie,
  Crosshair,
  CupSoda,
  Drumstick,
  Eye,
  EyeOff,
  Fish,
  Flag,
  Flame,
  Globe,
  Grid3x3,
  HandCoins,
  Heart,
  Hourglass,
  House,
  IceCreamCone,
  Layers,
  Leaf,
  LoaderCircle,
  LogIn,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Martini,
  Minus,
  Pencil,
  Phone,
  Pizza,
  Plus,
  QrCode,
  Receipt,
  Sandwich,
  Save,
  Search,
  ShoppingBasket,
  ShoppingCart,
  SlidersHorizontal,
  Soup,
  Star,
  Store,
  Table,
  Tag,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  UserMinus,
  UserRoundCog,
  Utensils,
  Wifi,
  X,
} from "lucide-react";
import type { SVGProps } from "react";

/** Facebook "f" mark; lucide-react no longer ships brand logos. */
function FacebookMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.6 2 14.4 2 11.8 2 10 3.6 10 6.5v2H7.3V12H10v10h4V12h2.7l.4-3.5H14Z" />
    </svg>
  );
}

/** TikTok note mark; lucide-react no longer ships brand logos. */
function TiktokMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.4 6.2V8.7a8 8 0 0 0 4.4 1.3V6.6a4.5 4.5 0 0 1-4.4-4.6Z" />
    </svg>
  );
}

type IconComponent =
  LucideIcon | ((props: SVGProps<SVGSVGElement>) => React.ReactElement);

/**
 * Icon names the app (and category data from the backend) uses, kept in the
 * old FontAwesome spelling so stored values such as `fa-solid fa-mug-hot`
 * keep working.
 */
const ICONS: Record<string, IconComponent> = {
  "arrow-left": ArrowLeft,
  "arrow-trend-down": TrendingDown,
  "arrow-trend-up": TrendingUp,
  ban: Ban,
  "basket-shopping": ShoppingBasket,
  bell: Bell,
  "bell-concierge": ConciergeBell,
  blender: Blend,
  "border-all": Grid3x3,
  "bowl-food": Soup,
  broom: Brush,
  burger: Sandwich,
  "cake-candles": Cake,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  "calendar-days": CalendarDays,
  "calendar-minus": CalendarMinus,
  "calendar-plus": CalendarPlus,
  "calendar-xmark": CalendarX,
  "candy-cane": Candy,
  carrot: Carrot,
  "cart-plus": ShoppingCart,
  "cart-shopping": ShoppingCart,
  "cash-register": Calculator,
  "chart-area": ChartArea,
  "chart-bar": ChartColumn,
  "chart-line": ChartLine,
  "chart-pie": ChartPie,
  check: Check,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "circle-check": CircleCheck,
  "circle-dollar-to-slot": CircleDollarSign,
  "circle-exclamation": CircleAlert,
  clock: Clock,
  cookie: Cookie,
  crosshairs: Crosshair,
  "drumstick-bite": Drumstick,
  envelope: Mail,
  eye: Eye,
  "eye-slash": EyeOff,
  "facebook-f": FacebookMark,
  fire: Flame,
  fish: Fish,
  "flag-checkered": Flag,
  "floppy-disk": Save,
  globe: Globe,
  heart: Heart,
  "hourglass-half": Hourglass,
  house: House,
  "ice-cream": IceCreamCone,
  jar: Archive,
  "kitchen-set": ChefHat,
  "layer-group": Layers,
  leaf: Leaf,
  "location-dot": MapPin,
  "magnifying-glass": Search,
  "martini-glass-citrus": Martini,
  minus: Minus,
  "money-bill-wave": Banknote,
  "mug-hot": Coffee,
  "mug-saucer": CupSoda,
  pen: Pencil,
  phone: Phone,
  "pizza-slice": Pizza,
  plus: Plus,
  qrcode: QrCode,
  receipt: Receipt,
  "right-from-bracket": LogOut,
  "right-to-bracket": LogIn,
  "sack-dollar": HandCoins,
  sliders: SlidersHorizontal,
  sort: ArrowUpDown,
  "sort-down": ArrowDown,
  "sort-up": ArrowUp,
  spinner: LoaderCircle,
  star: Star,
  store: Store,
  "store-slash": Store,
  table: Table,
  "table-columns": Columns3,
  tag: Tag,
  tags: Tags,
  tiktok: TiktokMark,
  trash: Trash2,
  "trash-can": Trash2,
  user: User,
  "user-minus": UserMinus,
  "user-tie": UserRoundCog,
  utensils: Utensils,
  wifi: Wifi,
  xmark: X,
};

export interface IconProps {
  /**
   * Icon name, e.g. `plus`. The FontAwesome spellings `fa-plus` and
   * `fa-solid fa-plus` are accepted too, because category icons are stored
   * that way.
   */
  name: string;
  /** Extra classes. The icon is sized by the font size (`text-sm`, ...). */
  className?: string;
  /** Fills the shape instead of drawing its outline, e.g. a chosen star. */
  filled?: boolean;
  /** Accessible name. Without it the icon is hidden from screen readers. */
  label?: string;
}

/**
 * Strips the FontAwesome prefixes from a stored icon value.
 * @param value Icon value such as `fa-solid fa-mug-hot` or `mug-hot`.
 * @returns The bare name, e.g. `mug-hot`.
 */
function normalizeIconName(value: string): string {
  const parts = value.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? "";
  return last.replace(/^fa-/, "");
}

/**
 * SVG icon bundled with the app (lucide-react), so icons render even when a
 * CDN is blocked. It is 1em square, so it follows the text size around it.
 * An unknown name renders a plain circle instead of nothing.
 * @param props.name Icon name, FontAwesome spelling accepted.
 * @param props.className Extra classes such as colour or margin.
 * @param props.filled Fills the shape with the current colour.
 * @param props.label Accessible name; omit it for decorative icons.
 * @returns The SVG element.
 */
export default function Icon({
  name,
  className = "",
  filled = false,
  label,
}: IconProps) {
  const Svg = ICONS[normalizeIconName(name)] ?? Circle;
  return (
    <Svg
      width="1em"
      height="1em"
      className={`inline-block shrink-0 align-[-0.125em] ${className}`}
      {...(filled ? { fill: "currentColor" } : {})}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
