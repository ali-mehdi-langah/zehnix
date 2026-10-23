"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Brain, ClipboardCheck, HeartHandshake } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Brain,
    title: "Personalized learning",
    description:
      "Practice with quizzes designed around individual learning needs and progress.",
  },
  {
    icon: ClipboardCheck,
    title: "Smart assessment",
    description:
      "Evaluate short answers automatically and provide meaningful feedback.",
  },
  {
    icon: HeartHandshake,
    title: "Student support",
    description:
      "Identify early signs of learning difficulties so educators can offer timely support.",
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        headingRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      )
        .fromTo(
          paragraphRef.current,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.4"
        )
        .fromTo(
          cardsRef.current ? Array.from(cardsRef.current.children) : [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
          "-=0.3"
        );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative z-10 pt-10 pb-16 md:pt-14 md:pb-24 px-6 sm:px-10 lg:px-16"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-start">
          {/* Heading */}
          <div className="lg:col-span-4">
            <h2
              ref={headingRef}
              className="text-3xl sm:text-4xl font-semibold text-[#15254B] tracking-[-0.02em] leading-[1.15]"
            >
              Why choose
              <span className="block text-[#15254B]/45">Zehnix?</span>
            </h2>
            <p
              ref={paragraphRef}
              className="text-sm sm:text-base text-[#15254B]/60 mt-4 leading-relaxed max-w-sm"
            >
              Every student learns differently. Zehnix uses intelligent
              learning tools to make education more personalized, accessible,
              and supportive.
            </p>
          </div>

          {/* Features */}
          <div
            ref={cardsRef}
            className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex flex-col items-start text-left border-t border-[#15254B]/10 pt-6"
                >
                  <div className="mb-5 w-11 h-11 rounded-xl bg-[#5D91F5]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#5D91F5]" strokeWidth={1.75} />
                  </div>

                  <h3 className="text-base font-semibold text-[#15254B] mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#15254B]/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}