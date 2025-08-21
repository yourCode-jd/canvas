import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";

export default function ProductSlider({
  productImages = [],
  selectedColor = "original",
  selectedFrame = null, // {src, mask}
  selectedBorder = null, // {label, size, color}
}) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const colorFilters = {
    original: "",
    warm: "sepia(0.6) hue-rotate(10deg) saturate(1.5) brightness(1.1)",
    cool: "hue-rotate(180deg) saturate(1.3) brightness(1.05)",
    vintage: "sepia(0.9) contrast(1.1) brightness(0.9)",
    mono: "grayscale(1) contrast(1.2)",
  };

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="w-20 flex flex-col gap-3">
        <Swiper
          onSwiper={setThumbsSwiper}
          direction="vertical"
          slidesPerView={4}
          spaceBetween={10}
          className="h-[400px] w-20"
        >
          {productImages.map((img, i) => (
            <SwiperSlide key={i}>
              <img
                src={img}
                alt={`thumb-${i}`}
                className="w-full h-20 object-cover rounded-lg border hover:border-black cursor-pointer"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Slider */}
      <div className="flex-1 max-w-[600px]">
        <Swiper
          modules={[Thumbs]}
          thumbs={{ swiper: thumbsSwiper }}
          slidesPerView={1}
          spaceBetween={0}
          className="rounded-2xl shadow-md w-full h-[500px]"
        >
          {productImages.map((img, i) => (
            <SwiperSlide key={i} className="!w-full !h-[500px]">
              <div className="relative w-full h-full bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                {/* Border wrapper (always visible) */}
                <div
                  style={{
                    backgroundColor: selectedBorder?.color || "transparent",
                    padding: `${selectedBorder?.size || 0}px`,
                    boxSizing: "content-box",
                  }}
                  className="flex items-center justify-center w-full h-full"
                >
                  {/* Artwork with optional mask */}
                  {/* Artwork inside mask */}
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      backgroundColor: selectedBorder?.color || "transparent", // fills inside mask with border color
                    }}
                  >
                    <img
                      src={img}
                      alt={`main-${i}`}
                      className="w-full h-full object-contain transition-all duration-300"
                      style={{
                        filter: colorFilters[selectedColor] || "none",
                        transform: selectedBorder?.size
                          ? `scale(${1 - selectedBorder.size / 200})` // shrink proportionally
                          : "scale(1)",
                        WebkitMaskImage: selectedFrame?.mask
                          ? `url(${selectedFrame.mask})`
                          : "none",
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskSize: "contain",
                        WebkitMaskPosition: "center",
                        maskImage: selectedFrame?.mask
                          ? `url(${selectedFrame.mask})`
                          : "none",
                        maskRepeat: "no-repeat",
                        maskSize: "contain",
                        maskPosition: "center",
                      }}
                    />
                  </div>
                </div>

                {/* Frame overlay */}
                {selectedFrame?.src && (
                  <img
                    src={selectedFrame.src}
                    alt="frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
