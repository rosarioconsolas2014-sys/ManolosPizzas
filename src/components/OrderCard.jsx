import React from 'react';
import { INGREDIENTS_BY_ID } from '../utils/gameConfig.js';
import { ChefHat, Sparkles } from 'lucide-react';
import IngredientIcon from './IngredientIcon.jsx';

export default function OrderCard({ challenge, currentLevel }) {
  if (!challenge) return null;

  return (
    <div className="relative bg-white text-[#383028] rounded-2xl p-3 sm:p-4 shadow-xs border-2 border-[#EADBCE] w-full overflow-hidden">
      {/* Italian Flag Strip along top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

      {/* Header Row: Client & Pizza Name */}
      <div className="flex items-center justify-between gap-2 border-b border-[#EADBCE] pb-2 mb-2">
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-wider text-[#27864B] flex items-center gap-1">
            <ChefHat className="w-3 h-3 text-[#27864B]" />
            <span>COMANDA #{Math.floor(Math.random() * 10) + 1} • {challenge.clientName}</span>
          </div>
          <div className="text-sm sm:text-base font-black text-[#383028] font-serif truncate">
            {challenge.pizzaName}
          </div>
        </div>

        <span className="bg-[#DCEFE1] text-[#27864B] font-black px-2 py-0.5 rounded-full text-[10px] uppercase shrink-0 border border-[#27864B]/30">
          NIVEL {currentLevel}
        </span>
      </div>

      {/* Greeting prompt */}
      {challenge.greeting && (
        <div className="text-xs text-[#5C3818] mb-2 font-medium">
          "{challenge.greeting}"
        </div>
      )}

      {/* Required Ingredients Showcase */}
      {challenge.type !== 'choose' && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#6B6258] mb-1.5 flex items-center gap-1">
            <span>Ingredientes requeridos:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {challenge.requiredIngredients?.map(ingId => {
              const ing = INGREDIENTS_BY_ID[ingId] || { name: ingId, icon: '•' };
              return (
                <div
                  key={ingId}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] text-xs font-bold text-[#383028] shadow-2xs"
                >
                  <IngredientIcon id={ingId} icon={ing.icon} size="sm" />
                  <span className="text-[11px] sm:text-xs">{ing.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If it's a choose minigame */}
      {challenge.type === 'choose' && (
        <div className="text-xs font-bold text-[#27864B] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡Observá las dos pizzas y elegí la correcta abajo!</span>
        </div>
      )}
    </div>
  );
}
