import React, { useState } from "react";
import ProductSlider from "./ProductSlider";
import ColorSelector from "./ColorSelector";
import FrameSelector from "./FrameSelector";
import { Button } from "./Button";

export default function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState("original");
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedMatting, setSelectedMatting] = useState(null);

  // ✅ Product images (from public/images)
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

  const mattingOptions = [
    { label: "None", size: 0 },
    { label: "Small Matting", size: 45 },
    { label: "Medium Matting", size: 60 },
    { label: "Large Matting", size: 90 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 items-start">
      {/* Left: Product Canvas Slider */}
      <ProductSlider
        productImages={productImages}
        selectedColor={selectedColor}
        selectedFrame={selectedFrame}
        selectedBorder={null}
        selectedMatting={selectedMatting}
      />

      {/* Right: Product Info & Selectors */}
      <div className="flex flex-col space-y-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold mb-2 text-black">
            Abstract Wall Art
          </h1>
          <p className="text-black leading-relaxed max-w-lg">
            A modern abstract painting that brings luxury vibes to your living
            space. High-quality print with customizable frames and matting.
          </p>
        </div>

        {/* Color Selector */}
        <ColorSelector
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
        />

        {/* Frame Selector */}
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
