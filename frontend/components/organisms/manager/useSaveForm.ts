"use client";

import { errorMessage } from "@/lib/utils/errors";
import { type FormEvent, useState } from "react";

/**
 * Submit handler for the manager modals. Closes the modal when the save
 * succeeds and keeps it open with the server error when it fails.
 * @param save Sends the form to the server.
 * @param onDone Called after a successful save, usually the modal's onClose.
 * @returns `submit(build)`, which makes a form `onSubmit` handler that calls
 *   `build()` for the input, plus the current `error` and `saving` flag.
 */
export function useSaveForm<T>(
  save: (input: T) => Promise<void>,
  onDone: () => void,
) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = (build: () => T) => async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await save(build());
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return { submit, error, saving };
}

/** Classes for text inputs in the manager modals. */
export const inputCls =
  "text-foreground w-full rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20";

/** Classes for labels in the manager modals. */
export const labelCls =
  "mb-1 block text-sm font-medium text-(--color-text-secondary)";
