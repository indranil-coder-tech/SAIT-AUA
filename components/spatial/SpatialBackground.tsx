"use client";

import React from "react";

export function SpatialBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-ivory">
      {/* Editorial Grid Texture */}
      <div className="absolute inset-0 bg-editorial-grid opacity-40" />

      {/* Warm Ambient Sunlight Diffusion Top Center */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[120px] opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(232, 240, 90, 0.7) 0%, rgba(158, 174, 134, 0.4) 50%, transparent 70%)",
        }}
      />

      {/* Fresh Sage ambient wash on bottom left */}
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(158, 174, 134, 0.8) 0%, transparent 70%)",
        }}
      />

      {/* Tangerine warm glow on bottom right */}
      <div
        className="absolute -bottom-[15%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(255, 129, 79, 0.7) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
