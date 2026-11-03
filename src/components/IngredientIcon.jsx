import React, { useState, useEffect } from 'react';

/**
 * Paleta oficial de colores de ingredientes requerida:
 * - Aceituna: dark green #235E35
 * - Morrón: red #D93636
 * - Mozzarella: light yellow #F6D365
 * - Jamón: pink #F29CA3
 * - Champiñón: brown #8B5A2B
 * - Cebolla: light violet #B794F4
 * - Albahaca: green #27864B
 * - Tomate: red #E53E3E
 * - Choclo: yellow #ECC94B
 * - Panceta: reddish brown #9B2C2C
 * - Ananá: yellow #D69E2E
 * - Pepperoni: red #DC2626
 */
export const INGREDIENT_COLORS = {
  aceitunas: '#235E35',
  aceituna: '#235E35',
  morron: '#D93636',
  morrones: '#D93636',
  pimiento: '#D93636',
  mozzarella: '#F6D365',
  queso: '#F6D365',
  jamon: '#F29CA3',
  champinones: '#8B5A2B',
  champinon: '#8B5A2B',
  cebolla: '#B794F4',
  albahaca: '#27864B',
  tomate: '#E53E3E',
  choclo: '#ECC94B',
  panceta: '#9B2C2C',
  anana: '#D69E2E',
  pepperoni: '#DC2626',
  peperoni: '#DC2626',
  oregano: '#27864B',
  salsa_tomate: '#E53E3E',
  masa: '#F3E5CC'
};

export const INGREDIENT_NAMES = {
  aceitunas: 'Aceitunas',
  morron: 'Morrón',
  mozzarella: 'Mozzarella',
  jamon: 'Jamón',
  champinones: 'Champiñones',
  cebolla: 'Cebolla',
  albahaca: 'Albahaca',
  tomate: 'Tomate',
  choclo: 'Choclo',
  panceta: 'Panceta',
  anana: 'Ananá',
  pepperoni: 'Pepperoni',
  oregano: 'Orégano',
  salsa_tomate: 'Salsa Tomate',
  masa: 'Masa'
};

export function getIngredientColor(id) {
  const cleanId = String(id || '').toLowerCase().replace(/[^a-z_]/g, '');
  for (const [key, color] of Object.entries(INGREDIENT_COLORS)) {
    if (cleanId.includes(key) || key.includes(cleanId)) return color;
  }
  return '#27864B';
}

/**
 * Checks whether an emoji glyph is rendered with color on the current device canvas.
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
    return nonTransparentPixels > 10;
  } catch (e) {
    return true;
  }
}

/**
 * Custom SVG illustrations ensuring 100% pixel-perfect rendering across platforms
 */
export function MorronSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 4 C18 1 23 2 24 5 C22 6 20 6.5 19 8 Z" fill="#235E35" />
      <path d="M14 8 C16 7 20 7 22 8 C23 9 21 11 18 10 C15 11 13 9 14 8 Z" fill="#27864B" />
      <path d="M8 14 C7 21 9 30 14 32 C12 28 10 20 12 13 C10 13 8 13 8 14 Z" fill="#B91C1C" />
      <path d="M11 12 C8 17 9 29 15 32 C17 33 19 33 21 32 C27 29 28 17 25 12 C23 10 13 10 11 12 Z" fill="#D93636" />
      <path d="M11 12 C9 15 9 25 14 31 C11 27 10 18 13 12 Z" fill="#EF4444" opacity="0.6" />
      <path d="M22 12 C25 15 27 23 24 31 C27 27 28 19 25 13 Z" fill="#991B1B" />
      <ellipse cx="14" cy="18" rx="2" ry="5" transform="rotate(-15 14 18)" fill="#FEE2E2" opacity="0.6" />
    </svg>
  );
}

export function AceitunasSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 10 Q18 8 22 12 Q16 14 12 10 Z" fill="#27864B" />
      <path d="M17 11 Q18 16 19 18" stroke="#5D4037" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="16" cy="22" rx="8" ry="10" transform="rotate(-20 16 22)" fill="#235E35" />
      <path d="M12 28 C15 32 21 30 23 24 C23 28 18 31 12 28 Z" fill="#143820" />
      <ellipse cx="13" cy="18" rx="2" ry="4" transform="rotate(-20 13 18)" fill="#86EFAC" opacity="0.75" />
      <circle cx="17" cy="27" r="2.2" fill="#D93636" />
      <ellipse cx="24" cy="20" rx="6.5" ry="8" transform="rotate(25 24 20)" fill="#1F2937" />
      <ellipse cx="23" cy="18" rx="1.5" ry="3" transform="rotate(25 23 18)" fill="#9CA3AF" opacity="0.6" />
    </svg>
  );
}

