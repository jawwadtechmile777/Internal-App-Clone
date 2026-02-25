"use client";

interface ScreenshotPreviewProps {
  url: string | null;
  alt?: string;
  className?: string;
}

export function ScreenshotPreview({ url, alt = "Payment proof", className = "" }: ScreenshotPreviewProps) {
  if (!url) {
    return (
      <div className={`flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500 ${className}`}>
        No screenshot
      </div>
    );
  }
  return (
    <div className={`overflow-hidden rounded-lg border border-slate-200 ${className}`}>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <img src={url} alt={alt} className="max-h-64 w-full object-contain" />
      </a>
    </div>
  );
}
