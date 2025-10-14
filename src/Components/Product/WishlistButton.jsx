"use client";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist, selectIsInWishlist } from '@/Redux/Reducers/wishlistReducer';
import { useAuthSync } from '@/hooks/useAuthSync';

const WishlistButton = ({ productId, size = 'md', showText = false, className = '' }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthSync();
  const isInWishlist = useSelector(selectIsInWishlist(productId));
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/accounts/login';
      return;
    }

    setIsAnimating(true);
    
    try {
      await dispatch(toggleWishlist(productId));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      // Reset animation after a short delay
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      icon: 'w-4 h-4',
      button: 'w-8 h-8',
      text: 'text-xs'
    },
    md: {
      icon: 'w-5 h-5',
      button: 'w-10 h-10',
      text: 'text-sm'
    },
    lg: {
      icon: 'w-6 h-6',
      button: 'w-12 h-12',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={handleToggleWishlist}
      className={`
        ${config.button} 
        ${className}
        relative flex items-center justify-center
        rounded-full border-2 transition-all duration-300
        transform hover:scale-110 active:scale-95
        ${isInWishlist 
          ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' 
          : 'bg-white border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-400 hover:shadow-md'
        }
        ${isAnimating ? 'animate-pulse' : ''}
        group
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {/* Heart Icon with Animation */}
      <svg
        className={`
          ${config.icon} 
          transition-all duration-300
          ${isInWishlist 
            ? 'text-white scale-110' 
            : 'text-gray-400 group-hover:text-red-400 group-hover:scale-110'
          }
          ${isAnimating ? 'animate-bounce' : ''}
        `}
        fill={isInWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={isInWishlist ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      {/* Ripple Effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-ping"></div>
      )}

      {/* Text (optional) */}
      {showText && (
        <span className={`
          ${config.text} 
          ml-2 font-medium
          ${isInWishlist ? 'text-red-600' : 'text-gray-600'}
        `}>
          {isInWishlist ? 'Saved' : 'Save'}
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        {isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      </div>
    </button>
  );
};

export default WishlistButton;




