"use client";

import { useCatalog } from "@/lib/contexts/catalog-context";

/** Category filter <select> used by the analytics sections. */
export function CategorySelect({
  value,
  onChange,
  label = "Danh mục:",
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const { categories } = useCatalog();
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-(--color-text-muted)">{label}</label>
      <select
        title="Danh mục"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background text-foreground rounded-lg border border-(--color-border) px-2 py-1.5 text-xs"
      >
        <option value="all">Tất cả</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
