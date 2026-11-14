"use client";

import { Modal, ModalHeader } from "@/components/molecules/modal";
import type { CartLineOption, NewCartLine } from "@/lib/contexts/cart-context";
import type { OptionGroup, OrderItemType } from "@/lib/types";
import { formatVND } from "@/lib/utils/currency";
import {
  checkSelection,
  defaultSelection,
  rangeLabel,
  selectedOptions,
} from "@/lib/utils/options";
import { useState } from "react";

const MAX_QTY = 20; // P-08 default; the server checks the configured value

/** One block of groups in the picker: the product itself, or one combo unit. */
export interface OptionPickerUnit {
  /** Combo units only: position in the combo, from 1 (FR-37) */
  no?: number;
  /** Combo units only: the unit's product name */
  productName?: string;
  /** The groups to choose from, in display order */
  groups: OptionGroup[];
}

export interface ProductOptionsModalProps {
  /** The product or combo being added, with its base price */
  item: { type: OrderItemType; id: number; name: string; price: number };
  /** One unit for a product; one per combo unit that has groups */
  units: OptionPickerUnit[];
  onAdd: (line: NewCartLine, quantity: number) => void;
  onClose: () => void;
}

/**
 * Lets the customer pick size, sugar, ice and toppings before adding a
 * product to the cart (UC-05, FR-35), or for each unit of a combo (FR-37).
 * Uses the same BR-18 check as the server, so an invalid choice is caught
 * before checkout.
 * @param props.item The product or combo being added.
 * @param props.units The blocks of groups to show.
 * @param props.onAdd Called with the line and quantity when the choice is valid.
 * @param props.onClose Closes the modal.
 */
export default function ProductOptionsModal({
  item,
  units,
  onAdd,
  onClose,
}: ProductOptionsModalProps) {
  const [selected, setSelected] = useState<number[][]>(() =>
    units.map((u) => defaultSelection(u.groups)),
  );
  const [quantity, setQuantity] = useState(1);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const isCombo = item.type === "COMBO";
  const problems = units.map((u, i) => checkSelection(u.groups, selected[i]));
  const hasProblem = problems.some((p) => p.length > 0);
  const options: CartLineOption[] = units.flatMap((u, i) =>
    selectedOptions(u.groups, selected[i]).map(({ group, value }) => ({
      optionValueId: value.id,
      groupName: group.name,
      valueName: value.name,
      priceDelta: value.priceDelta,
      ...(u.no ? { componentNo: u.no, componentName: u.productName } : {}),
    })),
  );
  // BR-17: base price plus the deltas of every chosen value
  const unitPrice = options.reduce((s, o) => s + o.priceDelta, item.price);

  const toggle = (unit: number, group: OptionGroup, valueId: number) =>
    setSelected((all) =>
      all.map((prev, i) => {
        if (i !== unit) return prev;
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
      }),
    );

  const submit = () => {
    if (hasProblem) {
      setTriedSubmit(true);
      return;
    }
    onAdd(
      { type: item.type, id: item.id, name: item.name, unitPrice, options },
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
        title={item.name}
        subtitle={`${isCombo ? "Giá combo" : "Giá gốc"} ${formatVND(item.price)}`}
        titleId="product-options-title"
        onClose={onClose}
      />

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
        {units.map((unit, ui) => (
          <section
            key={unit.no ?? 0}
            aria-label={unit.no ? `Ly ${unit.no}` : undefined}
            className={
              unit.no
                ? "space-y-4 rounded-2xl border border-(--color-border-light) p-3"
                : "space-y-5"
            }
          >
            {unit.no && (
              <h3 className="text-foreground text-sm font-bold">
                Ly {unit.no} · {unit.productName}
              </h3>
            )}
            {unit.groups.map((group) => {
              const chosen = group.values.filter((v) =>
                selected[ui].includes(v.id),
              ).length;
              const full =
                group.selectionType === "MULTIPLE" && chosen >= group.maxSelect;
              const problem = problems[ui].find((p) => p.groupId === group.id);
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
                      const on = selected[ui].includes(v.id);
                      const disabled = !v.isAvailable || (full && !on);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          role={
                            group.selectionType === "SINGLE"
                              ? "radio"
                              : "checkbox"
                          }
                          aria-checked={on}
                          disabled={disabled}
                          onClick={() => toggle(ui, group, v.id)}
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
          </section>
        ))}
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
          aria-disabled={hasProblem}
          className={`flex-1 cursor-pointer rounded-xl border-none bg-(--color-primary) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--color-primary-dark) ${hasProblem ? "opacity-50" : ""}`}
        >
          Thêm vào giỏ · {formatVND(unitPrice * quantity)}
        </button>
      </div>
    </Modal>
  );
}
