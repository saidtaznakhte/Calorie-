

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Page, FoodSearchResult, MealType } from '../types.js';
import { lookupBarcode } from '../services/barcodeService.js';
import { BackIcon, EditIcon, PlusIcon } from '../components/Icons.js';
import { useAppContext } from '../contexts/AppContext.js';
import RequestCameraAccess from '../components/RequestCameraAccess.js';
import PermissionDenied from '../components/PermissionDenied.js';
import { toYYYYMMDD } from '../utils/dateUtils.js';

// Check if BarcodeDetector is available in the browser


const getDefaultMealType = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) return MealType.Breakfast;
    if (currentHour >= 11 && currentHour < 16) return MealType.Lunch;
    if (currentHour >= 16 && currentHour < 22) return MealType.Dinner;
    return MealType.Snacks;
};

// Sub-component for displaying the found food item
const FoundItemCard = ({
    item,
    onLog,
    onScanAgain,
}) => {
    const { triggerHapticFeedback } = useAppContext();
    const [mealType, setMealType] = useState(getDefaultMealType());

    return (
        React.createElement("div", { className: "absolute bottom-0 left-0 right-0 bg-card dark:bg-dark-card rounded-t-3xl p-6 z-30 animate-slide-in-up shadow-[0_-10px_30px_rgba(0,0,0,0.1)]" },
            React.createElement("div", { className: "flex items-start mb-4" },
                React.createElement("img", {
                    src: item.imageUrl || `https://placehold.co/80x80/E0F8F2/00C795?text=🍴`,
                    alt: item.name,
                    className: "w-20 h-20 rounded-lg object-cover mr-4 flex-shrink-0 bg-light-gray"
                }),
                React.createElement("div", { className: "flex-1" },
                    React.createElement("h2", { className: "text-xl font-bold text-text-main dark:text-dark-text-main font-montserrat" }, item.name),
                    React.createElement("p", { className: "text-4xl font-extrabold text-primary" },
                        Math.round(item.calories),
                        " ",
                        React.createElement("span", { className: "text-xl font-semibold text-text-light dark:text-dark-text-light" }, "kcal")
                    )
                )
            ),
            React.createElement("div", { className: "grid grid-cols-3 gap-3 mb-4 text-center" },
                React.createElement("div", null,
                    React.createElement("p", { className: "font-bold text-protein" },
                        item.protein,
                        "g"
                    ),
                    React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light" }, "Protein")
                ),
                React.createElement("div", null,
                    React.createElement("p", { className: "font-bold text-carbs" },
                        item.carbs,
                        "g"
                    ),
                    React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light" }, "Carbs")
                ),
                React.createElement("div", null,
                    React.createElement("p", { className: "font-bold text-fats" },
                        item.fats,
                        "g"
                    ),
                    React.createElement("p", { className: "text-xs text-text-light dark:text-dark-text-light" }, "Fats")
                )
            ),
            
            React.createElement("div", { className: "mb-4" },
                React.createElement("label", { className: "text-sm font-semibold text-text-main dark:text-dark-text-main mb-2 block" }, "Log to:"),
                React.createElement("select", { value: mealType, onChange: e => setMealType(e.target.value), className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none" },
                    Object.values(MealType).map(type => React.createElement("option", { key: type, value: type }, type))
                )
            ),

            React.createElement("div", { className: "flex flex-col space-y-3" },
                 React.createElement("button", { onClick: () => { triggerHapticFeedback(); onLog(mealType); }, className: "w-full bg-primary text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center transition-transform active:scale-95" },
                    React.createElement(PlusIcon, { className: "w-6 h-6 mr-2" }),
                    "Log Meal"
                ),
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); onScanAgain(); }, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-bold py-3 rounded-xl transition-transform active:scale-95" },
                    "Scan Again"
                )
            )
        )
    );
};

// Sub-component for "not found" state
const NotFoundCard = ({ onRetry, onManualEntry }) => {
    const { triggerHapticFeedback } = useAppContext();
    return (
        React.createElement("div", { className: "absolute bottom-0 left-0 right-0 bg-card dark:bg-dark-card rounded-t-3xl p-6 z-30 animate-slide-in-up shadow-[0_-10px_30px_rgba(0,0,0,0.1)] text-center" },
            React.createElement("h2", { className: "text-2xl font-bold text-text-main dark:text-dark-text-main mb-2 font-montserrat" }, "Product Not Found"),
            React.createElement("p", { className: "text-text-light dark:text-dark-text-light mb-6" }, "Sorry, we couldn't find this barcode in our database."),
            React.createElement("div", { className: "flex flex-col space-y-3" },
                 React.createElement("button", { onClick: () => { triggerHapticFeedback(); onManualEntry(); }, className: "w-full bg-secondary text-white font-bold py-3 rounded-xl flex items-center justify-center transition-transform active:scale-95" },
                    React.createElement(EditIcon, { className: "w-5 h-5 mr-2" }),
                    "Enter Manually"
                ),
                React.createElement("button", { onClick: () => { triggerHapticFeedback(); onRetry(); }, className: "w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-bold py-3 rounded-xl transition-transform active:scale-95" },
                    "Try Again"
                )
            )
        )
    );
};


