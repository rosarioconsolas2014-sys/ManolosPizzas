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
  Calendar,
  Award,
  Gamepad2,
  History,
  BarChart3,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Mail,
  LogOut,
  Sparkles,
  Download,
  Ban,
  Check,
  X,
  Clock,
  MapPin,
  Settings as SettingsIcon,
  RefreshCw,
  Undo2,
  ToggleLeft,
  ToggleRight,
  Gift
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
import {
  getGameConfig,
  updateGameConfig,
  archiveCompetition,
  getCompetitionsHistory,
  getUserRole,
  verifyAdminPasscode
} from '../services/configService.js';
import {
  getAllParticipants,
  toggleBlockParticipant,
  resetParticipantAttempts
} from '../services/playerService.js';
import {
  getAllTimeRanking,
  deleteGameResult
} from '../services/scoreService.js';
import {
  formatMonthName,
  maskDni,
  DEFAULT_COMPETITION_CONFIG
} from '../utils/gameConfig.js';
import { sound } from '../utils/audio.js';

export default function Admin({ onBackToHome, onConfigUpdated }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('ADMINISTRADOR'); // 'ADMINISTRADOR' | 'SUPERVISOR'
  const [loginMethod, setLoginMethod] = useState('passcode'); // 'passcode' | 'email'
  const [passcodeInput, setPasscodeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'participantes' | 'resultados' | 'historial' | 'juegos'
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // SETTINGS CENTRALIZADOS (settings/gameConfig)
  // Bloque A: Acceso administrativo
  const [adminPasscode, setAdminPasscode] = useState(DEFAULT_COMPETITION_CONFIG.adminPasscode);
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeDraft, setPasscodeDraft] = useState(DEFAULT_COMPETITION_CONFIG.adminPasscode);
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);

  // Bloque B: Campeonato
  const [competitionEnabled, setCompetitionEnabled] = useState(DEFAULT_COMPETITION_CONFIG.competitionEnabled);
  const [competitionTitle, setCompetitionTitle] = useState(DEFAULT_COMPETITION_CONFIG.competitionTitle);
  const [startDate, setStartDate] = useState(DEFAULT_COMPETITION_CONFIG.startDate);
  const [endDate, setEndDate] = useState(DEFAULT_COMPETITION_CONFIG.endDate);
  const [maxAttempts, setMaxAttempts] = useState(DEFAULT_COMPETITION_CONFIG.maxAttempts);
  const [unlimitedAttempts, setUnlimitedAttempts] = useState(DEFAULT_COMPETITION_CONFIG.unlimitedAttempts);

  // Bloque C: Evento
  const [eventDate, setEventDate] = useState(DEFAULT_COMPETITION_CONFIG.eventDate);
  const [eventTime, setEventTime] = useState(DEFAULT_COMPETITION_CONFIG.eventTime);
  const [eventLocation, setEventLocation] = useState(DEFAULT_COMPETITION_CONFIG.eventLocation);
  const [eventAddress, setEventAddress] = useState(DEFAULT_COMPETITION_CONFIG.eventAddress);
  const [eventDescription, setEventDescription] = useState(DEFAULT_COMPETITION_CONFIG.eventDescription);

  // Bloque D: Premio
  const [prizeTitle, setPrizeTitle] = useState(DEFAULT_COMPETITION_CONFIG.prizeTitle);
  const [prizeSubtitle, setPrizeSubtitle] = useState(DEFAULT_COMPETITION_CONFIG.prizeSubtitle);
  const [prizeImage, setPrizeImage] = useState(DEFAULT_COMPETITION_CONFIG.prizeImage);
  const [prizeQuantity, setPrizeQuantity] = useState(DEFAULT_COMPETITION_CONFIG.prizeQuantity);

  // Minijuegos Settings (Nivel 1, 2, 3 Memoria)
  const [level1Time, setLevel1Time] = useState(45);
  const [level2Time, setLevel2Time] = useState(35);
  const [level3Time, setLevel3Time] = useState(40);
  const [memoryCardCount, setMemoryCardCount] = useState(12);
  const [memoryPointsPerMatch, setMemoryPointsPerMatch] = useState(200);
  const [memoryCompletionBonus, setMemoryCompletionBonus] = useState(500);
  const [memorySpeedBonusPerSecond, setMemorySpeedBonusPerSecond] = useState(10);
  const [memoryErrorPenalty, setMemoryErrorPenalty] = useState(20);

  // Snapshot of last saved values (for CANCELAR CAMBIOS)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(null);

  // Lists & Data
  const [participants, setParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState('all'); // 'all' | 'active' | 'blocked'
  const [showFullDni, setShowFullDni] = useState(false);

  const [results, setResults] = useState([]);
  const [resultSort, setResultSort] = useState('score'); // 'score' | 'time' | 'date'
  const [historyList, setHistoryList] = useState([]);

  // Confirmation Modals
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm, danger }

  useEffect(() => {
    // Check Firebase Auth session
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const role = await getUserRole(user);
        setUserRole(role);
        loadAllAdminData();
      }
    });

    // Also check session storage for passcode admin session
    const savedPasscodeSession = sessionStorage.getItem('manolos_admin_passcode_auth');
    if (savedPasscodeSession === 'true') {
      setCurrentUser({ email: 'administrador@manolospizzas.com', isPasscodeAdmin: true });
      setUserRole('ADMINISTRADOR');
      loadAllAdminData();
    }

    return () => unsubscribe();
  }, []);

  const populateConfigState = (cfg) => {
    // Bloque A
    const code = cfg.adminPasscode || DEFAULT_COMPETITION_CONFIG.adminPasscode;
    setAdminPasscode(code);
    setPasscodeDraft(code);

    // Bloque B
    setCompetitionEnabled(cfg.competitionEnabled !== false && cfg.status !== 'pausado');
    setCompetitionTitle(cfg.competitionTitle || cfg.eventName || DEFAULT_COMPETITION_CONFIG.competitionTitle);
    setStartDate(cfg.startDate || DEFAULT_COMPETITION_CONFIG.startDate);
    setEndDate(cfg.endDate || DEFAULT_COMPETITION_CONFIG.endDate);
    setMaxAttempts(Number(cfg.maxAttempts ?? cfg.maxAttemptsPerPlayer) || 3);
    setUnlimitedAttempts(Boolean(cfg.unlimitedAttempts || cfg.maxAttempts === 0));

    // Bloque C
    setEventDate(cfg.eventDate || DEFAULT_COMPETITION_CONFIG.eventDate);
    setEventTime(cfg.eventTime || DEFAULT_COMPETITION_CONFIG.eventTime);
    setEventLocation(cfg.eventLocation || cfg.location || DEFAULT_COMPETITION_CONFIG.eventLocation);
    setEventAddress(cfg.eventAddress || cfg.address || DEFAULT_COMPETITION_CONFIG.eventAddress);
    setEventDescription(cfg.eventDescription || cfg.description || DEFAULT_COMPETITION_CONFIG.eventDescription);

    // Bloque D
    setPrizeTitle(cfg.prizeTitle || cfg.prizeName || cfg.monthlyPrizeName || DEFAULT_COMPETITION_CONFIG.prizeTitle);
    setPrizeSubtitle(cfg.prizeSubtitle || cfg.prizeDescription || cfg.monthlyPrizeDescription || DEFAULT_COMPETITION_CONFIG.prizeSubtitle);
    setPrizeImage(cfg.prizeImage || cfg.prizeImageUrl || '');
    setPrizeQuantity(Number(cfg.prizeQuantity ?? 1));

    // Juegos
    setLevel1Time(Number(cfg.level1Time) || 45);
    setLevel2Time(Number(cfg.level2Time) || 35);
    setLevel3Time(Number(cfg.level3Time) || 40);
    setMemoryCardCount(Number(cfg.memoryCardCount) || 12);
    setMemoryPointsPerMatch(Number(cfg.memoryPointsPerMatch) || 200);
    setMemoryCompletionBonus(Number(cfg.memoryCompletionBonus) || 500);
    setMemorySpeedBonusPerSecond(Number(cfg.memorySpeedBonusPerSecond) || 10);
    setMemoryErrorPenalty(Number(cfg.memoryErrorPenalty ?? 20));

    // Store snapshot
    setLastSavedSnapshot(cfg);
  };

  const loadAllAdminData = async () => {
    setIsLoading(true);
    try {
      const cfg = await getGameConfig();
      populateConfigState(cfg);

      const [pList, rList, hList] = await Promise.all([
        getAllParticipants(),
        getAllTimeRanking(),
        getCompetitionsHistory()
      ]);
      setParticipants(pList);
      setResults(rList);
      setHistoryList(hList);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. GUARDAR SETTINGS
  const handleSaveSettings = async (overridePasscode = null) => {
    if (userRole === 'SUPERVISOR') {
      sound.playError();
      return;
    }
    sound.playClick();
    setIsLoading(true);

    const targetPasscode = overridePasscode || adminPasscode;

    const payload = {
      adminPasscode: targetPasscode,
      competitionEnabled: Boolean(competitionEnabled),
      competitionTitle: competitionTitle.trim(),
      startDate,
      endDate,
      eventDate,
      eventTime,
      eventLocation: eventLocation.trim(),
      eventAddress: eventAddress.trim(),
      maxAttempts: Number(maxAttempts) || 3,
      unlimitedAttempts: Boolean(unlimitedAttempts),
      prizeTitle: prizeTitle.trim(),
      prizeSubtitle: prizeSubtitle.trim(),
      prizeImage: prizeImage.trim(),
      prizeQuantity: Number(prizeQuantity) || 1,
      eventDescription: eventDescription.trim(),

      // Minijuegos
      level1Time: Number(level1Time),
      level2Time: Number(level2Time),
      level3Time: Number(level3Time),
      memoryCardCount: Number(memoryCardCount),
      memoryPointsPerMatch: Number(memoryPointsPerMatch),
      memoryCompletionBonus: Number(memoryCompletionBonus),
      memorySpeedBonusPerSecond: Number(memorySpeedBonusPerSecond),
      memoryErrorPenalty: Number(memoryErrorPenalty),

      // Retrocompatibility aliases
      eventName: competitionTitle.trim(),
      publicTitle: competitionTitle.trim(),
      description: eventDescription.trim(),
      location: eventLocation.trim(),
      address: eventAddress.trim(),
      prizeName: prizeTitle.trim(),
      prizeDescription: prizeSubtitle.trim(),
      prizeImageUrl: prizeImage.trim(),
      status: competitionEnabled ? 'activo' : 'pausado',
      gameActive: Boolean(competitionEnabled)
    };

    try {
      const saved = await updateGameConfig(payload);
      setLastSavedSnapshot(saved);
      sound.playOrderSuccess();
      setSaveSuccessMsg('¡Settings guardados con éxito en Firebase Firestore (settings/gameConfig)!');
      if (onConfigUpdated) onConfigUpdated(saved);
      setTimeout(() => setSaveSuccessMsg(''), 4500);
    } catch (e) {
      sound.playError();
      console.error(e);
      setSaveSuccessMsg('Hubo un error al guardar los settings en Firebase.');
      setTimeout(() => setSaveSuccessMsg(''), 4500);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CANCELAR CAMBIOS (restablece campos sin recargar la página)
  const handleCancelChanges = () => {
    sound.playClick();
    if (lastSavedSnapshot) {
      populateConfigState(lastSavedSnapshot);
      setIsChangingPasscode(false);
      setSaveSuccessMsg('Cambios cancelados. Se restauró el formulario al estado previamente guardado.');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
    }
  };

  // 3. RESTAURAR VALORES GUARDADOS (recarga desde Firestore)
  const handleRestoreSaved = async () => {
    sound.playClick();
    await loadAllAdminData();
    setIsChangingPasscode(false);
    sound.playOrderSuccess();
    setSaveSuccessMsg('Valores originales restaurados exitosamente desde Firebase Firestore.');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  // Passcode change with confirmation
  const handleRequestPasscodeChange = () => {
    const clean = passcodeDraft.trim();
    if (!clean || clean.length < 4) {
      sound.playError();
      setAuthError('El nuevo passcode debe tener al menos 4 caracteres.');
      setTimeout(() => setAuthError(''), 4000);
      return;
    }

    setConfirmModal({
      title: '¿Confirmar cambio de Passcode Administrativo?',
      message: `El nuevo código de acceso será "${clean}". Deberás utilizarlo para ingresar al panel en tus próximas sesiones.`,
      danger: false,
      onConfirm: async () => {
        setAdminPasscode(clean);
        setIsChangingPasscode(false);
        setConfirmModal(null);
        await handleSaveSettings(clean);
      }
    });
  };

  // Passcode-based login handler
  const handlePasscodeLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    sound.playClick();

    try {
      const isValid = await verifyAdminPasscode(passcodeInput);
      if (isValid) {
        sessionStorage.setItem('manolos_admin_passcode_auth', 'true');
        setCurrentUser({ email: 'administrador@manolospizzas.com', isPasscodeAdmin: true });
        setUserRole('ADMINISTRADOR');
        sound.playOrderSuccess();
        loadAllAdminData();
      } else {
        sound.playError();
        setAuthError('Passcode administrativo incorrecto. Verificá el código.');
      }
    } catch (err) {
      sound.playError();
      setAuthError('Error al verificar el passcode.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Email / Google login handlers
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    const cleanEmail = emailInput.trim();

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
      }
      sound.playOrderSuccess();
    } catch (err) {
      sound.playError();
      setAuthError(err.message || 'Error de autenticación.');
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
    } catch (err) {
      sound.playError();
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    sound.playClick();
    sessionStorage.removeItem('manolos_admin_passcode_auth');
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
  };

  // Participant Actions
  const handleToggleBlock = async (participant) => {
    if (userRole === 'SUPERVISOR') return;
    const newStatus = !participant.blocked;
    sound.playClick();
    await toggleBlockParticipant(participant.dni, newStatus);
    setParticipants(prev =>
      prev.map(p => (p.dni === participant.dni ? { ...p, blocked: newStatus } : p))
    );
  };

  const handleResetAttempts = async (participant) => {
    if (userRole === 'SUPERVISOR') return;
    setConfirmModal({
      title: '¿Reiniciar intentos?',
      message: `¿Estás seguro de reiniciar los intentos de ${participant.fullName || participant.nombre} (DNI: ${participant.dni}) a 0?`,
      danger: false,
      onConfirm: async () => {
        sound.playClick();
        await resetParticipantAttempts(participant.dni);
        setParticipants(prev =>
          prev.map(p => (p.dni === participant.dni ? { ...p, totalAttempts: 0, intentos: 0 } : p))
        );
        setConfirmModal(null);
      }
    });
  };

  // Results Actions
  const handleDeleteResult = (resultItem) => {
    if (userRole === 'SUPERVISOR') return;
    setConfirmModal({
      title: '¿Eliminar partida?',
      message: `Esta acción borrará de forma permanente el resultado de ${resultItem.fullName || resultItem.nombre} (${resultItem.totalScore || resultItem.puntajeTotal} pts).`,
      danger: true,
      onConfirm: async () => {
        sound.playClick();
        await deleteGameResult(resultItem.id);
        setResults(prev => prev.filter(r => r.id !== resultItem.id));
        setConfirmModal(null);
      }
    });
  };

  const handleExportCSV = () => {
    sound.playClick();
    const headers = ['Posición', 'Nombre', 'DNI', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Puntaje Total', 'Tiempo Total (s)', 'Fecha'];
    const rows = sortedResults.map((r, idx) => [
      idx + 1,
      `"${r.fullName || r.nombre || ''}"`,
      r.dni || '',
      r.level1Score || r.nivel1 || 0,
      r.level2Score || r.nivel2 || 0,
      r.level3Score || r.nivel3 || 0,
      r.totalScore || r.puntajeTotal || 0,
      r.totalTimeSeconds || r.tiempoTotal || 0,
      r.createdAt || r.fecha || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Resultados_ManolosPizzas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Archive Edition
  const handleArchiveCurrentEdition = () => {
    if (userRole === 'SUPERVISOR') return;
    setConfirmModal({
      title: '¿Archivar y guardar edición en el Historial?',
      message: 'Se creará una copia histórica permanente de esta edición con sus ganadores y configuración. Los puntajes históricos se preservarán íntegramente.',
      danger: false,
      onConfirm: async () => {
        sound.playOrderSuccess();
        const top3 = sortedResults.slice(0, 3);
        const record = await archiveCompetition({
          eventName: competitionTitle,
          edition: `${formatMonthName(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)}`,
          prizeName: prizeTitle,
          status: 'finalizado',
          podium: top3.map(p => ({
            name: p.fullName || p.nombre,
            dni: p.dni,
            score: p.totalScore || p.puntajeTotal,
            time: p.totalTimeSeconds || p.tiempoTotal
          })),
          totalParticipants: participants.length,
          totalGames: results.length
        });

        setHistoryList(prev => [record, ...prev]);
        setConfirmModal(null);
        setSaveSuccessMsg('¡Edición archivada con éxito en el Historial!');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
      }
    });
  };

  // Filtered Participants
  const filteredParticipants = participants.filter(p => {
    const q = participantSearch.toLowerCase();
    const matchesSearch =
      (p.fullName || p.nombre || '').toLowerCase().includes(q) ||
      (p.dni || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (participantFilter === 'active') return !p.blocked;
    if (participantFilter === 'blocked') return !!p.blocked;
    return true;
  });

  const sortedResults = [...results].sort((a, b) => {
    if (resultSort === 'time') {
      return (a.totalTimeSeconds || a.tiempoTotal || 0) - (b.totalTimeSeconds || b.tiempoTotal || 0);
    }
    if (resultSort === 'date') {
      return new Date(b.createdAt || b.fecha || 0) - new Date(a.createdAt || a.fecha || 0);
    }
    return (b.totalScore || b.puntajeTotal || 0) - (a.totalScore || a.puntajeTotal || 0);
  });

  // Login View if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100dvh-60px)] flex items-center justify-center px-3 sm:px-4 py-8 max-w-md mx-auto w-full">
        <div className="w-full bg-white border-2 border-[#EADBCE] rounded-3xl p-6 sm:p-8 shadow-md relative text-center overflow-hidden">
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
            Gestión centralizada del campeonato con Firebase Firestore
          </p>

          {/* Switch between Passcode Login and Firebase Auth */}
          <div className="flex bg-[#FFFDF5] p-1 rounded-xl border border-[#EADBCE] mt-4 mb-3">
            <button
              type="button"
              onClick={() => { setLoginMethod('passcode'); setAuthError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                loginMethod === 'passcode' ? 'bg-[#27864B] text-white shadow-2xs' : 'text-[#6B6258]'
              }`}
            >
              Passcode Rápido
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setAuthError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                loginMethod === 'email' ? 'bg-[#27864B] text-white shadow-2xs' : 'text-[#6B6258]'
              }`}
            >
              Correo / Google
            </button>
          </div>

          {authError && (
            <div className="mb-3 p-3 rounded-2xl bg-[#FBE4DF] border border-[#D93636]/40 text-[#D93636] text-xs text-left font-medium">
              {authError}
            </div>
          )}

          {/* Method 1: Passcode Direct Login */}
          {loginMethod === 'passcode' && (
            <form onSubmit={handlePasscodeLogin} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-black uppercase text-[#383028] mb-1">
                  Passcode Administrativo:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Código (ej: MANOLO2026)"
                    value={passcodeInput}
                    onChange={e => setPasscodeInput(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-[#383028] focus:border-[#27864B] outline-none uppercase tracking-wider"
                  />
                  <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6258]" />
                </div>
                <p className="text-[11px] text-[#6B6258] mt-1">
                  Código inicial de acceso: <span className="font-mono font-bold text-[#27864B]">MANOLO2026</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>{authLoading ? 'Verificando...' : 'INGRESAR CON PASSCODE'}</span>
              </button>
            </form>
          )}

          {/* Method 2: Email & Google */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
              <div className="flex bg-[#FFFDF5] p-1 rounded-xl border border-[#EADBCE] mb-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${!isRegisterMode ? 'bg-[#27864B] text-white' : 'text-[#6B6258]'}`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold ${isRegisterMode ? 'bg-[#27864B] text-white' : 'text-[#6B6258]'}`}
                >
                  Crear Admin
                </button>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#383028] mb-1">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@manolospizzas.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#383028] focus:border-[#27864B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#383028] mb-1">
                  Contraseña:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-[#EADBCE] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#383028] focus:border-[#27864B] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {authLoading ? 'Verificando...' : isRegisterMode ? 'REGISTRAR ADMIN' : 'INGRESAR AL PANEL'}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-white border-2 border-[#EADBCE] hover:border-[#27864B] text-[#383028] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs mt-2"
              >
                <span>🔑</span>
                <span>Continuar con Google</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // 5 Main Tabs with SETTINGS ⚙️ Prominently at the front
  const tabs = [
    { id: 'settings', label: 'SETTINGS ⚙️', icon: SettingsIcon },
    { id: 'participantes', label: 'Participantes', icon: Users },
    { id: 'resultados', label: 'Resultados', icon: BarChart3 },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'juegos', label: 'Juegos', icon: Gamepad2 }
  ];

  return (
    <div className="min-h-[calc(100dvh-60px)] px-3 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto w-full space-y-4">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#EADBCE] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] hover:bg-stone-100 text-[#6B6258] cursor-pointer"
            title="Volver a la portada"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black font-serif text-[#383028]">
                PANEL DE ADMINISTRACIÓN
              </h1>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                userRole === 'SUPERVISOR'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-[#DCEFE1] text-[#27864B] border-[#27864B]/40'
              }`}>
                {userRole}
              </span>
            </div>
            <div className="text-xs text-[#6B6258] flex items-center gap-2">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span className="font-mono text-[#27864B]">settings/gameConfig</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userRole === 'ADMINISTRADOR' && (
            <button
              onClick={() => handleSaveSettings()}
              disabled={isLoading}
              className="py-2.5 px-4 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'GUARDANDO...' : 'GUARDAR SETTINGS'}</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] hover:bg-[#FBE4DF] hover:border-[#D93636] text-[#6B6258] hover:text-[#D93636] cursor-pointer transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success & Status notification banner */}
      {saveSuccessMsg && (
        <div className="p-3 bg-[#DCEFE1] border-2 border-[#27864B] text-[#27864B] rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-2xl p-1.5 border-2 border-[#EADBCE] shadow-xs flex overflow-x-auto gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(t.id);
              }}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#27864B] text-white shadow-xs'
                  : 'text-[#6B6258] hover:text-[#383028] hover:bg-[#FFFDF5]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SETTINGS / CONFIGURACIÓN GENERAL (CENTRALIZADO) */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Action Buttons Header */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#EADBCE] shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-[#383028] uppercase font-serif flex items-center gap-2">
                <span>⚙️ CONFIGURACIÓN DEL JUEGO Y CAMPEONATO</span>
                <span className="font-mono text-[10px] bg-[#DCEFE1] text-[#27864B] px-2 py-0.5 rounded-full border border-[#27864B]/30">
                  settings/gameConfig
                </span>
              </div>
              <p className="text-xs text-[#6B6258]">
                Todos los cambios se guardan centralizados en Firestore y se recuperan automáticamente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCancelChanges}
                className="py-2 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#383028] text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Restablecer a valores antes de modificar"
              >
                <Undo2 className="w-4 h-4" />
                <span>CANCELAR CAMBIOS</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreSaved}
                className="py-2 px-3.5 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] hover:border-[#27864B] text-[#6B6258] hover:text-[#27864B] text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Recargar desde Firestore"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RESTAURAR VALORES GUARDADOS</span>
              </button>

              {userRole === 'ADMINISTRADOR' && (
                <button
                  type="button"
                  onClick={() => handleSaveSettings()}
                  disabled={isLoading}
                  className="py-2 px-4 rounded-xl bg-[#27864B] hover:bg-[#1e6b3c] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? 'GUARDANDO...' : 'GUARDAR SETTINGS'}</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BLOQUE A: ACCESO ADMINISTRATIVO */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#EADBCE] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-3">
                <div className="p-2 rounded-xl bg-[#DCEFE1] text-[#27864B]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#383028] uppercase font-serif">
                    A. ACCESO ADMINISTRATIVO
                  </h3>
                  <p className="text-[11px] text-[#6B6258]">
                    Passcode secreto para acceder y gestionar el panel
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">
                    Passcode Actual de Acceso:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPasscode ? 'text' : 'password'}
                        disabled={!isChangingPasscode}
                        value={isChangingPasscode ? passcodeDraft : adminPasscode}
                        onChange={e => setPasscodeDraft(e.target.value)}
                        className={`w-full font-mono rounded-xl px-3 py-2 text-xs border outline-none ${
                          isChangingPasscode
                            ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                            : 'bg-[#FFFDF5] border-[#EADBCE] text-[#383028]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6258] hover:text-[#383028] cursor-pointer"
                        title={showPasscode ? 'Ocultar' : 'Ver'}
                      >
                        {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {!isChangingPasscode ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPasscodeDraft(adminPasscode);
                          setIsChangingPasscode(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-[#DCEFE1] text-[#383028] hover:text-[#27864B] font-bold text-xs uppercase cursor-pointer"
                      >
                        Modificar
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleRequestPasscodeChange}
                          className="py-2 px-3 rounded-xl bg-[#27864B] text-white font-black text-xs uppercase cursor-pointer hover:bg-[#1e6b3c]"
                        >
                          Confirmar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasscodeDraft(adminPasscode);
                            setIsChangingPasscode(false);
                          }}
                          className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B6258] mt-1">
                    Este código es requerido para el inicio rápido y queda resguardado en Firestore.
                  </p>
                </div>

                <div className="p-3 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#383028]">Rol Actual de Sesión:</span>
                    <div className="text-[11px] text-[#6B6258]">Permisos administrativos totales</div>
                  </div>
                  <span className="font-black text-xs px-2.5 py-1 rounded-full bg-[#DCEFE1] text-[#27864B] border border-[#27864B]/40">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>

            {/* BLOQUE B: CAMPEONATO */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#EADBCE] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-3">
                <div className="p-2 rounded-xl bg-[#F8D978]/40 text-[#B45309]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#383028] uppercase font-serif">
                    B. CAMPEONATO
                  </h3>
                  <p className="text-[11px] text-[#6B6258]">
                    Estado de actividad, fechas límite e intentos
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Switch: Campeonato Activo (competitionEnabled) */}
                <div className="p-3 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] flex items-center justify-between">
                  <div>
                    <div className="font-black text-[#383028] uppercase">Campeonato Activo (`competitionEnabled`):</div>
                    <div className="text-[11px] text-[#6B6258]">
                      {competitionEnabled ? 'Habilitado para que el público juegue' : 'Pausado temporalmente'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCompetitionEnabled(!competitionEnabled);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                      competitionEnabled
                        ? 'bg-[#DCEFE1] text-[#27864B] border-2 border-[#27864B]'
                        : 'bg-[#FBE4DF] text-[#D93636] border-2 border-[#D93636]'
                    }`}
                  >
                    {competitionEnabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    <span>{competitionEnabled ? 'ACTIVO' : 'PAUSADO'}</span>
                  </button>
                </div>

                {/* Título del campeonato (competitionTitle) */}
                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">
                    Título del Campeonato (`competitionTitle`):
                  </label>
                  <input
                    type="text"
                    value={competitionTitle}
                    onChange={e => setCompetitionTitle(e.target.value)}
                    className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-2 text-[#383028] font-bold outline-none focus:border-[#27864B]"
                  />
                </div>

                {/* Fechas de inicio y fin */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-black uppercase text-[#383028] mb-1">Fecha de Inicio (`startDate`):</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-[#383028] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-black uppercase text-[#383028] mb-1">Fecha de Fin (`endDate`):</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-[#383028] font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Intentos máximos e intentos ilimitados */}
                <div className="p-3 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#383028]">Intentos Ilimitados (`unlimitedAttempts`):</span>
                      <p className="text-[10px] text-[#6B6258]">Si está activo, ignora el límite numérico</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setUnlimitedAttempts(!unlimitedAttempts);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase flex items-center gap-1 cursor-pointer ${
                        unlimitedAttempts
                          ? 'bg-[#DCEFE1] text-[#27864B] border border-[#27864B]'
                          : 'bg-stone-100 text-[#6B6258] border border-stone-300'
                      }`}
                    >
                      <span>{unlimitedAttempts ? 'ILIMITADO (SÍ)' : 'LIMITADO (NO)'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-[#383028] mb-1">
                      Intentos Máximos por Jugador (`maxAttempts`):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      disabled={unlimitedAttempts}
                      value={maxAttempts}
                      onChange={e => setMaxAttempts(Number(e.target.value))}
                      className={`w-full rounded-xl px-3 py-1.5 font-mono text-xs border outline-none ${
                        unlimitedAttempts
                          ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                          : 'bg-white border-[#EADBCE] text-[#383028]'
                      }`}
                    />
                    {unlimitedAttempts && (
                      <span className="text-[10px] text-[#27864B] font-bold">
                        ✓ Los jugadores pueden jugar partidas infinitas sin agotar intentos.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BLOQUE C: EVENTO */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#EADBCE] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-3">
                <div className="p-2 rounded-xl bg-[#DCEFE1] text-[#27864B]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#383028] uppercase font-serif">
                    C. EVENTO
                  </h3>
                  <p className="text-[11px] text-[#6B6258]">
                    Entrega de premios, locación y detalles presenciales
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-black uppercase text-[#383028] mb-1">Fecha de Premiación (`eventDate`):</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-[#383028] font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-black uppercase text-[#383028] mb-1">Hora del Evento (`eventTime`):</label>
                    <input
                      type="time"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 text-[#383028] font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">Lugar del Evento (`eventLocation`):</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={e => setEventLocation(e.target.value)}
                    placeholder="Manolo's Pizzas - Salón Principal"
                    className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-2 text-[#383028] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">Dirección (`eventAddress`):</label>
                  <input
                    type="text"
                    value={eventAddress}
                    onChange={e => setEventAddress(e.target.value)}
                    placeholder="Av. Pellegrini 1450, Rosario"
                    className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-2 text-[#383028] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">Descripción del Evento (`eventDescription`):</label>
                  <textarea
                    rows={3}
                    value={eventDescription}
                    onChange={e => setEventDescription(e.target.value)}
                    placeholder="Información sobre la degustación, trofeos y celebración..."
                    className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-2 text-[#383028] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE D: PREMIO */}
            <div className="bg-white rounded-3xl p-5 border-2 border-[#EADBCE] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#EADBCE] pb-3">
                <div className="p-2 rounded-xl bg-[#FBE4DF] text-[#D93636]">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#383028] uppercase font-serif">
                    D. PREMIO
                  </h3>
                  <p className="text-[11px] text-[#6B6258]">
                    Premios para el ganador y características
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">
                    Título del Premio (`prizeTitle`):
                  </label>
                  <input
                    type="text"
                    value={prizeTitle}
                    onChange={e => setPrizeTitle(e.target.value)}
                    placeholder="SUPER CENA PARA 4 PERSONAS"
                    className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-2 text-[#383028] font-black outline-none focus:border-[#27864B]"
                  />
                </div>

                <div>
                  <label className="block font-black uppercase text-[#383028] mb-1">
                    Bajada Promocional (`prizeSubtitle`):
                  </label>
                  <textarea
                    rows={2}
                    value={prizeSubtitle}
                    onChange={e => setPrizeSubtitle(e.target.value)}
                    placeholder="Una cena gourmet completa para 4 personas con entradas, pizzas gigantes..."
                    className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-2 text-[#383028] outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-black uppercase text-[#383028] mb-1">Imagen del Premio (`prizeImage`):</label>
                    <input
                      type="url"
                      value={prizeImage}
                      onChange={e => setPrizeImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-1.5 text-[#383028] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-black uppercase text-[#383028] mb-1">Cantidad (`prizeQuantity`):</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={prizeQuantity}
                      onChange={e => setPrizeQuantity(Number(e.target.value))}
                      className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-3 py-1.5 text-[#383028] font-mono outline-none"
                    />
                  </div>
                </div>

                {/* Prize Live Preview Card */}
                <div className="p-3 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F8D978]/30 border border-[#F8D978] flex items-center justify-center text-2xl shrink-0">
                    🎁
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-black uppercase text-[#D93636]">Vista previa en portada</div>
                    <div className="font-black text-[#383028] text-xs truncate">{prizeTitle}</div>
                    <div className="text-[10px] text-[#6B6258] truncate">{prizeSubtitle}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARTICIPANTES */}
      {activeTab === 'participantes' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#EADBCE] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#383028] uppercase font-serif">
                GESTIÓN DE PARTICIPANTES ({participants.length})
              </h2>
              <p className="text-xs text-[#6B6258]">
                Listado oficial de la colección `players` en Firestore con intentos y estado.
              </p>
            </div>

            <button
              onClick={() => setShowFullDni(!showFullDni)}
              className="py-1.5 px-3 rounded-xl bg-[#FFFDF5] border border-[#EADBCE] text-xs font-bold text-[#383028] flex items-center gap-1.5 cursor-pointer hover:bg-stone-50"
            >
              {showFullDni ? <EyeOff className="w-4 h-4 text-[#D93636]" /> : <Eye className="w-4 h-4 text-[#27864B]" />}
              <span>{showFullDni ? 'Ocultar DNI completo' : 'Ver DNI completo'}</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6258]" />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={participantSearch}
                onChange={e => setParticipantSearch(e.target.value)}
                className="w-full bg-[#FFFDF5] border border-[#EADBCE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#383028] outline-none"
              />
            </div>

            <div className="flex gap-1.5">
              {['all', 'active', 'blocked'].map(f => (
                <button
                  key={f}
                  onClick={() => setParticipantFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                    participantFilter === f
                      ? 'bg-[#27864B] text-white'
                      : 'bg-[#FFFDF5] border border-[#EADBCE] text-[#6B6258]'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Bloqueados'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#EADBCE] rounded-2xl overflow-x-auto max-h-[450px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFDF5] text-[#6B6258] font-black uppercase border-b border-[#EADBCE]">
                <tr>
                  <th className="py-2.5 px-3">Participante</th>
                  <th className="py-2.5 px-3">DNI</th>
                  <th className="py-2.5 px-3">Registro</th>
                  <th className="py-2.5 px-3 text-center">Intentos</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#6B6258]">
                      No se encontraron participantes registrados.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map(p => (
                    <tr key={p.dni} className="hover:bg-[#FFFDF5]/60">
                      <td className="py-2.5 px-3 font-bold text-[#383028]">
                        {p.fullName || p.nombre}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#6B6258]">
                        {showFullDni ? p.dni : maskDni(p.dni)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#6B6258]">
                        {p.fechaRegistro ? new Date(p.fechaRegistro).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#27864B]">
                        {p.totalAttempts || p.intentos || 0} / {unlimitedAttempts ? '∞' : maxAttempts}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {p.blocked ? 'BLOQUEADO' : 'HABILITADO'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1">
                        {userRole === 'ADMINISTRADOR' && (
                          <>
                            <button
                              onClick={() => handleResetAttempts(p)}
                              title="Reiniciar intentos a 0"
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#DCEFE1] text-[#27864B] cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleBlock(p)}
                              title={p.blocked ? 'Desbloquear' : 'Bloquear'}
                              className={`p-1.5 rounded-lg cursor-pointer ${
                                p.blocked
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RESULTADOS */}
      {activeTab === 'resultados' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#EADBCE] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#383028] uppercase font-serif">
                RESULTADOS DE PARTIDAS (`gameResults`)
              </h2>
              <p className="text-xs text-[#6B6258]">
                Historial de partidas jugadas con tiempos y puntajes detallados.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="py-2 px-3.5 rounded-xl bg-[#27864B] text-white text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer hover:bg-[#1e6b3c]"
            >
              <Download className="w-4 h-4" />
              <span>EXPORTAR CSV</span>
            </button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#6B6258]">Ordenar por:</span>
              <select
                value={resultSort}
                onChange={e => setResultSort(e.target.value)}
                className="bg-[#FFFDF5] border border-[#EADBCE] rounded-xl px-2.5 py-1.5 font-bold text-[#383028] outline-none"
              >
                <option value="score">Mayor Puntaje</option>
                <option value="time">Menor Tiempo</option>
                <option value="date">Fecha Más Reciente</option>
              </select>
            </div>

            <div className="text-xs text-[#6B6258]">
              Mostrando <span className="font-bold text-[#383028]">{sortedResults.length}</span> partidas
            </div>
          </div>

          {/* Table */}
          <div className="border border-[#EADBCE] rounded-2xl overflow-x-auto max-h-[450px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFDF5] text-[#6B6258] font-black uppercase border-b border-[#EADBCE]">
                <tr>
                  <th className="py-2.5 px-3">Pos</th>
                  <th className="py-2.5 px-3">Chef</th>
                  <th className="py-2.5 px-3">DNI</th>
                  <th className="py-2.5 px-3 text-center">Nivel 1</th>
                  <th className="py-2.5 px-3 text-center">Nivel 2</th>
                  <th className="py-2.5 px-3 text-center">Nivel 3 (Mem)</th>
                  <th className="py-2.5 px-3 text-right">Total Pts</th>
                  <th className="py-2.5 px-3 text-right">Tiempo</th>
                  {userRole === 'ADMINISTRADOR' && <th className="py-2.5 px-3 text-center">Eliminar</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADBCE]">
                {sortedResults.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-[#6B6258]">
                      No hay resultados registrados todavía.
                    </td>
                  </tr>
                ) : (
                  sortedResults.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-[#FFFDF5]/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#27864B]">
                        #{idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#383028]">
                        {r.fullName || r.nombre}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#6B6258]">
                        {showFullDni ? r.dni : maskDni(r.dni)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#6B6258]">
                        {r.level1Score || r.nivel1 || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#6B6258]">
                        {r.level2Score || r.nivel2 || 0}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#6B6258]">
                        {r.level3Score || r.nivel3 || 0}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-[#27864B]">
                        {(r.totalScore || r.puntajeTotal || 0).toLocaleString()} pts
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#6B6258]">
                        {r.totalTimeSeconds || r.tiempoTotal || 0}s
                      </td>
                      {userRole === 'ADMINISTRADOR' && (
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleDeleteResult(r)}
                            className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORIAL */}
      {activeTab === 'historial' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#EADBCE] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EADBCE] pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#383028] uppercase font-serif">
                HISTORIAL DE EDICIONES Y CAMPEONES
              </h2>
              <p className="text-xs text-[#6B6258]">
                Registro permanente de ediciones pasadas de Manolo's Pizzas en `competitionsHistory`.
              </p>
            </div>

            {userRole === 'ADMINISTRADOR' && (
              <button
                onClick={handleArchiveCurrentEdition}
                className="py-2 px-3.5 rounded-xl bg-[#27864B] text-white text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer hover:bg-[#1e6b3c]"
              >
                <Sparkles className="w-4 h-4" />
                <span>ARCHIVAR EDICIÓN ACTUAL</span>
              </button>
            )}
          </div>

          {historyList.length === 0 ? (
            <div className="p-10 text-center text-[#6B6258] bg-[#FFFDF5] rounded-2xl border border-[#EADBCE]">
              <History className="w-12 h-12 mx-auto mb-2 text-[#27864B] opacity-40" />
              <p className="font-bold text-[#383028]">No hay ediciones archivadas en el historial todavía.</p>
              <p className="text-xs text-[#6B6258] mt-1">Al finalizar un campeonato, presioná "Archivar Edición Actual" para conservar el podio para siempre.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((h, idx) => (
                <div key={h.id || idx} className="p-4 bg-[#FFFDF5] rounded-2xl border border-[#EADBCE] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-[#383028] text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#B45309]" />
                      <span>{h.eventName || `Edición ${h.edition}`}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#DCEFE1] text-[#27864B] px-2 py-0.5 rounded-full">
                      {h.edition || `${h.month}/${h.year}`}
                    </span>
                  </div>

                  <div className="text-xs text-[#6B6258]">
                    Premio entregado: <span className="font-bold text-[#383028]">{h.prizeName}</span>
                  </div>

                  {h.podium && h.podium.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                      {h.podium.map((pod, pIdx) => (
                        <div key={pIdx} className="p-2 bg-white rounded-xl border border-[#EADBCE] text-center">
                          <div className="text-[10px] font-black text-[#B45309]">
                            {pIdx === 0 ? '👑 1º PUESTO' : pIdx === 1 ? '🥈 2º PUESTO' : '🥉 3º PUESTO'}
                          </div>
                          <div className="font-bold text-[#383028] truncate">{pod.name}</div>
                          <div className="font-mono text-[10px] text-[#27864B]">{pod.score?.toLocaleString()} pts</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: JUEGOS (NIVELES Y MEMORIA) */}
      {activeTab === 'juegos' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#EADBCE] shadow-xs space-y-5">
          <div className="border-b border-[#EADBCE] pb-3">
            <h2 className="text-base sm:text-lg font-black text-[#383028] uppercase font-serif">
              CONFIGURACIÓN DE LOS 3 NIVELES DE JUEGO
            </h2>
            <p className="text-xs text-[#6B6258]">
              Personalizá los tiempos de cada nivel y los parámetros del juego de Memoria de Ingredientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Nivel 1 */}
            <div className="p-4 bg-[#DCEFE1]/50 rounded-2xl border border-[#27864B]/40 space-y-2">
              <div className="font-black text-[#27864B] uppercase flex items-center gap-1.5">
                <span>🍳</span>
                <span>NIVEL 1 – AYUDANTE</span>
              </div>
              <p className="text-[11px] text-[#6B6258]">Pizzas clásicas de 3 ingredientes seleccionables.</p>
              <div>
                <label className="block font-bold text-[#383028] mb-1">Tiempo Límite (segundos):</label>
                <input
                  type="number"
                  disabled={userRole === 'SUPERVISOR'}
                  value={level1Time}
                  onChange={e => setLevel1Time(Number(e.target.value))}
                  className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                />
              </div>
            </div>

            {/* Nivel 2 */}
            <div className="p-4 bg-[#F8D978]/30 rounded-2xl border border-[#F8D978] space-y-2">
              <div className="font-black text-[#92400E] uppercase flex items-center gap-1.5">
                <span>🍕</span>
                <span>NIVEL 2 – MAESTRO PIZZERO</span>
              </div>
              <p className="text-[11px] text-[#6B6258]">Comandas de 4 ingredientes y minijuegos de elección.</p>
              <div>
                <label className="block font-bold text-[#383028] mb-1">Tiempo Límite (segundos):</label>
                <input
                  type="number"
                  disabled={userRole === 'SUPERVISOR'}
                  value={level2Time}
                  onChange={e => setLevel2Time(Number(e.target.value))}
                  className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                />
              </div>
            </div>

            {/* Nivel 3 Memoria */}
            <div className="p-4 bg-[#FBE4DF] rounded-2xl border border-[#D93636]/40 space-y-2 md:col-span-3">
              <div className="font-black text-[#D93636] uppercase flex items-center gap-1.5 text-sm">
                <span>🧠</span>
                <span>NIVEL 3 – GRAN CHEF (MEMORIA Y COINCIDENCIA DE INGREDIENTES)</span>
              </div>
              <p className="text-xs text-[#6B6258]">
                Juego de parejas boca abajo con cartas interactivas y giros animados.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-[#383028] mb-1">Número de Cartas / Pares:</label>
                  <select
                    disabled={userRole === 'SUPERVISOR'}
                    value={memoryCardCount}
                    onChange={e => setMemoryCardCount(Number(e.target.value))}
                    className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-bold text-[#383028]"
                  >
                    <option value={10}>10 Cartas (5 Pares)</option>
                    <option value={12}>12 Cartas (6 Pares - Estándar)</option>
                    <option value={16}>16 Cartas (8 Pares)</option>
                    <option value={20}>20 Cartas (10 Pares - Experto)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#383028] mb-1">Tiempo Límite (segundos):</label>
                  <input
                    type="number"
                    disabled={userRole === 'SUPERVISOR'}
                    value={level3Time}
                    onChange={e => setLevel3Time(Number(e.target.value))}
                    className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#383028] mb-1">Puntos por Pareja Encontrada:</label>
                  <input
                    type="number"
                    disabled={userRole === 'SUPERVISOR'}
                    value={memoryPointsPerMatch}
                    onChange={e => setMemoryPointsPerMatch(Number(e.target.value))}
                    className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#383028] mb-1">Bonus por Completar Todos:</label>
                  <input
                    type="number"
                    disabled={userRole === 'SUPERVISOR'}
                    value={memoryCompletionBonus}
                    onChange={e => setMemoryCompletionBonus(Number(e.target.value))}
                    className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#383028] mb-1">Bono Velocidad (pts/segundo):</label>
                  <input
                    type="number"
                    disabled={userRole === 'SUPERVISOR'}
                    value={memorySpeedBonusPerSecond}
                    onChange={e => setMemorySpeedBonusPerSecond(Number(e.target.value))}
                    className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#383028] mb-1">Penalización por Error (pts):</label>
                  <input
                    type="number"
                    disabled={userRole === 'SUPERVISOR'}
                    value={memoryErrorPenalty}
                    onChange={e => setMemoryErrorPenalty(Number(e.target.value))}
                    className="w-full bg-white border border-[#EADBCE] rounded-xl px-3 py-1.5 font-mono text-[#383028]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-[#383028]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#EADBCE] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-[#383028] text-center space-y-4">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl border-2 ${
              confirmModal.danger ? 'bg-red-50 border-red-300 text-red-600' : 'bg-[#DCEFE1] border-[#27864B] text-[#27864B]'
            }`}>
              {confirmModal.danger ? <AlertTriangle className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
            </div>

            <h3 className="text-lg font-black text-[#383028] font-serif">
              {confirmModal.title}
            </h3>
            <p className="text-xs text-[#6B6258]">
              {confirmModal.message}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#383028] font-bold text-xs uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-white font-black text-xs uppercase cursor-pointer ${
                  confirmModal.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#27864B] hover:bg-[#1e6b3c]'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
