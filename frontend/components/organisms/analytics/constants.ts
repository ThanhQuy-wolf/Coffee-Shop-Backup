import type { AnalyticsPeriod } from "@/lib/types";

/** Vietnamese label of each reporting period. */
export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  day: "Theo ngày",
  week: "Theo tuần",
  month: "Theo tháng",
  year: "Theo năm",
};

/** Pie slice colours, used in order and repeated if there are more slices. */
export const CATEGORY_COLORS = [
  "#6F4E37",
  "#C8973A",
  "#A0785A",
  "#8B6914",
  "#D4A96A",
  "#4A3728",
  "#F0D9A8",
  "#A08060",
  "#3D2B1F",
];
