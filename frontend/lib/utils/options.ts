// Option rules the option picker checks before O-1, mirroring the backend so
// the UI blocks what the server would reject (BR-16 → BR-19).
import type { OptionGroup, OptionValue } from "../types";

/** One reason a selection breaks BR-18. */
export interface SelectionProblem {
  /** 0 when the value belongs to none of the product's groups */
  groupId: number;
  message: string;
}

/** One unit of a combo that carries option groups (FR-37). */
export interface ComboUnit {
  /** Position in the combo, from 1, counting every unit (BR-18) */
  no: number;
  productId: number;
  productName: string;
  groups: OptionGroup[];
}

/** A chosen value with the group it belongs to. */
export interface SelectedOption {
  group: OptionGroup;
  value: OptionValue;
}

/**
 * Picks a product's groups from the full list.
 *
 * @param product - anything with `optionGroupIds`
 * @param groups - all option groups
 * @returns the product's groups in its own display order; unknown ids are
 *   skipped
 */
export function groupsOf<G extends { id: number }>(
  product: { optionGroupIds: number[] },
  groups: G[],
): G[] {
  return product.optionGroupIds.flatMap((id) => {
    const g = groups.find((x) => x.id === id);
    return g ? [g] : [];
  });
}

/**
 * Lists a combo unit by unit: a combo of 2 Trà Đào and 1 Matcha gives
 * product ids at positions 1, 2 and 3. Server and client must number units
 * the same way, so both use this.
 *
 * @param items - the combo's items, in their stored order
 * @returns one product id per unit; `no` is the index + 1
 */
export function expandCombo(
  items: { productId: number; quantity: number }[],
): number[] {
  return items.flatMap((i) => Array<number>(i.quantity).fill(i.productId));
}

/**
 * The units of a combo the customer can choose options for.
 *
 * @param combo - anything with `items`
 * @param products - products to look the units up in
 * @param groups - all option groups
 * @returns units whose product has at least one group, with `no` counted
 *   over every unit so it matches `expandCombo`
 */
export function comboUnits<
  P extends { id: number; name: string; optionGroupIds: number[] },
>(
  combo: { items: { productId: number; quantity: number }[] },
  products: P[],
  groups: OptionGroup[],
): ComboUnit[] {
  return expandCombo(combo.items).flatMap((productId, i) => {
    const p = products.find((x) => x.id === productId);
    const g = p ? groupsOf(p, groups) : [];
    return p && g.length
      ? [{ no: i + 1, productId, productName: p.name, groups: g }]
      : [];
  });
}

/**
 * Starting selection for the option picker.
 *
 * @param groups - the product's groups
 * @returns ids of the default values that are on sale; a sold-out default
 *   leaves its group empty so the customer must choose (BR-16, BR-19)
 */
export function defaultSelection(groups: OptionGroup[]): number[] {
  return groups.flatMap((g) =>
    g.values.filter((v) => v.isDefault && v.isAvailable).map((v) => v.id),
  );
}

/**
 * Short label for how many values a group takes.
 *
 * @param g - the group's `minSelect` and `maxSelect`
 * @returns e.g. "Chọn 1", "Tối đa 3", "Chọn 1 → 2"
 */
export function rangeLabel(g: Pick<OptionGroup, "minSelect" | "maxSelect">) {
  if (g.maxSelect === 1) return g.minSelect === 1 ? "Chọn 1" : "Tối đa 1";
  if (g.minSelect === 0) return `Tối đa ${g.maxSelect}`;
  if (g.minSelect === g.maxSelect) return `Chọn ${g.minSelect}`;
  return `Chọn ${g.minSelect} → ${g.maxSelect}`;
}

/**
 * BR-18: every value belongs to one of the groups, no duplicates, and each
 * group gets between minSelect and maxSelect values. Availability is a
 * separate check (BR-21) because the server reports it with its own code.
 *
 * @param groups - the product's groups
 * @param valueIds - chosen value ids
 * @returns one problem per broken rule, empty when the selection is valid;
 *   `groupId` 0 for a duplicate or a value from another product
 */
export function checkSelection(
  groups: OptionGroup[],
  valueIds: number[],
): SelectionProblem[] {
  const problems: SelectionProblem[] = [];
  if (new Set(valueIds).size !== valueIds.length)
    problems.push({ groupId: 0, message: "Một tuỳ chọn bị chọn hai lần" });
  const known = new Set(groups.flatMap((g) => g.values.map((v) => v.id)));
  if (valueIds.some((id) => !known.has(id)))
    problems.push({ groupId: 0, message: "Có tuỳ chọn không thuộc món này" });
  for (const g of groups) {
    const count = g.values.filter((v) => valueIds.includes(v.id)).length;
    if (count < g.minSelect)
      problems.push({
        groupId: g.id,
        message:
          g.minSelect === 1
            ? `Chưa chọn ${g.name.toLowerCase()}`
            : `${g.name}: chọn ít nhất ${g.minSelect}`,
      });
    else if (count > g.maxSelect)
      problems.push({
        groupId: g.id,
        message: `${g.name}: chọn tối đa ${g.maxSelect}`,
      });
  }
  return problems;
}

/**
 * Resolves chosen ids to values.
 *
 * @param groups - the product's groups
 * @param valueIds - chosen value ids
 * @returns the chosen values in display order: by group, then by value
 */
export function selectedOptions(
  groups: OptionGroup[],
  valueIds: number[],
): SelectedOption[] {
  return groups.flatMap((group) =>
    group.values
      .filter((v) => valueIds.includes(v.id))
      .map((value) => ({ group, value })),
  );
}

/**
 * Whether the product can still be ordered with its options (BR-19).
 *
 * @param groups - the product's groups
 * @returns `false` when a required group has fewer values on sale than
 *   `minSelect`
 */
export function optionsSellable(groups: OptionGroup[]): boolean {
  return groups.every(
    (g) => g.values.filter((v) => v.isAvailable).length >= g.minSelect,
  );
}

/**
 * Summary of the options on a cart or order line, one entry per row to show.
 *
 * @param options - chosen options; combo options carry `componentNo`
 * @returns `["Size L, 50% đường"]` for a product line, or one entry per
 *   combo unit such as `"Ly 1 · Trà Đào Cam Sả: Size L, Ít đá"`
 */
export function optionLines(
  options: {
    valueName: string;
    componentNo?: number;
    componentName?: string;
  }[],
): string[] {
  const byUnit = new Map<number, { name?: string; values: string[] }>();
  for (const o of options) {
    const no = o.componentNo ?? 0;
    const unit = byUnit.get(no) ?? { name: o.componentName, values: [] };
    unit.values.push(o.valueName);
    byUnit.set(no, unit);
  }
  return [...byUnit.entries()]
    .sort(([a], [b]) => a - b)
    .map(([no, u]) =>
      no === 0
        ? u.values.join(", ")
        : `Ly ${no} · ${u.name}: ${u.values.join(", ")}`,
    );
}
