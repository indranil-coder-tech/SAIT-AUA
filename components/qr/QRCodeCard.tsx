"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode, Copy, Check, ExternalLink } from "lucide-react";

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
    const appUrl =
      customUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "https://sait-quiz.vercel.app");

    const fullSubmitUrl = `${appUrl.replace(/\/$/, "")}/submit`;
    setUrl(fullSubmitUrl);

    // High-contrast QR with solid margin
    QRCode.toDataURL(fullSubmitUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#20231E",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    })
      .then((res) => setDataUrl(res))
      .catch((err) => console.error("QR PNG generation error:", err));

    QRCode.toString(fullSubmitUrl, {
      type: "svg",
      margin: 2,
      color: {
        dark: "#20231E",
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
    <div className={`editorial-box rounded-3xl p-6 bg-white ${className || ""}`}>
      <div className="flex flex-col items-center text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-citrus text-charcoal border border-charcoal text-[11px] font-mono font-bold uppercase tracking-wider mb-3">
          <QrCode className="w-3.5 h-3.5" />
          <span>STUDENT SUBMISSION QR</span>
        </div>

        <h3 className="font-display text-3xl font-black text-charcoal mb-1">
          SCAN TO ASK ANONYMOUSLY
        </h3>
        <p className="text-xs font-mono text-charcoal/70 max-w-xs mb-5">
          Display in presentation slides or print on table slips for incoming first-years.
        </p>

        {/* QR Code Container */}
        <div className="p-4 rounded-2xl bg-white border-3 border-charcoal shadow-editorial-sm">
          {dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dataUrl}
              alt="Scan to submit an anonymous question to SAIT"
              className="w-56 h-56 sm:w-60 sm:h-60 object-contain rounded-lg"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center font-mono text-xs text-charcoal/60">
              Generating QR...
            </div>
          )}
        </div>

        {/* URL Box */}
        <div className="mt-4 w-full flex items-center gap-2 p-2 rounded-xl bg-ivory border-2 border-charcoal font-mono text-xs text-charcoal overflow-hidden">
          <span className="truncate flex-1 text-left px-2 font-medium">{url || "Loading..."}</span>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg bg-white hover:bg-citrus border border-charcoal transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg bg-white hover:bg-citrus border border-charcoal transition-colors"
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
            className="btn-editorial-tangerine flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={handleDownloadSVG}
            disabled={!svgString}
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl bg-ivory hover:bg-citrus/40 border-2 border-charcoal text-charcoal text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
