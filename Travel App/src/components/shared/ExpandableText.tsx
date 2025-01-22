import { useState } from "react";

type ExpandableTextProps = {
  text: string; // The full text to display
  maxLength?: number; // Maximum number of characters before truncation
  className?: string; // Optional additional styles
};

const ExpandableText = ({
  text,
  maxLength = 100,
  className = "",
}: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  // Determine the text to display based on the state
  const displayText = isExpanded
    ? text
    : text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;

  return (
    <p className={className}>
      {displayText}
      {text.length > maxLength && (
        <button onClick={toggleExpanded} className="ml-2 text-dm-dark-4">
          {isExpanded ? "less" : "more"}
        </button>
      )}
    </p>
  );
};

export default ExpandableText;
