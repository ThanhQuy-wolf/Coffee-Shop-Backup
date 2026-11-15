import { Icon } from "../icons";
import { ErrorMessageLoginProps } from "./Error.types";

/**
 * Error text for the login and register forms, with a warning icon.
 * @param props.message The error to show; nothing is rendered when empty.
 * @param props.type `primary` (default) for a boxed form-level error,
 *   `secondary` for a small line under a field.
 */
export default function ErrorMessageLogin({
  message,
  type = "primary",
}: ErrorMessageLoginProps) {
  if (!message) return null;

  function primaryType() {
    return (
      <div
        className={
          "mb-4 flex items-center gap-2 rounded-lg border border-(--color-danger)/30 bg-(--color-danger-bg) p-3 text-sm text-(--color-danger)"
        }
      >
        <Icon name="circle-exclamation" />
        <span>{message}</span>
      </div>
    );
  }

  function secondaryType() {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs text-(--color-danger)">
        <Icon name="circle-exclamation" />
        {message}
      </p>
    );
  }

  return type === "primary" ? primaryType() : secondaryType();
}
