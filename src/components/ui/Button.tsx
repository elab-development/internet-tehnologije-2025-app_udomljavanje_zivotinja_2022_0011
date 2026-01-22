import React from "react";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export default function Button({
  type = "button",
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full rounded-xl px-4 py-3 text-sm font-semibold",
        "bg-violet-600 text-white shadow-sm",
        "hover:bg-violet-700 active:bg-violet-800",
        "transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
