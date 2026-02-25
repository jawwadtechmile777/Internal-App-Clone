"use client";

interface ScreenshotPreviewProps {
  url: string | null;
  alt?: string;
  className?: string;
}

export function ScreenshotPreview({ url, alt = "Payment proof", className = "" }: ScreenshotPreviewProps) {
  if (!url) {
    return (
      <div className={`flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-600 bg-slate-800/50 text-gray-500 ${className}`}>
        No screenshot
      </div>
    );
  }
  return (
    <div className={`overflow-hidden rounded-lg border border-gray-700 ${className}`}>
      <a href={url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded">
        <img src={url} alt={alt} className="max-h-64 w-full object-contain" />
      </a>
    </div>
  );
}
