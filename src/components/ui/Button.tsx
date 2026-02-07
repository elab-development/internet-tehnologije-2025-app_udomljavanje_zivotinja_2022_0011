import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean; 
};

export default function Button({
  type = "button",
  children,
  disabled = false,
  className = "",
  fullWidth = false, 
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      className={[
        
        fullWidth ? "w-full" : "w-fit",
        "rounded-xl px-4 py-3 text-sm font-semibold",

      
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
