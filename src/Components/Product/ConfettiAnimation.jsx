"use client";
import { useEffect, useState } from 'react';

const ConfettiAnimation = ({ isActive, onComplete }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Create multiple confetti pieces with different shapes, colors, and physics
      const newConfettiPieces = Array.from({ length: 60 }, (_, i) => {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#FF9F43', '#10AC84', '#EE5A24', '#0984E3'];
        const shapes = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];
        
        return {
          id: i,
          x: Math.random() * 100, // Random x position (0-100%)
          y: Math.random() * 100, // Random y position (0-100%)
          delay: Math.random() * 1.0, // Random delay (0-1.0s)
          size: Math.random() * 15 + 6, // Random size (6-21px)
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          rotation: Math.random() * 360, // Random initial rotation
          rotationSpeed: (Math.random() - 0.5) * 1080, // Random rotation speed (faster)
          fallSpeed: Math.random() * 3 + 1.5, // Random fall speed
          drift: (Math.random() - 0.5) * 6, // Random horizontal drift (more drift)
          duration: Math.random() * 2.5 + 3.5, // Random duration (3.5-6s)
          gravity: Math.random() * 0.8 + 0.4, // Random gravity effect
          bounce: Math.random() * 0.3 + 0.1, // Random bounce effect
        };
      });

      setConfettiPieces(newConfettiPieces);

      // Show success message after a short delay
      const messageTimer = setTimeout(() => {
        setShowSuccessMessage(true);
      }, 500);

      // Call onComplete after animation finishes
      const maxDuration = Math.max(...newConfettiPieces.map(c => c.delay + c.duration));
      const timer = setTimeout(() => {
        setConfettiPieces([]);
        setShowSuccessMessage(false);
        onComplete?.();
      }, (maxDuration + 0.5) * 1000);

      return () => {
        clearTimeout(timer);
        clearTimeout(messageTimer);
      };
    }
  }, [isActive, onComplete]);

  if (!isActive || confettiPieces.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            transform: `rotate(${piece.rotation}deg)`,
            '--fall-speed': `${piece.fallSpeed}s`,
            '--drift': `${piece.drift}px`,
            '--rotation-speed': `${piece.rotationSpeed}deg`,
            '--gravity': `${piece.gravity}`,
          }}
        >
          {/* Confetti piece based on shape */}
          {piece.shape === 'circle' && (
            <div 
              className="w-full h-full rounded-full opacity-90 shadow-sm"
              style={{
                backgroundColor: piece.color,
                boxShadow: `0 2px 4px rgba(0,0,0,0.2), 0 0 8px ${piece.color}40`,
              }}
            />
          )}
          
          {piece.shape === 'square' && (
            <div 
              className="w-full h-full opacity-90 shadow-sm"
              style={{
                backgroundColor: piece.color,
                boxShadow: `0 2px 4px rgba(0,0,0,0.2), 0 0 8px ${piece.color}40`,
              }}
            />
          )}
          
          {piece.shape === 'triangle' && (
            <div 
              className="w-0 h-0 opacity-90 shadow-sm"
              style={{
                borderLeft: `${piece.size/2}px solid transparent`,
                borderRight: `${piece.size/2}px solid transparent`,
                borderBottom: `${piece.size}px solid ${piece.color}`,
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2)) drop-shadow(0 0 8px ${piece.color}40)`,
              }}
            />
          )}
          
          {piece.shape === 'star' && (
            <div 
              className="w-full h-full opacity-90 shadow-sm"
              style={{
                background: `radial-gradient(circle, ${piece.color} 0%, ${piece.color} 40%, transparent 70%)`,
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                boxShadow: `0 2px 4px rgba(0,0,0,0.2), 0 0 8px ${piece.color}40`,
              }}
            />
          )}
          
          {piece.shape === 'heart' && (
            <div 
              className="w-full h-full opacity-90 shadow-sm"
              style={{
                backgroundColor: piece.color,
                clipPath: 'path("M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z")',
                boxShadow: `0 2px 4px rgba(0,0,0,0.2), 0 0 8px ${piece.color}40`,
              }}
            />
          )}
          
          {piece.shape === 'diamond' && (
            <div 
              className="w-full h-full opacity-90 shadow-sm"
              style={{
                backgroundColor: piece.color,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                boxShadow: `0 2px 4px rgba(0,0,0,0.2), 0 0 8px ${piece.color}40`,
              }}
            />
          )}
        </div>
      ))}
      
      {/* Success message with party vibes */}
      {showSuccessMessage && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce-in"
          style={{
            animationDuration: '0.8s',
          }}
        >
          <div 
            className="px-8 py-4 rounded-full text-white font-bold text-base shadow-2xl backdrop-blur-sm border-2 border-white/30"
            style={{
              background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 20%, #45B7D1 40%, #96CEB4 60%, #FFEAA7 80%, #DDA0DD 100%)',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 107, 107, 0.6), 0 0 50px rgba(78, 205, 196, 0.4)',
              backgroundSize: '400% 400%',
              animation: 'gradientShift 1.5s ease infinite',
            }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl animate-confetti-float">🎉</span>
              <span className="text-shadow-lg">Added to Cart!</span>
              <span className="text-xl animate-confetti-float" style={{ animationDelay: '0.5s' }}>🎊</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfettiAnimation;
