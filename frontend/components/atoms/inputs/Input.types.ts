import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label above the field. */
  label?: string;
  /** Error shown below the field. */
  error?: string;
  className?: string;
}

export interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label, also used as the placeholder. */
  label: string;
  /** Input type; `password` adds a show/hide button. */
  type: string;
  /** Field name and input id. */
  name: string;
  value: string;
  /** Error for this field; turns the border red. */
  errors?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
