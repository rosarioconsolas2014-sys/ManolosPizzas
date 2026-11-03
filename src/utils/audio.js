/**
 * Arcade Web Audio Synthesizer for Manolo's Pizzas
 * Zero external audio dependencies: 100% reliable, zero latency, highly responsive
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio not initialized:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.3) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // Campanilla de nueva comanda (Crisp brass bell)
  playBell() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const notes = [880, 1320, 1760];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.4, 0.25);
      }, i * 70);
    });
  }

  // Ingrediente colocado en pizza (Plop/Pop)
  playIngredientPop() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  // Sonido de horno pizzero encendido / cocción
  playOvenSizzle() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // Noise buffer for sizzle/flames
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
    } catch (e) {}
  }

  // Pedido entregado correctamente / Éxito
  playOrderSuccess() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.28, 0.35);
      }, idx * 80);
    });
  }

  // Sonido de error / ingrediente incorrecto
  playError() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // Contador de puntos rápido / moneda arcade
  playCoinTick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.playTone(987.77, 'square', 0.05, 0.15); // B5
  }

  // Clic general de interfaz
  playClick() {
    if (this.isMuted) return;
    this.playTone(440, 'sine', 0.05, 0.15);
  }

  // Victoria / Campeón Fanfarria
  playVictory() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const melody = [
      { f: 523, d: 150 },
      { f: 659, d: 150 },
      { f: 784, d: 150 },
      { f: 1046, d: 400 },
      { f: 880, d: 150 },
      { f: 1046, d: 600 }
    ];

    let delay = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d / 1000, 0.4);
      }, delay);
      delay += note.d + 30;
    });
  }

  // Música de fondo chiptune pizzería (Tarantella alegre en loop)
  startArcadeMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    const tarantellaNotes = [
      440, 523, 659, 440, 523, 659, // A C E A C E
      493, 587, 659, 493, 587, 659, // B D E B D E
      440, 523, 659, 440, 523, 659, // A C E
      392, 493, 587, 440, 523, 440  // G B D A C A
    ];

    let step = 0;
    const tempoMs = 135;

    this.musicTimer = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted) {
        clearInterval(this.musicTimer);
        this.isMusicPlaying = false;
        return;
      }

      const freq = tarantellaNotes[step % tarantellaNotes.length];
      const bassFreq = freq / 2;

      // Bass note
      if (step % 3 === 0) {
        this.playTone(bassFreq, 'sine', 0.2, 0.1);
      }

      // Melody note
      this.playTone(freq, 'triangle', 0.12, 0.08);

      step++;
    }, tempoMs);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const sound = new SoundEngine();
