"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Navbar from "@/components/landing/navbar";

gsap.registerPlugin(ScrollTrigger);

const team = [
  { name: "Vishal Dewani", initials: "VD" },
  { name: "Ali Mehdi", initials: "AM" },
  { name: "Abdul Hameed", initials: "AH" },
];

const principles = [
  {
    title: "Personal",
    text: "Quizzes adapt to what each student already knows and what they still find difficult.",
  },
  {
    title: "Local",
    text: "A tutor that explains in English, Urdu, Sindhi, and Pashto, so language is never the barrier.",
  },
  {
    title: "Supportive",
    text: "Teachers see which students are falling behind early, and can reach out in time.",
  },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) return;

      gsap.fromTo(
        ".about-reveal",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="about-us"
      ref={sectionRef}
      className="relative z-10 py-16 md:py-24 px-6 sm:px-10 lg:px-16"
    >
        <Navbar />
      <div className="max-w-6xl mx-auto">
        {/* Intro */}
        <div className="max-w-2xl">
          <p className="about-reveal text-sm font-medium text-[#5D91F5] mb-3">
            About us
          </p>
          <h2 className="about-reveal text-3xl sm:text-4xl font-semibold text-[#15254B] tracking-[-0.02em] leading-[1.15] text-balance">
            Built so every student gets the support they need.
          </h2>
          <p className="about-reveal text-sm sm:text-base text-[#15254B]/60 mt-5 leading-relaxed">
            Zehnix is an education platform that combines personalized
            quizzes, automatic grading of short answers, and a multilingual
            tutor. Teachers also get an early-warning view of students who may
            be at risk of dropping out. Our goal is simple: make learning more
            personal, accessible, and supportive for students everywhere.
          </p>
        </div>

        {/* Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 mt-14">
          {principles.map((p) => (
            <div
              key={p.title}
              className="about-reveal border-t border-[#15254B]/10 pt-6"
            >
              <h3 className="text-base font-semibold text-[#15254B] mb-2 tracking-tight">
                {p.title}
              </h3>
              <p className="text-sm text-[#15254B]/60 leading-relaxed">
                {p.text}
              </p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="mt-16 md:mt-20">
          <p className="about-reveal text-sm font-medium text-[#5D91F5] mb-3">
            The team
          </p>
          <h3 className="about-reveal text-2xl sm:text-3xl font-semibold text-[#15254B] tracking-[-0.02em]">
            Created by
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="about-reveal flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                <div
                  className="w-12 h-12 shrink-0 rounded-full bg-[#5D91F5]/10 text-[#5D91F5] flex items-center justify-center text-sm font-semibold"
                  aria-hidden="true"
                >
                  {member.initials}
                </div>
                <p className="text-base font-semibold text-[#15254B] tracking-tight">
                  {member.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}