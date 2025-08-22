import React from "react";

export default function BorderSelector({
  borderOptions,
  selectedBorder,
  setSelectedBorder,
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-left">
        Choose Border Style
      </h2>
      <div className="flex gap-4">
        {borderOptions.map((border, i) => (
          <div
            key={i}
            onClick={() => setSelectedBorder(border)}
            className={`w-16 h-16 overflow-hidden cursor-pointer border-2 ${
              selectedBorder?.label === border.label
                ? "border-black"
                : "border-gray-200"
            }`}
            style={{ backgroundColor: border.color }}
          >
            {/* Preview with scaled padding */}
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundColor: border.color,
                padding: border.size / 4, // preview scaled down
              }}
            >
              <div className="bg-gray-400 w-full h-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
