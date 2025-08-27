import React from "react";

export default function FrameSelector({
  frameOptions,
  selectedFrame,
  setSelectedFrame,
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-left uppercase">
        Choose Frame
      </h2>
      <div className="flex flex-wrap md:gap-4 gap-3">
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
            className={`border-2 p-1 cursor-pointer md:w-18 w-12 md:h-22 h-16 ${
              selectedFrame?.id === frame.id
                ? "border-black"
                : "border-gray-300 hover:border-black"
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
          className="px-1 py-1 md:text-sm text-xs border-2 text-gray-700 hover:bg-gray-50 cursor-pointer md:w-18 w-12 md:h-22 h-16"
        >
          No Frame
        </button>
      </div>
    </div>
  );
}
