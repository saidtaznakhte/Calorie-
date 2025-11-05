

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page, Meal, MealAnalysis } from '../types.js';
import { analyzeMealPhoto } from '../services/geminiService.js';
import { BackIcon } from '../components/Icons.js';
import { toYYYYMMDD } from '../utils/dateUtils.js';
import { useAppContext } from '../contexts/AppContext.js';
import RequestCameraAccess from '../components/RequestCameraAccess.js';
import PermissionDenied from '../components/PermissionDenied.js';

const loadingMessages = [
    "Analyzing textures and colors...",
    "Identifying ingredients...",
    "Estimating portion sizes...",
    "Calculating nutritional values...",
    "Finalizing the report..."
];

const NutrientPill = ({ label, value, unit, color }) => (
    React.createElement("div", { className: "flex flex-col items-center justify-center bg-light-gray dark:bg-gray-800 p-3 rounded-xl text-center" },
        React.createElement("span", { className: "text-sm text-text-light dark:text-gray-400" }, label),
        React.createElement("span", { className: `text-xl font-bold ${color}` }, value),
        React.createElement("span", { className: "text-xs text-gray-500 dark:text-gray-500" }, unit)
    )
);

const AnalysisResultOverlay = ({
    result,
    image,
    onLog,
    onRetake,
}) => {
    const { triggerHapticFeedback } = useAppContext();
    return (
        React.createElement("div", { className: "absolute inset-0 bg-white dark:bg-gray-900 z-30 flex flex-col animate-slide-in-up" },
            React.createElement("header", { className: "p-4 flex items-center" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); onRetake(); }, className: "p-2 -ml-2 transition-transform active:scale-95" },
                    React.createElement(BackIcon, { className: "w-6 h-6 text-text-main dark:text-gray-100" })
                ),
                React.createElement("h1", { className: "text-xl font-bold text-text-main dark:text-gray-100 mx-auto font-montserrat" }, "Analysis Complete"),
                React.createElement("div", { className: "w-6" })
            ),
            React.createElement("div", { className: "flex-1 overflow-y-auto px-4 pb-4" },
                React.createElement("img", { src: image, alt: "Captured meal", className: "w-full h-48 object-cover rounded-2xl mb-4" }),
                
                React.createElement("h2", { className: "text-2xl font-bold text-text-main dark:text-gray-50 mb-1 font-montserrat" }, result.name),
                React.createElement("p", { className: "text-5xl font-extrabold text-primary mb-4" },
                    result.calories,
                    " ",
                    React.createElement("span", { className: "text-2xl font-semibold text-text-light dark:text-gray-400" }, "cal")
                ),

                React.createElement("div", { className: "grid grid-cols-3 gap-3 mb-4" },
                    React.createElement(NutrientPill, { label: "Protein", value: result.protein, unit: "grams", color: "text-protein" }),
                    React.createElement(NutrientPill, { label: "Carbs", value: result.carbs, unit: "grams", color: "text-carbs" }),
                    React.createElement(NutrientPill, { label: "Fats", value: result.fats, unit: "grams", color: "text-fats" })
                ),

                result.portionSuggestion && (
                    React.createElement("div", { className: "bg-primary-light dark:bg-primary/20 p-4 rounded-xl mb-4" },
                        React.createElement("h3", { className: "font-bold text-primary mb-1 text-sm font-montserrat" }, "\u{1F4A1} Portion Suggestion"),
                        React.createElement("p", { className: "text-sm text-text-main dark:text-gray-200" }, result.portionSuggestion)
                    )
                ),
                
                React.createElement("div", { className: "bg-light-gray dark:bg-gray-800 p-4 rounded-xl" },
                    React.createElement("h3", { className: "font-bold text-text-main dark:text-gray-200 mb-2 text-sm font-montserrat" }, "Detailed Breakdown"),
                    React.createElement("div", { className: "grid grid-cols-3 gap-x-4 text-center" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold dark:text-gray-50" }, result.fiber ?? 'N/A'),
                            React.createElement("p", { className: "text-xs text-text-light dark:text-gray-400" }, "Fiber (g)")
                        ),
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold dark:text-gray-50" }, result.sugar ?? 'N/A'),
                            React.createElement("p", { className: "text-xs text-text-light dark:text-gray-400" }, "Sugar (g)")
                        ),
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold dark:text-gray-50" }, result.sodium ?? 'N/A'),
                            React.createElement("p", { className: "text-xs text-text-light dark:text-gray-400" }, "Sodium (mg)")
                        )
                    )
                )
            ),

            React.createElement("div", { className: "p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" },
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); onLog(); }, className: "w-full bg-primary text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95" },
                    "Log Meal"
                )
            )
        )
    );
};


