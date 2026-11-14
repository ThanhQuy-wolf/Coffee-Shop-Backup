// Option rules shared by the option picker and the mock backend, so the UI
// blocks exactly what the server would reject (BR-16 → BR-19).
import type { OptionGroup, OptionValue } from "../types";

/** One reason a selection breaks BR-18. */
export interface SelectionProblem {
  /** 0 when the value belongs to none of the product's groups */
  groupId: number;
  message: string;
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
 * Unit price with options (BR-17).
 *
 * @param basePrice - the product's price, in đồng
 * @param groups - the product's groups
 * @param valueIds - chosen value ids
 * @returns base price plus the `priceDelta` of each chosen value
 */
export function priceWithOptions(
  basePrice: number,
  groups: OptionGroup[],
  valueIds: number[],
): number {
  return selectedOptions(groups, valueIds).reduce(
    (sum, { value }) => sum + value.priceDelta,
    basePrice,
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
 * One-line summary of the options on a cart or order line.
 *
 * @param options - chosen options
 * @returns e.g. "Size L, 50% đường, Trân châu đen"
 */
export function describeOptions(options: { valueName: string }[]): string {
  return options.map((o) => o.valueName).join(", ");
}
