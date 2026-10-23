"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode, Copy, Check, ExternalLink } from "lucide-react";
import { SpatialCard } from "../spatial/SpatialCard";

interface QRCodeCardProps {
  customUrl?: string;
  className?: string;
}

export function QRCodeCard({ customUrl, className }: QRCodeCardProps) {
  const [url, setUrl] = useState<string>("");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [svgString, setSvgString] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Determine the active submission URL
    const appUrl =
      customUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "https://sait-quiz.vercel.app");

    const fullSubmitUrl = `${appUrl.replace(/\/$/, "")}/submit`;
    setUrl(fullSubmitUrl);

    // Generate high-contrast PNG Data URL with quiet zone margin
    QRCode.toDataURL(fullSubmitUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#050711",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error("QR PNG generation error:", err));

    // Generate SVG string for vector export
    QRCode.toString(fullSubmitUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#050711",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((res) => setSvgString(res))
      .catch((err) => console.error("QR SVG generation error:", err));
  }, [customUrl]);

  const handleDownloadPNG = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `sait-ask-us-anything-qr-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `sait-ask-us-anything-qr-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleCopyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SpatialCard glow="cyan" className={className} enableTilt={false}>
      <div className="p-6 flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <QrCode className="w-3.5 h-3.5" />
          <span>Student Submission QR</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Scan to Ask Anonymously</h3>
        <p className="text-xs text-slate-400 max-w-xs mb-5">
          Display this in your slide deck or print on tables. Points directly to the mobile submission portal.
        </p>

        {/* QR Code Container with High-Contrast White Background & Margin */}
        <div className="relative p-3.5 rounded-2xl bg-white shadow-spatial-glow border-2 border-cyan-400/30 group">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Scan to submit an anonymous question to SAIT"
              className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              Generating QR...
            </div>
          )}
        </div>

        {/* URL Display and Copy */}
        <div className="mt-4 w-full flex items-center gap-2 p-2 rounded-xl bg-midnight-900/80 border border-white/10 text-xs text-slate-300 font-mono overflow-hidden">
          <span className="truncate flex-1 text-left px-2 select-all">{url || "Loading URL..."}</span>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
            title="Copy submission link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Download Buttons */}
        <div className="mt-4 flex flex-wrap gap-2.5 w-full justify-center">
          <button
            onClick={handleDownloadPNG}
            disabled={!dataUrl}
            className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium text-xs hover:from-cyan-500 hover:to-blue-500 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            disabled={!svgString}
            className="flex-1 min-w-[130px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-midnight-800 text-cyan-200 border border-cyan-500/30 font-medium text-xs hover:bg-midnight-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>
    </SpatialCard>
  );
}
