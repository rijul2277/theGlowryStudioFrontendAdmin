        // app/collection/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
    import {
    fetchAllCategories,
    selectAllCategories,
    selectCategoriesLoading,
    selectCategoriesError,
    } from "@/Redux/Reducers/catalogReducer";

export default function CollectionsPage() {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, sortOrder, createdAt
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [showFilters, setShowFilters] = useState(false);
  const categoriesFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch if not already loaded and not loading
    if (categories.length === 0 && !loading && !categoriesFetchedRef.current) {
      categoriesFetchedRef.current = true;
      dispatch(fetchAllCategories());
    }
  }, [dispatch, categories.length, loading]);

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories;

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(search) ||
        category.description?.toLowerCase().includes(search) ||
        category.slug.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "sortOrder":
          aValue = a.sortOrder || 0;
          bValue = b.sortOrder || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "desc") {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [categories, searchTerm, sortBy, sortOrder]);

  console.log("categories " , categories)

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-[40px] sm:text-5xl font-light tracking-tight text-neutral-800 mb-4 sm:mb-0">
          Collections
        </h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search collections..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="sortOrder">Custom Order</option>
                <option value="createdAt">Date Created</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                View
              </label>
              <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "grid" 
                      ? "bg-neutral-800 text-white" 
                      : "bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list" 
                      ? "bg-neutral-800 text-white" 
                      : "bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary and Clear Filters */}
          <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-neutral-600">
              Showing {filteredAndSortedCategories.length} of {categories.length} collections
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            
            {/* Clear Filters Button */}
            {(searchTerm || sortBy !== "name" || sortOrder !== "asc") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("name");
                  setSortOrder("asc");
                }}
                className="text-sm text-neutral-600 hover:text-neutral-800 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* skeleton while loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="aspect-[4/3] bg-neutral-200" />
              <div className="p-3">
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* No Results Message */}
          {filteredAndSortedCategories.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-neutral-900">No collections found</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-sm text-neutral-600 hover:text-neutral-800 underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Grid View */}
          {filteredAndSortedCategories.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredAndSortedCategories.map((c) => (
                <CollectionCard
                  id={c._id}
                  key={c.slug}
                  slug={c.slug}
                  title={c.name}
                  imageUrl={c.bannerImageUrl}
                  description={c.description}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {filteredAndSortedCategories.length > 0 && viewMode === "list" && (
            <div className="space-y-4">
              {filteredAndSortedCategories.map((c) => (
                <CollectionListCard
                  id={c._id}
                  key={c.slug}
                  slug={c.slug}
                  title={c.name}
                  imageUrl={c.bannerImageUrl}
                  description={c.description}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function CollectionCard({
  id,
  slug,
  title,
  imageUrl,
  description,
}) {

    console.log("imageUrl " , imageUrl)
  return (
    <Link
      href={`/collections/${encodeURIComponent(id)}`}
      className="group block rounded-2xl overflow-hidden shadow-sm bg-white"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={imageUrl || "/placeholder.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 33vw"
          priority={false}
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 text-[18px] text-neutral-800">
          <span className="leading-snug">{title}</span>
          <span className="translate-y-[1px] transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
        {/* optional sub copy; keep subtle to match vibe */}
        {description ? (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CollectionListCard({
  id,
  slug,
  title,
  imageUrl,
  description,
}) {
  return (
    <Link
      href={`/collections/${encodeURIComponent(id)}`}
      className="group block bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex">
        <div className="relative w-32 h-24 flex-shrink-0">
          <Image
            src={imageUrl || "/placeholder.jpg"}
            alt={title}
            fill
            className="object-cover"
            sizes="128px"
            priority={false}
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-neutral-800 group-hover:text-neutral-900 transition-colors">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
            <span className="ml-4 text-neutral-400 group-hover:text-neutral-600 transition-colors">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
