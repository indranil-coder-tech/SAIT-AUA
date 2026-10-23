"use client";

import React, { useRef, useState, useEffect } from "react";

export function Sculptural3DQuestion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(-5);
  const [rotateY, setRotateY] = useState(12);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center of object
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Subtle, controlled tilt between -18deg and +18deg
      setRotateY(Math.max(-18, Math.min(18, deltaX * 18)));
      setRotateX(Math.max(-14, Math.min(14, -deltaY * 14)));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[480px] lg:max-w-[540px] aspect-square flex items-center justify-center perspective-1200 preserve-3d select-none"
    >
      {/* Dynamic 3D Physical Object Container */}
      <div
        className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Deep Dimensional Ground Shadow */}
        <div
          className="absolute -bottom-8 w-3/4 h-14 rounded-full bg-charcoal/20 blur-xl preserve-3d"
          style={{ transform: "rotateX(90deg) translateZ(-160px)" }}
        />

        {/* ================= BACK SURFACE LAYER (Deep Olive / Extrusion Base) ================= */}
        <div
          className="absolute w-72 h-88 sm:w-80 sm:h-96 rounded-3xl bg-olive border-4 border-charcoal preserve-3d shadow-2xl"
          style={{
            transform: "translateZ(-40px) rotate(-6deg)",
          }}
        />

        {/* ================= MID-LAYER CARD (Fresh Sage Layer with Editorial Grid) ================= */}
        <div
          className="absolute w-72 h-88 sm:w-80 sm:h-96 rounded-3xl bg-sage border-4 border-charcoal preserve-3d shadow-editorial-lg p-6 flex flex-col justify-between overflow-hidden"
          style={{
            transform: "translateZ(-15px) rotate(-2deg)",
          }}
        >
          {/* Subtle Grid Accent */}
          <div className="absolute inset-0 bg-editorial-grid opacity-30 pointer-events-none" />

          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-charcoal font-bold z-10">
            <span>SAIT · GIM 2025</span>
            <span className="px-2 py-0.5 rounded-full bg-citrus text-charcoal text-[10px] border border-charcoal">
              AUA VOL. 01
            </span>
          </div>

          <div className="z-10 my-auto text-center opacity-10">
            <span className="font-display text-8xl font-black text-charcoal">SAIT</span>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-charcoal/80 z-10 pt-4 border-t border-charcoal/20">
            <span>NO LOGS · NO NAMES</span>
            <span>100% PRIVATE</span>
          </div>
        </div>

        {/* ================= FOREGROUND HERO 3D SCULPTURAL QUESTION MARK ================= */}
        <div
          className="relative z-20 preserve-3d flex items-center justify-center transition-transform duration-500"
          style={{
            transform: `translateZ(45px) ${isHovered ? "scale(1.05)" : "scale(1)"}`,
          }}
        >
          {/* Layered Physical Question Mark Silhouette */}
          <div className="relative preserve-3d">
            {/* 3D Extrusion Depth Layer (Charcoal Solid Shadow Face) */}
            <svg
              className="w-56 h-72 sm:w-64 sm:h-80 drop-shadow-editorial-lg text-charcoal absolute top-2 left-2"
              viewBox="0 0 200 250"
              fill="currentColor"
              style={{ transform: "translateZ(-12px)" }}
            >
              <path d="M75,35 C75,15 95,5 125,5 C155,5 175,20 175,50 C175,75 155,90 135,105 C118,118 112,130 112,150 L88,150 C88,122 98,106 118,92 C135,80 148,68 148,50 C148,32 138,25 125,25 C108,25 98,35 98,52 L75,35 Z M100,185 C112,185 122,195 122,207 C122,219 112,229 100,229 C88,229 78,219 78,207 C78,195 88,185 100,185 Z" />
            </svg>

            {/* Main Front Matte Ivory Sculptural Question Mark */}
            <svg
              className="w-56 h-72 sm:w-64 sm:h-80 text-ivory drop-shadow-sm"
              viewBox="0 0 200 250"
              fill="currentColor"
              stroke="#20231E"
              strokeWidth="7"
              strokeLinejoin="round"
              style={{ transform: "translateZ(10px)" }}
            >
              <path d="M75,35 C75,15 95,5 125,5 C155,5 175,20 175,50 C175,75 155,90 135,105 C118,118 112,130 112,150 L88,150 C88,122 98,106 118,92 C135,80 148,68 148,50 C148,32 138,25 125,25 C108,25 98,35 98,52 L75,35 Z M100,185 C112,185 122,195 122,207 C122,219 112,229 100,229 C88,229 78,219 78,207 C78,195 88,185 100,185 Z" />
            </svg>

            {/* Vivid Citrus Crown Accent Dot on Question Mark */}
            <div
              className="absolute bottom-2 left-[5.4rem] sm:left-[6.2rem] w-8 h-8 rounded-full bg-citrus border-3 border-charcoal preserve-3d shadow-editorial animate-pulse"
              style={{ transform: "translateZ(20px)" }}
            />
          </div>
        </div>

        {/* ================= ORBITING 3D EDITORIAL TOPIC BADGES ================= */}
        {/* 1. Tangerine Badge: "ZERO REGRETS" (Top Left) */}
        <div
          className="absolute -top-4 -left-4 sm:top-2 sm:-left-6 px-3.5 py-1.5 rounded-full bg-tangerine text-charcoal border-2 border-charcoal font-mono text-[11px] font-extrabold uppercase shadow-editorial-sm preserve-3d transition-transform hover:scale-105"
          style={{ transform: "translateZ(65px) rotate(-8deg)" }}
        >
          <span>💬 ZERO AWKWARDNESS</span>
        </div>

        {/* 2. Vivid Citrus Badge: "ASK ANYTHING" (Bottom Left) */}
        <div
          className="absolute bottom-10 -left-6 sm:bottom-12 sm:-left-8 px-4 py-2 rounded-xl bg-citrus text-charcoal border-2 border-charcoal font-mono text-xs font-black uppercase shadow-editorial preserve-3d"
          style={{ transform: "translateZ(80px) rotate(6deg)" }}
        >
          <span>⚡ LIVE & UNFILTERED</span>
        </div>

        {/* 3. Warm Ivory Speech Tag: "HONEST SENIORS" (Top Right) */}
        <div
          className="absolute top-8 -right-4 sm:top-12 sm:-right-8 px-3.5 py-2 rounded-xl bg-ivory text-charcoal border-2 border-charcoal font-mono text-[11px] font-bold uppercase shadow-editorial preserve-3d"
          style={{ transform: "translateZ(70px) rotate(5deg)" }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>PROJECTOR READY</span>
          </div>
        </div>

        {/* 4. Deep Olive Pill: "STUDENT FORUM" (Bottom Right) */}
        <div
          className="absolute -bottom-2 right-2 sm:bottom-4 sm:-right-4 px-3.5 py-1.5 rounded-full bg-olive text-white border-2 border-charcoal font-mono text-[11px] font-bold uppercase shadow-editorial preserve-3d"
          style={{ transform: "translateZ(55px) rotate(-4deg)" }}
        >
          <span>🎯 IT DEPARTMENT</span>
        </div>
      </div>
    </div>
  );
}
