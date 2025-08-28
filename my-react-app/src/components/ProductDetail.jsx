import React, { useState, useMemo } from "react";
import ProductSlider from "./ProductSlider";
import ColorSelector from "./ColorSelector";
import FrameSelector from "./FrameSelector";
import MattingSelector from "./MattingSelector";
import BorderSelector from "./BorderSelector"; // new import
import { Button } from "./Button";

export default function ProductDetail() {
  const [selectedColor, setSelectedColor] = useState("original");
  const productImages = useMemo(() => ["/images/art1.png"], []);

  const frameOptions = useMemo(
    () => [
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
    ],
    []
  );
  const [selectedFrame, setSelectedFrame] = useState(frameOptions[0]);

  // Add src for matting images
  const mattingOptions = useMemo(
    () => [
      { label: "None", size: 0, src: null },
      { label: "Small Matting", size: 50, src: "/images/art1-matted.png" },
      { label: "Medium Matting", size: 60, src: "/images/art2-matted.png" },
      { label: "Large Matting", size: 90, src: "/images/art3-matted.png" },
    ],
    []
  );
  const [selectedMatting, setSelectedMatting] = useState(mattingOptions[0]);

  const borderOptions = useMemo(
    () => [
      { label: "None", size: 0, color: "#000" },
      { label: "Thin", size: 4, color: "#000" },
      { label: "Medium", size: 8, color: "#000" },
      { label: "Thick", size: 12, color: "#000" },
    ],
    []
  );
  const [selectedBorder, setSelectedBorder] = useState(borderOptions[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] md:gap-12 gap-6 md:p-8 p-4 md:py-18 py-10 items-start max-w-screen-xl mx-auto">
      <ProductSlider
        productImages={productImages}
        selectedColor={selectedColor}
        selectedFrame={selectedFrame}
        selectedBorder={selectedBorder}
        selectedMatting={selectedMatting} // ← pass matting with src
      />
      <div className="flex flex-col md:space-y-9 space-y-6">
        <div className="text-left hidden md:block">
          <h1 className="text-3xl font-bold mb-2 text-black">
            Abstract Wall Art
          </h1>
          <p className="text-black leading-relaxed max-w-lg">
            A modern abstract painting that brings luxury vibes to your living
            space. High-quality print with customizable frames, matting, and
            borders.
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
        <MattingSelector
          mattingOptions={mattingOptions}
          selectedMatting={selectedMatting}
          setSelectedMatting={setSelectedMatting}
        />
        {/* <BorderSelector
          borderOptions={borderOptions}
          selectedBorder={selectedBorder}
          setSelectedBorder={setSelectedBorder}
        /> */}
        <Button className="w-60">Order Now</Button>
      </div>
    </div>
  );
}
