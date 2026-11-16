"use client";

import type { InputHTMLAttributes } from "react";
import { formatBrazilianPhone } from "@/lib/helpers";

type PhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  initialValue?: string | null;
};

export function PhoneInput({ initialValue = "", ...props }: PhoneInputProps) {
  return (
    <input
      {...props}
      type="tel"
      defaultValue={formatBrazilianPhone(initialValue || "")}
      placeholder="(00) 00000-0000"
      onChange={(event) => {
        event.currentTarget.value = formatBrazilianPhone(event.currentTarget.value);
      }}
    />
  );
}
