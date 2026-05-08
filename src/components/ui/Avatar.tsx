'use client';

import { useState } from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export default function Avatar({ src, alt, size = 32, className = '' }: AvatarProps) {
  const [error, setError] = useState(false);

  const px = `${size}px`;
  const fontSize = size <= 20 ? '10px' : size <= 28 ? '12px' : '14px';

  if (error || !src) {
    return (
      <div
        style={{ width: px, height: px, fontSize }}
        className={`rounded-full bg-gray-300 flex items-center justify-center text-gray-500 font-medium flex-shrink-0 ${className}`}
        title={alt}
      >
        {alt.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: px, height: px }}
      className={`rounded-full object-cover flex-shrink-0 ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