const BarcodeScannerScreen = () => {
    const { navigateTo, handleMealLogged, triggerHapticFeedback } = useAppContext();
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [scanState, setScanState] = useState('scanning');
    const [foundFood, setFoundFood] = useState(null);
    const barcodeDetectorRef = useRef(null);
    const [permissionStatus, setPermissionStatus] = useState('checking');

    useEffect(() => {
        if (!('BarcodeDetector' in window)) {
            setScanState('error');
            return;
        }
        try {
            barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'ean_8'] });
        } catch (e) {
            console.error("Error creating BarcodeDetector:", e);
            setScanState('error');
        }
    }, []);

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
        if (stream) stream.getTracks().forEach(track => track.stop());
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(err => console.error("Video play failed:", err));
            }
            setStream(mediaStream);
            setPermissionStatus('granted');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setPermissionStatus('denied');
        }
    };

    useEffect(() => {
        if (scanState === 'scanning' && permissionStatus === 'granted') {
            startCamera();
        } else {
            stream?.getTracks().forEach(track => track.stop());
        }
    }, [scanState, permissionStatus]);
    
    const handleBarcodeDetection = async (barcodeValue) => {
        setScanState('loading');
        triggerHapticFeedback();
        try {
            const foodData = await lookupBarcode(barcodeValue);
            setFoundFood(foodData);
            setScanState('success');
        } catch (err) {
            setScanState('error');
        }
    };

    const scanFrame = useCallback(async () => {
        if (scanState !== 'scanning' || !videoRef.current || !barcodeDetectorRef.current || videoRef.current.readyState < 2) return;
        try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
                handleBarcodeDetection(barcodes[0].rawValue);
            }
        } catch (err) { /* Silently ignore detection errors on single frames */ }
    }, [scanState, triggerHapticFeedback]);

    useEffect(() => {
        let animationFrameId;
        const tick = () => {
            scanFrame();
            animationFrameId = requestAnimationFrame(tick);
        };
        if (scanState === 'scanning' && stream) {
            animationFrameId = requestAnimationFrame(tick);
        }
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [scanState, stream, scanFrame]);

    const handleLog = (mealType) => {
        if (foundFood) {
            handleMealLogged({ ...foundFood, type: mealType, date: toYYYYMMDD(new Date()) });
            // The handleMealLogged function already navigates away.
        }
    };
    
    const resetScanner = () => {
        setFoundFood(null);
        setScanState('scanning');
    };

    const statusMessage = {
        scanning: "Searching for barcode...",
        loading: "✓ Found! Looking up product...",
        success: "✓ Product Found!",
        error: "Product not found.",
    }[scanState];
    
    return (
        React.createElement("div", { className: "w-full h-full bg-black flex flex-col items-center justify-center relative text-white" },
            permissionStatus === 'checking' && React.createElement("div", { className: "w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin" }),
            permissionStatus === 'prompt' && React.createElement(RequestCameraAccess, { onGrant: () => { triggerHapticFeedback(); startCamera(); }, onDeny: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); }, featureName: "Barcode Scanning", featureDescription: "Scan product barcodes to quickly log your food. We need camera access to use the scanner." }),
            permissionStatus === 'denied' && React.createElement(PermissionDenied, { onGoBack: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); }, featureName: "Barcode Scanning" }),

            permissionStatus === 'granted' && (
                React.createElement(React.Fragment, null,
                    React.createElement("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: `w-full h-full object-cover transition-opacity duration-300 ${scanState === 'success' || scanState === 'error' ? 'opacity-50' : 'opacity-100'}` }),
                    React.createElement("div", { className: "absolute inset-0 bg-black bg-opacity-20 z-10" }),
                    React.createElement("div", { className: "absolute inset-0 flex flex-col items-center justify-between p-8 z-20" },
                        React.createElement("div", { className: "w-full flex justify-between items-center" },
                            React.createElement("button", { onClick: () => { triggerHapticFeedback(); navigateTo(Page.LogMeal); }, className: "p-2 bg-black bg-opacity-40 rounded-full transition-transform active:scale-95" }, React.createElement(BackIcon, { className: "w-6 h-6 text-white" })),
                            React.createElement("h1", { className: "text-lg font-semibold bg-black bg-opacity-40 px-3 py-1 rounded-full font-montserrat" }, "Scan Barcode"),
                            React.createElement("div", { className: "w-10" })
                        ),
                        
                        React.createElement("div", { className: "w-full max-w-xs h-40 border-4 border-dashed border-white rounded-2xl relative bg-black bg-opacity-20" },
                            scanState === 'scanning' && React.createElement("div", { className: "absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-lg animate-pulse" }),
                            scanState === 'loading' && React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" }, React.createElement("div", { className: "w-8 h-8 border-2 border-white rounded-full border-t-transparent animate-spin" }))
                        ),

                        React.createElement("div", { className: `text-center bg-black bg-opacity-50 px-4 py-2 rounded-full min-h-[40px] flex items-center justify-center ${scanState === 'error' ? 'text-red-400' : ''}` },
                            React.createElement("p", null, statusMessage)
                        )
                    ),
                    
                    scanState === 'success' && foundFood && React.createElement(FoundItemCard, { item: foundFood, onLog: handleLog, onScanAgain: resetScanner }),
                    scanState === 'error' && React.createElement(NotFoundCard, { onRetry: resetScanner, onManualEntry: () => { triggerHapticFeedback(); navigateTo(Page.ManualLog); } })
                )
            )}
        )
    );
};

export default BarcodeScannerScreen;