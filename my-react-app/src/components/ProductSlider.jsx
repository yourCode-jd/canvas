import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

/** util: load image safely */
const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });

/** draw img into rect [x,y,w,h] using contain-fit (no crop, centered) */
function drawContainToRect(ctx, img, x, y, w, h) {
  if (!img) return;
  const sAspect = img.width / img.height;
  const dAspect = w / h;

  let dw, dh, dx, dy;
  if (sAspect > dAspect) {
    // limit by width
    dw = w;
    dh = dw / sAspect;
    dx = x;
    dy = y + (h - dh) / 2;
  } else {
    // limit by height
    dh = h;
    dw = dh * sAspect;
    dx = x + (w - dw) / 2;
    dy = y;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Draw full composition into given canvas.
 * If targetBox (percentages) is provided, the framed art is drawn
 * INSIDE that rectangle (contain fit). Otherwise it is centered.
 */
const drawToCanvas = async ({
  canvas,
  baseSrc,
  frame,
  border,
  matting,
  colorFilter,
  width,
  height,
  sceneBg,
  targetBox, // {x,y,w,h} — all 0..1 (percent of final canvas)
}) => {
  if (!canvas || !baseSrc) return;
  const ctx = canvas.getContext("2d");

  const [baseImg, frameImg, maskImg, sceneImg] = await Promise.all([
    loadImage(baseSrc),
    loadImage(frame?.src),
    loadImage(frame?.mask),
    loadImage(sceneBg),
  ]);
  if (!baseImg) return;

  // setup
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  // background (contain-fit so nothing is cropped)
  if (sceneImg) {
    drawContainToRect(ctx, sceneImg, 0, 0, width, height);
  } else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }

  // build the framed art on a temp canvas
  const baseWidth = 512;
  const baseHeight = 734;
  const mattingSize = matting?.size || 0;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = baseWidth + mattingSize * 2;
  tempCanvas.height = baseHeight + mattingSize * 2;
  const t = tempCanvas.getContext("2d");

  // matting
  if (mattingSize > 0) {
    t.fillStyle = "#fff";
    t.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }

  // art (with color filter)
  t.filter = colorFilter || "none";
  t.drawImage(baseImg, mattingSize, mattingSize, baseWidth, baseHeight);
  t.filter = "none";

  // mask
  if (maskImg) {
    t.globalCompositeOperation = "destination-in";
    t.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
    t.globalCompositeOperation = "source-over";
  }

  // optional border
  if (border && border.size > 0) {
    t.strokeStyle = border.color || "#000";
    t.lineWidth = border.size;
    t.strokeRect(
      border.size / 2,
      border.size / 2,
      tempCanvas.width - border.size,
      tempCanvas.height - border.size
    );
  }

  // frame overlay
  if (frameImg) {
    t.drawImage(frameImg, 0, 0, tempCanvas.width, tempCanvas.height);
  }

  // place the framed art
  if (targetBox) {
    const x = targetBox.x * width;
    const y = targetBox.y * height;
    const w = targetBox.w * width;
    const h = targetBox.h * height;
    // contain-fit the art inside the target box
    drawContainToRect(ctx, tempCanvas, x, y, w, h);
  } else {
    // center-fit on the whole canvas
    drawContainToRect(ctx, tempCanvas, 0, 0, width, height);
  }
};

export default function ProductSlider({
  productImages = [],
  selectedColor = "original",
  selectedFrame = null,
  selectedBorder = null,
  selectedMatting = null,
}) {
  // Use the first product image as the art
  const [currentImage] = useState(productImages[0] || null);
  const [currentScene, setCurrentScene] = useState(0); // index into scenePreviews
  const mainCanvasRef = useRef(null);
  const thumbRefs = useRef([]);

  const colorFilters = {
    original: "none",
    warm: "sepia(0.6) hue-rotate(10deg) saturate(1.5) brightness(1.1)",
    cool: "hue-rotate(180deg) saturate(1.3) brightness(1.05)",
    vintage: "sepia(0.9) contrast(1.1) brightness(0.9)",
    mono: "grayscale(1) contrast(1.2)",
  };

  /**
   * Scenes:
   * - bg: background image path (your bg.png, bg1.png, bg2.png, ...)
   * - box: where to place the framed art on that scene (percent of canvas)
   *   Tune these numbers to match each scene.
   */
  const FIXED_BOX = {
    w: 0.6,
    h: 0.62,
    x: (1 - 0.6) / 2, // 0.2
    y: (1 - 0.62) / 2, // 0.19
  };

  const scenePreviews = [
    { label: "Plain", bg: null, box: null },
    {
      label: "Bedroom",
      bg: "/images/bg.png",
      box: { x: 0.18, y: 0.1, ...FIXED_BOX },
    },
    {
      label: "Living",
      bg: "/images/bg1.png",
      box: { x: 0.2, y: 0.14, ...FIXED_BOX },
    },
    {
      label: "Office",
      bg: "/images/bg2.png",
      box: { x: 0.22, y: 0.16, ...FIXED_BOX },
    },
    {
      label: "Hall",
      bg: "/images/bg3.png",
      box: { x: 0.25, y: 0.18, ...FIXED_BOX },
    },
    {
      label: "Studio",
      bg: "/images/bg4.png",
      box: { x: 0.23, y: 0.15, ...FIXED_BOX },
    },
    {
      label: "Loft",
      bg: "/images/bg5.png",
      box: { x: 0.21, y: 0.17, ...FIXED_BOX },
    },
  ];

  // ---------- sizes (portrait 512×734)
  const MAIN_W = 512;
  const MAIN_H = 734;
  const THUMB_W = 70; // pick a small width
  const THUMB_H = Math.round((THUMB_W * MAIN_H) / MAIN_W); // keep the same aspect (≈100)

  // draw main
  useEffect(() => {
    if (!currentImage) return;
    const scene = scenePreviews[currentScene];
    drawToCanvas({
      canvas: mainCanvasRef.current,
      baseSrc: currentImage,
      frame: selectedFrame,
      border: selectedBorder,
      matting: selectedMatting,
      colorFilter: colorFilters[selectedColor],
      width: MAIN_W,
      height: MAIN_H,
      sceneBg: scene.bg,
      targetBox: scene.box,
    });
  }, [
    currentImage,
    currentScene,
    selectedColor,
    selectedFrame,
    selectedBorder,
    selectedMatting,
  ]);

  // draw thumbnails
  useEffect(() => {
    if (!currentImage) return;
    scenePreviews.forEach((scene, i) => {
      const canvas = thumbRefs.current[i];
      if (!canvas) return;
      drawToCanvas({
        canvas,
        baseSrc: currentImage,
        frame: selectedFrame,
        border: selectedBorder,
        matting: selectedMatting,
        colorFilter: colorFilters[selectedColor],
        width: THUMB_W,
        height: THUMB_H,
        sceneBg: scene.bg,
        targetBox: scene.box, // same placement, auto-fits to 70×~100
      });
    });
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
      <div
        className="w-[90px] flex flex-col"
        style={{ height: "734px" }} // match main canvas height
      >
        <Swiper
          direction="vertical"
          slidesPerView={6} // or "auto"
          spaceBetween={12}
          style={{ height: "100%" }} // fill parent
        >
          {scenePreviews.map((scene, i) => (
            <SwiperSlide key={scene.label} style={{ height: THUMB_H + 24 }}>
              <div className="flex flex-col items-center">
                <canvas
                  width={THUMB_W}
                  height={THUMB_H}
                  ref={(el) => (thumbRefs.current[i] = el)}
                  onClick={() => setCurrentScene(i)}
                  className={`rounded-lg cursor-pointer border ${
                    currentScene === i ? "border-black" : "border-gray-200"
                  }`}
                />
                <p className="text-[11px] text-center mt-1 leading-tight">
                  {scene.label}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Canvas */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden p-4">
        <canvas
          ref={mainCanvasRef}
          width={MAIN_W}
          height={MAIN_H}
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
