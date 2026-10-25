import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Heart,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Copy,
  Check,
  X
} from 'lucide-react';
import { InterfaceLanguage, INTERFACE_TRANSLATIONS } from '../i18n/interfaceTranslations';

interface LicensePrivacyModalProps {
  language: InterfaceLanguage;
  isDark?: boolean;
  onClose: () => void;
}

export const LicensePrivacyModal: React.FC<LicensePrivacyModalProps> = ({
  language,
  isDark = false,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'license' | 'privacy' | 'terms'>('all');
  const [copied, setCopied] = useState(false);

  const t = INTERFACE_TRANSLATIONS[language];

  const handleCopyText = () => {
    const legalText = `TÉRMINOS, LICENCIA Y PRIVACIDAD

1. LICENCIA DE SOFTWARE Y CÓDIGO ABIERTO (Creative Commons 4.0)
Este software y sus componentes se distribuyen bajo la licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0).
- Libertad de Compartir: Puedes copiar y redistribuir el material en cualquier medio o formato.
- Libertad de Adaptar: Puedes remezclar, transformar y construir sobre el material para cualquier propósito, incluso comercial.
- Condición de Atribución Obligatoria: Debes reconocer la autoría original de @garba y referenciar a www.zainder.com.

2. POLÍTICA DE PRIVACIDAD ESTRICTA (100% On-Device)
El software procesa todo el contenido íntegramente en el dispositivo del usuario. Ningún archivo, dato o telemetría se transmite ni almacena en servidores externos o en la nube. La aplicación no contiene cookies de rastreo ni venta de datos a terceros.
- Procesamiento Local: Toda ejecución corre en tu CPU/GPU local.
- Sin Recopilación de Datos: Cero cookies de rastreo y cero telemetría remota.

3. EXENCIÓN DE RESPONSABILIDAD (Disclaimer - AS IS)
El software se suministra "tal cual", sin garantías expresas o implícitas sobre idoneidad o ausencia de errores.`;

    navigator.clipboard.writeText(legalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div
        className={`w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
          isDark
            ? 'bg-[#0c1527] text-slate-100 border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 sm:px-8 py-5 border-b flex items-start justify-between gap-4 ${
          isDark ? 'bg-[#0e192f] border-slate-800/80' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Términos, Licencia y Privacidad
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
                  CC BY 4.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Condiciones de uso del software, licencia CC BY 4.0 y política de privacidad local.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyText}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-200/80 text-slate-500 hover:text-slate-800'
              }`}
              title="Copiar texto de licencia"
              aria-label="Copiar"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  : 'hover:bg-slate-200/80 text-slate-500 hover:text-slate-800'
              }`}
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 sm:px-8 py-3 border-b flex items-center gap-2 overflow-x-auto scrollbar-none ${
          isDark ? 'bg-[#09101f] border-slate-800' : 'bg-slate-100/70 border-slate-200/70'
        }`}>
          {[
            { id: 'all', label: 'Documento Completo' },
            { id: 'license', label: 'Licencia CC BY 4.0' },
            { id: 'privacy', label: 'Privacidad y Datos' },
            { id: 'terms', label: 'Términos y Garantía' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-[#002a5b] text-white shadow-xs font-bold'
                      : 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Top 3 Summary Highlight Cards (Always visible or in 'all') */}
          {(activeTab === 'all' || activeTab === 'license') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Licencia */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/90 dark:border-emerald-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Licencia CC BY 4.0
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Distribución y uso libre citando autoría y fuentes.
                  </p>
                </div>
              </div>

              {/* Card 2: 100% On-Device */}
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/90 dark:border-sky-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    100% On-Device
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Ningún archivo o dato se transmite a la nube.
                  </p>
                </div>
              </div>

              {/* Card 3: Software Gratuito */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/90 dark:border-purple-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    Software Gratuito
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Sin muros de pago. Donaciones voluntarias.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Licencia de Software y Código Abierto */}
          {(activeTab === 'all' || activeTab === 'license') && (
            <div className={`p-6 sm:p-7 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#0e192f]/60 border-slate-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    1. Licencia de Software y Código Abierto
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Creative Commons 4.0
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Esta aplicación y sus componentes se distribuyen bajo la licencia Creative Commons Atribución 4.0 Internacional (CC BY 4.0). Esta licencia otorga la libertad de usar, copiar, modificar, adaptar y redistribuir el software y sus diseños para cualquier fin (incluidos fines comerciales o educativos), con la única condición de citar la autoría original de @garba y referenciar a www.zainder.com.
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Libertad de Compartir:</strong> Puedes copiar y redistribuir el material en cualquier medio o formato.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Libertad de Adaptar:</strong> Puedes remezclar, transformar y construir sobre el material para cualquier propósito, incluso comercial.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Condición de Atribución Obligatoria:</strong> Debes reconocer la autoría de <span className="font-semibold text-slate-900 dark:text-white">@garba</span> y enlazar a <span className="text-[#25b0ae] font-semibold">www.zainder.com</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Política de Privacidad Estricta */}
          {(activeTab === 'all' || activeTab === 'privacy') && (
            <div className={`p-6 sm:p-7 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#0e192f]/60 border-slate-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    2. Política de Privacidad Estricta (100% On-Device)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-sky-100/80 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                  Zero Cloud Upload
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Esta aplicación procesa todo el contenido y configuración íntegramente en el dispositivo del usuario. Ninguna pista, fichero, metadato o información identificativa se recopila, transmite ni almacena en servidores externos o en la nube. La aplicación no contiene cookies de rastreo, telemetría comercial ni venta de datos a terceros.
              </p>

              {/* Mini sub-cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  isDark ? 'bg-[#0a1222] border-slate-800' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                    <Cpu className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      Procesamiento Local:
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Toda operación y renderizado corre en tu CPU/GPU local.
                    </p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  isDark ? 'bg-[#0a1222] border-slate-800' : 'bg-white border-slate-200/90'
                }`}>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      Sin Recopilación de Datos:
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Cero cookies de rastreo y cero telemetría remota.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Exención de Responsabilidad */}
          {(activeTab === 'all' || activeTab === 'terms') && (
            <div className={`p-6 sm:p-7 rounded-2xl border space-y-4 ${
              isDark ? 'bg-[#0e192f]/60 border-slate-800' : 'bg-slate-50/50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    3. Exención de Responsabilidad (Disclaimer)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  AS IS
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                El software se proporciona "tal cual" (AS IS), sin garantía de ningún tipo, explícita o implícita, incluyendo pero no limitándose a garantías de comerciabilidad, idoneidad para un propósito particular y no infracción. En ningún caso los autores o titulares de derechos de autor serán responsables de cualquier reclamación, daño u otra responsabilidad.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 sm:px-8 py-4 border-t flex justify-end ${
          isDark ? 'bg-[#0e192f] border-slate-800' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#002a5b] hover:bg-[#001733] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
