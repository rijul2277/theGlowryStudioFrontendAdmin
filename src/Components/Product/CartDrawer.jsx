"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, selectCartCount, selectCartLoading } from "@/Redux/Reducers/cartReducer";
import { updateCartItem, clearCart, closeCart, fetchCart, removeFromCart, getGuestCart } from "@/Redux/Reducers/cartReducer";
import { useAuthSync } from "@/hooks/useAuthSync";
import { useEffect, useRef } from "react";

const BROWN = "#7A5C49";

export default function CartDrawer() {
  const router = useRouter();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const loading = useSelector(selectCartLoading);
  const isOpen = useSelector((s) => s.cart.isOpen);
  const { isAuthenticated } = useAuthSync();
  
  // ✅ Track if cart has been fetched in this drawer
  const cartDrawerFetchedRef = useRef(false);

  // Helper function to safely extract product ID
  const getProductId = (product) => {
    return product && typeof product === 'object' ? product._id : product;
  };

  // Helper function to safely extract product title
  const getProductTitle = (item) => {
    return item.title || (item.product && typeof item.product === 'object' ? item.product.title : item.product);
  };

  // ✅ CONTROLLED: Cart fetching when drawer opens
  useEffect(() => {
    if (isOpen && !cartDrawerFetchedRef.current && !loading) {
      cartDrawerFetchedRef.current = true;
      
      if (isAuthenticated) {
        // ✅ User is logged in - fetch from API
        console.log('CartDrawer: Fetching cart for authenticated user');
        dispatch(fetchCart());
      } else {
        // ✅ Guest user - load from localStorage
        console.log('CartDrawer: Loading guest cart from localStorage');
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
  }, [isOpen, dispatch, isAuthenticated, loading]);

  // ✅ Reset cart fetch tracking when drawer closes
  useEffect(() => {
    if (!isOpen) {
      cartDrawerFetchedRef.current = false;
    }
  }, [isOpen]);

  const total = (items || []).reduce((sum, it) => sum + (it.quantity || 0) * (it.priceAtAdd || 0), 0);

  // Handle checkout navigation
  const handleCheckout = () => {
    if (!items || items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    
    // Close cart drawer
    dispatch(closeCart());
    
    // Navigate to checkout page
    router.push('/checkout');
  };

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={() => dispatch(closeCart())}
      />

      {/* Panel */}
      <aside
        className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl transition-transform"
        style={{ transform: `translateX(${isOpen ? 0 : 100}%)` }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: `${BROWN}22` }}>
          <h3 className="text-lg font-semibold" style={{ color: BROWN }}>Your cart</h3>
          <button onClick={() => dispatch(closeCart())} aria-label="Close" className="p-2" style={{ color: BROWN }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={BROWN} strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Items */}
        <div className="max-h-[65vh] overflow-auto px-4 py-3 space-y-5">
          {loading && <div style={{ color: BROWN }} className="text-sm">Loading…</div>}
          {!loading && (items || []).map((it) => (
            <div key={`${getProductId(it.product)}-${it.variantSku || ''}`} className="flex gap-3">
              <div className="h-20 w-16 overflow-hidden rounded border" style={{ borderColor: `${BROWN}22` }}>
                <Image src={it.imageUrl || "/placeholder.png"} alt="Item" width={64} height={80} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: BROWN }}>
                  {getProductTitle(it)}
                </div>
                <div className="text-xs opacity-70" style={{ color: BROWN }}>{it.variantSku}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="h-8 w-8 border rounded"
                    style={{ color: BROWN, borderColor: `${BROWN}55` }}
                    onClick={() => dispatch(updateCartItem({ productId: getProductId(it.product), variantSku: it.variantSku, quantity: Math.max(0, (it.quantity || 0) - 1) }))}
                  >
                    -
                  </button>
                  <span className="w-6 text-center" style={{ color: BROWN }}>{it.quantity || 0}</span>
                  <button
                    className="h-8 w-8 border rounded"
                    style={{ color: BROWN, borderColor: `${BROWN}55` }}
                    onClick={() => dispatch(updateCartItem({ productId: getProductId(it.product), variantSku: it.variantSku, quantity: (it.quantity || 0) + 1 }))}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm" style={{ color: BROWN }}>Rs. {(it.priceAtAdd || 0).toLocaleString("en-IN")}</div>
                <button
                  className="text-xs opacity-70 hover:opacity-100"
                  style={{ color: BROWN }}
                  onClick={() => dispatch(removeFromCart({ productId: getProductId(it.product), variantSku: it.variantSku }))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!loading && (items || []).length === 0 && (
            <div className="text-sm" style={{ color: BROWN }}>Your cart is empty</div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto border-t px-4 py-4 space-y-3" style={{ borderColor: `${BROWN}22` }}>
          <div className="flex items-center justify-between text-sm" style={{ color: BROWN }}>
            <span>Items</span>
            <span>{count}</span>
          </div>
          <div className="flex items-center justify-between text-base font-medium" style={{ color: BROWN }}>
            <span>Total</span>
            <span>Rs. {total.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex-1 rounded-md px-4 py-3 border"
              style={{ color: BROWN, borderColor: `${BROWN}55` }}
              onClick={() => dispatch(clearCart())}
            >
              Clear
            </button>
            <button
              className="flex-1 rounded-md px-4 py-3 text-white"
              style={{ background: BROWN }}
              onClick={handleCheckout}
            >
              Secure checkout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}


