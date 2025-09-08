"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;
      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

  return (
    <section className="w-full pt-30 md:pt-48 pb-10">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Heading + Subtitle */}
        <div>
          <h1 className="text-4xl md:text-8xl font-bold tracking-tight mb-6 gradient-titel">
            Your AI Career Coach for
            <br /> Professional Success
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <Link href="/dashboard">
            <Button size="lg" className="px-8" aria-label="Get Started with AI Career Coach">
              Get Started
            </Button>
          </Link>
          <Link href="https://www.youtube.com/roadsidecoder" target="_blank">
            <Button size="lg" className="px-8" variant="outline" aria-label="Watch Demo Video">
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* Banner */}
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div
            ref={imageRef}
            className="hero-image "
          >
            <Image
              src="/banner.jpeg"
              alt="AI Career Coach Banner"
              width={1280}
              height={800}
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
