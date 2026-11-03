import React from 'react';
import { motion } from 'motion/react';

export default function Chef({ mood = 'greeting', speech = '', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-20 h-24 sm:w-24 sm:h-28',
    md: 'w-32 h-38 sm:w-40 sm:h-48',
    lg: 'w-40 h-48 sm:w-56 sm:h-64',
    xl: 'w-44 h-52 xs:w-52 xs:h-60 sm:w-64 sm:h-72 md:w-72 md:h-80'
  };

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      {speech && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative mb-3 max-w-xs md:max-w-sm px-4 py-2.5 bg-white border-2 border-[#27864B] rounded-2xl shadow-md text-[#383028] font-bold text-sm md:text-base text-center z-20"
        >
          <div className="leading-snug">{speech}</div>
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-[#27864B]" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white" />
        </motion.div>
      )}

      <motion.div
        animate={
          mood === 'greeting'
            ? { y: [0, -6, 0] }
            : mood === 'celebrating'
            ? { y: [0, -12, 0], rotate: [-2, 2, -2] }
            : mood === 'worried'
            ? { x: [-3, 3, -3] }
            : { y: [0, -3, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === 'celebrating' ? 0.8 : mood === 'worried' ? 0.25 : 2,
          ease: 'easeInOut'
        }}
        className={`${sizeClasses[size] || sizeClasses.md} relative flex items-center justify-center`}
      >
        <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Soft shadow underneath */}
          <ellipse cx="100" cy="225" rx="55" ry="10" fill="#EADBCE" />

          {/* Pizza Paddle / Pala Pizzera in Hand (Light Pine Wood) */}
          <g>
            <rect x="25" y="140" width="10" height="90" rx="4" fill="#D4A373" transform="rotate(-20 25 140)" />
            <circle cx="20" cy="130" r="28" fill="#E9C46A" />
            <circle cx="20" cy="130" r="24" fill="#F4A261" />
            {/* Slice on paddle */}
            <path d="M12 118 L28 126 L16 142 Z" fill="#D93636" />
            <circle cx="18" cy="128" r="3" fill="#F8D978" />
            <circle cx="24" cy="132" r="2" fill="#27864B" />
          </g>

          {/* Body / Chef Jacket (Crisp White) */}
          <path
            d="M55 155 C55 130 145 130 145 155 L150 220 C150 225 50 225 50 220 Z"
            fill="#ffffff"
            stroke="#6B6258"
            strokeWidth="3.5"
          />

          {/* Italian Red Neckerchief / Pañuelo Italiano */}
          <path
            d="M80 135 C88 145 112 145 120 135 L108 165 C104 172 96 172 92 165 Z"
            fill="#D93636"
            stroke="#B91C1C"
            strokeWidth="2.5"
          />
          <circle cx="100" cy="148" r="4.5" fill="#F8D978" />

          {/* Chef Buttons (Italian Green) */}
          <circle cx="85" cy="170" r="3.5" fill="#27864B" />
          <circle cx="115" cy="170" r="3.5" fill="#27864B" />
          <circle cx="85" cy="190" r="3.5" fill="#27864B" />
          <circle cx="115" cy="190" r="3.5" fill="#27864B" />

          {/* Chef Head */}
          <circle cx="100" cy="98" r="38" fill="#FDEBD0" stroke="#6B6258" strokeWidth="3.5" />

          {/* Cheeks blush */}
          <ellipse cx="76" cy="106" rx="6" ry="4" fill="#FBE4DF" opacity="0.9" />
          <ellipse cx="124" cy="106" rx="6" ry="4" fill="#FBE4DF" opacity="0.9" />

          {/* Eyes depending on mood */}
          {mood === 'celebrating' || mood === 'happy' ? (
            <g>
              <path d="M74 94 Q82 84 90 94" stroke="#383028" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M110 94 Q118 84 126 94" stroke="#383028" strokeWidth="3.5" strokeLinecap="round" />
            </g>
          ) : mood === 'worried' ? (
            <g>
              <circle cx="82" cy="92" r="7" fill="#ffffff" stroke="#383028" strokeWidth="2" />
              <circle cx="82" cy="92" r="3.5" fill="#383028" />
              <circle cx="118" cy="92" r="7" fill="#ffffff" stroke="#383028" strokeWidth="2" />
              <circle cx="118" cy="92" r="3.5" fill="#383028" />
              {/* Sweat drop */}
              <path d="M136 78 C136 84 130 88 130 84 C130 80 134 74 136 78 Z" fill="#38bdf8" />
            </g>
          ) : (
            <g>
              <circle cx="82" cy="92" r="4.5" fill="#383028" />
              <circle cx="80" cy="90" r="1.5" fill="#ffffff" />
              <circle cx="118" cy="92" r="4.5" fill="#383028" />
              <circle cx="116" cy="90" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Italian Big Mustache */}
          <path
            d="M100 108 C90 102 70 102 62 114 C75 116 88 122 100 114 C112 122 125 116 138 114 C130 102 110 102 100 108 Z"
            fill="#5C3818"
            stroke="#383028"
            strokeWidth="2.5"
          />

          {/* Italian Nose */}
          <ellipse cx="100" cy="98" rx="8" ry="7" fill="#F8CBA6" stroke="#383028" strokeWidth="2" />

          {/* Smile / Mouth */}
          {mood === 'happy' || mood === 'celebrating' || mood === 'greeting' ? (
            <path d="M90 120 Q100 132 110 120" stroke="#D93636" strokeWidth="3.5" strokeLinecap="round" fill="#D93636" />
          ) : mood === 'worried' ? (
            <path d="M92 124 Q100 118 108 124" stroke="#D93636" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <path d="M92 120 Q100 126 108 120" stroke="#D93636" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Chef Hat (Toque Blanche) */}
          <path
            d="M68 64 C50 64 50 35 70 28 C70 12 95 8 100 18 C105 8 130 12 130 28 C150 35 150 64 132 64 Z"
            fill="#ffffff"
            stroke="#6B6258"
            strokeWidth="3.5"
          />
          {/* Hat band with Italian Tricolor stripe */}
          <rect x="66" y="60" width="68" height="12" rx="3" fill="#ffffff" stroke="#6B6258" strokeWidth="2.5" />
          <rect x="68" y="64" width="22" height="4" fill="#27864B" />
          <rect x="90" y="64" width="20" height="4" fill="#FFFDF5" />
          <rect x="110" y="64" width="22" height="4" fill="#D93636" />

          {/* Waving Right Hand */}
          <motion.g
            animate={
              mood === 'greeting'
                ? { rotate: [-10, 20, -10] }
                : mood === 'celebrating'
                ? { rotate: [-15, 25, -15], y: [-4, 4, -4] }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '150px 145px' }}
          >
            <path
              d="M145 150 Q165 135 175 120 Q180 115 176 110 Q170 108 162 118 L150 135 Z"
              fill="#FDEBD0"
              stroke="#6B6258"
              strokeWidth="3"
            />
            <circle cx="172" cy="112" r="5" fill="#FDEBD0" stroke="#6B6258" strokeWidth="2" />
          </motion.g>

          {/* Golden Trophy if celebrating */}
          {mood === 'celebrating' && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [-5, 5, -5] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              <path d="M155 70 L185 70 L180 105 Q170 115 160 105 Z" fill="#F8D978" stroke="#D97706" strokeWidth="2.5" />
              <path d="M150 78 Q140 85 152 95" stroke="#D97706" strokeWidth="2.5" fill="none" />
              <path d="M190 78 Q200 85 188 95" stroke="#D97706" strokeWidth="2.5" fill="none" />
              <rect x="166" y="105" width="8" height="15" fill="#E5A93C" />
              <rect x="158" y="120" width="24" height="8" rx="2" fill="#B45309" />
              <polygon points="170,75 173,81 180,82 175,87 176,93 170,90 164,93 165,87 160,82 167,81" fill="#FFFDF5" />
            </motion.g>
          )}
        </svg>
      </motion.div>
    </div>
  );
}
