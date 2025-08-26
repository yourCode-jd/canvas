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
    dw = w;
    dh = dw / sAspect;
    dx = x;
    dy = y + (h - dh) / 2;
  } else {
    dh = h;
    dw = dh * sAspect;
    dx = x + (w - dw) / 2;
    dy = y;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Draw full composition into given canvas.
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
  targetBox,
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

  // background
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

  // art
  t.filter = colorFilter || "none";
  t.drawImage(baseImg, mattingSize, mattingSize, baseWidth, baseHeight);
  t.filter = "none";

  // mask
  if (maskImg) {
    t.globalCompositeOperation = "destination-in";
    t.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
    t.globalCompositeOperation = "source-over";
  }

  // border
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
    drawContainToRect(ctx, tempCanvas, x, y, w, h);
  } else {
    drawContainToRect(ctx, tempCanvas, 0, 0, width, height);
  }
};

/** helper: apply scaling + offsets to a targetBox */
function applyScale(box, scene, scale = 1) {
  if (!box) return null;

  // 🔥 For Plain scene (no scale defined or scale === 1), use box as-is (full size)
  if (!scene.scale || scene.scale === 1) {
    return { ...box };
  }

  const w = box.w * scale;
  const h = box.h * scale;

  // default centering
  let x = box.x + (box.w - w) / 2;
  let y = box.y + (box.h - h) / 2;

  // allow per-scene overrides (scene.x, scene.y)
  if (typeof scene.x === "number") {
    x = scene.x > 1 ? scene.x / 512 : scene.x;
  }
  if (typeof scene.y === "number") {
    y = scene.y > 1 ? scene.y / 734 : scene.y;
  }

  return { w, h, x, y };
}

export default function ProductSlider({
  productImages = [],
  selectedColor = "original",
  selectedFrame = null,
  selectedBorder = null,
  selectedMatting = null,
}) {
  const [currentImage] = useState(productImages[0] || null);
  const [currentScene, setCurrentScene] = useState(0);
  const mainCanvasRef = useRef(null);
  const thumbRefs = useRef([]);

  const colorFilters = {
    original: "none",
    warm: "sepia(0.6) hue-rotate(10deg) saturate(1.5) brightness(1.1)",
    cool: "hue-rotate(180deg) saturate(1.3) brightness(1.05)",
    vintage: "sepia(0.9) contrast(1.1) brightness(0.9)",
    mono: "grayscale(1) contrast(1.2)",
  };

  const FIXED_BOX = {
    w: 1,
    h: 1,
    x: 0,
    y: 0,
  };

  const scenePreviews = [
    { label: "Plain", bg: null, box: FIXED_BOX }, // 👈 full-size, no scale
    {
      label: "Bedroom",
      bg: "/images/001.png",
      box: FIXED_BOX,
      scale: 0.4,
      x: 80,
      y: 150,
    },
    {
      label: "Living",
      bg: "/images/002.png",
      box: FIXED_BOX,
      scale: 0.4,
      x: 160,
      y: 100,
    },
    {
      label: "Office",
      bg: "/images/003.png",
      box: FIXED_BOX,
      scale: 0.3,
      x: 170,
      y: 120,
    },
    {
      label: "Hall",
      bg: "/images/004.png",
      box: FIXED_BOX,
      scale: 0.3,
      x: 70,
      y: 120,
    },
    {
      label: "Studio",
      bg: "/images/005.png",
      box: FIXED_BOX,
      scale: 0.3,
      x: 180,
      y: 120,
    },
    { label: "Loft", bg: "/images/bg5.png", box: FIXED_BOX, scale: 1.2 },
  ];

  const MAIN_W = 512;
  const MAIN_H = 734;
  const THUMB_W = 70;
  const THUMB_H = Math.round((THUMB_W * MAIN_H) / MAIN_W);

  // draw main
  useEffect(() => {
    if (!currentImage) return;
    const scene = scenePreviews[currentScene];
    const scaledBox = applyScale(scene.box, scene, scene.scale);
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
      targetBox: scaledBox,
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
      const scaledBox = applyScale(scene.box, scene, scene.scale);
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
        targetBox: scaledBox,
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
      <div className="w-[90px] flex flex-col" style={{ height: "734px" }}>
        <Swiper
          direction="vertical"
          slidesPerView={6}
          spaceBetween={12}
          style={{ height: "100%" }}
        >
          {scenePreviews.map((scene, i) => (
            <SwiperSlide key={scene.label} style={{ height: THUMB_H + 24 }}>
              <div className="flex flex-col items-center">
                <canvas
                  width={THUMB_W}
                  height={THUMB_H}
                  ref={(el) => (thumbRefs.current[i] = el)}
                  onClick={() => setCurrentScene(i)}
                  className={`cursor-pointer border ${
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
      <div className="border border-gray-200  bg-white overflow-hidden p-4">
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
