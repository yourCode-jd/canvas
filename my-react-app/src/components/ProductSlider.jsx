import React, { useRef, useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });

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

const drawSolidShadow = (
  ctx,
  box,
  lightDir = { x: -1, y: 1 },
  distance = 8,
  shadowColor = "rgba(0,0,0,0.5)"
) => {
  const { x, y, w, h } = box;
  const dx = lightDir.x < 0 ? distance : -distance;
  const dy = lightDir.y > 0 ? distance : -distance;

  ctx.save();
  ctx.fillStyle = shadowColor;
  ctx.beginPath();
  ctx.moveTo(x + dx, y + dy);
  ctx.lineTo(x + w + dx, y + dy);
  ctx.lineTo(x + w + dx, y + h + dy);
  ctx.lineTo(x + dx, y + h + dy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

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
  lightDir = { x: -1, y: 1 },
  shadowDistance = 8,
  shadowColor = "rgba(0,0,0,0.5)",
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

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  // Draw background
  if (sceneImg) drawContainToRect(ctx, sceneImg, 0, 0, width, height);
  else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }

  // Temp canvas for product image
  const baseWidth = 512;
  const baseHeight = 734;
  const mattingSize = matting?.size || 0;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = baseWidth + mattingSize * 2;
  tempCanvas.height = baseHeight + mattingSize * 2;
  const t = tempCanvas.getContext("2d");

  if (mattingSize > 0) {
    t.fillStyle = "#fff";
    t.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }

  t.filter = colorFilter || "none";
  t.drawImage(baseImg, mattingSize, mattingSize, baseWidth, baseHeight);
  t.filter = "none";

  if (maskImg) {
    t.globalCompositeOperation = "destination-in";
    t.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
    t.globalCompositeOperation = "source-over";
  }

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

  if (frameImg)
    t.drawImage(frameImg, 0, 0, tempCanvas.width, tempCanvas.height);

  // Determine if this is a thumbnail
  const isThumbnail = width <= 120 || height <= 160;

  if (targetBox) {
    const x = targetBox.x * width;
    const y = targetBox.y * height;
    const w = targetBox.w * width;
    const h = targetBox.h * height;
    if (!isThumbnail) {
      drawSolidShadow(
        ctx,
        { x, y, w, h },
        lightDir,
        shadowDistance,
        shadowColor
      );
    }
    drawContainToRect(ctx, tempCanvas, x, y, w, h);
  } else {
    if (!isThumbnail) {
      drawSolidShadow(
        ctx,
        { x: 0, y: 0, w: width, h: height },
        lightDir,
        shadowDistance,
        shadowColor
      );
    }
    drawContainToRect(ctx, tempCanvas, 0, 0, width, height);
  }
};

function applyScale(box, scene, scale = 1) {
  if (!box) return null;
  if (!scene.scale || scene.scale === 1) return { ...box };
  const w = box.w * scale;
  const h = box.h * scale;
  let x = box.x + (box.w - w) / 2;
  let y = box.y + (box.h - h) / 2;
  if (typeof scene.x === "number") x = scene.x > 1 ? scene.x / 512 : scene.x;
  if (typeof scene.y === "number") y = scene.y > 1 ? scene.y / 734 : scene.y;
  return { w, h, x, y };
}

