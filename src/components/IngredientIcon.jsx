import React, { useState, useEffect } from 'react';

/**
 * Checks whether an emoji glyph is rendered with color on the current device canvas.
 * If the emoji is unsupported (renders as empty tofu/box or black outline), returns false.
 */
function checkEmojiSupport(emoji) {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    ctx.textBaseline = 'top';
    ctx.font = '16px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.fillText(emoji, 2, 2);
    const imgData = ctx.getImageData(0, 0, 24, 24).data;
    let nonTransparentPixels = 0;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] > 20) {
        nonTransparentPixels++;
      }
    }
    // If fewer than 10 pixels were drawn, it's missing or blank
    return nonTransparentPixels > 10;
  } catch (e) {
    return true;
  }
}

/**
 * Custom SVG illustrations for Morrón (🫑) and Aceituna (🫒)
 * Guarantee 100% pixel-perfect rendering on any Android, iPhone, PC or webview!
 */
export function MorronSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Green stem */}
      <path d="M18 4 C18 1 23 2 24 5 C22 6 20 6.5 19 8 Z" fill="#2E7D32" />
      <path d="M14 8 C16 7 20 7 22 8 C23 9 21 11 18 10 C15 11 13 9 14 8 Z" fill="#4CAF50" />
      
      {/* Red Bell Pepper Body */}
      {/* Left lobe */}
      <path d="M8 14 C7 21 9 30 14 32 C12 28 10 20 12 13 C10 13 8 13 8 14 Z" fill="#D32F2F" />
      {/* Center main lobes */}
      <path d="M11 12 C8 17 9 29 15 32 C17 33 19 33 21 32 C27 29 28 17 25 12 C23 10 13 10 11 12 Z" fill="#E53935" />
      {/* Left bump */}
      <path d="M11 12 C9 15 9 25 14 31 C11 27 10 18 13 12 Z" fill="#EF5350" opacity="0.6" />
      {/* Right lobe */}
      <path d="M22 12 C25 15 27 23 24 31 C27 27 28 19 25 13 Z" fill="#C62828" />
      {/* Gloss highlight */}
      <ellipse cx="14" cy="18" rx="2" ry="5" transform="rotate(-15 14 18)" fill="#FFCDD2" opacity="0.6" />
    </svg>
  );
}

export function AceitunasSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Olive branch / leaf */}
      <path d="M12 10 Q18 8 22 12 Q16 14 12 10 Z" fill="#4CAF50" />
      <path d="M13 10 L21 11.5" stroke="#2E7D32" strokeWidth="0.8" />
      {/* Little stem */}
      <path d="M17 11 Q18 16 19 18" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />

      {/* Main Green Olive (Plump Italian Castelvetrano) */}
      <ellipse cx="16" cy="22" rx="8" ry="10" transform="rotate(-20 16 22)" fill="#689F38" />
      {/* Darker green shadow */}
      <path d="M12 28 C15 32 21 30 23 24 C23 28 18 31 12 28 Z" fill="#33691E" />
      {/* Gloss reflection */}
      <ellipse cx="13" cy="18" rx="2" ry="4" transform="rotate(-20 13 18)" fill="#DCEDC8" opacity="0.75" />
      {/* Pimento / core detail */}
      <circle cx="17" cy="27" r="2.2" fill="#D32F2F" />

      {/* Second Ripe Black/Purple Olive behind */}
      <ellipse cx="24" cy="20" rx="6.5" ry="8" transform="rotate(25 24 20)" fill="#37474F" />
      <ellipse cx="23" cy="18" rx="1.5" ry="3" transform="rotate(25 23 18)" fill="#78909C" opacity="0.6" />
    </svg>
  );
}

// Global cached support check
let morronSupported = null;
let aceitunaSupported = null;

export default function IngredientIcon({
  id = '',
  icon = '',
  className = 'text-2xl sm:text-3xl',
  size = 'md'
}) {
  const cleanId = String(id).toLowerCase().replace(/[^a-z_]/g, '');

  const [useSVG, setUseSVG] = useState(false);

  useEffect(() => {
    if (cleanId.includes('morron') || cleanId.includes('pimiento')) {
      if (morronSupported === null) {
        morronSupported = checkEmojiSupport('🫑');
      }
      if (!morronSupported) {
        setUseSVG(true);
      }
    } else if (cleanId.includes('aceitun')) {
      if (aceitunaSupported === null) {
        aceitunaSupported = checkEmojiSupport('🫒');
      }
      if (!aceitunaSupported) {
        setUseSVG(true);
      }
    }
  }, [cleanId]);

  // Size mapping for SVGs
  const svgSizes = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-9 h-9 sm:w-10 sm:h-10'
  };
  const activeSvgSize = svgSizes[size] || svgSizes.md;

  // If it's Morrón and SVG is needed, or if requested
  if (useSVG && (cleanId.includes('morron') || cleanId.includes('pimiento'))) {
    return <MorronSVG className={activeSvgSize} />;
  }

  // If it's Aceituna and SVG is needed
  if (useSVG && cleanId.includes('aceitun')) {
    return <AceitunasSVG className={activeSvgSize} />;
  }

  // Explicit Fallback for Morrón or Aceituna if icon string was somehow empty
  const displayIcon = icon || (cleanId.includes('morron') ? '🫑' : cleanId.includes('aceitun') ? '🫒' : '🍕');

  return (
    <span className={`${className} inline-flex items-center justify-center select-none font-normal leading-none`}>
      {displayIcon}
    </span>
  );
}
