import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { sound } from '../utils/audio.js';
import IngredientIcon from './IngredientIcon.jsx';

export default function Ingredient({
  ingredient,
  onToggle,
  isSelected = false
}) {
  const handleClick = () => {
    sound.playIngredientPop();
    onToggle(ingredient.id);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border-2 transition-all select-none cursor-pointer w-full min-h-[72px] sm:min-h-[82px] active:scale-95 ${
        isSelected
          ? 'bg-[#DCEFE1] border-[#27864B] shadow-sm ring-2 ring-[#27864B]/30'
          : 'bg-white border-[#EADBCE] hover:border-[#27864B]/50 shadow-xs'
      }`}
    >
      {/* Selection Checkmark Badge */}
      {isSelected && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#27864B] text-white flex items-center justify-center shadow-xs">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </span>
      )}

      {/* Ingredient Emoji with SVG Fallback */}
      <IngredientIcon
        id={ingredient.id}
        icon={ingredient.icon}
        className="text-2xl sm:text-3xl filter drop-shadow-xs transition-transform"
        size="md"
      />

      {/* Ingredient Name */}
      <span className={`mt-0.5 text-[11px] sm:text-xs font-bold text-center leading-tight line-clamp-1 ${
        isSelected ? 'text-[#27864B] font-extrabold' : 'text-[#383028]'
      }`}>
        {ingredient.name}
      </span>
    </motion.button>
  );
}
