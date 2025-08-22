import React, { useState } from "react";
import ProductSlider from "./ProductSlider";
import ColorSelector from "./ColorSelector";
import FrameSelector from "./FrameSelector";
// import BorderSelector from "./BorderSelector"; // Removed BorderSelector
import { Button } from "./Button";

export default function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState("original");
  const [selectedFrame, setSelectedFrame] = useState(null);
  // const [selectedBorder, setSelectedBorder] = useState(null); // Removed border state
  const [selectedMatting, setSelectedMatting] = useState(null);

  const productImages = ["/images/art1.png"];

  const frameOptions = [
    {
      id: "walnut",
      label: "Walnut",
      src: "/images/frame1.png",
      mask: "/images/frame1-mask.png",
    },
    {
      id: "black",
      label: "Black",
      src: "/images/frame2.png",
      mask: "/images/frame2-mask.png",
    },
    {
      id: "oak",
      label: "Oak",
      src: "/images/frame3.png",
      mask: "/images/frame3-mask.png",
    },
  ];

  // Removed border options
  /*
  const borderOptions = [
    { label: "None", size: 0, color: "transparent" },
    { label: "Thin White", size: 10, color: "#fff" },
    { label: "Medium White", size: 30, color: "#fff" },
    { label: "Thick White", size: 60, color: "#fff" },
  ];
  */

  const mattingOptions = [
    { label: "None", size: 0 },
    { label: "Small Matting", size: 30 },
    { label: "Medium Matting", size: 60 },
    { label: "Large Matting", size: 90 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 max-w-7xl mx-auto items-start">
      {/* Left: Product Slider */}
      <ProductSlider
        productImages={productImages}
        selectedColor={selectedColor}
        selectedFrame={selectedFrame}
        selectedBorder={null} // Always null since border is removed
        selectedMatting={selectedMatting}
      />

      {/* Right: Product Info & Selectors */}
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black">
            Abstract Wall Art
          </h1>
          <p className="text-black leading-relaxed max-w-lg">
            A modern abstract painting that brings luxury vibes to your living
            space. High-quality print with customizable frames and matting.
          </p>
        </div>

        <ColorSelector
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />
        <FrameSelector
          frameOptions={frameOptions}
          selectedFrame={selectedFrame}
          setSelectedFrame={setSelectedFrame}
        />

        {/* Matting Selector */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-left">
            Choose Matting
          </h2>
          <div className="flex gap-4">
            {mattingOptions.map((mat) => (
              <button
                key={mat.size}
                type="button"
                onClick={() => setSelectedMatting(mat)}
                className={`border p-2 cursor-pointer rounded ${
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

        <Button className="w-40">Order Now</Button>
      </div>
    </div>
  );
}
