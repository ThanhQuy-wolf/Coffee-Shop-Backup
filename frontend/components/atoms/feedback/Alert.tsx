export interface AlertProps {
  /** Text to show. Nothing is rendered when it is empty or null. */
  message?: string | null;
  /** `error` (red, default) for failures, `info` (blue) for neutral notices. */
  tone?: "error" | "info";
  /** Extra classes, usually spacing such as `mb-4`. */
  className?: string;
}

const TONES = {
  error: "bg-red-50 text-red-700",
  info: "bg-sky-50 text-sky-800",
};

/**
 * Message box announced to screen readers (`role="alert"`). Use it for errors
 * returned by a service and for short notices after an action.
 * @param props.message Text to show; nothing is rendered when it is empty.
 * @param props.tone Colour scheme, `error` by default.
 * @param props.className Extra classes for the wrapper.
 */
export default function Alert({
  message,
  tone = "error",
  className = "",
}: AlertProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={`rounded-lg px-3 py-2 text-sm ${TONES[tone]} ${className}`}
    >
      {message}
    </p>
  );
}
