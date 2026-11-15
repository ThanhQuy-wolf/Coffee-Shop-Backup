"use client";

import { Icon } from "@/components/atoms";
import { type ReactNode, useEffect, useRef } from "react";

export interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  /** Classes for the white panel (width, padding, flex layout). */
  className?: string;
  /** Id of the element that names the dialog, usually ModalHeader's `titleId`. */
  labelledBy?: string;
}

/**
 * Modal shell: backdrop, centred panel, closing on Esc or a backdrop click,
 * body scroll lock and dialog ARIA. The caller supplies the content; use
 * {@link ModalHeader} for the standard title and close button row.
 * @param props.onClose Called on Esc, a backdrop click or the close button.
 * @param props.children Panel content.
 * @param props.className Classes for the white panel, `max-w-md` by default.
 * @param props.labelledBy Id of the element that names the dialog.
 */
export function Modal({
  onClose,
  children,
  className = "max-w-md",
  labelledBy,
}: ModalProps) {
  // Keep the latest onClose without re-running the effect on every render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full rounded-2xl bg-white shadow-2xl ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export interface ModalHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Icon or element shown left of the title. */
  leading?: ReactNode;
  onClose: () => void;
  /** Id put on the title; pass the same to `Modal labelledBy`. */
  titleId?: string;
}

/**
 * Standard modal header: title and subtitle on the left, close button on the
 * right.
 * @param props.title Dialog title.
 * @param props.subtitle Smaller line under the title.
 * @param props.leading Icon or element left of the title.
 * @param props.onClose Called by the close button.
 * @param props.titleId Id put on the title; pass the same to `Modal labelledBy`.
 */
export function ModalHeader({
  title,
  subtitle,
  leading,
  onClose,
  titleId,
}: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-(--color-border-light) px-6 py-4">
      <div className="flex items-center gap-3">
        {leading}
        <div>
          <h2 id={titleId} className="text-foreground text-lg font-bold">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-(--color-text-muted)">{subtitle}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        title="Đóng"
        aria-label="Đóng"
        onClick={onClose}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-(--color-text-muted) transition-colors hover:bg-(--color-border-light) hover:text-(--color-primary)"
      >
        <Icon name="xmark" />
      </button>
    </div>
  );
}
