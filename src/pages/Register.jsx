import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, CreditCard, Sparkles, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Chef from '../components/Chef.jsx';
import { sound } from '../utils/audio.js';
import { getParticipant, registerOrUpdateParticipant } from '../services/playerService.js';
import { maskDni } from '../utils/gameConfig.js';

export default function Register({
  onParticipantReady,
  onBackToHome,
  maxAttempts = 3,
  unlimitedAttempts = false,
  competitionEnabled = true,
  startDate = null,
  endDate = null,
  gameActive = true
}) {
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [welcomePlayer, setWelcomePlayer] = useState(null);

  const isBeforeStart = () => {
    if (!startDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return today < startDate;
  };

  const isAfterEnd = () => {
    if (!endDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return today > endDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanDni = dni.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!cleanName || cleanName.length < 3) {
      setErrorMsg('Por favor ingresá tu nombre y apellido completo (mínimo 3 letras).');
      sound.playError();
      return;
    }

    if (!cleanDni || cleanDni.length < 4 || cleanDni.length > 20) {
      setErrorMsg('Por favor ingresá un DNI válido (entre 4 y 20 caracteres).');
      sound.playError();
      return;
    }

    if (!competitionEnabled || !gameActive) {
      setErrorMsg('El campeonato se encuentra actualmente en pausa por la administración. Por favor intentá más tarde.');
      sound.playError();
      return;
    }

    if (isBeforeStart()) {
      setErrorMsg(`El campeonato comenzará oficialmente el ${startDate}. Las inscripciones se abrirán en dicha fecha.`);
      sound.playError();
      return;
    }

    if (isAfterEnd()) {
      setErrorMsg(`El campeonato ha finalizado oficialmente el ${endDate}. No se admiten nuevas partidas.`);
      sound.playError();
      return;
    }

    setIsLoading(true);
    try {
      const existing = await getParticipant(cleanDni);
      if (existing?.blocked) {
        setErrorMsg('Esta cuenta o DNI se encuentra temporalmente inhabilitada por la administración.');
        sound.playError();
        setIsLoading(false);
        return;
      }

      if (!unlimitedAttempts && existing && maxAttempts > 0 && existing.totalAttempts >= maxAttempts) {
        setErrorMsg(`Has alcanzado el límite de ${maxAttempts} intentos permitidos para este campeonato.`);
        sound.playError();
        setIsLoading(false);
        return;
      }

      const participant = await registerOrUpdateParticipant(cleanDni, cleanName);
      sound.playOrderSuccess();
      setWelcomePlayer(participant);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error de conexión con Firebase Firestore. No se pudo verificar la inscripción de forma segura. Por favor revisá tu conexión e intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChallenge = () => {
    sound.playClick();
    onParticipantReady(welcomePlayer);
  };

  return (
    <div className="min-h-[calc(100dvh-60px)] flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 max-w-xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white border-2 border-[#EADBCE] rounded-3xl p-4 sm:p-8 shadow-md relative overflow-hidden"
      >
        {/* Italian Ribbon Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

        {welcomePlayer ? (
          /* Welcome Screen after Registration */
          <div className="text-center space-y-5">
            <Chef
              mood="happy"
              speech={`¡Benvenuto Chef ${welcomePlayer.fullName}! Ponete el delantal y afilá la pala.`}
              size="lg"
            />

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#27864B] font-serif">
                ¡FICHA DE CHEF LISTA!
              </h2>
              <div className="p-4 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] text-left space-y-1.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6258]">Participante:</span>
                  <span className="font-bold text-[#383028]">{welcomePlayer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6258]">DNI:</span>
                  <span className="font-mono font-bold text-[#27864B]">{maskDni(welcomePlayer.dni)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6258]">Intento actual:</span>
                  <span className="font-bold text-[#27864B]">
                    #{welcomePlayer.totalAttempts} {unlimitedAttempts ? '(Intentos Ilimitados)' : `(de ${maxAttempts} permitidos)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Button: Verde Italiano */}
            <button
              onClick={handleStartChallenge}
              className="w-full py-4 rounded-2xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-lg uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <span>¡INGRESAR A LA COCINA!</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Registration Form */
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onBackToHome}
                className="text-xs text-[#6B6258] hover:text-[#383028] flex items-center gap-1 cursor-pointer font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al inicio</span>
              </button>
              <span className="text-[11px] font-mono font-bold text-[#27864B] bg-[#DCEFE1] px-2.5 py-0.5 rounded-full border border-[#27864B]/30">
                {unlimitedAttempts ? '✨ Intentos Ilimitados' : `Límite: ${maxAttempts} intentos`}
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#DCEFE1] border-2 border-[#27864B]/40 mx-auto flex items-center justify-center text-3xl shadow-xs mb-2">
                👨‍🍳
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#D93636] font-serif">
                REGISTRO DE PARTICIPANTE
              </h2>
              <p className="text-xs text-[#6B6258] mt-1">
                Ingresá tus datos para validar tus intentos y competir por el Premio del Mes
              </p>
            </div>

            {/* Error Message: Rojo Suave */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-[#FBE4DF] border border-[#D93636]/40 text-[#D93636] text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D93636]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#383028] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#27864B]" />
                  <span>Nombre y Apellido:</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mario Rossi"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-4 py-3 text-sm text-[#383028] placeholder-[#6B6258]/60 focus:outline-hidden focus:border-[#27864B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#383028] mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#27864B]" />
                  <span>DNI (Documento de Identidad):</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 38456789"
                  value={dni}
                  onChange={e => setDni(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-4 py-3 text-sm font-mono text-[#383028] placeholder-[#6B6258]/60 focus:outline-hidden focus:border-[#27864B] transition-colors"
                />
                <span className="text-[11px] text-[#6B6258] mt-1 block">
                  Tu DNI te identifica de forma única para registrar tus puntajes en el ranking.
                </span>
              </div>

              {/* Botón Principal: Verde Italiano */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full py-4 rounded-2xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-base uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span>VALIDANDO CHEF...</span>
                ) : (
                  <>
                    <span>CONTINUAR AL DESAFÍO</span>
                    <Sparkles className="w-4 h-4 text-[#F8D978]" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
