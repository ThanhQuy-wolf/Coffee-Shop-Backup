"use client";

import { Alert } from "@/components/atoms";
import { useManager } from "@/lib/contexts/manager-context";
import type { Product } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import { errorMessage } from "@/lib/utils/errors";
import { groupsOf } from "@/lib/utils/options";
import { useState } from "react";

import DeleteConfirm from "./DeleteConfirm";
import ProductModal from "./ProductModal";
import StatusBadge from "./StatusBadge";

/**
 * Manager tab with the product table, filtered by search text, category and
 * sale status. The manager can switch a product on or off, add, edit and
 * delete it (C-5 → C-9).
 */
export default function ProductsTab() {
  const {
    products,
    categories,
    optionGroups,
    saveProduct,
    deleteProduct,
    setProductAvailability,
  } = useManager();

  const [filterCategory, setFilterCategory] = useState(0);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [search, setSearch] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = products.filter((p) => {
    if (filterCategory && p.categoryId !== filterCategory) return false;
    if (filterStatus === "available" && !p.isAvailable) return false;
    if (filterStatus === "unavailable" && p.isAvailable) return false;
    if (
      search &&
      !p.name.toLowerCase().includes(search.toLowerCase()) &&
      !p.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const categoryOf = (id: number) => categories.find((c) => c.id === id);

  const toggle = async (p: Product) => {
    setToggleError(null);
    try {
      await setProductAvailability(p.id, !p.isAvailable);
    } catch (err) {
      setToggleError(errorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-2/5 flex-1">
          <i className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-(--color-text-muted)"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm món..."
            className="text-foreground w-full rounded-xl border border-(--color-border) bg-white py-2 pr-9 pl-9 text-sm transition outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20"
          />
          {search && (
            <button
              title="Xóa tìm kiếm"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent text-(--color-text-muted) hover:text-(--color-primary)"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(Number(e.target.value))}
          className="text-foreground cursor-pointer rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary)"
          title="Lọc theo danh mục"
        >
          <option value={0}>Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as "all" | "available" | "unavailable",
            )
          }
          className="text-foreground cursor-pointer rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary)"
          title="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Đang bán</option>
          <option value="unavailable">Tạm ngừng bán</option>
        </select>

        <button
          title="Thêm món"
          onClick={() => setModalProduct("new")}
          className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) active:scale-95"
        >
          <i className="fa-solid fa-plus"></i>
          <span className="hidden sm:inline">Thêm món</span>
        </button>
      </div>

      <p className="text-sm text-(--color-text-muted)">
        Hiển thị <strong className="text-foreground">{filtered.length}</strong>{" "}
        / {products.length} món
      </p>
      <Alert message={toggleError} />

      <div className="overflow-x-auto rounded-2xl border border-(--color-border-light) bg-white shadow-sm">
        <table className="min-w-full divide-y divide-(--color-border-light) text-sm">
          <thead className="bg-background">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-(--color-text-secondary)">
                Tên món
              </th>
              <th className="px-4 py-3 text-left font-semibold text-(--color-text-secondary)">
                Danh mục
              </th>
              <th className="px-4 py-3 text-right font-semibold text-(--color-text-secondary)">
                Giá bán
              </th>
              <th className="px-4 py-3 text-right font-semibold text-(--color-text-secondary)">
                Giá vốn
              </th>
              <th className="px-4 py-3 text-center font-semibold text-(--color-text-secondary)">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center font-semibold text-(--color-text-secondary)">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--color-border-light)">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-(--color-text-muted)"
                >
                  <i className="fa-solid fa-mug-hot mb-2 block text-3xl opacity-30"></i>
                  Không tìm thấy món nào
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-background transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground font-medium">{p.name}</p>
                      {p.description && (
                        <p className="mt-0.5 max-w-xs truncate text-xs text-(--color-text-muted)">
                          {p.description}
                        </p>
                      )}
                      {p.optionGroupIds.length > 0 && (
                        <p className="mt-0.5 text-[11px] text-(--color-text-muted)">
                          <i className="fa-solid fa-sliders mr-1"></i>
                          {groupsOf(p, optionGroups)
                            .map((g) => g.name)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--color-accent-light) px-2.5 py-0.5 text-xs font-medium text-(--color-primary-dark)">
                      <i
                        className={`${categoryOf(p.categoryId)?.icon ?? "fa-solid fa-tag"} text-[10px]`}
                      ></i>
                      {categoryOf(p.categoryId)?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-(--color-primary)">
                    {formatVND(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right text-(--color-text-secondary)">
                    {p.costPrice ? (
                      formatVND(p.costPrice)
                    ) : (
                      <span className="text-xs text-amber-600">
                        Chưa khai báo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(p)}
                      title="Nhấn để đổi trạng thái"
                      className="cursor-pointer border-none bg-transparent"
                    >
                      <StatusBadge available={p.isAvailable} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setModalProduct(p)}
                        title="Chỉnh sửa"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-(--color-border-light) bg-transparent text-(--color-text-muted) transition hover:border-(--color-primary-light) hover:text-(--color-primary)"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title="Xóa"
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent bg-transparent text-(--color-text-muted) transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === "new" ? null : modalProduct}
          categories={categories}
          optionGroups={optionGroups}
          onSave={(input) =>
            saveProduct(
              input,
              modalProduct === "new" ? undefined : modalProduct.id,
            )
          }
          onClose={() => setModalProduct(null)}
        />
      )}

      {deleteTarget !== null && (
        <DeleteConfirm
          name={deleteTarget.name}
          note="Món đã từng bán sẽ được ẩn để giữ lịch sử đơn (BR-14). Món còn nằm trong combo phải gỡ khỏi combo trước."
          onConfirm={() => deleteProduct(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
