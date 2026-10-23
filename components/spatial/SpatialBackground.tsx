"use client";

import React from "react";

export function SpatialBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-midnight-950">
      {/* Perspective Spatial Grid */}
      <div className="absolute inset-0 spatial-grid opacity-60" />

      {/* Ambient Radial Lighting Cones */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[140px] opacity-25 animate-pulse-subtle"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 70%)",
        }}
      />

      {/* Floating secondary ambient light - bottom left cyan */}
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.7) 0%, transparent 70%)",
        }}
      />

      {/* Floating secondary ambient light - bottom right electric violet */}
      <div
        className="absolute -bottom-[15%] -right-[10%] w-[650px] h-[650px] rounded-full blur-[150px] opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%)",
        }}
      />

      {/* Floating 3D Depth Geometries (subtle, non-distracting) */}
      <div className="absolute top-24 left-[8%] w-16 h-16 rounded-2xl border border-violet-500/20 bg-violet-500/5 rotate-12 blur-[1px] animate-float-slow hidden md:block" />
      <div
        className="absolute bottom-32 right-[10%] w-20 h-20 rounded-full border border-cyan-500/20 bg-cyan-500/5 -rotate-6 blur-[1px] animate-float-slow hidden md:block"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
}
