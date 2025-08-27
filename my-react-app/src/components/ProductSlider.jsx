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

const drawShadow = (ctx, tempCanvas, x, y, w, h, isThumbnail) => {
  if (isThumbnail) {
    const pad = Math.max(8, Math.round(Math.min(w, h) * 0.12));
    const s = document.createElement("canvas");
    s.width = Math.round(w + pad * 2);
    s.height = Math.round(h + pad * 2);
    const sctx = s.getContext("2d");
    sctx.filter = `blur(6px)`;
    sctx.fillStyle = "rgba(0,0,0,0.08)";
    sctx.fillRect(pad, pad, w, h);
    sctx.filter = "none";
    ctx.drawImage(s, x - pad + 3, y - pad + 4);
    drawContainToRect(ctx, tempCanvas, x, y, w, h);
    return;
  }

  // Ambient shadow
  const ambientPad = Math.round(Math.max(w, h) * 0.55);
  const sA = document.createElement("canvas");
  sA.width = Math.round(w + ambientPad * 2);
  sA.height = Math.round(h + ambientPad * 2);
  const sActx = sA.getContext("2d");
  sActx.filter = `blur(42px)`;
  sActx.fillStyle = "rgba(0,0,0,0.06)";
  sActx.fillRect(ambientPad, ambientPad, w, h);
  sActx.filter = "none";
  ctx.drawImage(sA, x - ambientPad + 2, y - ambientPad + 4);

  // Directional drop shadow
  const dropPad = Math.round(Math.min(w, h) * 0.2);
  const sD = document.createElement("canvas");
  sD.width = Math.round(w + dropPad * 2);
  sD.height = Math.round(h + dropPad * 2);
  const sDctx = sD.getContext("2d");
  sDctx.filter = `blur(18px)`;
  sDctx.fillStyle = "rgba(0,0,0,0.22)";
  sDctx.fillRect(dropPad, dropPad, w, h);
  sDctx.filter = "none";
  ctx.drawImage(sD, x - dropPad + 6, y - dropPad + 20);

  // Corner falloff
  const cornerSize = Math.round(Math.min(w, h) * 0.45);
  const corners = [
    [x, y, 0.1],
    [x + w, y, 0.08],
    [x, y + h, 0.1],
    [x + w, y + h, 0.18],
  ];
  corners.forEach(([cx, cy, opacity]) => {
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cornerSize);
    grad.addColorStop(0, `rgba(0,0,0,${opacity})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(cx - cornerSize, cy - cornerSize, cornerSize, cornerSize);
  });

  drawContainToRect(ctx, tempCanvas, x, y, w, h);
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

  // background
  if (sceneImg) drawContainToRect(ctx, sceneImg, 0, 0, width, height);
  else {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
  }

  // temp canvas for art
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

  const isThumbnail = width <= 120 || height <= 160;
  if (targetBox) {
    const x = targetBox.x * width;
    const y = targetBox.y * height;
    const w = targetBox.w * width;
    const h = targetBox.h * height;
    drawShadow(ctx, tempCanvas, x, y, w, h, isThumbnail);
  } else drawShadow(ctx, tempCanvas, 0, 0, width, height, isThumbnail);
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
  ]);

  return (
    <div className="flex gap-6">
      <div
        className="relative w-[90px] flex flex-col"
        style={{ height: "770px" }}
      >
        <div className="absolute top-0 left-0 w-full h-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
        <Swiper
          direction="vertical"
          slidesPerView={6}
          spaceBetween={12}
          style={{ height: "100%" }}
          className="thumbnail-swiper"
        >
          {scenePreviews.map((scene, i) => (
            <SwiperSlide key={i} style={{ height: THUMB_H + 24 }}>
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
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />
      </div>
      <div className="border border-gray-200 bg-white overflow-hidden p-4">
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
