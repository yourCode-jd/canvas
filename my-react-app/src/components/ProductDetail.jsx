import React, { useState } from "react";
import ProductSlider from "./ProductSlider";
import ColorSelector from "./ColorSelector";
import FrameSelector from "./FrameSelector";
import BorderSelector from "./BorderSelector";
import { Button } from "./Button";

export default function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState("original");
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedBorder, setSelectedBorder] = useState(null);

  const productImages = [
    "/images/art1.jpg",
    "/images/art1.jpg",
    "/images/art1.jpg",
  ];

  // IMPORTANT: create matching mask files (same pixel size as the frame image).
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

  const borderOptions = [
    { label: "None", size: 0, color: "transparent" },
    { label: "Thin White", size: 10, color: "#fff" },
    { label: "Medium White", size: 30, color: "#fff" },
    { label: "Thick White", size: 60, color: "#fff" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 max-w-7xl mx-auto">
      <ProductSlider
        productImages={productImages}
        selectedColor={selectedColor}
        selectedFrame={selectedFrame} // full object {src, mask}
        selectedBorder={selectedBorder}
      />

      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-black text-left">
            Abstract Wall Art
          </h1>
          <p className="text-black text-left leading-relaxed">
            A modern abstract painting that brings luxury vibes to your living
            space. High-quality print with customizable frames and borders.
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
        <BorderSelector
          borderOptions={borderOptions}
          selectedBorder={selectedBorder}
          setSelectedBorder={setSelectedBorder}
        />

        <Button>Order Now</Button>
      </div>
    </div>
  );
}
