// Centralized, robust Text-to-Speech utility for Zeltavia English Learning
// Designed for 100% offline operation in Tauri and web browsers.
// Guarantees that an English voice and 'en-US' / 'en-GB' language tag are always selected.

let cachedVoices: SpeechSynthesisVoice[] = [];
let voiceListeners: Array<() => void> = [];

export function isEnglishVoice(voice: SpeechSynthesisVoice): boolean {
  if (!voice) return false;
  const lang = (voice.lang || '').toLowerCase().replace(/_/g, '-');
  const name = (voice.name || '').toLowerCase();

  return (
    lang.startsWith('en') ||
    lang.includes('en-') ||
    name.includes('english') ||
    name.includes('david') ||
    name.includes('zira') ||
    name.includes('mark') ||
    name.includes('george') ||
    name.includes('susan') ||
    name.includes('hazel') ||
    name.includes('samantha') ||
    name.includes('daniel') ||
    name.includes('alex') ||
    name.includes('karen') ||
    name.includes('moira') ||
    name.includes('victoria') ||
    name.includes('fred') ||
    name.includes('tessa') ||
    name.includes('richard') ||
    name.includes('linda') ||
    name.includes('natural') ||
    name.includes('google us') ||
    name.includes('google uk') ||
    name.includes('desktop')
  );
}

export function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  try {
    const raw = window.speechSynthesis.getVoices() || [];
    if (raw.length > 0) {
      cachedVoices = raw;
      voiceListeners.forEach(cb => {
        try { cb(); } catch {}
      });
    }
  } catch (e) {
    // ignore
  }
  return cachedVoices;
}

export function subscribeVoicesChanged(callback: () => void): () => void {
  voiceListeners.push(callback);
  return () => {
    voiceListeners = voiceListeners.filter(cb => cb !== callback);
  };
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const allVoices = cachedVoices.length > 0 ? cachedVoices : refreshVoices();
  const enVoices = allVoices.filter(isEnglishVoice);
  if (enVoices.length > 0) return enVoices;
  // Fallback to any voice with 'en' in lang or name
  return allVoices.filter(v => (v.lang || '').toLowerCase().includes('en'));
}

export function getSavedVoicePreference(): string {
  try {
    return (
      localStorage.getItem('app_preferred_voice_name') ||
      localStorage.getItem('zainder_preferred_voice_name') ||
      localStorage.getItem('zeltavia_preferred_voice_name') ||
      ''
    );
  } catch {
    return '';
  }
}

export function setSavedVoicePreference(voiceName: string): void {
  try {
    localStorage.setItem('app_preferred_voice_name', voiceName);
  } catch {}
}

export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const enVoices = getEnglishVoices();
  const savedName = getSavedVoicePreference();

  // 1. Check user preference if saved
  if (savedName && enVoices.length > 0) {
    const matched = enVoices.find(v => v.name === savedName);
    if (matched) return matched;
  }

  if (!enVoices.length) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const all = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      return all[0] || null;
    }
    return null;
  }

  // 2. High-quality Natural or Google English
  const natural = enVoices.find(v => v.name.includes('Natural') || v.name.includes('Google'));
  if (natural) return natural;

  // 3. Native US English (David, Zira, Mark, Samantha, Alex)
  const us = enVoices.find(
    v =>
      (v.lang || '').toLowerCase().startsWith('en-us') ||
      v.name.includes('David') ||
      v.name.includes('Zira') ||
      v.name.includes('Samantha') ||
      v.name.includes('Alex')
  );
  if (us) return us;

  // 4. British English (George, Susan, Hazel, Daniel)
  const gb = enVoices.find(
    v =>
      (v.lang || '').toLowerCase().startsWith('en-gb') ||
      v.name.includes('Daniel') ||
      v.name.includes('George')
  );
  if (gb) return gb;

  return enVoices[0];
}

// Warm up voices on startup and handle async loading in Tauri/WebView2
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  refreshVoices();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      refreshVoices();
    };
  }

  // Poller for desktop webviews (WebView2, WebKitGTK) where getVoices is async
  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    const v = refreshVoices();
    if (v.length > 0 || attempts > 25) {
      clearInterval(timer);
    }
  }, 120);
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking;
}

export function speakEnglish(text: string, options: SpeakOptions = {}): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const clean = text.trim();
  if (!clean) return null;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch (e) {
    // ignore
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  // Always default to English for pronunciation
  utterance.lang = 'en-US';
  utterance.rate = options.rate ?? 0.95;
  if (options.pitch !== undefined) utterance.pitch = options.pitch;
  if (options.volume !== undefined) utterance.volume = options.volume;

  // Voice selection: custom passed, saved preference, or best English voice
  if (options.voiceName) {
    const enVoices = getEnglishVoices();
    const specific = enVoices.find(v => v.name === options.voiceName);
    if (specific) {
      utterance.voice = specific;
      if (specific.lang) utterance.lang = specific.lang;
    }
  } else {
    const bestVoice = getBestEnglishVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      if (bestVoice.lang) utterance.lang = bestVoice.lang;
    }
  }

  if (options.onEnd) {
    utterance.onend = () => options.onEnd?.();
  }
  if (options.onError) {
    utterance.onerror = (e) => options.onError?.(e);
  }

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }

  return utterance;
}
