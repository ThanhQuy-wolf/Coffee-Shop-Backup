"use client";

import { useCatalog } from "@/lib/contexts/catalog-context";
import { getProductSales, getRevenue } from "@/lib/services/analytics";
import type { AnalyticsPeriod } from "@/lib/types";
import { calcChange } from "@/lib/utils/analytics";
import { useMemo } from "react";

import type { PieSlice } from "./PieChart";
import { CATEGORY_COLORS } from "./constants";

/**
 * All derived numbers for the analytics page (summary, comparisons,
 * chart data, top products, filtered totals) for a period + category filter.
 */
export function useAnalytics(period: AnalyticsPeriod, categoryFilter: string) {
  const { categories } = useCatalog();
  const productSales = getProductSales();

  // Revenue data for selected period
  const revenueData = getRevenue(period);

  // Split into halves for bar comparison
  const half = Math.floor(revenueData.length / 2);
  const barCurrent = revenueData.slice(half);
  const barPrevious = revenueData.slice(0, half).slice(0, barCurrent.length);

  // Filtered product sales
  const filteredSales = useMemo(
    () =>
      categoryFilter === "all"
        ? productSales
        : productSales.filter((p) => p.category === categoryFilter),
    [categoryFilter, productSales],
  );

  // Summary stats
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);
  const totalProfit = filteredSales.reduce((s, d) => s + d.profit, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Period-over-period comparisons
  const curRevenue = barCurrent.reduce((s, d) => s + d.revenue, 0);
  const prevRevenue = barPrevious.reduce((s, d) => s + d.revenue, 0);
  const curOrders = barCurrent.reduce((s, d) => s + d.orders, 0);
  const prevOrders = barPrevious.reduce((s, d) => s + d.orders, 0);
  const revComp = calcChange(curRevenue, prevRevenue);
  const ordComp = calcChange(curOrders, prevOrders);
  const proComp = calcChange(curRevenue * 0.65, prevRevenue * 0.65);

  // Pie data: revenue by category
  const pieData = useMemo((): PieSlice[] => {
    const byCategory: Record<string, number> = {};
    productSales.forEach((p) => {
      byCategory[p.category] = (byCategory[p.category] ?? 0) + p.revenue;
    });
    return Object.entries(byCategory)
      .map(([catId, rev], i) => ({
        label: categories.find((c) => c.id === catId)?.name ?? catId,
        value: rev,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [productSales, categories]);

  // Top 5 products
  const top5 = useMemo(
    () => [...filteredSales].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    [filteredSales],
  );

  // Totals for summary row
  const filteredRevenue = filteredSales.reduce((s, d) => s + d.revenue, 0);
  const filteredProfit = filteredSales.reduce((s, d) => s + d.profit, 0);
  const filteredUnits = filteredSales.reduce((s, d) => s + d.unitsSold, 0);
  const avgMargin =
    filteredSales.length > 0
      ? filteredSales.reduce((s, d) => s + d.profitMargin, 0) /
        filteredSales.length
      : 0;

  return {
    revenueData,
    barCurrent,
    barPrevious,
    filteredSales,
    totalRevenue,
    totalOrders,
    totalProfit,
    avgOrderValue,
    revComp,
    ordComp,
    proComp,
    pieData,
    top5,
    filteredRevenue,
    filteredProfit,
    filteredUnits,
    avgMargin,
  };
}
