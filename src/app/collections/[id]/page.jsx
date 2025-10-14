"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "next/navigation";
// import {
//   fetchProductsByCategoryId,
//   selectCategoryHeader,
//   selectCategoryProducts,
//   selectCategoryMeta,
//   selectCategoryLoading,
//   selectCategoryError,
// } from "@/Redux/Reducers/catalogReducer";
import ProductCard from "@/Components/Product/ProductCard";
import { fetchProductsByCategoryId, selectCategoryError, selectCategoryHeader, selectCategoryLoading, selectCategoryMeta, selectCategoryProducts } from "@/Redux/Reducers/catalogReducer";

const BROWN = "#7A5C49";
const SUBTEXT = "#6B6B6B";

/** Plain, text-style select with a chevron (no border, no background). */
function PlainSelect({ value, onChange, ariaLabel, children }) {
  return (
    <span className="relative inline-flex items-center">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-transparent border-none p-0 pr-5 m-0 text-sm cursor-pointer focus:outline-none focus:ring-0"
        style={{ color: BROWN, fontWeight: 500 }}
      >
        {children}
      </select>
      {/* tiny chevron */}
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-0 h-4 w-4"
        style={{ fill: BROWN, opacity: 0.8 }}
      >
        <path d="M5.8 7.5a1 1 0 0 1 1.4 0L10 10.3l2.8-2.8a1 1 0 1 1 1.4 1.4l-3.5 3.5a1.5 1.5 0 0 1-2.1 0L5.8 8.9a1 1 0 0 1 0-1.4z" />
      </svg>
    </span>
  );
}

