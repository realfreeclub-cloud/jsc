import { useState } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface LazyImageProps extends HTMLMotionProps<"img"> {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage = ({ src, alt, className = "", ...props }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blurred Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
      )}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover ${className}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
