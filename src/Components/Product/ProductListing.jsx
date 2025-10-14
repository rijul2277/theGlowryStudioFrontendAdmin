    // "use client";
    import ProductCard from "@/Components/Product/ProductCard";
    import Link from "next/link";

    const BROWN = "#7A5C49";

    export default function ProductListing({
        id,
    title = "Tyohar Ki Queen Collection",
    products = [],
    // Show more props
    categoryId = null,
    totalProducts = 0,
    showMoreThreshold = 8,
    }) {
    return (
        <section className="w-full py-10">
        <div className="mx-auto max-w-[1600px] px-6">
            {/* Heading */}
            <div className="mb-7 text-center">
                <h2
                className="text-[30px] sm:text-[32px] font-semibold mb-2"
                style={{ color: BROWN }}
                >
                {title}
                </h2>
                {products && products.length > 0 ? (
                    <p className="text-sm text-gray-500">
                        Showing {products.length} of {totalProducts} products
                    </p>
                ) : (
                    <p className="text-sm text-gray-400 italic">
                        No products available yet
                    </p>
                )}
            </div>
            {/* Grid — 1/2/3/4/5 like the reference */}
            {products && products.length > 0 ? (
                <div
                className="
                    grid gap-x-10 gap-y-12
                    grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                "
                >
                {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-sm text-gray-500 max-w-md">
                        We're working on adding amazing products to this collection. 
                        Check back soon for new arrivals!
                    </p>
                </div>
            )}

            {/* Show More Button */}
            {totalProducts > showMoreThreshold && categoryId && (
            <div className="mt-10 flex flex-col items-center justify-center gap-4">
                <Link
                    href={`/collections/${categoryId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#7A5C49] text-[#7A5C49] font-semibold rounded-lg hover:bg-[#7A5C49] hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                    <span>Show More Products</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
                <p className="text-xs text-gray-500">
                    View all {totalProducts} products in {title}
                </p>
            </div>
            )}
        </div>
        </section>
    );
    }
