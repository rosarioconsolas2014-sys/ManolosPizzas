import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  Save,
  Trash2,
  RotateCcw,
  Users,
  Trophy,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  LogOut
} from 'lucide-react';
import { auth } from '../services/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getGameConfig, updateGameConfig } from '../services/configService.js';
import { getAllParticipants } from '../services/playerService.js';
import {
  getAllTimeRanking,
  deleteGameResult,
  resetMonthlyRanking
} from '../services/scoreService.js';
import { formatMonthName, getCurrentMonthString } from '../utils/gameConfig.js';
import { sound } from '../utils/audio.js';

export default function Admin({ onBackToHome, onConfigUpdated }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Configuration state
  const [config, setConfig] = useState(null);
  const [prizeName, setPrizeName] = useState('');
  const [prizeDesc, setPrizeDesc] = useState('');
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthString());
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Lists state
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'participants' | 'results'
  const [isLoading, setIsLoading] = useState(false);

  // Confirmation modals
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showResetMonthConfirm, setShowResetMonthConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        loadInitialData();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const cfg = await getGameConfig();
      setConfig(cfg);
      setPrizeName(cfg.monthlyPrizeName || '');
      setPrizeDesc(cfg.monthlyPrizeDescription || '');
      setMaxAttempts(cfg.maxAttemptsPerPlayer || 3);
      setGameActive(cfg.gameActive !== false);
      setCurrentMonth(cfg.currentMonth || getCurrentMonthString());

      const [pList, rList] = await Promise.all([
        getAllParticipants(),
        getAllTimeRanking()
      ]);
      setParticipants(pList);
      setResults(rList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const cleanEmail = emailInput.trim();
    if (!cleanEmail || !passwordInput) {
      setAuthError('Por favor ingresá tu correo electrónico y contraseña.');
      setAuthLoading(false);
      sound.playError();
      return;
    }

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      }
      sound.playOrderSuccess();
    } catch (error) {
      sound.playError();
      console.warn('Firebase Auth notice:', error?.code, error?.message);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setAuthError('Credenciales incorrectas o usuario no registrado en Firebase Authentication.');
      } else if (error.code === 'auth/wrong-password') {
        setAuthError('Contraseña incorrecta.');
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError('Este correo ya está registrado. Probá iniciando sesión.');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setAuthError(`Error de autenticación: ${error.message || 'Verificá tus credenciales'}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      sound.playOrderSuccess();
    } catch (error) {
      sound.playError();
      console.warn('Google Auth notice:', error?.message);
      setAuthError(`Error con Google: ${error.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaveSuccessMsg('');
    try {
      const updated = await updateGameConfig({
        monthlyPrizeName: prizeName,
        monthlyPrizeDescription: prizeDesc,
        maxAttemptsPerPlayer: Number(maxAttempts) || 3,
        gameActive: Boolean(gameActive),
        currentMonth: currentMonth
      });
      setConfig(updated);
      if (onConfigUpdated) onConfigUpdated(updated);
      sound.playOrderSuccess();
      setSaveSuccessMsg('Configuración guardada correctamente en el sistema.');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      sound.playError();
    }
  };

  const handleDeleteResultConfirmed = async () => {
    if (!itemToDelete) return;
    sound.playClick();
    await deleteGameResult(itemToDelete.id);
    setResults(prev => prev.filter(r => r.id !== itemToDelete.id));
    setItemToDelete(null);
  };

  const handleResetMonthConfirmed = async () => {
    sound.playClick();
    await resetMonthlyRanking(currentMonth);
    setShowResetMonthConfirm(false);
    loadInitialData();
  };

  // Login Screen if not authenticated via Firebase
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100dvh-60px)] flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 max-w-md mx-auto w-full">
        <div className="w-full bg-white border-2 border-[#EADBCE] rounded-3xl p-5 sm:p-8 shadow-md relative text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#27864B_0px,#27864B_33.33%,#FFFDF5_33.33%,#FFFDF5_66.66%,#D93636_66.66%,#D93636_100%)]" />

          <button
            onClick={onBackToHome}
            className="text-xs text-[#6B6258] hover:text-[#383028] font-bold flex items-center gap-1.5 cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>

          <div className="w-16 h-16 rounded-2xl bg-[#DCEFE1] border-2 border-[#27864B]/40 mx-auto flex items-center justify-center text-[#27864B] mb-3 shadow-xs">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-[#383028] font-serif">
            PANEL DE ADMINISTRACIÓN
          </h2>
          <p className="text-xs text-[#6B6258] mt-1">
            Autenticación segura con Firebase Authentication
          </p>

          {/* Toggle between Iniciar Sesión and Registrar Admin */}
          <div className="flex bg-[#FFFDF5] p-1 rounded-xl border border-[#EADBCE] mt-4 mb-2">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setAuthError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'bg-[#27864B] text-white shadow-2xs'
                  : 'text-[#6B6258] hover:text-[#383028]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setAuthError('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                isRegisterMode
                  ? 'bg-[#27864B] text-white shadow-2xs'
                  : 'text-[#6B6258] hover:text-[#383028]'
              }`}
            >
              Crear Administrador
            </button>
          </div>

          {authError && (
            <div className="mt-3 p-3 rounded-2xl bg-[#FBE4DF] border border-[#D93636]/40 text-[#D93636] text-xs text-left font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="mt-4 space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-black uppercase text-[#383028] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#27864B]" />
                <span>Correo Electrónico:</span>
              </label>
              <input
                type="email"
                required
                placeholder="admin@manolospizzas.com"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#383028] placeholder-[#6B6258]/60 focus:outline-hidden focus:border-[#27864B]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-[#383028] mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#27864B]" />
                <span>Contraseña:</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#383028] placeholder-[#6B6258]/60 focus:outline-hidden focus:border-[#27864B]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? 'Verificando...' : isRegisterMode ? 'REGISTRAR ADMIN' : 'INGRESAR AL PANEL'}
            </button>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EADBCE]" />
              </div>
              <span className="relative bg-white px-2 text-[10px] uppercase text-[#6B6258] font-bold">
                O continuar con
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-white border-2 border-[#EADBCE] hover:border-[#27864B] text-[#383028] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <span>🔑</span>
              <span>Iniciar Sesión con Google</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-[calc(100dvh-60px)] px-3 sm:px-4 py-4 sm:py-8 max-w-5xl mx-auto space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-[#EADBCE] pb-3">
        <div>
          <button
            onClick={onBackToHome}
            className="text-xs text-[#6B6258] hover:text-[#383028] font-bold flex items-center gap-1.5 cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio del juego</span>
          </button>

          <h1 className="text-3xl font-black font-serif text-[#383028] tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#27864B]" />
            <span>PANEL DE CONTROL DE MANOLO'S</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6258]">
            Administración del Torneo Mensual, Premios, Participantes y Resultados
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-[#6B6258] font-bold uppercase">Admin Autenticado</div>
            <div className="text-xs font-mono font-bold text-[#27864B] max-w-[180px] truncate">
              {currentUser.email || currentUser.displayName || 'Administrador'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-xs font-bold text-[#D93636] hover:bg-[#FBE4DF] hover:border-[#D93636]/40 cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#EADBCE] pb-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#27864B] text-white shadow-xs'
              : 'text-[#6B6258] hover:text-[#383028] hover:bg-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Configuración & Premio</span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'participants'
              ? 'bg-[#27864B] text-white shadow-xs'
              : 'text-[#6B6258] hover:text-[#383028] hover:bg-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participantes ({participants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-[#27864B] text-white shadow-xs'
              : 'text-[#6B6258] hover:text-[#383028] hover:bg-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Historial de Partidas ({results.length})</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-[#DCEFE1] border-2 border-[#27864B]/40 text-[#27864B] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#27864B] shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: SETTINGS & PRIZE */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-[#EADBCE] shadow-sm space-y-6">
          <h2 className="text-xl font-black text-[#27864B] font-serif border-b border-[#EADBCE] pb-3">
            CONFIGURACIÓN GENERAL DEL JUEGO
          </h2>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            {/* Game Active Switch */}
            <div className="flex items-center justify-between p-4 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE]">
              <div>
                <div className="text-sm font-black text-[#383028]">
                  Estado del Juego: {gameActive ? 'ACTIVO (PÚBLICO)' : 'EN PAUSA (MANTENIMIENTO)'}
                </div>
                <div className="text-xs text-[#6B6258]">
                  Permite o suspende nuevos intentos de juego.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGameActive(!gameActive)}
                className={`p-1.5 rounded-2xl transition-colors cursor-pointer ${
                  gameActive ? 'text-[#27864B]' : 'text-[#6B6258]'
                }`}
              >
                {gameActive ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            {/* Monthly Prize Section */}
            <div className="p-4 bg-[#DCEFE1]/40 rounded-2xl border border-[#27864B]/30 space-y-4">
              <div className="text-xs font-black uppercase text-[#27864B] tracking-wider">
                🏆 PREMIO ESPECIAL DEL MES ACTUAL
              </div>

              <div>
                <label className="block text-xs font-bold text-[#383028] mb-1">
                  Nombre / Título del Premio:
                </label>
                <input
                  type="text"
                  required
                  value={prizeName}
                  onChange={e => setPrizeName(e.target.value)}
                  className="w-full bg-white border border-[#EADBCE] rounded-xl px-4 py-2.5 text-sm text-[#383028] focus:outline-hidden focus:border-[#27864B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#383028] mb-1">
                  Descripción Detallada del Premio:
                </label>
                <textarea
                  rows={3}
                  value={prizeDesc}
                  onChange={e => setPrizeDesc(e.target.value)}
                  className="w-full bg-white border border-[#EADBCE] rounded-xl px-4 py-2.5 text-sm text-[#383028] focus:outline-hidden focus:border-[#27864B]"
                />
              </div>
            </div>

            {/* Rules Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#383028] mb-1">
                  Cantidad Máxima de Intentos por Jugador:
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxAttempts}
                  onChange={e => setMaxAttempts(Number(e.target.value))}
                  className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-4 py-2.5 text-sm text-[#383028] focus:outline-hidden focus:border-[#27864B] font-mono"
                />
                <span className="text-[10px] text-[#6B6258] mt-0.5 block">
                  Controla cuántas veces puede jugar un mismo DNI.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#383028] mb-1">
                  Mes de la Competencia (YYYY-MM):
                </label>
                <input
                  type="text"
                  value={currentMonth}
                  onChange={e => setCurrentMonth(e.target.value)}
                  className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-4 py-2.5 text-sm text-[#383028] focus:outline-hidden focus:border-[#27864B] font-mono"
                />
                <span className="text-[10px] text-[#6B6258] mt-0.5 block">
                  Actualmente: {formatMonthName(currentMonth)}
                </span>
              </div>
            </div>

            {/* Save Button: Verde Italiano */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EADBCE]">
              <button
                type="button"
                onClick={() => setShowResetMonthConfirm(true)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FBE4DF] border border-[#D93636]/40 text-[#D93636] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar Competencia Mensual</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>GUARDAR CONFIGURACIÓN</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PARTICIPANTS DIRECTORY */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-3xl border-2 border-[#EADBCE] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#EADBCE] bg-[#FFFDF5] flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-[#27864B]">
              LISTADO DE PARTICIPANTES REGISTRADOS
            </h2>
            <span className="text-xs text-[#6B6258] font-mono font-bold">
              Total: {participants.length}
            </span>
          </div>

          {participants.length === 0 ? (
            <div className="p-8 text-center text-[#6B6258] text-xs">
              No hay participantes registrados todavía.
            </div>
          ) : (
            <div className="divide-y divide-[#EADBCE]/70 max-h-[500px] overflow-y-auto">
              {participants.map(p => (
                <div key={p.dni} className="p-4 flex items-center justify-between hover:bg-[#FFFDF5] text-xs">
                  <div>
                    <div className="font-bold text-[#383028] text-sm">{p.fullName}</div>
                    <div className="text-[#6B6258] font-mono">DNI: {p.dni}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[#27864B] font-bold">{p.totalAttempts} intentos</div>
                    <div className="text-[10px] text-[#6B6258]">
                      Último: {p.lastAttemptAt ? new Date(p.lastAttemptAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GAME RESULTS MANAGEMENT */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-3xl border-2 border-[#EADBCE] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#EADBCE] bg-[#FFFDF5] flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-[#27864B]">
              REGISTROS DE PARTIDAS COMPLETADAS
            </h2>
            <span className="text-xs text-[#6B6258] font-mono font-bold">
              Total: {results.length} registros
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center text-[#6B6258] text-xs">
              No hay partidas registradas en el historial.
            </div>
          ) : (
            <div className="divide-y divide-[#EADBCE]/70 max-h-[500px] overflow-y-auto">
              {results.map((res, idx) => (
                <div key={res.id || idx} className="p-4 flex items-center justify-between hover:bg-[#FFFDF5] text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-[#383028] text-sm truncate">{res.fullName}</div>
                    <div className="text-[#6B6258] font-mono">
                      DNI: {res.dni} • Mes: {res.month}
                    </div>
                    <div className="text-[10px] text-[#6B6258] mt-0.5">
                      N1: {res.level1Score} | N2: {res.level2Score} | N3: {res.level3Score} | {res.totalTimeSeconds}s
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-[#27864B]">
                        {res.totalScore?.toLocaleString()} pts
                      </div>
                      <div className="text-[10px] text-[#27864B] font-mono font-bold">
                        {res.accuracy || 100}% prec.
                      </div>
                    </div>

                    <button
                      onClick={() => setItemToDelete(res)}
                      title="Eliminar partida"
                      className="p-2 rounded-xl bg-white hover:bg-[#FBE4DF] text-[#6B6258] hover:text-[#D93636] border border-[#EADBCE] cursor-pointer shadow-xs transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal: Delete Result */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-[#383028]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#D93636] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <AlertTriangle className="w-12 h-12 text-[#D93636] mx-auto" />
            <h3 className="text-lg font-black text-[#383028]">¿Eliminar registro?</h3>
            <p className="text-xs text-[#6B6258]">
              ¿Seguro que deseas eliminar la partida de <strong>{itemToDelete.fullName}</strong> ({itemToDelete.totalScore} pts)? Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] text-[#6B6258] text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteResultConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-[#D93636] text-white text-xs font-bold hover:bg-[#b91c1c] cursor-pointer shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Month */}
      {showResetMonthConfirm && (
        <div className="fixed inset-0 z-50 bg-[#383028]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#D93636] rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-xl">
            <RotateCcw className="w-12 h-12 text-[#D93636] mx-auto" />
            <h3 className="text-xl font-black text-[#383028]">¿Reiniciar Competencia Mensual?</h3>
            <p className="text-xs text-[#6B6258] leading-relaxed">
              Esto reseteará los resultados de la competencia del mes ({currentMonth}) para dar inicio a un nuevo torneo. Los datos del ranking histórico se mantendrán archivados.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowResetMonthConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] text-[#6B6258] text-xs font-bold hover:bg-stone-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetMonthConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-[#D93636] text-white text-xs font-bold hover:bg-[#b91c1c] cursor-pointer shadow-xs"
              >
                Sí, Reiniciar Torneo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
