import { useState, useEffect } from "react";

type MediaSlideshowProps = {
  mediaUrls: any[];
  slideInterval?: number;
  customStyles?: {
    container?: string;
    image?: string;
    video?: string;
  };
};

const MediaSlideshow = ({
  mediaUrls,
  slideInterval = 3000,
  customStyles = {},
}: MediaSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIndex((curr) => (curr === mediaUrls.length - 1 ? 0 : curr + 1));
    }, slideInterval);

    return () => clearInterval(slideTimer);
  }, [mediaUrls.length, slideInterval]);

  return (
    <div className={`overflow-hidden relative ${customStyles.container || ""}`}>
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {mediaUrls.map((media, index) => (
          <div key={index} className="min-w-full flex items-center justify-center">
            {media.type === "Photo" ? (
              <img
                src={media.url}
                alt={`media-${index}`}
                className={customStyles.image ? customStyles.image : "post-card_img"}
              />
            ) : media.type === "Video" ? (
              <video
                className={customStyles.video ? customStyles.video : "post-card_img bg-black z-10"}
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
