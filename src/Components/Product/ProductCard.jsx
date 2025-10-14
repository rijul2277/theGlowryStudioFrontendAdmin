"use client";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "./WishlistButton";

const BROWN = "#7A5C49";
const CREAM = "#F6EFE7";
const GOLD = "#D4AF37";
const DEEP_RED = "#8B0000";

function formatRs(n){
  if (typeof n !== "number") return "";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ProductCard({ product }) {
  // ✅ OPTIMIZED: Direct access to price fields
  const price = product?.price ?? null;
  const compareAtPrice = product?.compareAtPrice ?? null;
  const savings = (compareAtPrice && price && compareAtPrice > price)
    ? compareAtPrice - price
    : 0;

  const img = product?.mainImageUrl || "/placeholder.png";

  // ✅ ENHANCED: Get variant information for display
  const getVariantInfo = () => {
    if (!product?.variants || product.variants.length === 0) {
      return { sizes: [], colors: [], priceRange: null };
    }

    const sizes = [...new Set(product.variants.map(v => v.attributes?.size).filter(Boolean))];
    const colors = [...new Set(product.variants.map(v => v.attributes?.color).filter(Boolean))];
    const prices = product.variants.map(v => v.price);
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices)
    } : null;

    return { sizes, colors, priceRange };
  };

  const { sizes, colors, priceRange } = getVariantInfo();

  // ✅ ENHANCED: Get display price
  const getDisplayPrice = () => {
    if (price) return formatRs(price);
    if (priceRange) {
      if (priceRange.min === priceRange.max) {
        return formatRs(priceRange.min);
      }
      return `${formatRs(priceRange.min)} - ${formatRs(priceRange.max)}`;
    }
    return "Price not available";
  };

  // ✅ ENHANCED: Get stock status
  const getStockStatus = () => {
    if (!product?.variants || product.variants.length === 0) return null;
    
    const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    if (totalStock === 0) return { status: 'out', text: 'Out of Stock', color: 'text-red-600' };
    if (totalStock < 10) return { status: 'low', text: 'Low Stock', color: 'text-orange-600' };
    return { status: 'in', text: 'In Stock', color: 'text-green-600' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="group relative">
      {/* ✅ ELEGANT: Fixed height card for consistency */}
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 overflow-hidden h-[480px] flex flex-col">
        <Link href={`/product/${product.slug}`} className="focus:outline-none flex-1 flex flex-col">
          {/* ✅ ELEGANT: Image container with fixed height */}
          <div className="relative h-[280px] overflow-hidden">
            <Image
              src={img}
              alt={product?.title || product?.name || "Product"}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              priority
            />
            
            {/* ✅ ELEGANT: Save badge with Indian styling */}
            {savings > 0 && (
              <div className="absolute left-4 top-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-lg">
                <span className="text-xs font-bold">
                  Save ₹{savings.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* ✅ ELEGANT: Wishlist button */}
            <div className="absolute right-4 top-4 z-10">
              <WishlistButton 
                productId={product?._id} 
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2"
              />
            </div>

            {/* ✅ ELEGANT: Stock status badge */}
            {stockStatus && (
              <div className={`absolute right-4 top-16 px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm shadow-lg ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            )}

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

          {/* ✅ ELEGANT: Product details with consistent spacing */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              {/* ✅ ELEGANT: Title with Indian typography */}
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 leading-tight" style={{ color: BROWN }}>
                {product?.title}
              </h3>

              {/* ✅ ELEGANT: Description with better styling */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                {product?.description}
              </p>

              {/* ✅ ELEGANT: Variant information with Indian styling */}
              {(sizes.length > 0 || colors.length > 0) && (
                <div className="mb-3 space-y-2">
                  {/* Sizes */}
                  {/* {sizes.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Available Sizes:</span>
                      <div className="flex space-x-1">
                        {sizes.slice(0, 3).map((size, index) => (
                          <span key={index} className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-1 rounded-full text-gray-700 border border-amber-200">
                            {size}
                          </span>
                        ))}
                        {sizes.length > 3 && (
                          <span className="text-xs text-gray-500">+{sizes.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )} */}

                  {/* Colors */}
                  {/* {colors.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 font-medium">Colors:</span>
                      <div className="flex space-x-1">
                        {colors.slice(0, 3).map((color, index) => (
                          <span key={index} className="text-xs bg-gradient-to-r from-pink-100 to-rose-100 px-2 py-1 rounded-full text-gray-700 border border-pink-200">
                            {color}
                          </span>
                        ))}
                        {colors.length > 3 && (
                          <span className="text-xs text-gray-500">+{colors.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )} */}
                </div>
              )}
            </div>

            {/* ✅ ELEGANT: Price with Indian styling */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-3 mb-2">
                {!!compareAtPrice && !!price && compareAtPrice > price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatRs(compareAtPrice)}
                  </span>
                )}
                <span className="text-xl font-bold" style={{ color: BROWN }}>
                  {getDisplayPrice()}
                </span>
              </div>

              {/* ✅ ELEGANT: Rating with Indian stars */}
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">(4.8)</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}