'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export default function ResponsiveImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);
  const fallbackSrc = '/images/1.png'; // Default fallback image

  const handleError = () => {
    if (src !== fallbackSrc) {
      setError(true);
    }
  };

  return (
    <Image
      src={error ? fallbackSrc : src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={handleError}
    />
  );
}