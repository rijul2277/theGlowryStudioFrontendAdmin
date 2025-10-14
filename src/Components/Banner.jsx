"use client";
import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import Link from "next/link";
import { bannerAPI } from '../lib/api';

// Traditional Indian color palette
const DEEP_RED = "#8B0000";        // Deep red for traditional feel
const GOLD = "#FFD700";             // Gold for elegance
const MAROON = "#800020";          // Maroon for richness
const CREAM = "#FFF8DC";           // Cream for softness
const SADDLE_BROWN = "#8B4513";    // Saddle brown for warmth
const DARK_GOLD = "#B8860B";        // Dark gold for sophistication

export default function HeroBanner() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // ✅ Fetch banners from API
  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bannerAPI.getBanners();
      
      if (data.success) {
        setBanners(data.data || []);
        console.log('Banners loaded from:', data.source); // Log cache status
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // ✅ Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Increased to 6 seconds for better viewing

    return () => clearInterval(interval);
  }, [isAutoPlay, banners.length]);

  // ✅ Navigation functions
  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false); // Stop auto-play when user manually navigates
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
    setIsAutoPlay(false);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlay(false);
  }, [banners.length]);

  // ✅ Handle mouse events for auto-play control
  const handleMouseEnter = () => setIsAutoPlay(false);
  const handleMouseLeave = () => setIsAutoPlay(true);

  // ✅ Loading state
  if (isLoading) {
    return (
      <section className="w-full relative">
        {/* Increased height for better image visibility */}
        <div className="relative w-full h-[80vh] min-h-[600px] bg-gradient-to-br from-amber-50 to-rose-100 animate-pulse">
          {/* Traditional Indian corner design */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-red-100">
            {/* Traditional corner decorations with Indian motifs */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-red-600/20 to-transparent rounded-br-[200px] banner-corner-glow traditional-pattern"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-yellow-600/20 to-transparent rounded-bl-[200px] banner-corner-glow traditional-pattern"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-600/20 to-transparent rounded-tr-[200px] banner-corner-glow traditional-pattern"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-orange-600/20 to-transparent rounded-tl-[200px] banner-corner-glow traditional-pattern"></div>
            
            {/* Traditional Indian loading spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-amber-200 border-t-red-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full animate-pulse traditional-ornament"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <p className="text-red-800 font-medium text-lg" style={{fontFamily: 'serif'}}>Loading traditional elegance...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ✅ No banners state
  if (banners.length === 0) {
    return (
      <section className="w-full relative">
        <div className="relative w-full h-[80vh] min-h-[600px]">
          {/* Traditional Indian gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-rose-50 to-red-100">
            {/* Traditional corner decorations with Indian motifs */}
            <div className="absolute top-0 left-0 w-56 h-56 bg-gradient-to-br from-red-600/30 to-transparent rounded-br-[250px] banner-corner-glow traditional-pattern"></div>
            <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-yellow-600/30 to-transparent rounded-bl-[250px] banner-corner-glow traditional-pattern"></div>
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-amber-600/30 to-transparent rounded-tr-[250px] banner-corner-glow traditional-pattern"></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-gradient-to-tl from-orange-600/30 to-transparent rounded-tl-[250px] banner-corner-glow traditional-pattern"></div>
            
            {/* Traditional Indian content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-red-800 px-6 max-w-6xl">
                <div className="mb-12">
                  <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-red-600 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl traditional-ornament">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                </div>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-red-800 via-amber-600 to-yellow-600 bg-clip-text text-transparent text-elegant-shadow" style={{fontFamily: 'serif'}}>
                  स्वागत है आपका
                </h2>
                <p className="text-2xl md:text-3xl opacity-80 font-light leading-relaxed text-red-700" style={{fontFamily: 'serif'}}>
                  Discover the beauty of traditional Indian sarees and lehengas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full relative">
      {/* Enhanced full-width carousel container with increased height */}
      <div 
        className="relative w-full h-[80vh] min-h-[600px] overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentIndex 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              {/* Background Image with better object-fit */}
              <div className="relative w-full h-full">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || "Banner"}
                  fill
                  priority={index === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                  quality={95}
                />
                
                {/* Traditional Indian overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-amber-900/60 to-yellow-900/80">
                  {/* Traditional corner decorations with Indian motifs */}
                  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-600/50 to-transparent rounded-br-[300px] banner-corner-glow traditional-pattern"></div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-yellow-600/50 to-transparent rounded-bl-[300px] banner-corner-glow traditional-pattern"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-600/50 to-transparent rounded-tr-[300px] banner-corner-glow traditional-pattern"></div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-orange-600/50 to-transparent rounded-tl-[300px] banner-corner-glow traditional-pattern"></div>
                  
                  {/* Traditional Indian pattern overlay */}
                  <div className="absolute inset-0 opacity-15" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, #DC2626 2px, transparent 2px),
                                    radial-gradient(circle at 75% 75%, #F59E0B 1px, transparent 1px),
                                    radial-gradient(circle at 50% 50%, #EF4444 1px, transparent 1px)`,
                    backgroundSize: '60px 60px, 40px 40px, 80px 80px'
                  }}></div>
                </div>
                
                {/* Enhanced Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-8 max-w-7xl">
                    {/* Traditional Indian title with elegant styling */}
                    {banner.title && (
                      <div className="mb-12">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 drop-shadow-2xl" style={{fontFamily: 'serif'}}>
                          <span className="bg-gradient-to-r from-yellow-200 via-amber-100 to-yellow-200 bg-clip-text text-transparent text-elegant-shadow">
                            {banner.title}
                          </span>
                        </h1>
                        {/* Traditional decorative line with Indian motifs */}
                        <div className="w-48 h-2 bg-gradient-to-r from-transparent via-yellow-300 to-transparent mx-auto rounded-full shadow-lg traditional-border"></div>
                      </div>
                    )}
                    
                    {/* Traditional Indian description */}
                    {banner.description && (
                      <p className="text-xl md:text-2xl lg:text-3xl mb-16 drop-shadow-lg opacity-95 font-light max-w-5xl mx-auto leading-relaxed text-yellow-100" style={{fontFamily: 'serif'}}>
                        {banner.description}
                      </p>
                    )}
                    
                    {/* Traditional Indian CTA Button */}
                    {banner.ctaText && (
                      <div className="relative">
                        <Link href={banner.ctaLink || '/'}>
                          <button className="group relative bg-gradient-to-r from-red-600 to-yellow-600 text-white px-16 py-6 rounded-full text-xl font-semibold transition-all duration-500 transform hover:scale-110 shadow-2xl hover:shadow-red-600/40 overflow-hidden banner-button traditional-button" style={{fontFamily: 'serif'}}>
                            {/* Traditional button background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Traditional button content */}
                            <span className="relative z-10 flex items-center gap-4">
                              {banner.ctaText}
                              <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                            
                            {/* Traditional shine effect */}
                            <div className="absolute inset-0 -top-2 -left-2 w-0 h-0 bg-gradient-to-r from-transparent via-yellow-300/40 to-transparent group-hover:w-full group-hover:h-full transition-all duration-700 transform rotate-12 banner-button-shine"></div>
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Navigation Arrows */}
        {banners.length > 1 && (
          <>
            {/* Enhanced Previous Button */}
            <button
              onClick={goToPrevious}
              className="absolute left-8 top-1/2 transform -translate-y-1/2 glass-morphism text-white p-5 rounded-full transition-all duration-300 hover:bg-white/30 group smooth-transition"
              aria-label="Previous banner"
            >
              <svg className="w-7 h-7 transition-transform duration-300 group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Enhanced Next Button */}
            <button
              onClick={goToNext}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 glass-morphism text-white p-5 rounded-full transition-all duration-300 hover:bg-white/30 group smooth-transition"
              aria-label="Next banner"
            >
              <svg className="w-7 h-7 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Enhanced Dots Indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative w-5 h-5 rounded-full transition-all duration-300 smooth-transition ${
                  index === currentIndex 
                    ? 'bg-white scale-125 shadow-xl' 
                    : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              >
                {/* Enhanced active dot glow effect */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-white rounded-full animate-pulse shadow-lg"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Enhanced Auto-play Indicator */}
        {banners.length > 1 && (
          <div className="absolute top-8 right-8">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="glass-morphism text-white p-4 rounded-full transition-all duration-300 hover:bg-white/20 group smooth-transition"
              aria-label={isAutoPlay ? "Pause auto-play" : "Start auto-play"}
            >
              {isAutoPlay ? (
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Traditional Indian Progress Bar */}
        {banners.length > 1 && isAutoPlay && (
          <div className="absolute bottom-0 left-0 w-full h-2 bg-yellow-200/30">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-yellow-500 to-amber-600 transition-all duration-100 ease-linear banner-progress"
              style={{ 
                width: '100%',
                animation: 'progressBar 6s linear infinite'
              }}
            ></div>
          </div>
        )}

        {/* Slide Counter */}
        {banners.length > 1 && (
          <div className="absolute top-8 left-8 glass-morphism text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentIndex + 1} / {banners.length}
          </div>
        )}
      </div>

        {/* Traditional Indian Custom CSS for animations */}
      <style jsx>{`
        @keyframes progressBar {
          from { 
            width: 0%; 
            background: linear-gradient(90deg, #DC2626, #F59E0B, #D97706);
          }
          to { 
            width: 100%; 
            background: linear-gradient(90deg, #DC2626, #F59E0B, #D97706);
          }
        }
        
        @keyframes cornerGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        @keyframes buttonShine {
          0% {
            transform: translateX(-100%) rotate(12deg);
          }
          100% {
            transform: translateX(100%) rotate(12deg);
          }
        }
        
        @keyframes traditionalPattern {
          0%, 100% {
            opacity: 0.2;
            transform: rotate(0deg);
          }
          50% {
            opacity: 0.4;
            transform: rotate(180deg);
          }
        }
        
        .banner-corner-glow {
          animation: cornerGlow 4s ease-in-out infinite;
        }
        
        .banner-button-shine {
          animation: buttonShine 3s ease-in-out infinite;
        }
        
        .banner-progress {
          animation: progressBar 6s linear infinite;
        }
        
        .traditional-pattern {
          animation: traditionalPattern 8s ease-in-out infinite;
        }
        
        .traditional-ornament {
          box-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
        }
        
        .traditional-border {
          background: linear-gradient(90deg, transparent, #F59E0B, #DC2626, #F59E0B, transparent);
        }
        
        .traditional-button {
          box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
          border: 2px solid rgba(255, 215, 0, 0.3);
        }
        
        .traditional-button:hover {
          box-shadow: 0 12px 40px rgba(220, 38, 38, 0.5);
          border-color: rgba(255, 215, 0, 0.6);
        }
      `}</style>
    </section>
  );
}