export default function CollectionDetailPage() {
  const dispatch = useDispatch();

  // Add smooth scrolling behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // ✅ Get dynamic route & query in a client component
  const params = useParams();              // { id: "68dae59e..." }
  const search = useSearchParams();

  const id = params?.id?.toString() || "";
  const page = Number(search.get("page") || 1);
  const limit = Number(search.get("limit") || 5); // Show only 5 products initially
  const sort = search.get("sort") || "";
  const fields = ""; // keep default

  const header = useSelector(selectCategoryHeader);
  const products = useSelector(selectCategoryProducts);
  const meta = useSelector(selectCategoryMeta);
  const loading = useSelector(selectCategoryLoading);
  const error = useSelector(selectCategoryError);

  // Filter states
  const [availability, setAvailability] = useState("all"); // all | in | out
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState("alpha-desc"); // alpha | alpha-desc | price-asc | price-desc | date-desc | date-asc
  const [showFilters, setShowFilters] = useState(false);

  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  // Initial data fetch
  useEffect(() => {
    if (!id) return;
    setCurrentPage(1);
    setHasMore(true);
    setLoadMoreError(null);
    dispatch(fetchProductsByCategoryId({ categoryId: id, page: 1, limit, sort, fields }));
  }, [dispatch, id, limit, sort, fields]);

  // Update hasMore when meta changes
  useEffect(() => {
    if (meta) {
      setHasMore(meta.hasNextPage || false);
    }
  }, [meta]);

  // Load more products function with smooth UX
  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || isLoadingMore || loading) return;
    
    setIsLoadingMore(true);
    setLoadMoreError(null);
    const nextPage = currentPage + 1;
    
    try {
      // Add a small delay for smoother UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await dispatch(fetchProductsByCategoryId({ 
        categoryId: id, 
        page: nextPage, 
        limit, 
        sort, 
        fields 
      }))
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Failed to load more products:', error);
      setLoadMoreError(error.message || 'Failed to load more products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [dispatch, id, currentPage, limit, sort, fields, hasMore, isLoadingMore, loading]);

  // Intersection Observer for infinite scroll with improved UX
  useEffect(() => {
    let timeoutId;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && !loading) {
          // Debounce to prevent rapid API calls
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            loadMoreProducts();
          }, 200); // Increased debounce time for smoother experience
        }
      },
      {
        root: null,
        rootMargin: '300px', // Start loading 300px before the element comes into view
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [loadMoreProducts, hasMore, isLoadingMore, loading]);

  // Client-side filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let list = Array.isArray(products) ? [...products] : [];

    // Availability filter (uses first variant's stock)
    if (availability !== "all") {
      const wantIn = availability === "in";
      list = list.filter((p) => {
        const stock = p?.variants?.[0]?.stock ?? 0;
        return wantIn ? stock > 0 : stock <= 0;
      });
    }

    // Price range filter (first variant price)
    list = list.filter((p) => {
      const price = p?.variants?.[0]?.price;
      if (typeof price !== "number") return false;
      const min = Number(minPrice || 0);
      const max = Number(maxPrice || 99999999);
      return price >= min && price <= max;
    });

    // Sorting
    switch (sortBy) {
      case "price-asc":
        list.sort(
          (a, b) => (a?.variants?.[0]?.price ?? 0) - (b?.variants?.[0]?.price ?? 0)
        );
        break;
      case "price-desc":
        list.sort(
          (a, b) => (b?.variants?.[0]?.price ?? 0) - (a?.variants?.[0]?.price ?? 0)
        );
        break;
      case "date-desc":
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "date-asc":
        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "alpha-desc":
        list.sort((a, b) =>
          String(b?.title || "").localeCompare(String(a?.title || ""))
        );
        break;
      default:
        // alpha asc (A–Z)
        list.sort((a, b) =>
          String(a?.title || "").localeCompare(String(b?.title || ""))
        );
    }

    return list;
  }, [products, availability, minPrice, maxPrice, sortBy]);

  const count = useMemo(
    () => filteredAndSortedProducts?.length ?? 0,
    [filteredAndSortedProducts]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10" style={{ scrollBehavior: 'smooth' }}>
      <h1 className="text-[40px] sm:text-5xl font-light tracking-tight" style={{ color: BROWN }}>
        {header?.name || "Collection"}
      </h1>
      <p className="mt-2 text-base sm:text-lg italic" style={{ color: SUBTEXT }}>
        {/* optional tagline */}
      </p>

      {/* Filter Toggle Button */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? "border-neutral-800 bg-neutral-800 text-white" 
                : "border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Sort by:</span>
            <PlainSelect
              ariaLabel="Sort products"
              value={sortBy}
              onChange={(v) => setSortBy(v)}
            >
              <option value="alpha">Alphabetically, A–Z</option>
              <option value="alpha-desc">Alphabetically, Z–A</option>
              <option value="price-asc">Price, low to high</option>
              <option value="price-desc">Price, high to low</option>
              <option value="date-desc">Date, new to old</option>
              <option value="date-asc">Date, old to new</option>
            </PlainSelect>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-neutral-500">
              {count} of {meta?.total || 0} products
            </span>
            {meta?.total && meta.total > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-20 sm:w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((count / meta.total) * 100, 100)}%`,
                      backgroundColor: BROWN 
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {Math.round((count / meta.total) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-6 bg-white border border-neutral-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Availability
              </label>
              <PlainSelect
                ariaLabel="Availability"
                value={availability}
                onChange={(v) => setAvailability(v)}
              >
                <option value="all">All</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </PlainSelect>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Min"
                  className="w-20 sm:w-24 px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                />
                <span className="text-sm text-neutral-500">–</span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Max"
                  className="w-20 sm:w-24 px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
                  value={maxPrice === 100000 ? "" : maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 100000)}
                />
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setAvailability("all");
                  setMinPrice(0);
                  setMaxPrice(100000);
                  setSortBy("alpha-desc");
                }}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-800 underline"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Showing {count} of {products?.length || 0} products
              {availability !== "all" && ` (${availability === "in" ? "in stock" : "out of stock"})`}
              {(minPrice > 0 || maxPrice < 100000) && ` (₹${minPrice} - ₹${maxPrice})`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-8">
        {loading ? (
          <SkeletonGrid />
        ) : (
          <>
            {/* No Results Message */}
            {filteredAndSortedProducts.length === 0 && products.length > 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-neutral-900">No products found</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Try adjusting your filter criteria.
                </p>
                <button
                  onClick={() => {
                    setAvailability("all");
                    setMinPrice(0);
                    setMaxPrice(100000);
                    setSortBy("alpha-desc");
                  }}
                  className="mt-4 text-sm text-neutral-600 hover:text-neutral-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {filteredAndSortedProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredAndSortedProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Subtle loading indicator that appears earlier */}
                {hasMore && !isLoadingMore && (
                  <div className="mt-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-500">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                      <span>More products available</span>
                    </div>
                  </div>
                )}

                {/* Infinite Scroll Loading Indicator */}
                {hasMore && (
                  <div 
                    ref={loadingRef}
                    className="flex flex-col items-center py-12 gap-4"
                  >
                    {loadMoreError ? (
                      <div className="flex flex-col items-center gap-4 text-center max-w-md">
                        <div className="flex items-center gap-2 text-red-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">Failed to load more products</span>
                        </div>
                        <p className="text-sm text-gray-500">{loadMoreError}</p>
                        <button
                          onClick={loadMoreProducts}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Try Again</span>
                        </button>
                      </div>
                    ) : isLoadingMore ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200"></div>
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-2 absolute top-0 left-0" style={{ borderTopColor: BROWN }}></div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">Loading more products...</p>
                          <p className="text-xs text-gray-500 mt-1">Please wait while we fetch the latest items</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          <span className="text-sm text-gray-500">Scroll down to load more</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && filteredAndSortedProducts.length > 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-500">You've reached the end</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* No Products in Collection */}
            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-neutral-900">No products in this collection</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Check back later for new products.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-md border border-neutral-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <div className="relative m-3 overflow-hidden rounded-md bg-neutral-200 aspect-[7/9]" />
          <div className="px-4 pb-4">
            <div className="h-4 w-3/4 bg-neutral-200 rounded" />
            <div className="mt-3 h-5 w-1/3 bg-neutral-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
