import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, HelpCircle, Award, Star, X, MapPin, Calendar, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import Chef from '../components/Chef.jsx';
import { sound } from '../utils/audio.js';
import { formatMonthName } from '../utils/gameConfig.js';

export default function Home({
  onStartGame,
  onViewRanking,
  champion,
  config,
  topScore = 0
}) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState({ days: 0, hours: 0, mins: 0, secs: 0, isPast: false, mode: 'end' });

  // Calculate live countdown to championship startDate or endDate
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const startStr = config?.startDate ? `${config.startDate}T${config.startTime || '00:00:00'}` : null;
      const endStr = config?.endDate ? `${config.endDate}T${config.endTime || '23:59:59'}` : null;

      const startTime = startStr ? new Date(startStr).getTime() : 0;
      const endTime = endStr ? new Date(endStr).getTime() : 0;

      // If before start
      if (startTime && now < startTime) {
        const diff = startTime - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeftStr({ days, hours, mins, secs, isPast: false, mode: 'start' });
        return;
      }

      // If active before end
      if (endTime) {
        const diff = endTime - now;
        if (diff <= 0) {
          setTimeLeftStr({ days: 0, hours: 0, mins: 0, secs: 0, isPast: true, mode: 'end' });
          return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeftStr({ days, hours, mins, secs, isPast: false, mode: 'end' });
        return;
      }

      setTimeLeftStr({ days: 0, hours: 0, mins: 0, secs: 0, isPast: false, mode: 'end' });
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [config?.startDate, config?.startTime, config?.endDate, config?.endTime]);

  const today = new Date().toISOString().split('T')[0];
  const isBeforeStart = Boolean(config?.startDate && today < config.startDate);
  const isAfterEnd = Boolean(config?.endDate && today > config.endDate);
  const isManuallyDisabled = config?.competitionEnabled === false || config?.status === 'pausado';

  let effectiveStatus = 'activo';
  if (isManuallyDisabled) {
    effectiveStatus = 'pausado';
  } else if (isBeforeStart) {
    effectiveStatus = 'proximo';
  } else if (isAfterEnd) {
    effectiveStatus = 'finalizado';
  }

  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case 'proximo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#F59E0B] text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
            <span>PRÓXIMAMENTE (INICIA {config?.startDate})</span>
          </span>
        );
      case 'pausado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#FB923C] text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#EA580C]" />
            <span>CAMPEONATO EN PAUSA</span>
          </span>
        );
      case 'finalizado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] text-[#B91C1C] border border-[#EF4444] text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <span>CAMPEONATO FINALIZADO</span>
          </span>
        );
      case 'activo':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCEFE1] text-[#27864B] border border-[#27864B] text-xs font-black uppercase tracking-wider shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#27864B] animate-pulse" />
            <span>COMPETENCIA ACTIVA</span>
          </span>
        );
    }
  };

  const prizeName = config?.prizeName || config?.monthlyPrizeName || 'CENA COMPLETA PARA 4 PERSONAS';
  const prizeDesc = config?.prizeDescription || config?.monthlyPrizeDescription || 'Una cena gourmet completa para 4 personas con entradas, pizzas de la casa, bebidas y postre artesanal.';
  const promoText = config?.promoText || '¡Jugá gratis, acumulá el puntaje más alto del mes y ganá una Super Cena para 4 personas!';

  return (
    <div className="relative min-h-[calc(100vh-68px)] flex flex-col items-center justify-between px-3 sm:px-4 py-5 md:py-8 max-w-6xl mx-auto w-full">
      {/* Hero Section */}
      <div className="w-full text-center space-y-3 relative z-10">
        {/* Status and Italian Badge Header */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {getStatusBadge()}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border-2 border-[#27864B] text-[#27864B] text-xs font-black tracking-wider uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#27864B]" />
            <span>TORNEO OFICIAL MANOLO'S PIZZAS</span>
            <span className="w-2 h-2 rounded-full bg-[#D93636]" />
          </div>
        </div>

        {/* Main Logo & Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-serif tracking-tight uppercase leading-tight">
            <span className="text-[#D93636]">MANOLO'S</span>{' '}
            <span className="text-[#27864B]">PIZZAS</span>
          </h1>
          <div className="text-lg sm:text-2xl md:text-3xl font-black tracking-wider text-[#383028] uppercase font-mono">
            {config?.publicTitle || 'THE PIZZA CHALLENGE'}
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#6B6258] max-w-2xl mx-auto font-medium">
            {config?.description || '¿Tenés lo necesario para ser el mejor pizzero del mes? Atendé comandas a contrarreloj en 3 niveles de pura velocidad y memoria gastronómica para ganar premios reales.'}
          </p>
        </div>

        {/* Event Dates & Countdown Banner */}
        {!timeLeftStr.isPast && (timeLeftStr.days > 0 || timeLeftStr.hours > 0 || timeLeftStr.mins > 0 || timeLeftStr.secs > 0) && (
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 bg-white rounded-2xl border-2 border-[#EADBCE] shadow-xs text-xs font-bold text-[#383028]">
            <span className="text-[#6B6258] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#27864B]" />
              <span>{timeLeftStr.mode === 'start' ? 'INICIO DEL TORNEO EN:' : 'CIERRE DEL TORNEO EN:'}</span>
            </span>
            <div className="flex items-center gap-1.5 font-mono font-black text-[#27864B]">
              <span className="bg-[#DCEFE1] px-2 py-0.5 rounded-lg border border-[#27864B]/30">{timeLeftStr.days}d</span>
              <span>:</span>
              <span className="bg-[#DCEFE1] px-2 py-0.5 rounded-lg border border-[#27864B]/30">{String(timeLeftStr.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-[#DCEFE1] px-2 py-0.5 rounded-lg border border-[#27864B]/30">{String(timeLeftStr.mins).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-[#DCEFE1] px-2 py-0.5 rounded-lg border border-[#27864B]/30">{String(timeLeftStr.secs).padStart(2, '0')}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Centerpiece: Chef Manolo + Action Station */}
      <div className="my-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-center z-10">
        {/* Left Column: Monthly Champion Showcase Card & Prize Highlights */}
        <div className="lg:col-span-4 order-2 lg:order-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border-2 border-[#EADBCE] shadow-sm relative overflow-hidden">
            {/* Italian Flag Strip along top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

            <div className="flex items-center justify-between border-b border-[#EADBCE] pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-[#F8D978] text-[#5C3818] shadow-xs">
                  <Trophy className="w-5 h-5 text-[#B45309]" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-[#27864B] tracking-wider">
                    COMPETENCIA MENSUAL
                  </div>
                  <div className="text-sm font-black text-[#383028]">
                    CAMPEÓN DEL MES
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-[#DCEFE1] text-[#27864B] px-2 py-0.5 rounded-full border border-[#27864B]/30">
                {config?.competitionMonth && config?.competitionYear
                  ? formatMonthName(`${config.competitionYear}-${String(config.competitionMonth).padStart(2, '0')}`)
                  : formatMonthName(config?.currentMonth)}
              </span>
            </div>

            {/* Champion Info */}
            {champion ? (
              <div className="space-y-3 bg-[#FFFDF5] p-3.5 rounded-2xl border border-[#EADBCE]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#F8D978] to-[#FFF4D0] flex items-center justify-center text-2xl shadow-xs border-2 border-[#D97706]/40">
                    👑
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#B45309] font-bold uppercase">
                      LÍDER ACTUAL
                    </div>
                    <div className="text-base font-black text-[#383028] truncate">
                      {champion.fullName}
                    </div>
                    <div className="text-xs font-mono text-[#6B6258]">
                      Récord: <span className="text-[#27864B] font-bold">{champion.totalScore?.toLocaleString()} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] text-[#6B6258] text-xs">
                <Star className="w-8 h-8 text-[#F8D978] mx-auto mb-1 animate-pulse" />
                <p className="font-bold text-[#383028]">¡Puesto vacante!</p>
                <p className="text-[11px] text-[#6B6258]">Jugá ahora y convertite en el primer campeón del mes.</p>
              </div>
            )}

            {/* Featured Prize Box */}
            <div className="mt-4 p-4 rounded-2xl bg-[#DCEFE1]/70 border-2 border-[#27864B]/40 space-y-1.5 relative overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-black text-[#27864B] uppercase tracking-wider">
                <Award className="w-4 h-4 text-[#D97706]" />
                <span>PREMIO DESTACADO</span>
              </div>
              <div className="text-sm font-black text-[#383028] leading-tight">
                {prizeName}
              </div>
              <p className="text-[11px] text-[#6B6258] leading-snug">
                {prizeDesc}
              </p>
              {config?.prizeQuantity && (
                <div className="text-[10px] font-mono text-[#27864B] font-bold pt-1">
                  🎁 Cantidad: {config.prizeQuantity}
                </div>
              )}
            </div>
          </div>

          {/* Ceremony Venue & Location Box */}
          {(config?.eventDate || config?.location) && (
            <div className="bg-white rounded-3xl p-4 border-2 border-[#EADBCE] shadow-xs text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#B45309] tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>ENTREGA DE PREMIOS & EVENTO</span>
              </div>
              <div className="font-black text-[#383028] text-xs sm:text-sm">
                {config.location || "Manolo's Pizzas Tradicional"}
              </div>
              {config.address && (
                <div className="text-[11px] text-[#6B6258] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D93636] shrink-0" />
                  <span>{config.address}</span>
                </div>
              )}
              {config.eventDate && (
                <div className="text-[11px] font-mono text-[#27864B] font-bold">
                  📅 {config.eventDate} {config.eventTime ? `a las ${config.eventTime} hs` : ''}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Chef Manolo Animation & Main CTA */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center order-1 lg:order-2">
          <Chef
            mood={effectiveStatus === 'pausado' ? 'worried' : 'greeting'}
            speech={
              effectiveStatus === 'pausado'
                ? '¡Atención pizzeros! El torneo está en pausa técnica momentánea.'
                : effectiveStatus === 'proximo'
                ? `¡El campeonato comenzará el ${config?.startDate || 'pronto'}! ¡Preparate para competir!`
                : effectiveStatus === 'finalizado'
                ? '¡El campeonato ha finalizado! ¡Revisá las posiciones para conocer a los ganadores!'
                : '¡Benvenuto a Manolo\'s! ¡Demostrá tu habilidad en la cocina y ganá la Super Cena!'
            }
            size="xl"
          />

          {/* Primary CTA Button: Verde Italiano */}
          <motion.button
            whileHover={{ scale: effectiveStatus === 'activo' ? 1.04 : 1 }}
            whileTap={{ scale: effectiveStatus === 'activo' ? 0.95 : 1 }}
            disabled={effectiveStatus !== 'activo'}
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className={`mt-6 w-full max-w-sm py-4 px-8 rounded-2xl font-black text-xl sm:text-2xl uppercase tracking-wider shadow-md border-2 flex items-center justify-center gap-3 transition-all ${
              effectiveStatus !== 'activo'
                ? 'bg-stone-300 border-stone-400 text-stone-600 cursor-not-allowed opacity-80'
                : 'bg-[#27864B] hover:bg-[#1e6b3c] text-white border-[#1e6b3c] cursor-pointer'
            }`}
          >
            <Play className="w-6 h-6 fill-current" />
            <span>
              {effectiveStatus === 'pausado'
                ? 'TORNEO EN PAUSA'
                : effectiveStatus === 'proximo'
                ? `INICIA ${config?.startDate || ''}`
                : effectiveStatus === 'finalizado'
                ? 'TORNEO FINALIZADO'
                : '¡JUGAR AHORA!'}
            </span>
          </motion.button>

          {/* Secondary Buttons: Posiciones y Cómo Jugar */}
          <div className="mt-4 flex items-center gap-3 w-full max-w-sm">
            <button
              onClick={() => {
                sound.playClick();
                onViewRanking();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border-2 border-[#27864B] text-[#27864B] hover:bg-[#DCEFE1]/50 text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#D97706]" />
              <span>POSICIONES</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowHowToPlay(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white border-2 border-[#EADBCE] text-[#383028] hover:border-[#6B6258] hover:bg-stone-50 text-xs sm:text-sm font-black uppercase flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#D93636]" />
              <span>CÓMO JUGAR</span>
            </button>
          </div>
        </div>

        {/* Right Column: High Score & 3 Challenge Levels */}
        <div className="lg:col-span-3 order-3 space-y-4">
          {/* High Score Card */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#EADBCE] shadow-sm text-center">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#6B6258]">
              MEJOR PUNTAJE DEL MES
            </div>
            <div className="mt-1 text-3xl font-black font-mono text-[#27864B]">
              {(champion?.totalScore || topScore || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-[#6B6258] font-mono mt-0.5">PUNTOS RECORD</div>
          </div>

          {/* 3 Challenge Levels Showcase */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#EADBCE] shadow-sm space-y-2">
            <div className="text-xs font-black uppercase text-[#27864B] tracking-wider">
              3 NIVELES DE DESAFÍO:
            </div>

            {/* Level 1: Verde suave */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#DCEFE1]/60 border border-[#27864B]/30 text-xs">
              <span className="text-lg">🍳</span>
              <div>
                <div className="font-bold text-[#27864B]">Nivel 1: Ayudante</div>
                <div className="text-[10px] text-[#6B6258]">Comandas clásicas de 3 ingredientes</div>
              </div>
            </div>

            {/* Level 2: Amarillo mozzarella */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#F8D978]/30 border border-[#F8D978] text-xs">
              <span className="text-lg">🍕</span>
              <div>
                <div className="font-bold text-[#92400E]">Nivel 2: Maestro Pizzero</div>
                <div className="text-[10px] text-[#6B6258]">Comandas gourmet y reflejos rápidos</div>
              </div>
            </div>

            {/* Level 3: Nuevo juego de memoria */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FBE4DF] border border-[#D93636]/40 text-xs">
              <span className="text-lg">🧠</span>
              <div>
                <div className="font-bold text-[#D93636]">Nivel 3: Gran Chef</div>
                <div className="text-[10px] text-[#6B6258]">Memoria y parejas de ingredientes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-[#6B6258] py-2 border-t border-[#EADBCE] w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Manolo's Pizzas – Auténtica Pizzería Italiana</span>
        <span className="font-mono text-[#27864B] font-bold">Torneo Oficial Mensual</span>
      </div>

      {/* "Cómo Jugar" Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#383028]/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-2 border-[#EADBCE] rounded-3xl p-6 max-w-xl w-full shadow-2xl text-[#383028] relative max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)] rounded-t-3xl" />

              <button
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-[#FFFDF5] border border-[#EADBCE] hover:bg-stone-100 text-[#6B6258] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="p-3 rounded-2xl bg-[#DCEFE1] text-[#27864B]">
                  <ChefHatIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#D93636] font-serif">
                    ¿CÓMO JUGAR?
                  </h2>
                  <p className="text-xs text-[#6B6258]">
                    Instrucciones maestras del Chef Manolo
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-[#383028]">
                <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE]">
                  <div className="font-bold text-[#27864B] mb-1 flex items-center gap-1.5">
                    <span>1.</span> Nivel 1: Ayudante de Cocina
                  </div>
                  <p className="text-[#6B6258] text-xs">
                    Leé la comanda y armá las pizzas clásicas de 3 ingredientes seleccionándolos de la bandeja antes de que se agote el tiempo.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE]">
                  <div className="font-bold text-[#27864B] mb-1 flex items-center gap-1.5">
                    <span>2.</span> Nivel 2: Maestro Pizzero
                  </div>
                  <p className="text-[#6B6258] text-xs">
                    Comandas gourmet de 4 ingredientes y minijuegos de agilidad visual con mayor cantidad de ingredientes en la mesada.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-[#EADBCE]">
                  <div className="font-bold text-[#D93636] mb-1 flex items-center gap-1.5">
                    <span>3.</span> Nivel 3: Memoria de Gran Chef
                  </div>
                  <p className="text-[#6B6258] text-xs">
                    ¡El gran desafío de memoria! Da vuelta las cartas boca abajo y encontrá todas las parejas de ingredientes italianos. Mientras más rápido lo hagas y menos falles, mayor será tu bonificación.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#DCEFE1]/60 border border-[#27864B]/40">
                  <div className="font-black text-[#27864B] mb-1">
                    SISTEMA DE PUNTOS:
                  </div>
                  <ul className="text-xs space-y-1 text-[#383028] font-mono">
                    <li>• Acierto comanda: <span className="text-[#27864B] font-bold">+100 pts</span></li>
                    <li>• Pedido perfecto: <span className="text-[#B45309] font-bold">+500 pts</span></li>
                    <li>• Pareja de memoria: <span className="text-[#27864B] font-bold">+200 pts</span></li>
                    <li>• Bono velocidad Nivel 3: <span className="text-[#27864B] font-bold">10 pts por segundo</span></li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowHowToPlay(false);
                  if (competitionStatus === 'activo') onStartGame();
                }}
                className="mt-5 w-full py-3.5 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-sm uppercase tracking-wider shadow-md cursor-pointer transition-all"
              >
                ¡ENTENDIDO!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChefHatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}
