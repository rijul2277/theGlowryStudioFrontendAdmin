"use client";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuthSync } from '@/hooks/useAuthSync';
import { fetchWishlist, clearWishlist, selectWishlistItems, selectWishlistLoading, selectWishlistError } from '@/Redux/Reducers/wishlistReducer';
import { addToCart } from '@/Redux/Reducers/cartReducer';
import Image from 'next/image';
import Link from 'next/link';
import WishlistButton from '@/Components/Product/WishlistButton';

const BROWN = "#7A5C49";
const CREAM = "#F6EFE7";
const GOLD = "#D4AF37";
const DEEP_RED = "#8B0000";

function formatRs(n) {
  if (typeof n !== "number") return "";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthSync();
  const wishlistItems = useSelector(selectWishlistItems);
  const loading = useSelector(selectWishlistLoading);
  const error = useSelector(selectWishlistError);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);


  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist());
    }
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-8">Please log in to view your wishlist</p>
          <Link 
            href="/accounts/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#7A5C49] hover:bg-[#5A4A3A] transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Wishlist</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => dispatch(fetchWishlist())}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#7A5C49] hover:bg-[#5A4A3A] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: BROWN }}>My Wishlist</h1>
              <p className="text-gray-600 text-lg">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  <span>Clear All</span>
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16" style={{ color: BROWN }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4" style={{ color: BROWN }}>Your wishlist is empty</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">Start adding beautiful Indian dresses you love to your wishlist</p>
            <Link 
              href="/"
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${BROWN} 0%, #8B4513 100%)`,
                boxShadow: `0 10px 30px rgba(122, 92, 73, 0.3)`
              }}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <span>Continue Shopping</span>
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlistItems.map((product) => (
              <div key={product._id} className="group relative">
                {/* ✅ ELEGANT: Fixed height card for consistency */}
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden h-[480px] flex flex-col">
                  <Link href={`/product/${product.slug}`} className="focus:outline-none flex-1 flex flex-col">
                    {/* ✅ ELEGANT: Image container with fixed height */}
                    <div className="relative h-[280px] overflow-hidden">
                      <Image
                        src={product.mainImageUrl || "/placeholder.png"}
                        alt={product.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      
                      {/* ✅ ELEGANT: Wishlist button */}
                      <div className="absolute right-4 top-4 z-10">
                        <WishlistButton 
                          productId={product._id} 
                          size="sm"
                          className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2"
                        />
                      </div>

                      {/* ✅ ELEGANT: Quick view overlay with Indian touch */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6">
                        <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium text-gray-800 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-lg">
                          <span className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            <span>View Details</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {console.log( "wishlist product", product)}



                    {/* ✅ ELEGANT: Product details with consistent spacing */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* ✅ ELEGANT: Title with Indian typography */}
                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 leading-tight" style={{ color: BROWN }}>
                          {product.title}
                        </h3>

                        {/* ✅ ELEGANT: Description with better styling */}
                        {/* <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p> */}

                        {/* ✅ ELEGANT: Category badge */}
                        {/* {product.category && (
                          <div className="mb-3">
                            <span className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700 border border-amber-200">
                              {product.category.name}
                            </span>
                          </div>
                        )} */}
                      </div>

                      {/* ✅ ELEGANT: Price with Indian styling */}
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-xl font-bold" style={{ color: BROWN }}>
                            {formatRs(product.price)}
                          </span>
                        </div>

                        {/* ✅ ELEGANT: Rating with Indian stars */}
                        {/* <div className="flex items-center space-x-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">(4.8)</span>
                        </div> */}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}




