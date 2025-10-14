import React from "react";

const THEME = {
  brown: "#7A5C49",
  subtext: "#6B6B6B",
  heading: "#2E2E2E",
};

export default function AboutUsSplit({
  align = "left", // "left" -> text left, image right | "right" -> image left, text right
  title = "About us",
  description =
    "We celebrate the art of sarees the way it was meant to be – crafted slow, chosen rare, and made only for those who know the difference.",
  buttonText = "Get in touch",
  onButtonClick,
  imageUrl =
    "https://www.houseofmasaba.com/cdn/shop/files/Masaba100410copy.jpg?v=1720173528",
  imageAlt = "Woman in saree holding a red rose",
} = {}) {
  const isTextLeft = align === "left";

  // Make image column much wider for better image display
  const gridStyle = {
    "--col1": isTextLeft ? "1fr" : "1.5fr",
    "--col2": isTextLeft ? "1.5fr" : "1fr",
  };

  return (
    <section className="about-wrap">
      <div className="about-container">
        <div className="about-grid" style={gridStyle}>
          {/* Order depends on align prop */}
          {isTextLeft ? (
            <>
              <TextBlock
                title={title}
                description={description}
                buttonText={buttonText}
                onButtonClick={onButtonClick}
              />
              <ImageBlock imageUrl={imageUrl} imageAlt={imageAlt} />
            </>
          ) : (
            <>
              <ImageBlock imageUrl={imageUrl} imageAlt={imageAlt} />
              <TextBlock
                title={title}
                description={description}
                buttonText={buttonText}
                onButtonClick={onButtonClick}
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        .about-wrap { width: 100%; background: #fff; }
        .about-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3.5rem 1.25rem; /* 56px vertical, 20px horizontal */
        }
        @media (min-width: 640px) { .about-container { padding-left: 2rem; padding-right: 2rem; } }
        @media (min-width: 1024px) { .about-container { padding-left: 3rem; padding-right: 3rem; } }
        @media (min-width: 1280px) { .about-container { padding-left: 4rem; padding-right: 4rem; } }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr; /* mobile stack */
          align-items: center;
          justify-items: start; /* <-- keeps text hugging the left edge of its column */
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .about-grid {
            grid-template-columns: var(--col1) var(--col2); /* flips with align */
            gap: 4rem; /* balanced gap for better spacing */
            align-items: stretch; /* ensures both columns take full height */
          }
        }

        .about-text { max-width: 40rem; justify-self: start; }
        .about-heading { font-weight: 600; letter-spacing: -0.01em; font-size: 28px; line-height: 1.2; color: ${THEME.heading}; }
        @media (min-width: 768px) { .about-heading { font-size: 32px; } }
        @media (min-width: 1024px) { .about-heading { font-size: 34px; } }

        .about-desc { margin-top: 1.25rem; font-size: 16px; line-height: 2; color: ${THEME.subtext}; }
        @media (min-width: 768px) { .about-desc { font-size: 17px; } }

        .about-btn {
          margin-top: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          border: 1px solid ${THEME.brown};
          border-radius: 8px;
          background: transparent;
          color: ${THEME.brown};
          transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
          cursor: pointer;
        }
        .about-btn:hover { background-color: ${THEME.brown}; color: #fff; }

        .about-image-ratio {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4; /* taller aspect ratio for better image display */
          background: #f7f7f7;
          border-radius: 12px; /* professional rounded corners */
          overflow: hidden; /* ensure clean edges */
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* professional shadow */
          min-height: 400px; /* ensure minimum height for better display */
        }
        @media (min-width: 768px) {
          .about-image-ratio {
            min-height: 500px; /* larger on tablet and up */
          }
        }
        @media (min-width: 1024px) {
          .about-image-ratio {
            min-height: 600px; /* even larger on desktop */
          }
        }
        @supports not (aspect-ratio: 3 / 4) {
          .about-image-ratio { padding-top: 133.33%; } /* 4:3 ratio fallback */
          .about-image-ratio > img { position: absolute; inset: 0; }
        }
        .about-image-ratio img {
          width: 100%; 
          height: 100%; 
          object-fit: cover; /* ensures full image is visible without cropping */
          object-position: center; /* centers the image */
          display: block;
          transition: transform 0.3s ease; /* smooth hover effect */
        }
        .about-image-ratio:hover img {
          transform: scale(1.05); /* subtle zoom on hover */
        }
      `}</style>
    </section>
  );
}

function TextBlock({ title, description, buttonText, onButtonClick }) {
  return (
    <div className="about-text">
      <h2 className="about-heading">{title}</h2>
      <p className="about-desc">{description}</p>
      <button type="button" onClick={onButtonClick} className="about-btn">
        {buttonText}
      </button>
    </div>
  );
}

function ImageBlock({ imageUrl, imageAlt }) {
  return (
    <div className="about-image">
      <div className="about-image-ratio">
        <img src={imageUrl} alt={imageAlt} />
      </div>
    </div>
  );
}
