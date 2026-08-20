"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const CONFIRM_MS = 1500;
// damping 1.0 (critically damped) / response 0.3s -> bounce 0 / duration 0.3
const LABEL_SPRING = { type: "spring", bounce: 0, duration: 0.3 } as const;

interface AddToCartButtonProps {
  disabled?: boolean;
  isLoading?: boolean;
  onAdd: () => void;
  className?: string;
}

export function AddToCartButton({
  disabled,
  isLoading,
  onAdd,
  className = "",
}: AddToCartButtonProps) {
  const [confirmed, setConfirmed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  const handleClick = () => {
    // feedback (scale + label swap) fires on press; addToCart confirms state after
    setConfirmed(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setConfirmed(false), CONFIRM_MS);
    onAdd();
  };

  const label = confirmed ? "Added ✓" : isLoading ? "Adding..." : "Add to cart";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`inline-flex min-w-[10rem] items-center justify-center rounded-labelashb-sm bg-labelashb-wine px-6 py-3 text-labelashb-body font-medium text-labelashb-accent-foreground transition-transform duration-100 ease-out hover:bg-labelashb-wine-hover active:scale-[0.97] active:bg-labelashb-wine-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-labelashb-accent focus-visible:ring-offset-1 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0.1 } : LABEL_SPRING}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