export default function ProductSlider({
  productImages = [],
  selectedColor = "original",
  selectedFrame = null,
  selectedBorder = null,
  selectedMatting = null,
  lightDir = { x: -1, y: 1 },
  shadowDistance = 8,
  shadowColor = "rgba(0,0,0,0.5)",
}) {
  const [currentImage] = useState(productImages[0] || null);
  const [currentScene, setCurrentScene] = useState(0);
  const mainCanvasRef = useRef(null);
  const thumbRefs = useRef([]);

  const colorFilters = useMemo(
    () => ({
      original: "none",
      warm: "sepia(0.6) hue-rotate(10deg) saturate(1.5) brightness(1.1)",
      cool: "hue-rotate(180deg) saturate(1.3) brightness(1.05)",
      vintage: "sepia(0.9) contrast(1.1) brightness(0.9)",
      mono: "grayscale(1) contrast(1.2)",
    }),
    []
  );

  const FIXED_BOX = { w: 1, h: 1, x: 0, y: 0 };

  const scenePreviews = useMemo(
    () => [
      { bg: null, box: FIXED_BOX },
      { bg: "/images/001.png", box: FIXED_BOX, scale: 0.4, x: 80, y: 150 },
      { bg: "/images/002.png", box: FIXED_BOX, scale: 0.4, x: 160, y: 100 },
      { bg: "/images/003.png", box: FIXED_BOX, scale: 0.3, x: 170, y: 120 },
      { bg: "/images/004.png", box: FIXED_BOX, scale: 0.3, x: 70, y: 120 },
      { bg: "/images/005.png", box: FIXED_BOX, scale: 0.3, x: 180, y: 120 },
      { bg: "/images/006.png", box: FIXED_BOX, scale: 0.4, x: 150, y: 60 },
      { bg: "/images/007.png", box: FIXED_BOX, scale: 0.4, x: 150, y: 60 },
      { bg: "/images/008.png", box: FIXED_BOX, scale: 0.4, x: 150, y: 60 },
    ],
    []
  );

  const MAIN_W = 512,
    MAIN_H = 734;
  const THUMB_W = 70;
  const THUMB_H = Math.round((THUMB_W * MAIN_H) / MAIN_W);

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
      lightDir,
      shadowDistance,
      shadowColor,
    });
  }, [
    currentImage,
    currentScene,
    selectedColor,
    selectedFrame,
    selectedBorder,
    selectedMatting,
    scenePreviews,
    colorFilters,
    lightDir,
    shadowDistance,
    shadowColor,
  ]);

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
        lightDir,
        shadowDistance,
        shadowColor,
      });
    });
  }, [
    currentImage,
    selectedColor,
    selectedFrame,
    selectedBorder,
    selectedMatting,
    scenePreviews,
    colorFilters,
    lightDir,
    shadowDistance,
    shadowColor,
  ]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6 justify-center lg:justify-end items-start">
      {/* Thumbnails */}
      <div
        className="relative w-full md:w-[90px] flex flex-row md:flex-col overflow-x-auto md:overflow-visible"
        style={{ height: "auto", maxHeight: "734px" }}
      >
        {/* Top gradient for vertical swiper (hidden on mobile) */}
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10 hidden md:block" />

        <Swiper
          direction="vertical"
          slidesPerView={6}
          spaceBetween={12}
          style={{ height: "100%" }}
          className="thumbnail-swiper"
          breakpoints={{
            0: {
              // Mobile
              direction: "horizontal",
              slidesPerView: 4,
              spaceBetween: 8,
            },
            768: {
              // Tablet/Desktop
              direction: "vertical",
              slidesPerView: 6,
              spaceBetween: 12,
            },
          }}
        >
          {scenePreviews.map((scene, i) => (
            <SwiperSlide
              key={i}
              className="flex justify-center items-center p-2"
            >
              <div className="flex flex-col items-center w-[50px] md:w-[70px] sm:w-auto">
                <canvas
                  ref={(el) => (thumbRefs.current[i] = el)}
                  onClick={() => setCurrentScene(i)}
                  className={`cursor-pointer border ${
                    currentScene === i ? "border-black" : "border-gray-200"
                  } w-full h-auto`}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Bottom gradient for vertical swiper (hidden on mobile) */}
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10 hidden md:block" />
      </div>

      {/* Main canvas */}
      <div className="w-full max-w-[512px] aspect-[512/734] border border-gray-200 bg-white overflow-hidden p-4">
        <canvas
          ref={mainCanvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>
    </div>
  );
}
