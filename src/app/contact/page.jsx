"use client";
import React from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"], // lighter overall
});

export default function ContactSection() {
  return (
    <section
      className={`${poppins.className} mx-auto max-w-[980px] px-6 pt-16 pb-24 text-center text-[#2E2E2E]`}
    >
      {/* Title — lighter weight + tighter color */}
      <h1 className="mb-7 text-[clamp(36px,5.2vw,56px)] font-medium leading-[1.15] tracking-[0.01em] text-[#7A5C49]">
        Contact
      </h1>

      {/* Lede (two lines) — graceful + airy */}
      <p className="mx-auto mb-4 text-[clamp(20px,3.2vw,32px)] font-normal leading-[1.5] text-[#7A5C49]/90">
        For any queries, collaborations, or
        <br className="block" />
        support, please reach out to us:
      </p>

      {/* Subcopy — softer gray and spacing */}
      <p className="mx-auto mb-8 text-[15px] leading-relaxed text-[#6B6B6B]">
        For any queries, collaborations, or support, please reach out to us:
      </p>

      {/* Divider */}
      <div className="mx-auto mt-1 max-w-[720px] border-t border-[#DCCFC4] pt-6">

        {/* Email row */}
        <div className="mx-auto my-2 inline-flex items-center gap-2 text-[15px] text-[#7A5C49]/95">
          <span className="inline-flex translate-y-[1px] leading-none opacity-80" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2
              2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 13 4
              6.01V6h16ZM4 18V8.236l7.386 6.157a1 1 0 0 0 1.228
              0L20 8.236V18H4Z"/>
            </svg>
          </span>
          <span className="font-medium/95">Email:</span>
          <a
            href="mailto:pyaarinaari2025@gmail.com"
            className="border-b border-dashed border-[#DCCFC4] text-[#7A5C49] no-underline transition-opacity hover:opacity-80"
          >
            pyaarinaari2025@gmail.com
          </a>
        </div>

        {/* Phone row */}
        <div className="mx-auto my-2 inline-flex items-center gap-2 text-[15px] text-[#7A5C49]/95">
          <span className="inline-flex translate-y-[1px] leading-none opacity-80" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1
              1 0 0 1 1.01-.24c1.11.37 2.31.57 3.58.57a1 1 0 0
              1 1 1V21a1 1 0 0 1-1 1C10.85 22 2 13.15 2
              2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.2 2.47.57
              3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z"/>
            </svg>
          </span>
          <span className="font-medium/95">Phone:</span>
          <a
            href="tel:7889187265"
            className="border-b border-dashed border-[#DCCFC4] text-[#7A5C49] no-underline transition-opacity hover:opacity-80"
          >
            7889187265
          </a>
        </div>

        {/* Meta lines — understated */}
        <div className="mt-6 space-y-1 text-[15px] leading-relaxed">
          <div>
            <span className="text-[#2E2E2E]/75">Proprietor (Legal Owner):</span>{" "}
            <strong className="font-medium text-[#2E2E2E]">Rimalpreet Singh</strong>
          </div>
          <div>
            <span className="text-[#2E2E2E]/75">Brand Name:</span>{" "}
            <strong className="font-medium text-[#2E2E2E]">Pyaari Naari</strong>
          </div>
        </div>
      </div>

      {/* Subtle global tweaks for responsiveness */}
      <style jsx global>{`
        @media (min-width: 1200px) {
          section { padding-top: 72px; }
        }
        @media (max-width: 520px) {
          .inline-flex { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
