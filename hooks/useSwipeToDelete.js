
import { useState, useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 50; // Pixels to swipe to trigger delete visibility

export const useSwipeToDelete = () => {
  const startX = useRef(0);
  const currentX = useRef(0);
  const [translateX, setTranslateX] = useState(0);
  const [showDelete, setShowDelete] = useState(false);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    isSwiping.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping.current) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Only allow swiping left from initial position
    if (diff > 0 && translateX === 0) {
      isSwiping.current = false;
      return;
    }
    
    // Cap swipe distance
    const newTranslateX = showDelete
      ? Math.max(-SWIPE_THRESHOLD, -SWIPE_THRESHOLD + diff)
      : Math.max(-SWIPE_THRESHOLD, diff);

    if (newTranslateX > 0) {
        setTranslateX(0);
    } else {
        setTranslateX(newTranslateX);
    }
  }, [showDelete, translateX]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    
    if (translateX < -SWIPE_THRESHOLD / 2) {
      setTranslateX(-SWIPE_THRESHOLD);
      setShowDelete(true);
    } else {
      setTranslateX(0);
      setShowDelete(false);
    }
  }, [translateX]);

  const bind = useCallback(() => ({
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { translateX, showDelete, bind };
};
