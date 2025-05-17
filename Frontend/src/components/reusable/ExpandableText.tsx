import { useState } from "react";

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

  const processedText = isExpanded
    ? text.split("\n")
    : text.substring(0, maxLength).split("\n");

  return (
    <div
      className={className}
      style={{
        maxWidth: maxCharsPerLine ? `${maxCharsPerLine}ch` : "auto",
        overflowWrap: "break-word",
      }}
    >
      {processedText.map((line, index) => (
        <p key={index}>
          {line}
          {index < processedText.length - 1 && <br />}
        </p>
      ))}
      {text.length > maxLength && (
        <button
          onClick={(e) => toggleExpanded(e)}
          className="ml-2 text-dm-dark-4"
        >
          {isExpanded ? "less" : "more"}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
