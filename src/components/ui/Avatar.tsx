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

  const sizeClass = size <= 24 ? 'w-6 h-6' : size <= 32 ? 'w-8 h-8' : 'w-10 h-10';

  if (error || !src) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-medium flex-shrink-0 ${className}`}
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
      className={`${sizeClass} rounded-full object-cover flex-shrink-0 ${className}`}
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