const CameraScreen = () => {
  const { handleMealLogged: onMealLogged, navigateTo, triggerHapticFeedback } = useAppContext();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const loadingMessageInterval = useRef(null);
  const [permissionStatus, setPermissionStatus] = useState('checking');

  useEffect(() => {
    if (isLoading) {
        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]); // Set initial message
        loadingMessageInterval.current = window.setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2000); // Change message every 2 seconds
    } else {
        if (loadingMessageInterval.current) {
            clearInterval(loadingMessageInterval.current);
        }
    }

    return () => {
        if (loadingMessageInterval.current) {
            clearInterval(loadingMessageInterval.current);
        }
    };
  }, [isLoading]);

  useEffect(() => {
    if (typeof navigator.permissions?.query !== 'function') {
      setPermissionStatus('prompt');
      return;
    }
    navigator.permissions.query({ name: 'camera' }).then((status) => {
        setPermissionStatus(status.state);
        status.onchange = () => setPermissionStatus(status.state);
    }).catch(() => {
        setPermissionStatus('prompt');
    });
  }, []);

  const startCamera = async () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Explicitly play the video, as autoplay can be unreliable
        videoRef.current.play().catch(err => {
            console.error("Video play failed:", err);
            setError("Could not start camera view.");
        });
      }
      setStream(mediaStream);
      setPermissionStatus('granted');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
      setPermissionStatus('denied');
    }
  };
  
  useEffect(() => {
    if (permissionStatus === 'granted' && !analysisResult) {
        startCamera();
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [permissionStatus, analysisResult]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    triggerHapticFeedback();
    setIsLoading(true);
    setError(null);

    const video = videoRef.current;
    // FIX: Use canvasRef.current directly to avoid block-scoped variable error.
    const canvasElement = canvasRef.current;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    const context = canvasElement.getContext('2d');
    context?.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

    const imageDataUrl = canvasElement.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    const base64Image = imageDataUrl.split(',')[1];
    
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);

    try {
        const mealData = await analyzeMealPhoto(base64Image);
        setAnalysisResult(mealData);
    } catch(err) {
        console.error(err);
        setError('Could not analyze the meal. Please try again.');
        setCapturedImage(null);
    } finally {
        setIsLoading(false);
    }
  }, [stream, triggerHapticFeedback]);
  
  const handleLogMeal = () => {
      if (analysisResult) {
          onMealLogged({
            ...analysisResult,
            date: toYYYYMMDD(new Date()),
          });
      }
  };

  const handleRetake = () => {
      setAnalysisResult(null);
      setCapturedImage(null);
      setError(null);
      setPermissionStatus('checking'); // Re-check permission to restart flow
      setTimeout(() => {
          if (typeof navigator.permissions?.query !== 'function') {
            setPermissionStatus('prompt');
          } else {
            navigator.permissions.query({ name: 'camera' }).then(status => setPermissionStatus(status.state));
          }
      }, 100);
  };

  const handleGrantAccess = () => {
      triggerHapticFeedback();
      startCamera();
  };

  return (
    React.createElement("div", { className: "w-full h-full bg-black flex flex-col items-center justify-center relative text-white" },
      isLoading && (
        React.createElement("div", { className: "absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-20 transition-opacity duration-300" },
            React.createElement("div", { className: "w-16 h-16 border-4 border-white border-t-primary rounded-full animate-spin" }),
            React.createElement("p", { className: "mt-4 text-lg text-center px-4 transition-opacity duration-300" }, loadingMessage)
        )
      ),
      error && !analysisResult && (
        React.createElement("div", { className: "absolute top-10 left-4 right-4 bg-red-500 p-3 rounded-lg z-20 text-center" },
            React.createElement("p", null, error),
            React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); }, className: "font-bold mt-2 underline transition-transform active:scale-95" }, "Go Back")
        )
      ),
      
      analysisResult && capturedImage && (
          React.createElement(AnalysisResultOverlay, {
            result: analysisResult,
            image: capturedImage,
            onLog: handleLogMeal,
            onRetake: handleRetake
          })
      ),

      permissionStatus === 'checking' && !analysisResult && (
          React.createElement("div", { className: "absolute inset-0 bg-black flex items-center justify-center z-50" },
              React.createElement("div", { className: "w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin" })
          )
      ),

      permissionStatus === 'prompt' && !analysisResult && (
          React.createElement(RequestCameraAccess, {
              onGrant: handleGrantAccess,
              onDeny: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); },
              featureName: "Meal Snapping",
              featureDescription: "Snap a photo of your food for instant nutritional analysis. We need camera access to see your meal."
          })
      ),

      permissionStatus === 'denied' && !analysisResult && (
          React.createElement(PermissionDenied, {
              onGoBack: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); },
              featureName: "Meal Snapping"
          })
      ),
      
      permissionStatus === 'granted' && !analysisResult && (
          React.createElement(React.Fragment, null,
            React.createElement("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: `w-full h-full object-cover animate-fade-in` }),
            React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-between p-8" },
              React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); }, className: "self-start p-2 bg-black bg-opacity-40 rounded-full transition-transform active:scale-95" },
                  React.createElement(BackIcon, { className: "w-6 h-6 text-white" })
              ),
              React.createElement("div", { className: "w-full h-2/3 border-2 border-dashed border-white border-opacity-70 rounded-3xl flex items-center justify-center" },
                   React.createElement("p", { className: "text-center font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full" },
                      "Center your food in the frame"
                  )
              ),
              React.createElement("div", { className: "flex flex-col items-center" },
                  React.createElement("button", {
                      onClick: capturePhoto,
                      disabled: isLoading,
                      className: "w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  },
                      React.createElement("div", { className: "w-16 h-16 bg-white rounded-full border-2 border-primary ring-2 ring-white" })
                  ),
                  React.createElement("p", { className: "mt-4 text-sm font-medium" }, "Tap to scan")
              )
            )
          )
      ),
      React.createElement("canvas", { ref: canvasRef, className: "hidden" })
    )
  );
};

export default CameraScreen;