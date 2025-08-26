import React from "react";

export default function ColorSelector({ selectedColor, setSelectedColor }) {
  // new set of options
  const colors = ["original", "warm", "cool", "vintage", "mono"];

  const swatchBg = {
    original: "transparent",
    warm: "#FFD580", // soft golden
    cool: "#80D0FF", // soft blue
    vintage: "#C19A6B", // brownish sepia
    mono: "#888888", // gray
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-left uppercase">
        Choose Style
      </h2>
      <div className="flex gap-4">
        {colors.map((color) => (
          <label
            key={color}
            className="flex flex-col items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="radio"
              name="color"
              value={color}
              checked={selectedColor === color}
              onChange={() => setSelectedColor(color)}
              className="sr-only"
            />
            <span
              className={`w-16 h-16 border-2 ${
                selectedColor === color ? "border-black" : "border-gray-300"
              }`}
              style={{
                backgroundColor: swatchBg[color],
                backgroundImage:
                  color === "original"
                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                    : "none",
                backgroundSize: color === "original" ? "8px 8px" : "auto",
              }}
              aria-hidden="true"
            />
            <span className="capitalize">{color}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
