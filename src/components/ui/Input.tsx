import React from "react";

type InputProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
};

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
}: InputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={[
          "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
          "bg-white shadow-sm",
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-400"
            : "border-neutral-200 focus:ring-2 focus:ring-violet-500",
        ].join(" ")}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
