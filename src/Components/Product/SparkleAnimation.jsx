"use client";
import { useEffect, useState } from 'react';

const SparkleAnimation = ({ isActive, onComplete }) => {
  const [sparkles, setSparkles] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Create multiple sparkles with different positions and delays
      const newSparkles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // Random x position (0-100%)
        y: Math.random() * 100, // Random y position (0-100%)
        delay: Math.random() * 0.6, // Random delay (0-0.6s)
        size: Math.random() * 10 + 6, // Random size (6-16px)
        rotation: Math.random() * 360, // Random rotation
        duration: Math.random() * 1.0 + 0.8, // Random duration (0.8-1.8s)
        color: Math.random() > 0.5 ? '#FFD700' : '#FFA500', // Random gold/orange
      }));

      setSparkles(newSparkles);

      // Show success message after a short delay
      const messageTimer = setTimeout(() => {
        setShowSuccessMessage(true);
      }, 300);

      // Call onComplete after animation finishes
      const maxDuration = Math.max(...newSparkles.map(s => s.delay + s.duration));
      const timer = setTimeout(() => {
        setSparkles([]);
        setShowSuccessMessage(false);
        onComplete?.();
      }, (maxDuration + 0.3) * 1000);

      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [isActive, onComplete]);

  if (!isActive || sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            transform: `rotate(${sparkle.rotation}deg)`,
          }}
        >
          {/* Main sparkle */}
          <div className="w-full h-full relative">
            {/* Central bright sparkle */}
            <div 
              className="absolute inset-0 rounded-full opacity-90"
              style={{
                background: `radial-gradient(circle, ${sparkle.color} 0%, ${sparkle.color === '#FFD700' ? '#FFA500' : '#FFD700'} 50%, transparent 100%)`,
                boxShadow: `0 0 10px ${sparkle.color}, 0 0 20px ${sparkle.color === '#FFD700' ? '#FFA500' : '#FFD700'}`,
              }}
            />
            
            {/* Outer glow */}
            <div 
              className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: `radial-gradient(circle, ${sparkle.color} 0%, transparent 70%)`,
                transform: 'scale(1.5)',
                filter: 'blur(2px)',
              }}
            />
            
            {/* Cross sparkle lines */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(45deg, transparent 30%, ${sparkle.color} 50%, transparent 70%),
                  linear-gradient(-45deg, transparent 30%, ${sparkle.color} 50%, transparent 70%)
                `,
                opacity: 0.8,
              }}
            />
          </div>
        </div>
      ))}
      
      {/* Success message */}
      {showSuccessMessage && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce-in"
          style={{
            animationDuration: '0.8s',
          }}
        >
          <div 
            className="px-6 py-3 rounded-full text-white font-bold text-sm shadow-2xl backdrop-blur-sm border-2 border-white/20"
            style={{
              background: 'linear-gradient(135deg, #7A5C49 0%, #8B4513 50%, #7A5C49 100%)',
              boxShadow: '0 8px 25px rgba(122, 92, 73, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 2s ease infinite',
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">✨</span>
              <span>Added to Cart!</span>
              <span className="text-lg">✨</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparkleAnimation;
