import { useState, useEffect } from "react";

type MediaSlideshowProps = {
  mediaUrls: any[];
  minInterval?: number; // Minimum slide interval (ms)
  maxInterval?: number; // Maximum slide interval (ms)
  customStyles?: {
    container?: string;
    image?: string;
    video?: string;
  };
};

const MediaSlideshow = ({
  mediaUrls,
  minInterval = 9000, // Default: 2 seconds
  maxInterval = 10000, // Default: 5 seconds
  customStyles = {},
}: MediaSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideInterval, setSlideInterval] = useState(
    Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval
  );

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIndex((curr) => (curr === mediaUrls.length - 1 ? 0 : curr + 1));
      setSlideInterval(
        Math.floor(Math.random() * (maxInterval - minInterval + 1)) +
          minInterval
      );
    }, slideInterval);

    return () => clearInterval(slideTimer);
  }, [mediaUrls.length, slideInterval, minInterval, maxInterval]);

  return (
    <div className={`overflow-hidden relative ${customStyles.container || ""}`}>
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
                className={
                  customStyles.image ? customStyles.image : "post-card_img"
                }
              />
            ) : media.type === "Video" ? (
              <video
                className={
                  customStyles.video
                    ? customStyles.video
                    : "post-card_img bg-black z-10"
                }
                src={media.url}
                autoPlay
                loop
                muted
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaSlideshow;
