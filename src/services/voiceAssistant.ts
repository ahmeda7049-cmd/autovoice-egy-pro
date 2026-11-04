/**
 * Automotive Voice Alert & Audio Warning Engine
 * Powered by Web Speech API (Arabic Native TTS) + Web Audio API synthesizer
 */

class AutomotiveVoiceAssistant {
  private isEnabled: boolean = true;
  private volume: number = 1.0;
  private rate: number = 0.95;
  private pitch: number = 1.0;
  private audioCtx: AudioContext | null = null;
  private lastAlertTime: Map<string, number> = new Map();
  private queue: string[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Warm up voices
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.getBestArabicVoice();
        };
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play realistic automotive chime using Web Audio API
  public playChime(type: 'warning' | 'critical' | 'success' | 'connect') {
    if (!this.isEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'critical') {
        // High urgency alternating two-tone chime
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(659, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.3);

        gain.gain.setValueAtTime(0.3 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'warning') {
        // BMW / Mercedes style warm double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(783.99, now + 0.12); // G5

        gain.gain.setValueAtTime(0.25 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'connect') {
        // Futuristic low-to-high ascending confirmation chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.38);
      } else {
        // Success pleasant chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  }

  private getBestArabicVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize Egyptian or Saudi or any Arabic voice
    const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang === 'ar-EG' || v.lang === 'ar-SA');
    return arVoice || voices.find(v => v.lang.includes('ar')) || null;
  }

  public speak(text: string, force = false, key?: string) {
    if (!this.isEnabled && !force) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Throttle repeated alerts of the same key (e.g. don't repeat same code within 15 seconds)
    if (key) {
      const last = this.lastAlertTime.get(key) || 0;
      const now = Date.now();
      if (now - last < 15000 && !force) {
        return;
      }
      this.lastAlertTime.set(key, now);
    }

    this.queue.push(text);
    this.processQueue();
  }

  private processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;
    const text = this.queue.shift();
    if (!text) return;

    this.isSpeaking = true;
    try {
      window.speechSynthesis.cancel(); // Clear any hung speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.volume = this.volume;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      const voice = this.getBestArabicVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 300);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        setTimeout(() => this.processQueue(), 200);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
    }
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.queue = [];
      this.isSpeaking = false;
    }
  }

  public setEnabled(val: boolean) {
    this.isEnabled = val;
    if (!val) {
      this.stopSpeaking();
    }
  }

  public getEnabled() {
    return this.isEnabled;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getVolume() {
    return this.volume;
  }

  public setRate(val: number) {
    this.rate = Math.max(0.5, Math.min(1.5, val));
  }

  public getRate() {
    return this.rate;
  }
}

export const voiceAssistant = new AutomotiveVoiceAssistant();
