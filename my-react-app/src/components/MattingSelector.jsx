// MattingSelector.jsx
import React from "react";

export default function MattingSelector({
  mattingOptions,
  selectedMatting,
  setSelectedMatting,
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-left uppercase">
        Choose Matting
      </h2>
      <div className="flex gap-4">
        {mattingOptions.map((mat) => (
          <button
            key={mat.size}
            type="button"
            onClick={() => setSelectedMatting(mat)}
            className={`border-2 p-2 cursor-pointer  ${
              selectedMatting?.size === mat.size
                ? "border-black bg-gray-100"
                : "border-gray-300"
            }`}
          >
            {mat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
