"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import FloatingLabels from "./floating-labels";

gsap.registerPlugin(useGSAP);

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(
        headingRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      )
        .fromTo(
          paragraphRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.45"
        )
        .fromTo(
          buttonsRef.current ? buttonsRef.current.children : [],
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          "-=0.4"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative z-10 pt-32 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24 px-4 flex flex-col items-center justify-center min-h-[520px]"
    >
      {/* Desktop Floating Labels (absolute positioned, hidden on mobile) */}
      <FloatingLabels desktopOnly />

      <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Main Heading */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-semibold text-[#15254B] tracking-[-0.03em] leading-[1.1] text-balance"
        >
          Learning that thinks about you.
        </h1>

        {/* Supporting Paragraph */}
        <p
          ref={paragraphRef}
          className="text-base sm:text-lg text-[#15254B]/60 max-w-xl mx-auto mt-6 leading-relaxed text-balance"
        >
          Personalized quizzes, intelligent assessments, and AI-powered
          tutoring designed to help every student learn in their own way.
        </p>

        {/* CTA Buttons */}
        <div
          ref={buttonsRef}
          className="flex flex-row flex-wrap items-center justify-center gap-3 mt-10"
        >
          <a
            href="/register"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#15254B] text-white text-sm font-medium hover:bg-[#15254B]/90 active:scale-[0.98] transition-all duration-200"
          >
            <span>Start learning</span>
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>

          <a
            href="#features"
            className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium text-[#15254B] border border-[#15254B]/15 hover:border-[#15254B]/40 hover:bg-white/60 active:scale-[0.98] transition-all duration-200"
          >
            Explore features
          </a>
        </div>

        {/* Mobile Floating Pills (shown below buttons on small screens) */}
        <FloatingLabels mobileOnly />
      </div>
    </section>
  );
}