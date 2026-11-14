export interface ErrorMessageLoginProps {
  /** The error to show. Nothing is rendered when it is empty. */
  message?: string | null;
  /** `primary` for a boxed form error, `secondary` for a line under a field. */
  type?: "primary" | "secondary";
}
