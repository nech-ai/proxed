"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { CopyIcon } from "lucide-react";
import { useState } from "react";

export function PostCopyURL() {
  const [isCopied, setCopied] = useState(false);

  const handleClipboard = async () => {
    try {
      setCopied(true);

      await navigator.clipboard.writeText(window.location.href);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleClipboard}
      className="relative flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
    >
      <motion.div
        className="absolute -left-4 top-0.5"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: isCopied ? 0 : 1, scale: isCopied ? 0 : 1 }}
      >
        <CopyIcon className="h-4 w-4" />
      </motion.div>

      <motion.div
        className="absolute -left-4 top-0.5"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isCopied ? 1 : 0, scale: isCopied ? 1 : 0 }}
      >
        <CheckIcon className="h-4 w-4 text-green-400" />
      </motion.div>

      <span className="text-xs ml-2">Copy link</span>
    </button>
  );
}
