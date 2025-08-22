import React from "react";

export default function FrameSelector({
  frameOptions,
  selectedFrame,
  setSelectedFrame,
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-left">Choose Frame</h2>
      <div className="flex gap-4">
        {frameOptions.map((frame) => (
          <button
            type="button"
            key={frame.id}
            onClick={() => {
              setSelectedFrame(frame);
              setTimeout(() => {
                setSelectedFrame(frame);
              }, 50);
            }}
            className={`border p-1 cursor-pointer w-16 h-16 ${
              selectedFrame?.id === frame.id
                ? "border-black"
                : "border-gray-300"
            }`}
            title={frame.label}
          >
            <img
              src={frame.src}
              alt={frame.label}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
        {/* Clear frame option */}
        <button
          type="button"
          onClick={() => setSelectedFrame(null)}
          className="px-3 py-2 text-sm border  text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          No Frame
        </button>
      </div>
    </div>
  );
}
