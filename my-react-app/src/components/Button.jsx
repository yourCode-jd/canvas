import React from "react";

export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-6 py-3 rounded-xl font-semibold shadow-md bg-black text-white hover:bg-gray-800 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
