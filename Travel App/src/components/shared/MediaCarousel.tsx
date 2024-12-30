import { useState, useEffect } from "react";

type MediaCarouselProps = {
  mediaUrls: any[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
};

const MediaCarousel = ({
  mediaUrls,
  autoSlide = false,
  autoSlideInterval = 3000,
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((curr) => (curr === 0 ? mediaUrls.length - 1 : curr - 1));
  };
  const next = () => {
    setCurrentIndex((curr) => (curr === mediaUrls.length - 1 ? 0 : curr + 1));
  };

  useEffect(() => {
    if (!autoSlide) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="overflow-hidden relative">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {mediaUrls.map((media, index) => (
          <div
            key={index}
            className="min-w-full flex items-center justify-center"
          >
            {media.type === "Photo" ? (
              <img
                src={media.url}
                alt={`media-${index}`}
                className="post-card_img"
              />
            ) : media.type === "Video" ? (
              <video
                controls
                className="post-card_img bg-black z-10"
                src={media.url}
                autoPlay
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  const videoElement = e.currentTarget;
                  if (videoElement.paused) {
                    videoElement.play();
                  } else {
                    videoElement.pause();
                  }
                }}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {mediaUrls.length > 1 && (
          <>
            {currentIndex > 0 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={prev}
                  className="bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full pointer-events-auto z-20 opacity-30 hover:opacity-90"
                >
                  <img
                    src="/assets/icons/left-arrow.png"
                    alt="left-arrow"
                    className="w-5 h-auto"
                  />
                </button>
              </div>
            )}
            {currentIndex < mediaUrls.length - 1 && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <button
                  onClick={next}
                  className="bg-dm-dark hover:bg-dm-secondary text-dm-light p-2 rounded-full pointer-events-auto z-20 opacity-30 hover:opacity-90"
                >
                  <img
                    src="/assets/icons/right-arrow.png"
                    alt="right-arrow"
                    className="w-5 h-auto"
                  />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dots */}
      <div className="absolute bottom-7 right-0 left-0">
        <div className="flex items-center justify-center gap-2">
          {mediaUrls.length > 1 &&
            mediaUrls.map((_, i) => (
              <div
                className={`
              w-2 h-2 bg-white rounded-full
              ${currentIndex === i ? "p-1" : "bg-opacity-50"}
            `}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MediaCarousel;
