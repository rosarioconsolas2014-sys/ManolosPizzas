import React from 'react';
import { Phone, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-20 w-full mt-auto border-t border-[#EADBCE] bg-[#FFFDF5]/90 backdrop-blur-xs py-4 px-4 select-none pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
      {/* Subtle Italian Tricolor top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)] opacity-80 rounded-full" />

      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-2">
        {/* Development Signature: CARVI SOFT */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#27864B]" />
            <span className="font-extrabold tracking-wider uppercase text-[#27864B] font-sans">
              CARVI SOFT
            </span>
          </div>

          <span className="hidden sm:inline text-[#EADBCE] font-bold">•</span>

          <span className="text-[#6B6258] font-medium text-[11px] sm:text-xs">
            Desarrollo de Software
          </span>

          <span className="hidden sm:inline text-[#EADBCE] font-bold">•</span>

          <a
            href="tel:3412570106"
            className="inline-flex items-center gap-1 text-[#27864B] hover:text-[#1e6b3c] font-semibold text-[11px] sm:text-xs transition-colors group cursor-pointer"
            title="Llamar a CARVI SOFT"
          >
            <Phone className="w-3 h-3 text-[#27864B] group-hover:scale-110 transition-transform" />
            <span>Contacto: <strong className="font-mono font-bold text-[#383028] group-hover:text-[#27864B]">4312570106</strong></span>
          </a>
        </div>

        {/* Brand Copyright */}
        <div className="text-[10px] sm:text-xs text-[#6B6258]/80 font-medium">
          © 2026 Manolo's Pizzas. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
