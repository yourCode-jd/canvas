import React from "react";

export default function MattingSelector({
  selectedMatting,
  setSelectedMatting,
  mattingOptions,
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-left">
        Choose Borders & Matting
      </h2>
      <div className="flex gap-4">
        {mattingOptions.map((mat) => (
          <button
            key={mat.id}
            type="button"
            onClick={() => setSelectedMatting(mat)}
            className={`border p-1 cursor-pointer w-16 h-16 text-xs flex flex-col items-center justify-center ${
              selectedMatting?.id === mat.id
                ? "border-black"
                : "border-gray-300"
            }`}
          >
            {/* You can replace this with an actual image thumbnail if needed */}
            <div className="w-full h-full bg-gray-100" />
            <span className="mt-1">{mat.label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelectedMatting(null)}
          className="px-3 py-2 text-sm border text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          No Matting
        </button>
      </div>
    </div>
  );
}
