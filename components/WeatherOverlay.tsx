
import React from 'react';

interface WeatherOverlayProps {
  weatherCondition: 'sunny' | 'rainy' | 'snowy';
}

const Raindrop: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute w-1 h-3 rounded-sm bg-blue-300 animate-rain-fall opacity-70"
    style={style}
  ></div>
);

const Snowflake: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute w-2 h-2 rounded-full bg-white animate-snow-fall opacity-80"
    style={style}
  ></div>
);

const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ weatherCondition }) => {
  const renderParticles = () => {
    switch (weatherCondition) {
      case 'rainy':
        return Array.from({ length: 70 }).map((_, i) => (
          <Raindrop
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.7 + Math.random() * 0.6}s`,
            }}
          />
        ));
      case 'snowy':
        return Array.from({ length: 50 }).map((_, i) => (
          <Snowflake
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ));
      case 'sunny':
      default:
        return null; // No particles for sunny
    }
  };

  if (weatherCondition === 'sunny') {
    return null; // Don't render overlay if sunny, let background handle it
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {renderParticles()}
    </div>
  );
};

export default WeatherOverlay;
