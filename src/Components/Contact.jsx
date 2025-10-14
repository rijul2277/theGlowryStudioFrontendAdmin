"use client";
import React from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function ContactSection() {
  return (
    <section
      className={`${poppins.className} mx-auto max-w-[1080px] px-5 pt-16 pb-24 text-center text-[#2E2E2E]`}
    >
      {/* Title */}
      <h1 className="mb-9 text-[clamp(42px,6vw,64px)] font-semibold leading-[1.1] tracking-[0.02em] text-[#7A5C49]">
        Contact
      </h1>

      {/* Lede (two lines) */}
      <p className="mx-auto mb-6 text-[clamp(22px,3.6vw,36px)] font-medium leading-snug text-[#7A5C49]">
        For any queries, collaborations, or
        <br className="block" />
        support, please reach out to us:
      </p>

      {/* Subcopy */}
      <p className="mx-auto mb-7 text-[16px] text-[#6B6B6B]">
        For any queries, collaborations, or support, please reach out to us:
      </p>

      {/* Divider + content */}
      <div className="mt-2 border-t border-[#DCCFC4] pt-4">
        {/* Email row */}
        <div className="mx-auto my-2 inline-flex items-center gap-2 text-[16px] text-[#7A5C49]">
          <span className="inline-flex translate-y-[1px] leading-none opacity-90" aria-hidden>
            {/* envelope */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2
              2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 13 4
              6.01V6h16ZM4 18V8.236l7.386 6.157a1 1 0 0 0 1.228
              0L20 8.236V18H4Z"/>
            </svg>
          </span>
          <span className="font-medium">Email:</span>
          <a
            href="mailto:pyaarinaari2025@gmail.com"
            className="border-b border-dashed border-[#DCCFC4] text-[#7A5C49] no-underline hover:opacity-90"
          >
            pyaarinaari2025@gmail.com
          </a>
        </div>

        {/* Phone row */}
        <div className="mx-auto my-2 inline-flex items-center gap-2 text-[16px] text-[#7A5C49]">
          <span className="inline-flex translate-y-[1px] leading-none opacity-90" aria-hidden>
            {/* phone */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1
              1 0 0 1 1.01-.24c1.11.37 2.31.57 3.58.57a1 1 0 0
              1 1 1V21a1 1 0 0 1-1 1C10.85 22 2 13.15 2
              2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.2 2.47.57
              3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z"/>
            </svg>
          </span>
          <span className="font-medium">Phone:</span>
          <a href="tel:7889187265" className="border-b border-dashed border-[#DCCFC4] text-[#7A5C49] no-underline hover:opacity-90">
            7889187265
          </a>
        </div>

        {/* Meta lines */}
        <div className="mt-4 text-[16px]">
          <div>
            <span className="opacity-80">Proprietor (Legal Owner):</span>{" "}
            <strong className="font-semibold">Rimalpreet Singh</strong>
          </div>
          <div>
            <span className="opacity-80">Brand Name:</span>{" "}
            <strong className="font-semibold">Pyaari Naari</strong>
          </div>
        </div>
      </div>

      {/* Minor spacing tweaks */}
      <style jsx global>{`
        @media (min-width: 1200px) {
          section { padding-top: 72px; }
        }
        @media (max-width: 480px) {
          .inline-flex { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
s