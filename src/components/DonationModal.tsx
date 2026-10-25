import React from 'react';
import {
  Heart,
  Sparkles,
  Coffee,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { InterfaceLanguage, INTERFACE_TRANSLATIONS } from '../i18n/interfaceTranslations';

interface DonationModalProps {
  language: InterfaceLanguage;
  isDark?: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  language,
  isDark = false,
  onClose
}) => {
  const t = INTERFACE_TRANSLATIONS[language];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border transition-colors ${
          isDark
            ? 'bg-[#0c1527] text-slate-100 border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#0e192f] border-slate-800/80' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 flex items-center justify-center text-rose-500 shadow-xs shrink-0">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t.donationTitle}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.donationSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs sm:text-sm">
          {/* Main Info Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/60 via-sky-50/40 to-teal-50/50 dark:from-slate-800/60 dark:to-slate-900 border border-rose-200/60 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500 text-white font-mono shadow-xs">
                APOYO VOLUNTARIO
              </span>
              <span className="text-[11px] text-slate-500 font-medium">· Próximamente</span>
            </div>

            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Contribuye al Desarrollo Continuo
            </h3>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
              Esta sección está pensada para permitir a los usuarios apoyar de forma voluntaria el mantenimiento, las actualizaciones y el desarrollo de nuevas funciones y herramientas para esta plantilla y sus aplicaciones.
            </p>

            <div className="pt-2 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% voluntario. La aplicación se mantiene libre y accesible.</span>
            </div>
          </div>

          {/* Placeholders for future payment channels */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Canales de Apoyo (En Preparación)
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#0a1222] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Buy Me a Coffee / Ko-fi</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Próximamente</span>
            </div>

            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-[#0a1222] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Donación Segura (Stripe / PayPal)</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Próximamente</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${
          isDark ? 'bg-[#0e192f] border-slate-800' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#002a5b] hover:bg-[#001733] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
