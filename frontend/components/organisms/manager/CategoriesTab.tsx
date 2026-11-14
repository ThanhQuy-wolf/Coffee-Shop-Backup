"use client";

import { useManager } from "@/lib/contexts/manager-context";
import type { MenuCategory } from "@/lib/types";
import { useState } from "react";

import CategoryModal from "./CategoryModal";
import DeleteConfirm from "./DeleteConfirm";

export default function CategoriesTab() {
  const { categories, products, saveCategory, deleteCategory } = useManager();

  const [modalCategory, setModalCategory] = useState<
    MenuCategory | null | "new"
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);

  const getProductCount = (catId: number) =>
    products.filter((p) => p.categoryId === catId).length;
  const nextSortOrder = Math.max(0, ...categories.map((c) => c.sortOrder)) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-(--color-text-muted)">
          <strong className="text-foreground">{categories.length}</strong> danh
          mục
        </p>
        <button
          onClick={() => setModalCategory("new")}
          className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          <span className="hidden sm:inline">Thêm danh mục</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const count = getProductCount(cat.id);
          return (
            <div
              key={cat.id}
              className="group relative flex items-center gap-4 rounded-2xl border border-(--color-border-light) bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--color-accent-light)">
                <i className={`${cat.icon} text-xl text-(--color-primary)`}></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-semibold">
                  {cat.name}
                </p>
                <p className="text-xs text-(--color-text-muted)">{count} món</p>
              </div>
              <div className="flex flex-col gap-1 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                <button
                  onClick={() => setModalCategory(cat)}
                  title="Chỉnh sửa"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-(--color-border-light) bg-transparent text-(--color-text-muted) transition hover:border-(--color-primary-light) hover:text-(--color-primary)"
                >
                  <i className="fa-solid fa-pen text-[11px]"></i>
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  title="Xóa"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-(--color-text-muted) transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                >
                  <i className="fa-solid fa-trash text-[11px]"></i>
                </button>
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-(--color-text-muted)">
            <i className="fa-solid fa-tag text-4xl opacity-30"></i>
            <p className="text-sm">Chưa có danh mục nào</p>
          </div>
        )}
      </div>

      {modalCategory !== null && (
        <CategoryModal
          category={modalCategory === "new" ? null : modalCategory}
          nextSortOrder={nextSortOrder}
          onSave={(input) =>
            saveCategory(
              input,
              modalCategory === "new" ? undefined : modalCategory.id,
            )
          }
          onClose={() => setModalCategory(null)}
        />
      )}

      {deleteTarget !== null && (
        <DeleteConfirm
          name={deleteTarget.name}
          note="Chỉ xoá được danh mục không còn món nào, kể cả món đang tắt bán (BR-11)."
          onConfirm={() => deleteCategory(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
