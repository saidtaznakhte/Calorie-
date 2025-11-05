
import { useState, useEffect, useRef, useCallback } from 'react';

const PULL_THRESHOLD = 80; // Pixels to pull down to trigger refresh
const RELEASE_THRESHOLD = 60; // Pixels to release before triggering
const REFRESH_TIMEOUT = 2000; // Minimum time for refresh animation

export const usePullToRefresh = (onRefresh) => {
  const scrollRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const animationFrameId = useRef(null);

  const onRefreshRef = useRef(onRefresh);
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const updateScroll = useCallback(() => {
    if (scrollRef.current && isPulling.current) {
      const translateY = Math.max(0, currentY.current - startY.current);
      scrollRef.current.style.transform = `translateY(${translateY}px)`;
      scrollRef.current.style.transition = 'none'; // Disable transition during pull
    }
    if(isPulling.current) {
        animationFrameId.current = requestAnimationFrame(updateScroll);
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
      isPulling.current = true;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      animationFrameId.current = requestAnimationFrame(updateScroll);
    }
  }, [isRefreshing, updateScroll]);

  const handleTouchMove = useCallback((e) => {
    if (isPulling.current) {
      currentY.current = e.touches[0].clientY;
      if (currentY.current - startY.current < 0) { // If pulling up, stop pulling behavior
        isPulling.current = false;
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        if (scrollRef.current) {
          scrollRef.current.style.transform = '';
          scrollRef.current.style.transition = '';
        }
        return;
      }
      // Prevent default to stop scrolling, but only if pulling down past a certain point
      if (currentY.current - startY.current > 0) {
        e.preventDefault();
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling.current) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      const pulledDistance = currentY.current - startY.current;
      isPulling.current = false;

      if (scrollRef.current) {
        scrollRef.current.style.transition = 'transform 0.3s ease-out';
      }

      if (pulledDistance > PULL_THRESHOLD) {
        setIsRefreshing(true);
        if (scrollRef.current) {
          scrollRef.current.style.transform = `translateY(${RELEASE_THRESHOLD}px)`; // Keep indicator visible
        }

        const startTime = Date.now();
        await onRefreshRef.current();
        const elapsedTime = Date.now() - startTime;

        // Ensure refresh animation lasts at least REFRESH_TIMEOUT
        const delay = Math.max(0, REFRESH_TIMEOUT - elapsedTime);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.style.transform = '';
          }
          setIsRefreshing(false);
        }, delay);

      } else {
        if (scrollRef.current) {
          scrollRef.current.style.transform = '';
        }
      }
    }
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) {
      const options = { passive: false };
      element.addEventListener('touchstart', handleTouchStart, options);
      element.addEventListener('touchmove', handleTouchMove, options);
      element.addEventListener('touchend', handleTouchEnd, options);
    
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchMove);
        element.removeEventListener('touchend', handleTouchEnd);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef };
};
