import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { INGREDIENTS_BY_ID } from '../utils/gameConfig.js';
import { Flame, Undo2 } from 'lucide-react';
import { sound } from '../utils/audio.js';
import IngredientIcon from './IngredientIcon.jsx';

export default function PizzaBuilder({
  selectedIngredients = [],
  onToggleIngredient,
  onClearAll,
  onSubmitPizza,
  isBaking,
  submitDisabled = false
}) {
  const hasSauce = selectedIngredients.includes('salsa_tomate');
  const hasCheese = selectedIngredients.includes('mozzarella');

  // Topping list (excluding sauce and cheese which render as full layers)
  const toppingIds = selectedIngredients.filter(id => id !== 'salsa_tomate' && id !== 'mozzarella');

  // Deterministic circular layout positions for placed toppings
  const placedToppings = toppingIds.map((id, index) => {
    const total = toppingIds.length;
    // Circular angle distribution
    const angle = (index / Math.max(1, total)) * 2 * Math.PI;
    const radius = total === 1 ? 0 : (total <= 3 ? 24 : 28);
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { id, x, y };
  });

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      {/* Responsive Pizza Display Container */}
      <div className="relative w-48 h-48 xs:w-52 xs:h-52 sm:w-60 sm:h-60 flex items-center justify-center select-none">
        {/* Wooden Handle of Peel */}
        <div className="absolute -bottom-5 w-8 h-12 bg-linear-to-b from-[#D4A373] to-[#B37D4E] rounded-b-lg border-2 border-[#8A5A36] shadow-xs z-0" />

        {/* Light Birch Wood Round Peel */}
        <div className="absolute w-full h-full rounded-full bg-linear-to-br from-[#F5DEB3] via-[#E6C280] to-[#D4A373] border-3 border-[#B37D4E] shadow-sm z-0 flex items-center justify-center">
          <div className="w-[94%] h-[94%] rounded-full border border-[#B37D4E]/30" />
        </div>

        {/* Oven Baking Animation Overlay */}
        <AnimatePresence>
          {isBaking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 rounded-full bg-[#D93636]/90 backdrop-blur-xs flex flex-col items-center justify-center text-white border-4 border-[#F8D978] shadow-lg"
            >
              <Flame className="w-10 h-10 text-[#F8D978] animate-bounce" />
              <div className="text-sm sm:text-base font-black uppercase tracking-wider font-serif">
                ¡AL HORNO!
              </div>
              <div className="text-[10px] text-[#FFFDF5] font-mono">
                Cocinando a 450°C
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIZZA BASE (Masa fresca) */}
        <div className="relative w-[84%] h-[84%] rounded-full bg-linear-to-br from-[#FFF8E7] via-[#F3E5CC] to-[#E9D5B5] border-4 border-[#D4A373] shadow-inner z-10 overflow-hidden">
          {/* SAUCE LAYER */}
          {hasSauce && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-2 rounded-full bg-linear-to-br from-[#D93636] via-[#B91C1C] to-[#991B1B] shadow-inner z-11 opacity-95"
            >
              <div className="w-full h-full rounded-full opacity-35 bg-[radial-gradient(#27864b_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
            </motion.div>
          )}

          {/* CHEESE LAYER */}
          {hasCheese && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-3.5 rounded-full bg-linear-to-br from-[#FFFBEA] via-[#F8D978] to-[#F1C40F] shadow-xs z-12 opacity-95"
            >
              <div className="absolute top-5 left-8 w-3 h-2 rounded-full bg-[#E5A93C]/50" />
              <div className="absolute bottom-6 right-9 w-4 h-3 rounded-full bg-[#E5A93C]/50" />
            </motion.div>
          )}

          {/* TOPPINGS */}
          <div className="absolute inset-0 z-15">
            {placedToppings.map((item) => {
              const ing = INGREDIENTS_BY_ID[item.id] || { icon: '✨', name: item.id };
              return (
                <motion.button
                  key={`${item.id}_${item.x}`}
                  type="button"
                  initial={{ scale: 1.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onToggleIngredient(item.id)}
                  title={`Tocar para quitar ${ing.name}`}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="filter drop-shadow-xs cursor-pointer active:scale-90 transition-transform p-1 hover:brightness-110 flex items-center justify-center"
                >
                  <IngredientIcon id={item.id} icon={ing.icon} size="md" />
                </motion.button>
              );
            })}
          </div>

          {/* Empty pizza prompt */}
          {selectedIngredients.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 z-15 text-[#6B6258] font-bold">
              <span className="text-2xl mb-0.5">🫓</span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#383028]">
                Masa lista
              </span>
              <span className="text-[9px] font-medium text-[#6B6258]">
                Toca los ingredientes abajo
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Items Mini Pills Strip */}
      <div className="mt-2.5 w-full flex items-center justify-between gap-1.5 px-1">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {selectedIngredients.length > 0 ? (
            selectedIngredients.map(id => {
              const ing = INGREDIENTS_BY_ID[id];
              if (!ing) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggleIngredient(id)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#DCEFE1] border border-[#27864B]/40 text-[#27864B] text-[10px] font-bold shrink-0 shadow-2xs hover:bg-[#FBE4DF] hover:text-[#D93636] hover:border-[#D93636]/40 transition-colors cursor-pointer"
                  title="Tocar para quitar"
                >
                  <IngredientIcon id={id} icon={ing.icon} size="sm" />
                  <span className="max-w-[60px] truncate">{ing.name}</span>
                  <span className="text-[9px] opacity-60">×</span>
                </button>
              );
            })
          ) : (
            <span className="text-[10px] text-[#6B6258] italic">
              Ningún ingrediente seleccionado
            </span>
          )}
        </div>

        {selectedIngredients.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            disabled={isBaking}
            className="text-[10px] font-bold text-[#6B6258] hover:text-[#D93636] flex items-center gap-0.5 px-1.5 py-0.5 rounded-md hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
          >
            <Undo2 className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Big Tactile Action Button: ENTREGAR PEDIDO */}
      <div className="w-full mt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onSubmitPizza}
          disabled={submitDisabled || isBaking}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#D93636] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-sm border-2 border-[#D93636] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Flame className="w-5 h-5 text-[#F8D978] animate-pulse" />
          <span>ENTREGAR PEDIDO</span>
        </motion.button>
      </div>
    </div>
  );
}
