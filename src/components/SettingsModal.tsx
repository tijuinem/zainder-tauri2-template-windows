import React, { useState, useEffect } from 'react';
import {
  Eye,
  Type,
  Sun,
  Moon,
  Laptop,
  Globe,
  Activity,
  CheckCircle2,
  Volume2,
  Play,
  Check,
  X,
  Folder
} from 'lucide-react';
import { nativeApi } from '../services/nativeApi';
import { InterfaceLanguage, INTERFACE_TRANSLATIONS } from '../i18n/interfaceTranslations';
import {
  getEnglishVoices,
  getBestEnglishVoice,
  getSavedVoicePreference,
  setSavedVoicePreference,
  speakEnglish,
  subscribeVoicesChanged
} from '../utils/speech';
import { isTauriApp } from '../utils/desktop';

export interface AppSettings {
  language: InterfaceLanguage;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'standard' | 'xlarge';
  highContrast: boolean;
}

interface SettingsModalProps {
  settings: AppSettings;
  isDark?: boolean;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isDark = false,
  onUpdateSettings,
  onClose
}) => {
  const t = INTERFACE_TRANSLATIONS[settings.language];

  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const storageAvailable = typeof window !== 'undefined' && 'localStorage' in window;
  const isTauri = isTauriApp();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getEnglishVoices());
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return getSavedVoicePreference() || getBestEnglishVoice()?.name || '';
  });
  const [testingSpeech, setTestingSpeech] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const v = getEnglishVoices();
      setVoices(v);
      if (!selectedVoiceName && v.length > 0) {
        setSelectedVoiceName(getBestEnglishVoice()?.name || v[0].name);
      }
    };
    update();
    return subscribeVoicesChanged(update);
  }, [selectedVoiceName]);

  const handleSelectVoice = (name: string) => {
    setSelectedVoiceName(name);
    setSavedVoicePreference(name);
  };

  const handleTestVoice = () => {
    setTestingSpeech(true);
    speakEnglish('Speech synthesis diagnostic test: audio output working properly.', {
      voiceName: selectedVoiceName,
      onEnd: () => setTestingSpeech(false),
      onError: () => setTestingSpeech(false)
    });
  };

  // Render modal styling depending on light / dark mode, both strictly conforming to Zainder branding
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
      isDark ? 'bg-slate-950/75' : 'bg-slate-900/40'
    }`}>
      <div
        className={`w-full max-w-2xl md:max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors border ${
          isDark
            ? 'bg-[#0c1527] text-slate-100 border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between transition-colors ${
          isDark
            ? 'border-slate-800/80 bg-[#0e192f]'
            : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-colors ${
              isDark
                ? 'bg-[#25b0ae]/15 border-[#25b0ae]/30 text-[#25b0ae]'
                : 'bg-sky-50 border-sky-200 text-[#002a5b]'
            }`}>
              <Eye className={`w-5 h-5 ${isDark ? 'text-[#25b0ae]' : 'text-[#002a5b]'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-[#002a5b]'
              }`}>
                {t.settingsTitle}
              </h2>
              <p className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {t.settingsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* Section 1: Font Size */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-[#25b0ae]' : 'text-[#002a5b]'
            }`}>
              <Type className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.fontSizeTitle}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Small (previously standard) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: 'small' })}
                className={`flex flex-col items-center justify-center py-3 px-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  settings.fontSize === 'small'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-extrabold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                }`}
              >
                <span className="text-sm font-bold">Aa-</span>
                <span className={`text-xs mt-0.5 ${settings.fontSize === 'small' ? 'text-[#25b0ae]' : ''}`}>
                  {t.fontSizeSmall}
                </span>
              </button>

              {/* Standard (previously large, now default) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: 'standard' })}
                className={`flex flex-col items-center justify-center py-3 px-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  settings.fontSize === 'standard'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-extrabold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                }`}
              >
                <span className="text-base font-bold">Aa</span>
                <span className={`text-xs mt-0.5 ${settings.fontSize === 'standard' ? 'text-[#25b0ae]' : ''}`}>
                  {t.fontSizeStandard}
                </span>
              </button>

              {/* Extra Large */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: 'xlarge' })}
                className={`flex flex-col items-center justify-center py-3 px-3 rounded-2xl border transition-all text-center cursor-pointer ${
                  settings.fontSize === 'xlarge'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-extrabold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80 font-medium'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                }`}
              >
                <span className="text-lg font-bold">Aa+</span>
                <span className={`text-xs mt-0.5 ${settings.fontSize === 'xlarge' ? 'text-[#25b0ae]' : ''}`}>
                  {t.fontSizeXLarge}
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: High Contrast Mode */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
            isDark
              ? 'bg-slate-800/40 border-slate-700/70'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="space-y-0.5">
              <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#002a5b]'}`}>
                {t.highContrastTitle}
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.highContrastSubtitle}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.highContrast}
              onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                settings.highContrast ? 'bg-[#25b0ae]' : isDark ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 3: Interface Theme */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-[#25b0ae]' : 'text-[#002a5b]'
            }`}>
              <Sun className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.themeTitle}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl border transition-all text-xs font-semibold ${
                  settings.theme === 'light'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Sun className={`w-4 h-4 ${settings.theme === 'light' ? 'text-[#25b0ae]' : 'text-amber-500'}`} />
                <span>{t.themeLight}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl border transition-all text-xs font-semibold ${
                  settings.theme === 'dark'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Moon className={`w-4 h-4 ${settings.theme === 'dark' ? 'text-[#25b0ae]' : 'text-sky-400'}`} />
                <span>{t.themeDark}</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'system' })}
                className={`flex items-center justify-center gap-2 py-3 px-2 rounded-2xl border transition-all text-xs font-semibold ${
                  settings.theme === 'system'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Laptop className={`w-4 h-4 ${settings.theme === 'system' ? 'text-[#25b0ae]' : 'text-purple-400'}`} />
                <span>{t.themeSystem}</span>
              </button>
            </div>
          </div>

          {/* Section 4: Application Language */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-[#25b0ae]' : 'text-[#002a5b]'
            }`}>
              <Globe className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.languageTitle}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'es' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                  settings.language === 'es'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`font-mono text-[10px] font-black uppercase ${
                  settings.language === 'es' ? 'text-[#25b0ae]' : 'opacity-70'
                }`}>ES</span>
                <span>Español</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                  settings.language === 'en'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`font-mono text-[10px] font-black uppercase ${
                  settings.language === 'en' ? 'text-[#25b0ae]' : 'opacity-70'
                }`}>GB</span>
                <span>English</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'fr' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                  settings.language === 'fr'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`font-mono text-[10px] font-black uppercase ${
                  settings.language === 'fr' ? 'text-[#25b0ae]' : 'opacity-70'
                }`}>FR</span>
                <span>Français</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ language: 'de' })}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl border transition-all text-xs font-semibold cursor-pointer ${
                  settings.language === 'de'
                    ? 'bg-[#002a5b] text-white border-[#25b0ae]/60 shadow-md font-bold ring-2 ring-[#25b0ae]/30'
                    : isDark
                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={`font-mono text-[10px] font-black uppercase ${
                  settings.language === 'de' ? 'text-[#25b0ae]' : 'opacity-70'
                }`}>DE</span>
                <span>Deutsch</span>
              </button>
            </div>
          </div>

          {/* Section 5: Voice Selection (English Offline TTS) */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-[#25b0ae]' : 'text-[#002a5b]'
            }`}>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#25b0ae]" />
                <span>Voz en Inglés (Pronunciación Nativa Offline)</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold lowercase">
                100% offline
              </span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <select
                  value={selectedVoiceName}
                  onChange={(e) => handleSelectVoice(e.target.value)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                    isDark
                      ? 'bg-[#0c1527] border-slate-700 text-slate-200 focus:border-[#25b0ae]'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-[#002a5b]'
                  } outline-none cursor-pointer`}
                >
                  {voices.length === 0 ? (
                    <option value="">Voz nativa estándar en inglés (en-US)</option>
                  ) : (
                    voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  )}
                </select>

                <button
                  type="button"
                  onClick={handleTestVoice}
                  disabled={testingSpeech}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                    testingSpeech
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : isDark
                        ? 'bg-[#25b0ae] hover:bg-[#1f9391] text-[#001733]'
                        : 'bg-[#002a5b] hover:bg-[#001f44] text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{testingSpeech ? 'Reproduciendo...' : 'Probar Pronunciación'}</span>
                </button>
              </div>

              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Motor de voz sintetizada del sistema operativo configurado estrictamente en fonética inglesa. Funciona sin conexión a internet y sin consumo de datos.
              </p>
            </div>
          </div>

          {/* Section 6: Diagnostics & Runtime */}
          <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Activity className="w-3.5 h-3.5 text-[#25b0ae]" />
              <span>{t.diagnosticsTitle}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[11px] sm:text-xs">
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 min-w-0 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25b0ae] shrink-0" />
                <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={`${t.diagSpeech}: ${speechAvailable ? 'OK' : 'N/A'}`}>
                  {t.diagSpeech}: {speechAvailable ? 'OK' : 'N/A'}
                </span>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 min-w-0 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25b0ae] shrink-0" />
                <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={`${t.diagStorage}: ${storageAvailable ? 'OK' : 'N/A'}`}>
                  {t.diagStorage}: {storageAvailable ? 'OK' : 'N/A'}
                </span>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 min-w-0 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25b0ae] shrink-0" />
                <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={`${t.diagOffline}: Ready`}>
                  {t.diagOffline}: Ready
                </span>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2 min-w-0 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#25b0ae] shrink-0" />
                <span className={`truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={`Motor: ${isTauri ? 'Tauri Native' : 'Navegador Web'}`}>
                  Motor: {isTauri ? 'Tauri Native' : 'Navegador Web'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800/80 bg-[#0e192f]' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <button
            type="button"
            onClick={() => nativeApi.openAppDataFolder()}
            title="Abrir carpeta donde se guarda settings.json"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-[#25b0ae]" />
            <span className="hidden sm:inline">Carpeta de Configuración (%APPDATA%)</span>
            <span className="sm:hidden">AppData</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-[#002a5b] hover:bg-[#001733] text-white'
            }`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
