import { useEffect, useState } from "react";

type ExpandableTextProps = {
  text: string; // The full text to display
  maxLength?: number; // Maximum number of characters before truncation
  maxCharsPerLine?: number; // Maximum number of characters per line
  className?: string; // Optional additional styles
};

const ExpandableText = ({
  text,
  maxLength = 100,
  maxCharsPerLine,
  className = "",
}: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  // Determine the text to display based on the state
  const displayText = isExpanded
    ? text
    : text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;

  return (
    <p
      className={className}
      style={{
        maxWidth: maxCharsPerLine ? `${maxCharsPerLine}ch` : "auto",
        overflowWrap: "break-word", // Ensure words break if they exceed max width
      }}
    >
      {displayText}
      {text.length > maxLength && (
        <button
          onClick={(e) => toggleExpanded(e)}
          className="ml-2 text-dm-dark-4"
        >
          {isExpanded ? "less" : "more"}
        </button>
      )}
    </p>
  );
};

export default ExpandableText;
