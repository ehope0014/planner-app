"use client";

import { useState } from "react";

// Shows a photo from the public/images folder. If the photo hasn't been
// uploaded yet, a soft color block shows instead of a broken image.
export default function EventPhoto({ src, alt, className = "" }) {
  const [missing, setMissing] = useState(false);
  if (missing) return <div className={`bg-sage-100 ${className}`} aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setMissing(true)} className={`object-cover ${className}`} />
  );
}