export function MozzarellaSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="18" cy="20" rx="13" ry="10" fill="#F6D365" />
      <ellipse cx="18" cy="16" rx="11" ry="8" fill="#FDE68A" />
      <ellipse cx="16" cy="14" rx="3" ry="1.5" fill="#FEF3C7" opacity="0.8" />
      <circle cx="13" cy="19" r="1.8" fill="#D97706" opacity="0.3" />
      <circle cx="22" cy="18" r="2" fill="#D97706" opacity="0.3" />
    </svg>
  );
}

export function ChampinonSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 20 L15 30 Q18 32 21 30 L21 20 Z" fill="#E7E5E4" />
      <path d="M7 20 C7 10 29 10 29 20 C29 23 7 23 7 20 Z" fill="#8B5A2B" />
      <path d="M10 18 C11 12 25 12 26 18 Z" fill="#A16207" opacity="0.3" />
      <circle cx="13" cy="16" r="1.5" fill="#FEF08A" opacity="0.7" />
      <circle cx="21" cy="15" r="1.8" fill="#FEF08A" opacity="0.7" />
    </svg>
  );
}

export function AlbahacaSVG({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 36 36" className={`${className} inline-block select-none`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6 C26 9 27 22 18 30 C9 22 10 9 18 6 Z" fill="#27864B" />
      <path d="M18 8 L18 28" stroke="#14532D" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 14 Q22 16 23 18" stroke="#14532D" strokeWidth="1" strokeLinecap="round" />
      <path d="M18 19 Q14 21 13 23" stroke="#14532D" strokeWidth="1" strokeLinecap="round" />
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
  size = 'md',
  showDot = false,
  showBadge = false
}) {
  const cleanId = String(id || '').toLowerCase().replace(/[^a-z_]/g, '');
  const [useSVG, setUseSVG] = useState(false);

  useEffect(() => {
    if (cleanId.includes('morron') || cleanId.includes('pimiento')) {
      if (morronSupported === null) {
        morronSupported = checkEmojiSupport('🫑');
      }
      if (!morronSupported) setUseSVG(true);
    } else if (cleanId.includes('aceitun')) {
      if (aceitunaSupported === null) {
        aceitunaSupported = checkEmojiSupport('🫒');
      }
      if (!aceitunaSupported) setUseSVG(true);
    }
  }, [cleanId]);

  const svgSizes = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
    xl: 'w-14 h-14 sm:w-16 sm:h-16'
  };
  const activeSvgSize = svgSizes[size] || svgSizes.md;
  const ingColor = getIngredientColor(cleanId);

  // Render SVG when requested or fallback triggered
  let content = null;
  if (useSVG || cleanId.includes('morron') || cleanId.includes('pimiento')) {
    content = <MorronSVG className={activeSvgSize} />;
  } else if (useSVG || cleanId.includes('aceitun')) {
    content = <AceitunasSVG className={activeSvgSize} />;
  } else if (cleanId.includes('mozzarella') || cleanId.includes('queso')) {
    content = <MozzarellaSVG className={activeSvgSize} />;
  } else if (cleanId.includes('champinon')) {
    content = <ChampinonSVG className={activeSvgSize} />;
  } else if (cleanId.includes('albahaca')) {
    content = <AlbahacaSVG className={activeSvgSize} />;
  } else {
    const displayIcon = icon || '🍕';
    content = (
      <span className={`${className} inline-flex items-center justify-center select-none font-normal leading-none`}>
        {displayIcon}
      </span>
    );
  }

  if (showBadge) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white border border-[#EADBCE] shadow-2xs">
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-black/10"
          style={{ backgroundColor: ingColor }}
        />
        {content}
      </div>
    );
  }

  if (showDot) {
    return (
      <div className="relative inline-flex items-center justify-center">
        {content}
        <span
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
          style={{ backgroundColor: ingColor }}
          title={cleanId}
        />
      </div>
    );
  }

  return content;
}
