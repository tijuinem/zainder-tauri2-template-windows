import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Heart,
  X,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { InterfaceLanguage, INTERFACE_TRANSLATIONS } from '../i18n/interfaceTranslations';
import { nativeApi } from '../services/nativeApi';

interface CreditsModalProps {
  language: InterfaceLanguage;
  isDark?: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({
  language,
  isDark = false,
  onClose
}) => {
  const t = INTERFACE_TRANSLATIONS[language];
  const [appVersion, setAppVersion] = useState<string>('1.0.0');

  useEffect(() => {
    nativeApi.getAppVersion().then((v) => {
      if (v) setAppVersion(v);
    }).catch(() => {});
  }, []);

  if (isDark) {
    // DARK MODE: Clean Dark Theme
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
        <div
          className="w-full max-w-lg bg-[#0c1527] text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-[#0e192f]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#25b0ae]/15 border border-[#25b0ae]/30 flex items-center justify-center text-[#25b0ae]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {t.creditsTitle}
                </h2>
                <p className="text-xs text-slate-400">
                  {t.creditsSubtitle}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm">
            {/* Version Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#002a5b]/40 to-[#001733]/80 border border-sky-900/50 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#25b0ae]">
                  {t.appVersionLabel}
                </div>
                <div className="text-base font-extrabold text-white font-mono">
                  PLANTILLA v{appVersion}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Windows Desktop Ready · 2026
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Offline Ready</span>
              </div>
            </div>

            {/* Template Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#002a5b]/40 to-slate-900 border border-[#25b0ae]/30 shadow-xs relative overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#25b0ae] bg-[#25b0ae]/15 px-2 py-0.5 rounded-md font-mono">
                      PLANTILLA BASE · WINDOWS
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Diseño Modular y Responsivo</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Plantilla optimizada para pantallas panorámicas y aplicaciones de escritorio compatibles con Windows. Estética cuidada, sistema de temas claro/oscuro y soporte de accesibilidad.
                  </p>
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/30" />
                    <span>Listo para incorporar nuevos módulos y funcionalidades</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-[#25b0ae]/20 border border-[#25b0ae]/40 text-[#25b0ae] text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                  <Layers className="w-3.5 h-3.5" />
                  <span>UI Kit</span>
                </div>
              </div>
            </div>

            {/* License & Attribution Notice */}
            <div className="pt-3 border-t border-slate-800/80 text-center space-y-1.5 text-xs">
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <span className="font-semibold text-[#25b0ae]">Licencia CC BY 4.0</span>
                <span>·</span>
                <span className="text-slate-400">Plantilla modular de libre uso</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800/80 bg-[#0e192f] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LIGHT MODE
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-[#002a5b]">
              <Sparkles className="w-5 h-5 text-[#25b0ae]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#002a5b]">
                {t.creditsTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.creditsSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm">
          {/* Version Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-[#25b0ae]/10 border border-sky-200 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#002a5b]">
                {t.appVersionLabel}
              </div>
              <div className="text-base font-extrabold text-[#002a5b] font-mono">
                PLANTILLA v{appVersion}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Windows Desktop Ready · 2026
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Offline Ready</span>
            </div>
          </div>

          {/* Template Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 via-sky-50/80 to-amber-50/60 border border-[#25b0ae]/40 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#002a5b] bg-[#25b0ae]/20 px-2 py-0.5 rounded-md font-mono">
                    PLANTILLA BASE · WINDOWS
                  </span>
                </div>
                <div className="text-sm font-bold text-[#002a5b] flex items-center gap-1.5">
                  <span>Diseño Modular y Responsivo</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Plantilla optimizada para pantallas panorámicas y aplicaciones de escritorio compatibles con Windows. Estética cuidada, sistema de temas claro/oscuro y soporte de accesibilidad.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                  <span>Listo para incorporar nuevos módulos y funcionalidades</span>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-full bg-[#002a5b] text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-[#25b0ae]" />
                <span>UI Kit</span>
              </div>
            </div>
          </div>

          {/* License & Attribution Notice */}
          <div className="pt-3 border-t border-slate-100 text-center space-y-1.5 text-xs">
            <div className="flex items-center justify-center gap-2 text-slate-700">
              <span className="font-bold text-[#002a5b]">Licencia CC BY 4.0</span>
              <span>·</span>
              <span className="text-slate-500">Plantilla modular de libre uso</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#002a5b] hover:bg-[#001733] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
