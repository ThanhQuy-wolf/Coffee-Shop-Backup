"use client";

import { Modal, ModalHeader } from "@/components/molecules/modal";
import type { NewCartLine } from "@/lib/contexts/cart-context";
import type { OptionGroup, Product } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import {
  checkSelection,
  defaultSelection,
  priceWithOptions,
  rangeLabel,
  selectedOptions,
} from "@/lib/utils/options";
import { useState } from "react";

const MAX_QTY = 20; // P-08 default; the server checks the configured value

export interface ProductOptionsModalProps {
  product: Product;
  /** The product's groups, already in display order */
  groups: OptionGroup[];
  onAdd: (line: NewCartLine, quantity: number) => void;
  onClose: () => void;
}

/**
 * Lets the customer pick size, sugar, ice and toppings before adding a
 * product to the cart (UC-05, FR-35). Uses the same BR-18 check as the
 * server, so an invalid choice is caught before checkout.
 * @param props.product The product being added.
 * @param props.groups The product's groups, in display order.
 * @param props.onAdd Called with the line and quantity when the choice is valid.
 * @param props.onClose Closes the modal.
 */
export default function ProductOptionsModal({
  product,
  groups,
  onAdd,
  onClose,
}: ProductOptionsModalProps) {
  const [selected, setSelected] = useState<number[]>(() =>
    defaultSelection(groups),
  );
  const [quantity, setQuantity] = useState(1);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const problems = checkSelection(groups, selected);
  const unitPrice = priceWithOptions(product.price, groups, selected);

  const toggle = (group: OptionGroup, valueId: number) =>
    setSelected((prev) => {
      const inGroup = group.values.map((v) => v.id);
      if (group.selectionType === "SINGLE") {
        const others = prev.filter((id) => !inGroup.includes(id));
        // An optional single-choice group can be cleared by tapping again
        return prev.includes(valueId) && group.minSelect === 0
          ? others
          : [...others, valueId];
      }
      return prev.includes(valueId)
        ? prev.filter((id) => id !== valueId)
        : [...prev, valueId];
    });

  const submit = () => {
    if (problems.length) {
      setTriedSubmit(true);
      return;
    }
    onAdd(
      {
        type: "PRODUCT",
        id: product.id,
        name: product.name,
        unitPrice,
        options: selectedOptions(groups, selected).map(({ group, value }) => ({
          optionValueId: value.id,
          groupName: group.name,
          valueName: value.name,
          priceDelta: value.priceDelta,
        })),
      },
      quantity,
    );
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="product-options-title"
      className="flex max-h-[90vh] max-w-md flex-col"
    >
      <ModalHeader
        title={product.name}
        subtitle={`Giá gốc ${formatVND(product.price)}`}
        titleId="product-options-title"
        onClose={onClose}
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
        {groups.map((group) => {
          const chosen = group.values.filter((v) =>
            selected.includes(v.id),
          ).length;
          const full =
            group.selectionType === "MULTIPLE" && chosen >= group.maxSelect;
          const problem = problems.find((p) => p.groupId === group.id);
          return (
            <fieldset key={group.id}>
              <legend className="mb-2 flex w-full items-center justify-between gap-2">
                <span className="text-foreground text-sm font-semibold">
                  {group.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    group.minSelect > 0
                      ? "bg-(--color-accent-light) text-(--color-primary-dark)"
                      : "bg-(--color-border-light) text-(--color-text-muted)"
                  }`}
                >
                  {group.minSelect > 0 ? "Bắt buộc · " : ""}
                  {rangeLabel(group)}
                </span>
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {group.values.map((v) => {
                  const on = selected.includes(v.id);
                  const disabled = !v.isAvailable || (full && !on);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      role={
                        group.selectionType === "SINGLE" ? "radio" : "checkbox"
                      }
                      aria-checked={on}
                      disabled={disabled}
                      onClick={() => toggle(group, v.id)}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${
                        on
                          ? "border-(--color-primary) bg-(--color-primary)/5 font-semibold text-(--color-primary-dark)"
                          : "border-(--color-border-light) bg-white text-(--color-text-secondary) hover:border-(--color-primary-light)"
                      }`}
                    >
                      <span className="min-w-0 truncate">{v.name}</span>
                      <span className="shrink-0 text-xs text-(--color-text-muted)">
                        {!v.isAvailable
                          ? "Hết"
                          : v.priceDelta > 0
                            ? `+${formatVND(v.priceDelta)}`
                            : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
              {problem && triedSubmit && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {problem.message}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <div className="flex items-center gap-3 border-t border-(--color-border-light) px-6 py-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => q - 1)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-(--color-border) bg-transparent disabled:opacity-40"
          >
            -
          </button>
          <span className="w-6 text-center font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={quantity >= MAX_QTY}
            onClick={() => setQuantity((q) => q + 1)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-(--color-border) bg-transparent disabled:opacity-40"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={submit}
          aria-disabled={problems.length > 0}
          className={`flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) ${problems.length ? "opacity-50" : ""}`}
        >
          Thêm vào giỏ · {formatVND(unitPrice * quantity)}
        </button>
      </div>
    </Modal>
  );
}
