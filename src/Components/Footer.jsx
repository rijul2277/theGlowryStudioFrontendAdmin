'use client';
// components/FooterElegant.js
import React from "react";
import Image from "next/image";

const THEME = {
  bg: "#D8CDC5",      // warm beige background like your screenshot
  text: "#7A5C49",    // elegant brown for text/icons
  border: "#CDBFB6",  // subtle divider/border line
  placeholder: "#9F8E84",
};

export default function FooterElegant({
  year = new Date().getFullYear(),
  brand = "Pyaari Naari",
  proprietor = "Rimalpreet Singh",
  instagramHref = "#",
  paymentLogos = [
    { alt: "Paytm",     src: "https://upload.wikimedia.org/wikipedia/commons/5/53/Paytm_Logo_%282019%29.svg", w: 60, h: 22 },
    { alt: "Google Pay",src: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Pay_Logo.svg",        w: 54, h: 22 },
    { alt: "Mastercard",src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",        w: 44, h: 28 },
    { alt: "PhonePe",   src: "https://upload.wikimedia.org/wikipedia/commons/9/9d/PhonePe_Logo.svg",           w: 54, h: 22 },
    { alt: "UPI",       src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg",        w: 46, h: 20 },
  ],
  legalLinks = [
    { label: "Privacy policy", href: "#" },
    { label: "Refund policy", href: "#" },
    { label: "Contact information", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Shipping policy", href: "#" },
  ],
}) {
  return (
    <footer className="pn-footer">
      <div className="pn-container">
        {/* Row: payments (left), copyright (center), social (right) */}
        <div className="pn-top">
          <div className="pn-payments">
            {paymentLogos.map((p) => (
              <span key={p.alt} className="pn-pay">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  style={{ objectFit: "contain" }}
                />
              </span>
            ))}
          </div>

          <div className="pn-copy">
            © {year} {brand} | Proprietorship of{" "}
            <strong className="pn-strong">{proprietor}</strong>
          </div>

          <div className="pn-social">
            <a href={instagramHref} aria-label="Instagram" className="pn-ig">
              {/* Minimal brown outlined Instagram glyph */}
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.2" fill="none" stroke="currentColor" strokeWidth="1.4"/>
                <circle cx="17.7" cy="6.3" r="1.2" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="pn-divider" />

        {/* Newsletter */}
        <div className="pn-news">
          <h4 className="pn-news-title">Subscribe to our newsletter</h4>
          <form className="pn-input-wrap" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Email"
              className="pn-input"
              aria-label="Email"
            />
            <button type="submit" className="pn-arrow" aria-label="Submit email">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M5 12h12M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>

        <div className="pn-divider" />

        {/* Bottom legal row */}
        <div className="pn-bottom">
          <div className="pn-legal">
            <span>© {year}, {brand} </span>
            <span className="pn-sep">·</span>
            <span>Powered by Shopify</span>
            {legalLinks.map((l, i) => (
              <span key={l.label}>
                <span className="pn-sep">·</span>
                <a href={l.href}>{l.label}</a>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style jsx>{`
        .pn-footer {
          background: ${THEME.bg};
          color: ${THEME.text};
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji",
            "Segoe UI Emoji";
        }
        .pn-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px 34px;
        }

        /* Top row */
        .pn-top {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
        }
        .pn-payments {
          display: flex;
          align-items: center;
          gap: 18px;
          opacity: 0.95;
        }
        .pn-pay :global(img) {
          filter: saturate(0.9) contrast(0.95);
        }
        .pn-copy {
          text-align: center;
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.95;
        }
        .pn-strong {
          font-weight: 700;
        }
        .pn-social {
          display: flex;
          justify-content: flex-end;
        }
        .pn-ig {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          color: ${THEME.text};
          transition: opacity 140ms ease;
        }
        .pn-ig:hover { opacity: 0.75; }

        .pn-divider {
          height: 1px;
          background: ${THEME.border};
          margin: 18px 0 22px;
          opacity: 0.65;
        }

        /* Newsletter */
        .pn-news-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 14px;
          opacity: 0.95;
        }
        .pn-news {
          max-width: 560px;
        }
        .pn-input-wrap {
          position: relative;
          width: 100%;
        }
        .pn-input {
          width: 100%;
          height: 46px;
          border: 1px solid ${THEME.text};
          border-radius: 6px;
          background: transparent;
          outline: none;
          padding: 0 48px 0 16px;
          color: ${THEME.text};
          font-size: 15px;
        }
        .pn-input::placeholder {
          color: ${THEME.placeholder};
        }
        .pn-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          color: ${THEME.text};
          border: 0;
          cursor: pointer;
          transition: opacity 140ms ease;
        }
        .pn-arrow:hover { opacity: 0.75; }

        /* Bottom */
        .pn-bottom { margin-top: 10px; }
        .pn-legal {
          text-align: center;
          font-size: 13.5px;
          line-height: 2;
          opacity: 0.95;
        }
        .pn-legal a {
          color: ${THEME.text};
          text-decoration: none;
        }
        .pn-legal a:hover { text-decoration: underline; }
        .pn-sep {
          margin: 0 8px;
          opacity: 0.6;
        }

        @media (max-width: 860px) {
          .pn-top {
            grid-template-columns: 1fr;
            row-gap: 10px;
          }
          .pn-copy { text-align: left; }
          .pn-social { justify-content: flex-start; }
        }
      `}</style>
    </footer>
  );
}
