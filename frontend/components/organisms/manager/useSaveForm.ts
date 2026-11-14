"use client";

import { errorMessage } from "@/lib/utils/errors";
import { type FormEvent, useState } from "react";

/** Submit handler for the manager modals: closes on success, keeps the server error otherwise. */
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

export const inputCls =
  "text-foreground w-full rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm transition outline-none focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20";

export const labelCls =
  "mb-1 block text-sm font-medium text-(--color-text-secondary)";
