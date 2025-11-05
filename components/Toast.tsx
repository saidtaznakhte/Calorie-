
import React, { useEffect, useState, useRef } from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons.js'; // Import icons

interface ToastProps {
  message: { text: string; type?: 'success' | 'error' | 'info' } | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Keep toast visible for 3 seconds
    } else {
      setIsVisible(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message]);

  if (!isVisible || !message) {
    return null;
  }

  let bgColor = 'bg-blue-500'; // Default for info or unspecified
  let Icon = null;
  let iconColor = 'text-white';

  switch (message.type) {
    case 'success':
      bgColor = 'bg-primary'; // Using primary green for success
      Icon = CheckCircleIcon;
      iconColor = 'text-white';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      Icon = XCircleIcon;
      iconColor = 'text-white';
      break;
    case 'info':
    default:
      // Default info toast, can be customized or left without a specific icon
      bgColor = 'bg-blue-500'; 
      Icon = null;
      iconColor = 'text-white';
      break;
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-in-up">
      <div className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 transform origin-bottom animate-fade-in`}>
        {Icon && <Icon className={`w-5 h-5 ${iconColor} animate-checkmark-bounce flex-shrink-0`} />}
        <span>{message.text}</span>
      </div>
    </div>
  );
};

export default Toast;