import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`cursor-pointer px-8 py-4 font-semibold shadow-md bg-black text-white hover:bg-gray-800 transition uppercase ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
