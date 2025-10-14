"use client";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/Redux/Reducers/cartReducer';
import { api } from '@/lib/api';
import WishlistButton from '@/Components/Product/WishlistButton';

const BROWN = "#7A5C49";
const CREAM = "#F6EFE7";

function formatRs(n) {
  if (typeof n !== "number") return "";
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // ✅ SIMPLE: Image zoom states
  const [isZoomed, setIsZoomed] = useState(false);

  // ✅ Helper functions - moved to top to maintain hook order
  const isVariantAvailable = useCallback((size, color) => {
    return product?.variants?.some(v => v.size === size && v.color === color) || false;
  }, [product?.variants]);
  
  const getAvailableColorsForSize = useCallback((size) => {
    return product?.variants?.filter(v => v.size === size).map(v => v.color) || [];
  }, [product?.variants]);
  
  const getAvailableSizesForColor = useCallback((color) => {
    return product?.variants?.filter(v => v.color === color).map(v => v.size) || [];
  }, [product?.variants]);

  // ✅ Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/products/get-product-by-slug/${params.slug}`);
      
      if (response.data.success) {
        const productData = response.data.data;
        setProduct(productData);
        
        // Set default variant (first available)
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          setSelectedSize(productData.variants[0].size);
          setSelectedColor(productData.variants[0].color);
        }
        
        console.log('Product loaded from:', response.data.source);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug, fetchProduct]);

  // ✅ Handle variant selection
  const handleVariantChange = useCallback((size, color) => {
    if (!product?.variants) return;
    
    // First, try to find exact match
    let variant = product.variants.find(v => 
      v.size === size && v.color === color
    );
    
    // If no exact match, find the first variant with the selected size or color
    if (!variant) {
      // If selecting a size, find first variant with that size
      if (size && size !== selectedSize) {
        variant = product.variants.find(v => v.size === size);
        if (variant) {
          setSelectedColor(variant.color); // Update color to match the found variant
        }
      }
      // If selecting a color, find first variant with that color
      else if (color && color !== selectedColor) {
        variant = product.variants.find(v => v.color === color);
        if (variant) {
          setSelectedSize(variant.size); // Update size to match the found variant
        }
      }
    }
    
    if (variant) {
      console.log('Selected variant:', variant);
      setSelectedVariant(variant);
      setSelectedSize(variant.size);
      setSelectedColor(variant.color);
      setSelectedImage(0); // Reset image to first
      setIsZoomed(false); // Reset zoom when variant changes
    } else {
      console.log('No variant found for:', { size, color, selectedSize, selectedColor });
    }
  }, [product, selectedSize, selectedColor]);

  // ✅ SIMPLE: Toggle zoom
  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  // ✅ Handle add to cart
  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) return;
    
    setAddingToCart(true);
    try {
      dispatch(addToCart({
        productId: product._id,
        variantSku: selectedVariant.sku,
        unitPrice: selectedVariant.price,
        quantity: quantity
      }));
      
      // Show success message (you can add a toast here)
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  }, [selectedVariant, product, quantity, dispatch]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              
              {/* Content skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
                <div className="h-12 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#7A5C49] hover:bg-[#5A4A3A] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // ✅ Get available sizes and colors
  const availableSizes = [...new Set(product.variants?.map(v => v.size).filter(Boolean))];
  const availableColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];
  
  // ✅ Get all images for selected variant
  const variantImages = selectedVariant?.images || [product.mainImageUrl];
  const allImages = [product.mainImageUrl, ...product.variants?.flatMap(v => v.images || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#7A5C49] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link href={`/collections/${product.category?.slug}`} className="text-gray-500 hover:text-[#7A5C49] transition-colors">
                {product.category?.name}
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 font-medium">{product.title}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ✅ SIMPLE: Product Images with Clean Zoom */}
          <div className="space-y-4">
            {/* Main Image with Simple Zoom */}
            <div className="relative">
              <div 
                className={`aspect-square relative overflow-hidden rounded-lg bg-white shadow-lg cursor-pointer transition-all duration-300 ${
                  isZoomed ? 'scale-110 shadow-2xl' : 'hover:scale-105'
                }`}
                onClick={toggleZoom}
              >
                <Image
                  src={variantImages[selectedImage] || product.mainImageUrl}
                  alt={product.title}
                  fill
                  className={`object-cover transition-transform duration-300 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* ✅ SIMPLE: Zoom indicator */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                  {isZoomed ? '🔍 Zoomed' : '🔍 Click to Zoom'}
                </div>
                
                {/* Image Navigation */}
                {variantImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(Math.max(0, selectedImage - 1));
                        setIsZoomed(false);
                      }}
                      disabled={selectedImage === 0}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(Math.min(variantImages.length - 1, selectedImage + 1));
                        setIsZoomed(false);
                      }}
                      disabled={selectedImage === variantImages.length - 1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* ✅ SIMPLE: Zoom instructions */}
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  Click image to zoom in/out
                </p>
              </div>
            </div>

            {/* ✅ SIMPLE: Thumbnail Images */}
            {variantImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {variantImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImage(index);
                      setIsZoomed(false); // Reset zoom when changing images
                    }}
                    className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedImage === index 
                        ? 'border-[#7A5C49] shadow-lg ring-2 ring-[#7A5C49]/20' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                    
                    {/* ✅ SIMPLE: Active indicator */}
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-[#7A5C49]/10 flex items-center justify-center">
                        <div className="w-6 h-6 bg-[#7A5C49] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-lg text-gray-600">{product.category?.name}</p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-[#7A5C49]">
                  {selectedVariant ? formatRs(selectedVariant.price) : formatRs(product.priceRange?.min)}
                </span>
                {selectedVariant?.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatRs(selectedVariant.compareAtPrice)}
                  </span>
                )}
              </div>
              
              {product.priceRange && product.priceRange.min !== product.priceRange.max && (
                <p className="text-sm text-gray-600">
                  Price range: {formatRs(product.priceRange.min)} - {formatRs(product.priceRange.max)}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Available Combinations Info */}
            {product.variants && product.variants.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Combinations:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedVariant?.sku === variant.sku
                          ? 'bg-[#7A5C49] text-white'
                          : 'bg-white border border-gray-300 text-gray-600'
                      }`}
                    >
                      {variant.size} - {variant.color}
                      {variant.stock === 0 && ' (Out of Stock)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isAvailable = getAvailableColorsForSize(size).length > 0;
                    const isSelected = selectedSize === size;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => handleVariantChange(size, selectedColor)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 border rounded-lg transition-all duration-200 transform hover:scale-105 ${
                          isSelected
                            ? 'border-[#7A5C49] bg-[#7A5C49] text-white shadow-lg'
                            : isAvailable
                            ? 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {size}
                        {!isAvailable && (
                          <span className="ml-1 text-xs">(N/A)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const isAvailable = getAvailableSizesForColor(color).length > 0;
                    const isSelected = selectedColor === color;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => handleVariantChange(selectedSize, color)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 border rounded-lg transition-all duration-200 transform hover:scale-105 ${
                          isSelected
                            ? 'border-[#7A5C49] bg-[#7A5C49] text-white shadow-lg'
                            : isAvailable
                            ? 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        {color}
                        {!isAvailable && (
                          <span className="ml-1 text-xs">(N/A)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stock Status */}
            {selectedVariant && (
              <div className="flex items-center space-x-2">
                {selectedVariant.stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">
                      In Stock ({selectedVariant.stock} available)
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0 || addingToCart}
                className="w-full bg-[#7A5C49] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-[#5A4A3A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {/* ✅ ENHANCED: Wishlist Button */}
              <div className="flex items-center justify-center">
                <WishlistButton 
                  productId={product._id} 
                  size="lg"
                  showText={true}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-lg border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#7A5C49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Free shipping on orders over Rs. 999</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#7A5C49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-gray-700">30-day return policy</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-[#7A5C49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">Fast delivery within 2-3 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}