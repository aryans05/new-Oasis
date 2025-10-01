"use client";

import React, { useState } from "react";
import Logo from "./Logo";

type TextExpanderProps = {
  children: React.ReactNode;
  words?: number; // how many words to show when collapsed
  className?: string;
};

// Helper: recursively extract plain text from React children
function getTextFromNode(node: React.ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);

  if (Array.isArray(node)) {
    return node.map(getTextFromNode).join(" ");
  }

  if (React.isValidElement(node)) {
    return getTextFromNode((node.props as any).children);
  }

  return "";
}

export default function TextExpander({
  children,
  words = 40,
  className,
}: TextExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract plain text for truncation logic
  const fullText = getTextFromNode(children).trim();
  const wordArray = fullText === "" ? [] : fullText.split(/\s+/);
  const shouldTruncate = wordArray.length > words;

  const truncatedText = shouldTruncate
    ? wordArray.slice(0, words).join(" ") + "..."
    : fullText;

  return (
    <span className={className}>
      {isExpanded
        ? // show original children (keeps JSX formatting intact)
          children
        : // collapsed version shows only truncated plain text
          truncatedText}{" "}
      {shouldTruncate && (
        <button
          type="button"
          className="text-primary-700 border-b border-primary-700 leading-3 pb-1"
          onClick={() => setIsExpanded((s) => !s)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
      <Logo />
    </span>
  );
}
