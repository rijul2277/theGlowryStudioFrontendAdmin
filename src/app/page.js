"use client"

import AboutUsSplit from "@/Components/AboutUs";
import HeroBanner from "@/Components/Banner";
import FooterElegant from "@/Components/Footer";
import ProductCard from "@/Components/Product/ProductCard";
import ProductListing from "@/Components/Product/ProductListing";
import { fetchCatalogSections, selectCatalogLoading, selectCatalogPagination, selectCatalogSections, setCategoryPage } from "@/Redux/Reducers/catalogReducer";
import Image from "next/image";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import img1 from "@/images/theglowrystudio.jpg";
import img2 from "@/images/theglowrystudio1.jpg";



export default function Home() {

  const dispatch = useDispatch()

  const sections = useSelector(selectCatalogSections);
  const pagination = useSelector(selectCatalogPagination);
  const loading = useSelector(selectCatalogLoading);

  console.log("Rendered sections " , sections)

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    dispatch(setCategoryPage(newPage));
    dispatch(fetchCatalogSections({ categoryPage: newPage }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCatalogSections())
  } , [dispatch])



  return (

    <main className="bg-white">
      <HeroBanner />

      {
        loading && sections.length === 0 && (
          <div className="mx-auto max-w-[1600px] px-6 py-12 text-center text-[#7A5C49]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7A5C49]"></div>
              <p className="text-lg font-medium">Loading products...</p>
            </div>
          </div>
        )
      }

      {
        !loading && sections.length === 0 && (
          <div className="mx-auto max-w-[1600px] px-6 py-12 text-center text-[#7A5C49]">
            <div className="flex flex-col items-center gap-4">
              <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-gray-500">Try refreshing the page or check back later</p>
            </div>
          </div>
        )
      }

      {
        sections.map((sec , idx) =>  {
          console.log("name " , sec.category.name)
          return (
              <ProductListing
                key={sec?.category?._id}
                title={sec?.category?.name}
                products={sec?.products ?? []}
                categoryId={sec?.category?._id}
                totalProducts={sec?.productPagination?.total ?? 0}
                showMoreThreshold={8}
              />
          )
        })
      }

      {/* Elegant Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mx-auto max-w-[1600px] px-6 py-12 relative">
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Loading overlay for pagination */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7A5C49]"></div>
                  <span className="text-sm text-gray-600">Loading categories...</span>
                </div>
              </div>
            )}
            {/* Pagination Info */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {pagination.categoriesTotal} total categories
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.page;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-[#7A5C49] text-white shadow-md'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Quick Jump */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Go to page:</span>
              <select
                value={pagination.page}
                onChange={(e) => handlePageChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A5C49] focus:border-transparent"
              >
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <AboutUsSplit align="left" title="About us" description="We celebrate the art of sarees the way it was meant to be – crafted slow, chosen rare, and made only for those who know the difference." buttonText="Get in touch" onButtonClick={() => {}} imageUrl={img1.src} imageAlt="Woman in saree holding a red rose" />
      <AboutUsSplit align="right" title="Final World" description="if you’ve scrolled this far, elegance clearly speaks your language—why not wear it too?" buttonText="Shop Now" imageUrl={img2.src} imageAlt="Woman in saree holding a red rose" />
     
    
      
    </main> 
  );
}
