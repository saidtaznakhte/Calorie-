
import React, { useState, useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 50; // Pixels to swipe to trigger delete visibility
const ANIMATION_DURATION = 200; // ms for the slide animation

interface SwipeToDeleteHook {
  translateX: number;
  showDelete: boolean;
  bind: () => {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    style: React.CSSProperties;
  };
}

export const useSwipeToDelete = (): SwipeToDeleteHook => {
  const startX = useRef(0);
  const currentX = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null); // Ref to the swipable element
  const [translateX, setTranslateX] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const isSwiping = useRef(false); // To prevent interference with vertical scroll

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setTranslateX(showDelete ? -SWIPE_THRESHOLD : 0); // If delete is already open, start from there
    isSwiping.current = true;
    // Prevent ancestor scroll from capturing touch events
    const parent = e.currentTarget.parentElement;
    if (parent) {
      parent.style.overflow = 'hidden';
    }
  }, [showDelete]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    if (diff > 0) { // Only allow swiping left
        setTranslateX(0);
        setShowDelete(false);
        isSwiping.current = false; // Stop swipe if moving right
        return;
    }

    const newTranslateX = Math.max(-SWIPE_THRESHOLD, diff); // Cap the swipe distance
    setTranslateX(newTranslateX);
    setShowDelete(newTranslateX <= -SWIPE_THRESHOLD / 2); // Show delete if past half threshold
  }, []);

  const handleTouchEnd = useCallback(() => {
    isSwiping.current = false;
    const parent = elementRef.current?.parentElement;
    if (parent) {
      parent.style.overflow = ''; // Restore parent overflow
    }

    if (translateX < -SWIPE_THRESHOLD / 2) {
      setTranslateX(-SWIPE_THRESHOLD); // Snap to open
      setShowDelete(true);
    } else {
      setTranslateX(0); // Snap back to close
      setShowDelete(false);
    }
  }, [translateX]);

  const bind = useCallback(() => ({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    style: {
      transform: `translateX(${translateX}px)`,
      transition: isSwiping.current ? 'none' : `transform ${ANIMATION_DURATION}ms ease-out`,
      touchAction: 'pan-y', // Allow vertical scrolling, prevent horizontal by default
      cursor: 'grab', // Visual cue for interaction
    },
    ref: elementRef, // Attach ref to the swipable element
  }), [translateX, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { translateX, showDelete, bind };
};