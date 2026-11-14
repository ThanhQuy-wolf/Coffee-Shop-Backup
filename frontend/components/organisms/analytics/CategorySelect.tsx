"use client";

import { useCatalog } from "@/lib/contexts/catalog-context";
import { ALL_CATEGORY_ID } from "@/lib/services";

/**
 * Category filter `<select>` used by the analytics sections, with an
 * "all categories" option first.
 * @param props.value Selected category id, or `ALL_CATEGORY_ID`.
 * @param props.onChange Called with the new id.
 * @param props.label Text before the select.
 */
export function CategorySelect({
  value,
  onChange,
  label = "Danh mục:",
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const { categories } = useCatalog();
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-(--color-text-muted)">{label}</label>
      <select
        title="Danh mục"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-background text-foreground rounded-lg border border-(--color-border) px-2 py-1.5 text-xs"
      >
        <option value={ALL_CATEGORY_ID}>Tất cả</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
