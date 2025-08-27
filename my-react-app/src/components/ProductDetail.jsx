import React, { useState } from "react";
import ProductSlider from "./ProductSlider";
import ColorSelector from "./ColorSelector";
import FrameSelector from "./FrameSelector";
import MattingSelector from "./MattingSelector"; // 👈 new import
import { Button } from "./Button";

export default function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState("original");

  const productImages = ["/images/art1.png"];

  const frameOptions = [
    {
      id: "walnut",
      label: "Walnut",
      src: "/images/fv/frame1.png",
      mask: "/images/fv/frame1-mask.png",
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
    {
      id: "maple",
      label: "Maple",
      src: "/images/frame4.png",
      mask: "/images/frame4-mask.png",
    },
    {
      id: "cherry",
      label: "Cherry",
      src: "/images/frame6.png",
      mask: "/images/frame6-mask.png",
    },
  ];

  const [selectedFrame, setSelectedFrame] = useState(frameOptions[0]); // ✅ default Walnut

  const mattingOptions = [
    { label: "None", size: 0 },
    { label: "Small Matting", size: 50 },
    { label: "Medium Matting", size: 60 },
    { label: "Large Matting", size: 90 },
  ];

  const [selectedMatting, setSelectedMatting] = useState(mattingOptions[0]); // ✅ default None

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 py-18 items-start max-w-screen-2xl mx-auto">
      {/* Left: Product Canvas Slider */}
      <ProductSlider
        productImages={productImages}
        selectedColor={selectedColor}
        selectedFrame={selectedFrame}
        selectedBorder={null}
        selectedMatting={selectedMatting}
      />

      {/* Right: Product Info & Selectors */}
      <div className="flex flex-col space-y-9">
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
        <MattingSelector
          mattingOptions={mattingOptions}
          selectedMatting={selectedMatting}
          setSelectedMatting={setSelectedMatting}
        />

        <Button className="w-60">Order Now</Button>
      </div>
    </div>
  );
}
