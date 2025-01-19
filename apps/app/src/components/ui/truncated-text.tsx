"use client";

import { useRef, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@proxed/ui/components/tooltip";
import { cn } from "@proxed/ui/utils";

interface TruncatedTextProps {
  text: string;
  className?: string;
}

export function TruncatedText({ text, className }: TruncatedTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [text]);

  if (!isTruncated) {
    return (
      <p ref={textRef} className={cn("truncate", className)}>
        {text}
      </p>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <p ref={textRef} className={cn("truncate", className)}>
          {text}
        </p>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[300px] break-words">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
