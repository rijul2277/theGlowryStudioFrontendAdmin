"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductListing from "@/Components/Product/ProductListing";
import {
  fetchProducts,
  selectProducts,
  selectProductsLoading,
  selectProductsError,
  selectProductsPagination,
  selectProductsParams,
} from "@/Redux/Reducers/catalogReducer";

const BROWN = "#7A5C49";
// Keeping BEIGE/BORDER for future use if needed (bar is flat per screenshot)
const BEIGE = "#F6EFE7";
const BORDER = "#CDBFB6";

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

export default function AllProductsPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const pagination = useSelector(selectProductsPagination);
  const serverParams = useSelector(selectProductsParams);

  // local UI state for filters & sort
  const [page, setPage] = useState(serverParams.page || 1);
  const [limit, setLimit] = useState(serverParams.limit || 20);
  const [availability, setAvailability] = useState("all"); // all | in | out
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);

  // Default to Z–A to mirror screenshot
  const [sort, setSort] = useState("alpha-desc"); // alpha | alpha-desc | price-asc | price-desc | date-desc | date-asc

  // fetch from server when page/limit changes
  useEffect(() => {
    dispatch(fetchProducts({ page, limit }));
  }, [dispatch, page, limit]);

  // client-side filter/sort based on the server response
  const filtered = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];

    // availability (uses first variant's stock)
    if (availability !== "all") {
      const wantIn = availability === "in";
      list = list.filter((p) => {
        const stock = p?.variants?.[0]?.stock ?? 0;
        return wantIn ? stock > 0 : stock <= 0;
      });
    }

    // price range (first variant price)
    list = list.filter((p) => {
      const price = p?.variants?.[0]?.price;
      if (typeof price !== "number") return false;
      const min = Number(minPrice || 0);
      const max = Number(maxPrice || 99999999);
      return price >= min && price <= max;
    });

    // sort
    switch (sort) {
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
  }, [items, availability, minPrice, maxPrice, sort]);

  const totalPages = pagination?.totalPages || 1;
  const productsCount =
    typeof pagination?.total === "number" ? pagination.total : filtered.length;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <main className="w-full" style={{ backgroundColor: "#fff" }}>
      <div className="mx-auto max-w-[1600px] px-6 pt-10">
        <h1 className="text-[36px] font-semibold mb-6" style={{ color: BROWN }}>
          Products
        </h1>

        {/* Filter Bar — flat text style to match the screenshot */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Left: Filter group */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="text-sm" style={{ color: BROWN, opacity: 0.9 }}>
                Filter:
              </span>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: BROWN, opacity: 0.9 }}>
                  Availability
                </span>
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

              {/* Price */}
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: BROWN, opacity: 0.9 }}>
                  Price
                </span>

                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Min"
                  className="w-16 bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0"
                  style={{ color: BROWN, fontWeight: 500 }}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span className="text-sm" style={{ color: BROWN, opacity: 0.6 }}>
                  –
                </span>
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="Max"
                  className="w-16 bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0"
                  style={{ color: BROWN, fontWeight: 500 }}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Right: Sort + count */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: BROWN, opacity: 0.9 }}>
                  Sort by:
                </span>
                <PlainSelect
                  ariaLabel="Sort products"
                  value={sort}
                  onChange={(v) => setSort(v)}
                >
                  <option value="alpha">Alphabetically, A–Z</option>
                  <option value="alpha-desc">Alphabetically, Z–A</option>
                  <option value="price-asc">Price, low to high</option>
                  <option value="price-desc">Price, high to low</option>
                  <option value="date-desc">Date, new to old</option>
                  <option value="date-asc">Date, old to new</option>
                </PlainSelect>
              </div>

              <span
                className="text-sm whitespace-nowrap"
                style={{ color: BROWN, opacity: 0.9 }}
              >
                {productsCount} products
              </span>
            </div>
          </div>
        </div>

        {/* Listing */}
        <ProductListing
          title={filtered?.length ? undefined : ""}
          products={filtered}
          page={pagination?.page || page}
          totalPages={totalPages}
          onPrev={goPrev}
          onNext={goNext}
        />

        {loading && (
          <div className="py-6 text-center text-sm" style={{ color: BROWN }}>
            Loading…
          </div>
        )}
        {error && (
          <div className="py-6 text-center text-sm" style={{ color: BROWN }}>
            Failed: {String(error)}
          </div>
        )}
      </div>
    </main>
  );
}
