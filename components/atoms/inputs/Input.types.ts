import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string; // FontAwesome class
  onIconClick?: () => void;
  className?: string;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  className?: string;
}

export interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  type: string;
  name: string;
  value: string;
  errors?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
