"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import logo from "./Product/image/logo.png";
import dynamic from "next/dynamic";
const CartDrawer = dynamic(() => import("@/Components/Product/CartDrawer"), { ssr: false });
import {
  fetchCatalogSections,
  selectCatalogSections,
  fetchAllCategories,
  selectAllCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  fetchProducts,
  selectProducts,
  selectProductsLoading,
} from "@/Redux/Reducers/catalogReducer";
import { logoutUser, getCurrentUser } from "@/Redux/Actions/authAction";
import { signOut } from "next-auth/react";
import { useAuthSync } from "@/hooks/useAuthSync";
import { fetchCart, selectCartCount, openCart, getGuestCart, fetchCartCount, selectCartLoading } from "@/Redux/Reducers/cartReducer";
import { selectWishlistCount, fetchWishlistCount, fetchWishlist } from "@/Redux/Reducers/wishlistReducer";

const BROWN = "#7A5C49";
const HAIRLINE = "#DCCFC4";

export default function Navbar({ cartCounts = 3 }) {
  // Add CSS for hiding scrollbars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const dispatch = useDispatch();
  const router = useRouter();
  const sections = useSelector(selectCatalogSections);
  const categories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const searchResults = useSelector(selectProducts);
  const searchLoading = useSelector(selectProductsLoading);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const cartLoading = useSelector(selectCartLoading);


  console.log(  "cartCount", cartCount);
  
  // Auth state with session sync
  const { isAuthenticated, user, isLoading, session } = useAuthSync();
  
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // --- NEW: ref + click-outside / Escape close ---
  const collectionsRef = useRef(null);
  const userMenuRef = useRef(null);
  const categoriesFetchedRef = useRef(false);
  const cartFetchedRef = useRef(false);
  
  useEffect(() => {
    if (!collectionsOpen) return;

    const onDocPointerDown = (e) => {
      // Close only if click is outside the collections wrapper
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) {
        setCollectionsOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setCollectionsOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [collectionsOpen]);

  // User menu click outside handler
  useEffect(() => {
    if (!userMenuOpen) return;

    const onDocPointerDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [userMenuOpen]);

  // ✅ OPTIMIZED: Process categories for navbar display
  const processedCategories = useMemo(() => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }
    
    return categories
      .filter((c) => c && (c.name || c.slug))
      .map((c) => ({
        ...c,
        href: `/collections/${c._id}`,
        img: c.bannerImageUrl || "/placeholder.png"
      }));
  }, [categories]);


  // Load initial data on mount
  useEffect(() => {
    // ✅ Fetch categories for navbar (lightweight, no products) - only if not already loaded
    if (categories.length === 0 && !categoriesLoading && !categoriesFetchedRef.current) {
      categoriesFetchedRef.current = true;
      dispatch(fetchAllCategories());
    }
    
    // ✅ CONTROLLED: Cart fetching - single call when navbar renders
    if (!cartFetchedRef.current && !cartLoading) {
      cartFetchedRef.current = true;
      
      if (isAuthenticated) {
        // ✅ User is logged in - fetch from API
        console.log('Navbar: Fetching cart for authenticated user');
        dispatch(fetchCart());
      } else {
        // ✅ Guest user - load from localStorage
        console.log('Navbar: Loading guest cart from localStorage');
        const guestCart = getGuestCart();
        if (guestCart.items.length > 0) {
          // Update Redux state with guest cart data
          dispatch({
            type: 'cart/fetchCart/fulfilled',
            payload: guestCart
          });
        }
      }
    }
  }, [dispatch, isAuthenticated, categories.length, categoriesLoading, cartLoading]);

  // ✅ ENHANCED: Load wishlist count when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlistCount());
      dispatch(fetchWishlist());
      dispatch(fetchCartCount());
    }
  }, [isAuthenticated, dispatch]);

  // Handle redirect when user becomes unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated && userMenuOpen) {
      // User was logged out, close menu and redirect
      setUserMenuOpen(false);
      router.push('/');
    }
  }, [isAuthenticated, isLoading, userMenuOpen, router]);

  // ✅ Reset cart fetch tracking when auth state changes
  useEffect(() => {
    cartFetchedRef.current = false;
  }, [isAuthenticated]);

  /* --------------------------- SEARCH EXPERIENCE --------------------------- */
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!searchOpen) return;
    const onDocPointer = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onEsc);
    };
  }, [searchOpen]);

  // debounce queries -> call fetchProducts with search
  useEffect(() => {
    const q = query.trim();
    if (!searchOpen || q.length === 0) return;
    const t = setTimeout(() => {
      dispatch(fetchProducts({ page: 1, limit: 6, search: q }));
    }, 300);
    return () => clearTimeout(t);
  }, [dispatch, query, searchOpen]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    console.log('Logout button clicked');
    setIsLoggingOut(true);
    try {
      setUserMenuOpen(false);
      
      // Try NextAuth signOut first
      try {
        await signOut({ redirect: false });
        console.log('NextAuth signOut successful');
      } catch (nextAuthError) {
        console.error('NextAuth signOut failed:', nextAuthError);
      }
      
      // Then dispatch our custom logout
      await dispatch(logoutUser());
      console.log('Logout dispatch completed');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
      // Even if logout fails, redirect to home
      router.push('/');
    }
  }, [dispatch, router]);

  // Memoized event handlers
  const handleMobileMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleCollectionsToggle = useCallback(() => {
    setCollectionsOpen((prev) => !prev);
  }, []);

  const handleUserMenuToggle = useCallback(() => {
    setUserMenuOpen((prev) => !prev);
  }, []);

  const handleSearchToggle = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
  }, []);

  const handleCartOpen = useCallback(() => {
    dispatch(openCart());
  }, [dispatch]);

  const handleMobileMenuClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserMenuOpen(false);
  }, []);

  const handleCollectionsClose = useCallback(() => {
    setCollectionsOpen(false);
  }, []);

  // Handle collection link click - close dropdown and navigate
  const handleCollectionClick = useCallback((href) => {
    setCollectionsOpen(false);
    router.push(href);
  }, [router]);

  // Memoized search query handler
  const handleSearchQueryChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  // Memoized search results
  const memoizedSearchResults = useMemo(() => {
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      return [];
    }
    return searchResults.map((p) => ({
      ...p,
      href: `/product/${p.slug}`,
      img: p.mainImageUrl || "/placeholder.png"
    }));
  }, [searchResults]);

  // Memoized mobile menu height
  const mobileMenuHeight = useMemo(() => {
    return mobileOpen ? 360 : 0;
  }, [mobileOpen]);

  return (
    <header
      className="w-full bg-white sticky top-0 z-40 shadow-sm"
      style={{ borderTop: `1px solid ${HAIRLINE}` }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8 relative">
        {/* TOP ROW — mobile/tablet: hamburger | logo | icons  — desktop: links | logo | icons */}
        <div className="grid grid-cols-3 items-center py-4 sm:py-5 md:py-6 lg:py-7">
          {/* LEFT: mobile hamburger / desktop nav */}
          <div className="flex items-center">
            {/* Hamburger (mobile/tablet) */}
            <button
              aria-label="Open menu"
              className="lg:hidden p-2 -ml-1 sm:-ml-2 transition-colors duration-200 hover:bg-gray-50 rounded-md"
              onClick={handleMobileMenuToggle}
              style={{ color: BROWN }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="sm:w-6 sm:h-6">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            {/* Desktop primary nav */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link 
                href="/" 
                className="text-sm xl:text-[15px] font-medium transition-colors duration-200 hover:opacity-80" 
                style={{ color: BROWN }}
              >
                <span className="underline underline-offset-[8px] decoration-[1px]">Home</span>
              </Link>

              {/* --- WRAP button + menu in one ref container --- */}
              <div className="relative" ref={collectionsRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm xl:text-[15px] font-medium transition-colors duration-200 hover:opacity-80"
                  style={{ color: BROWN }}
                  onClick={handleCollectionsToggle}
                  // REMOVED onBlur (it caused the menu to close on inner clicks)
                >
                  Collections
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="xl:w-4 xl:h-4">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {collectionsOpen && (
                  <>
                    {/* Background overlay */}
                    <div 
                      className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
                      onClick={handleCollectionsClose}
                    />
                    
                    {/* Professional Collections Dropdown */}
                    <div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-[95vw] max-w-5xl rounded-2xl bg-white shadow-2xl border z-50 animate-in slide-in-from-top-2 duration-300"
                      style={{ 
                        borderColor: `${BROWN}15`,
                        boxShadow: `0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px ${BROWN}10`
                      }}
                      onMouseEnter={() => setCollectionsOpen(true)}
                    >
                      {/* Arrow pointing up to Collections button */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-4 h-4 bg-white border-l border-t transform rotate-45" style={{ borderColor: `${BROWN}15` }}></div>
                      </div>
                      
                      {/* Header */}
                      <div className="px-6 py-4 border-b" style={{ borderColor: `${BROWN}10` }}>
                        <h3 className="text-xl font-bold text-center" style={{ color: BROWN }}>
                          Our Collections
                        </h3>
                        <p className="text-sm text-center mt-1 opacity-70" style={{ color: BROWN }}>
                          Discover our curated selection of premium products
                        </p>
                      </div>

                      {/* Collections Horizontal Scroll */}
                      <div className="p-6">
                        {categoriesLoading && (
                          <div className="flex justify-center items-center py-12">
                            <div className="inline-flex items-center gap-3 text-sm opacity-70" style={{ color: BROWN }}>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Loading collections…
                            </div>
                          </div>
                        )}

                        {!categoriesLoading && processedCategories.length === 0 && (
                          <div className="text-center py-12">
                            <div className="text-sm opacity-70" style={{ color: BROWN }}>
                              No collections available at the moment
                            </div>
                          </div>
                        )}

                        {categoriesError && (
                          <div className="text-center py-12">
                            <div className="text-sm opacity-70" style={{ color: '#ef4444' }}>
                              Failed to load collections. Please try again.
                            </div>
                          </div>
                        )}

                        {!categoriesLoading && processedCategories.length > 0 && (
                          <div className="relative">
                            {/* Horizontal scroll container */}
                            <div className="overflow-x-auto hide-scrollbar">
                              <div className="flex gap-6 pb-4" style={{ minWidth: 'fit-content' }}>
                                {processedCategories.map((c) => (
                                  <button
                                    key={c._id}
                                    onClick={() => handleCollectionClick(c.href)}
                                    className="group flex-shrink-0 w-48 sm:w-52 md:w-56 lg:w-60 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl"
                                    style={{ 
                                      focusRingColor: `${BROWN}30`
                                    }}
                                  >
                                    <div className="w-full">
                                      <div className="relative overflow-hidden rounded-xl border-2 transition-all duration-300 group-hover:shadow-lg group-hover:border-opacity-60" 
                                           style={{ borderColor: `${BROWN}20` }}>
                                        <Image
                                          src={c.img}
                                          alt={c.name || c.slug}
                                          width={240}
                                          height={200}
                                          className="w-full h-40 sm:h-44 md:h-48 lg:h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        {/* Elegant overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        
                                        {/* Collection name overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <div className="text-white text-sm font-semibold text-center">
                                            {c.name || c.slug}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Collection name below image */}
                                      <div className="mt-3 text-center">
                                        <div className="text-sm font-semibold transition-colors duration-200 group-hover:opacity-80 truncate" 
                                             style={{ color: BROWN }}>
                                          {c.name || c.slug}
                                        </div>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Scroll indicators */}
                            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-6 py-4 border-t bg-gray-50/50 rounded-b-2xl" style={{ borderColor: `${BROWN}10` }}>
                        <div className="text-center">
                          <Link 
                            href="/collections" 
                            onClick={handleCollectionsClose}
                            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:opacity-80"
                            style={{ color: BROWN }}
                          >
                            View All Collections
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Link 
                href="/contact" 
                className="text-sm xl:text-[15px] font-medium transition-colors duration-200 hover:opacity-80" 
                style={{ color: BROWN }}
              >
                Contact
              </Link>
              <Link 
                href="/wishlist" 
                className="text-sm xl:text-[15px] font-medium transition-colors duration-200 hover:opacity-80" 
                style={{ color: BROWN }}
              >
                Wishlist
              </Link>
            </nav>
          </div>

          {/* CENTER: logo + tagline */}
          <div className="flex flex-col items-center justify-center px-2 sm:px-4">
            <Link 
              href="/" 
              className="transition-all duration-300 hover:scale-105 hover:opacity-90 p-2 rounded-lg hover:bg-gray-50/50"
            >
              <Image
                src={logo}
                alt="The Glowry Studio Logo"
                width={150}
                height={30}
                className="h-7 w-auto sm:h-9 sm:w-auto md:h-11 md:w-auto lg:h-13 lg:w-auto xl:h-16 xl:w-auto drop-shadow-sm"
                priority
              />
            </Link>
            <div
              className="mt-1.5 hidden sm:block text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] uppercase font-semibold tracking-wider opacity-90"
              style={{ color: BROWN, letterSpacing: "0.4em" }}
            >
              The Glowry Studio
            </div>
          </div>

          {/* RIGHT: icons */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-6 lg:gap-7" style={{ color: BROWN }}>
            {/* search trigger */}
            <button 
              aria-label="Open search" 
              className="p-2 transition-colors duration-200 hover:bg-gray-50 rounded-md" 
              onClick={handleSearchToggle}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            {/* user */}
            <div className="relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <button
                  aria-label="User menu"
                  className="p-2 flex items-center gap-1 sm:gap-2 transition-colors duration-200 hover:bg-gray-50 rounded-md"
                  onClick={handleUserMenuToggle}
                >
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || "User"}
                      width={20}
                      height={20}
                      className="rounded-full w-5 h-5 sm:w-6 sm:h-6"
                    />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 19c1.8-3 5-4 7-4s5.2 1 7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                  <span className="hidden md:block text-xs sm:text-sm font-medium transition-colors duration-200" style={{ color: BROWN }}>
                    {user?.name || "User"}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="sm:w-3 sm:h-3">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <Link 
                  href="/accounts/login" 
                  className="p-2 transition-colors duration-200 hover:bg-gray-50 rounded-md"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M5 19c1.8-3 5-4 7-4s5.2 1 7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Link>
              )}

              {/* User dropdown menu */}
              {userMenuOpen && isAuthenticated && (
                <div
                  className="absolute right-0 mt-2 w-44 sm:w-48 rounded-lg bg-white shadow-xl border animate-in slide-in-from-top-2 duration-200"
                  style={{ borderColor: `${BROWN}22` }}
                >
                  <div className="py-2">
                    <div className="px-4 py-2 border-b" style={{ borderColor: `${BROWN}11` }}>
                      <p className="text-sm font-medium" style={{ color: BROWN }}>
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: BROWN }}>
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                      style={{ color: BROWN }}
                      onClick={handleUserMenuClose}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                      style={{ color: BROWN }}
                      onClick={handleUserMenuClose}
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50"
                      style={{ color: BROWN }}
                      onClick={handleUserMenuClose}
                    >
                      Orders
                    </Link>
                    <div className="border-t" style={{ borderColor: `${BROWN}11` }} />
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: BROWN }}
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* wishlist */}
            <Link 
              href="/wishlist"
              aria-label="Wishlist" 
              className="relative p-2 transition-colors duration-200 hover:bg-gray-50 rounded-md" 
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {wishlistCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 sm:-right-1.5 sm:-top-0.5 grid h-4 w-4 sm:h-[18px] sm:min-w-[18px] place-items-center rounded-full px-1 sm:px-[6px] text-[9px] sm:text-[10px] text-white font-medium"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>
            
            {/* cart */}
            <button 
              aria-label="Cart" 
              className="relative p-2 transition-colors duration-200 hover:bg-gray-50 rounded-md" 
              onClick={handleCartOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                <path d="M6 7h14l-1.4 8.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 7a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 sm:-right-1.5 sm:-top-0.5 grid h-4 w-4 sm:h-[18px] sm:min-w-[18px] place-items-center rounded-full px-1 sm:px-[6px] text-[9px] sm:text-[10px] text-white font-medium"
                  style={{ backgroundColor: BROWN }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN (slide-down) */}
        <div
          className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-t`}
          style={{ maxHeight: mobileMenuHeight, borderColor: `${BROWN}22` }}
        >
          <nav className="pb-4 pt-2">
            <ul className="space-y-1 text-sm sm:text-[15px] font-medium">
              <li>
                <Link 
                  href="/" 
                  className="block py-2 px-2 transition-colors duration-200 hover:bg-gray-50 rounded-md" 
                  style={{ color: BROWN }} 
                  onClick={handleMobileMenuClose}
                >
                  Home
                </Link>
              </li>
              <li>
                <details className="group">
                  <summary className="list-none flex items-center justify-between py-2 px-2 cursor-pointer transition-colors duration-200 hover:bg-gray-50 rounded-md" style={{ color: BROWN }}>
                    <span>Collections</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-open:rotate-180">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="pl-2 pb-2 grid grid-cols-1 gap-1">
                    {processedCategories.map((c) => (
                      <Link
                        key={c._id}
                        href={c.href}
                        className="flex items-center gap-3 py-2 px-2 text-xs sm:text-sm transition-colors duration-200 hover:bg-gray-50 rounded-md"
                        style={{ color: BROWN }}
                        onClick={handleMobileMenuClose}
                      >
                        <div className="h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded border flex-shrink-0" style={{ borderColor: `${BROWN}22` }}>
                          <Image
                            src={c.img}
                            alt={c.name || c.slug}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="truncate">{c.name || c.slug}</span>
                      </Link>
                    ))}
                    {categoriesLoading && (
                      <div className="py-2 text-[13px]" style={{ color: BROWN }}>
                        Loading collections…
                      </div>
                    )}
                    {!categoriesLoading && processedCategories.length === 0 && (
                      <div className="py-2 text-[13px]" style={{ color: BROWN }}>
                        No collections found
                      </div>
                    )}
                    {categoriesError && (
                      <div className="py-2 text-[13px]" style={{ color: '#ef4444' }}>
                        Failed to load collections
                      </div>
                    )}
                  </div>
                </details>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="block py-2 px-2 transition-colors duration-200 hover:bg-gray-50 rounded-md" 
                  style={{ color: BROWN }} 
                  onClick={handleMobileMenuClose}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/wishlist" 
                  className="block py-2 px-2 transition-colors duration-200 hover:bg-gray-50 rounded-md" 
                  style={{ color: BROWN }} 
                  onClick={handleMobileMenuClose}
                >
                  Wishlist
                </Link>
              </li>
              {/* Mobile auth section */}
              <li className="border-t pt-2 mt-2" style={{ borderColor: `${BROWN}22` }}>
                {isAuthenticated ? (
                  <div>
                    <div className="px-2 py-2">
                      <p className="text-sm font-medium" style={{ color: BROWN }}>
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: BROWN }}>
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block py-2 px-2 text-xs sm:text-sm transition-colors duration-200 hover:bg-gray-50 rounded-md"
                      style={{ color: BROWN }}
                      onClick={handleMobileMenuClose}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/orders"
                      className="block py-2 px-2 text-xs sm:text-sm transition-colors duration-200 hover:bg-gray-50 rounded-md"
                      style={{ color: BROWN }}
                      onClick={handleMobileMenuClose}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        handleMobileMenuClose();
                      }}
                      disabled={isLoggingOut}
                      className="block w-full text-left py-2 px-2 text-xs sm:text-sm transition-colors duration-200 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: BROWN }}
                    >
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/accounts/login"
                    className="block py-2 px-2 text-sm sm:text-[15px] font-medium transition-colors duration-200 hover:bg-gray-50 rounded-md"
                    style={{ color: BROWN }}
                    onClick={handleMobileMenuClose}
                  >
                    Login / Sign Up
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>

        {/* FULL-WIDTH SEARCH OVERLAY */}
        {searchOpen && (
          <div
            ref={searchRef}
            className="absolute left-0 right-0 top-0 z-50 animate-in slide-in-from-top-2 duration-200"
          >
            {/* background panel */}
            <div
              className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8"
            >
              <div
                className="mt-2 rounded-lg border shadow-xl overflow-hidden"
                style={{ background: "#FFFFFF", borderColor: `${BROWN}22` }}
              >
                {/* input row */}
                <div className="flex items-center gap-2 sm:gap-3 px-3 py-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5 flex-shrink-0">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search for products"
                    value={query}
                    onChange={handleSearchQueryChange}
                    className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:opacity-60"
                    style={{ color: BROWN }}
                  />
                  <button
                    aria-label="Close search"
                    onClick={handleSearchClose}
                    className="p-1 sm:p-2 transition-colors duration-200 hover:bg-gray-50 rounded-md"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="sm:w-5 sm:h-5">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* results */}
                {query.trim().length > 0 && (
                  <div className="border-t" style={{ borderColor: `${BROWN}11` }}>
                    {searchLoading && (
                      <div className="p-3 sm:p-4 text-sm" style={{ color: BROWN }}>Searching…</div>
                    )}
                    {!searchLoading && Array.isArray(searchResults) && searchResults.length === 0 && (
                      <div className="p-3 sm:p-4 text-sm" style={{ color: BROWN }}>No results</div>
                    )}
                    {!searchLoading && memoizedSearchResults.length > 0 && (
                      <ul className="max-h-[50vh] sm:max-h-[60vh] overflow-auto divide-y" style={{ borderColor: `${BROWN}11` }}>
                        {memoizedSearchResults.map((p) => (
                          <li key={p._id}>
                            <Link
                              href={p.href}
                              className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 transition-colors duration-200 hover:bg-gray-50"
                              onClick={handleSearchClose}
                            >
                              <div className="h-12 w-10 sm:h-14 sm:w-12 overflow-hidden rounded border flex-shrink-0" style={{ borderColor: `${BROWN}22` }}>
                                <Image
                                  src={p.img}
                                  alt={p.title}
                                  width={48}
                                  height={56}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="text-sm sm:text-[15px] truncate" style={{ color: BROWN }}>{p.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <CartDrawer />
      </div>
    </header>
  );
}