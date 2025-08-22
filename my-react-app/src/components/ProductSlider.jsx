import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

export default function ProductSlider({
  productImages = [],
  selectedColor = "original",
  selectedFrame = null,
  selectedBorder = null,
  selectedMatting = null, // matting object { size: number }
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [currentImage, setCurrentImage] = useState(productImages[0]);
  const canvasRef = useRef(null);

  const colorFilters = {
    original: "none",
    warm: "sepia(0.6) hue-rotate(10deg) saturate(1.5) brightness(1.1)",
    cool: "hue-rotate(180deg) saturate(1.3) brightness(1.05)",
    vintage: "sepia(0.9) contrast(1.1) brightness(0.9)",
    mono: "grayscale(1) contrast(1.2)",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = currentImage;

    const frameImg = new Image();
    const maskImg = new Image();
    frameImg.crossOrigin = "anonymous";
    maskImg.crossOrigin = "anonymous";

    frameImg.src = selectedFrame?.src || "";
    maskImg.src = selectedFrame?.mask || "";

    const baseWidth = 512;
    const baseHeight = 734;

    const mattingSize = selectedMatting?.size || 0;

    const canvasWidth = baseWidth + mattingSize * 2;
    const canvasHeight = baseHeight + mattingSize * 2;

    const drawFinal = () => {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Step 1: Draw matting background (white)
      if (mattingSize > 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Step 2: Create temp canvas for masked product image
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = baseWidth;
      tempCanvas.height = baseHeight;
      const tempCtx = tempCanvas.getContext("2d");

      // Step 3: Draw product image with filter on temp canvas
      tempCtx.filter = colorFilters[selectedColor] || "none";
      tempCtx.drawImage(baseImg, 0, 0, baseWidth, baseHeight);
      tempCtx.filter = "none";

      // Step 4: Apply mask ALWAYS, mask should clip the image inside frame
      if (selectedFrame?.mask) {
        tempCtx.globalCompositeOperation = "destination-in";
        tempCtx.drawImage(maskImg, 0, 0, canvasWidth, canvasHeight);
        tempCtx.globalCompositeOperation = "source-over";
      }

      // Step 5: Draw masked product image on main canvas, shifted by matting
      ctx.drawImage(tempCanvas, mattingSize, mattingSize);

      // Step 6: Draw border inside matting area if specified
      if (selectedBorder && selectedBorder.size > 0) {
        ctx.strokeStyle = selectedBorder.color || "#fff";
        ctx.lineWidth = selectedBorder.size;
        ctx.strokeRect(
          selectedBorder.size / 2,
          selectedBorder.size / 2,
          canvasWidth - selectedBorder.size,
          canvasHeight - selectedBorder.size
        );
      }

      // Step 7: Draw frame on top at full canvas size
      if (selectedFrame?.src) {
        ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
      }
    };

    // Load all images before drawing
    let loadedCount = 0;
    const totalToLoad = selectedFrame ? 3 : 1; // baseImg + frameImg + maskImg or only baseImg

    const onLoad = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        drawFinal();
      }
    };

    baseImg.onload = onLoad;
    if (selectedFrame) {
      frameImg.onload = onLoad;
      maskImg.onload = onLoad;
    }
  }, [
    currentImage,
    selectedColor,
    selectedFrame,
    selectedBorder,
    selectedMatting,
  ]);

  return (
    <div className="flex gap-6">
      {/* Thumbnails */}
      <div className="w-20 flex flex-col gap-3">
        <Swiper
          onSwiper={setThumbsSwiper}
          direction="vertical"
          slidesPerView={4}
          spaceBetween={10}
          className="h-[800px] w-20"
        >
          {productImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`thumb-${i}`}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                onClick={() => setCurrentImage(img)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Canvas Area */}
      <div
        className="w-[600px] h-[600px] p-14 flex justify-center items-center border border-gray-200 rounded-lg bg-white overflow-hidden"
        style={{ aspectRatio: "1 / 1" }} // keep outer box square/horizontal
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}
