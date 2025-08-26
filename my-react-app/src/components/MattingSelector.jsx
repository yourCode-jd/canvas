import React from "react";

export default function MattingSelector({
  mattingOptions,
  selectedMatting,
  setSelectedMatting,
  previewImage = "/images/art1.png", // 👈 default preview artwork
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-left uppercase">
        Choose Matting
      </h2>
      <div className="flex gap-6">
        {mattingOptions.map((mat) => (
          <div key={mat.size} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedMatting(mat)}
              className={`w-18 h-22 border-2 transition-all duration-200 flex items-center justify-center cursor-pointer ${
                selectedMatting?.size === mat.size
                  ? "border-black"
                  : "border-gray-300 hover:border-black"
              }`}
            >
              {/* White matting container */}
              <div
                className="bg-white flex items-center justify-center w-full h-full"
                style={{
                  padding: `${mat.size / 8}px`, // 👈 simulate mat thickness
                }}
              >
                {/* Artwork preview */}
                <img
                  src={previewImage}
                  alt={mat.label}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {/* Label text outside */}
            <span
              className={`mt-2 text-sm font-normal ${
                selectedMatting?.size === mat.size
                  ? "text-black"
                  : "text-gray-600"
              }`}
            >
              {mat.label.replace("Matting", "").trim()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
