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
        // layout & typography (kao login)
        "w-full rounded-xl px-4 py-3 text-sm font-semibold",

        // PASTELNO PLAVA – KANON IZ LOGIN-A
        "bg-[#C3E7FD] text-neutral-800 shadow-sm",
        "hover:bg-[#AEDCF9]",

        // accessibility & interaction
        "transition focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-2",

        // disabled state
        "disabled:opacity-60 disabled:cursor-not-allowed",

        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
