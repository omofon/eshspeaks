"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Editorial image panel for the auth split-card (see AuthShell).
 * One illustration at a time inside a fixed 360px-tall centred container,
 * auto-advancing every 3s, with subtle dot pagination. Image-only bar the
 * tiny masthead labels.
 */
const SLIDES = [
  {
    src: "/images/man-coffee-newspaper.png",
    alt: "A reader with the morning newspaper and coffee",
  },
  {
    src: "/images/woman-standing-headphone.png",
    alt: "A listener following the day's news on headphones",
  },
  {
    src: "/images/man-using-phone.png",
    alt: "A reader catching up on the news on a phone",
  },
] as const;

const ROTATE_MS = 3000;

export function AuthGallery() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % SLIDES.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="auth-gallery relative flex min-h-[360px] items-center justify-center overflow-hidden bg-gallery px-6 py-16 sm:px-10 md:min-h-[640px]"
      aria-label="Editorial illustrations"
    >
      <div className="gallery-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Tiny masthead labels — the only text permitted over the image. */}
      {/* <div className="pointer-events-none absolute inset-x-5 top-5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45 sm:inset-x-8 sm:top-8">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-peach" /> EshSpeaks
        </span>
        <span>Vol. 01 / 2026</span>
      </div> */}

      {/* Fixed 360px-tall, horizontally centred image container. */}
      <div className="relative mx-auto h-[360px] w-full max-w-[420px]">
        {SLIDES.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="420px"
            priority={index === 0}
            className={`auth-illustration object-contain transition-opacity duration-700 ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={index !== active}
          />
        ))}
      </div>

      {/* Pagination — no numbering. */}
      <div
        className="absolute bottom-6 left-5 flex items-center gap-2 sm:bottom-8 sm:left-8"
        aria-label="Illustration carousel progress"
      >
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show illustration ${index + 1}`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              index === active ? "w-8 bg-ink" : "w-1.5 bg-ink/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default AuthGallery;
