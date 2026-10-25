import React from 'react';
import { Keyboard, X, Command, HardDrive, Sliders, Moon, FileText, Layers, Folder } from 'lucide-react';
import { InterfaceLanguage } from '../i18n/interfaceTranslations';

interface ShortcutsModalProps {
  language: InterfaceLanguage;
  isDark?: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  language,
  isDark = false,
  onClose
}) => {
  const shortcutGroups = [
    {
      group: 'Navegación & General',
      items: [
        { keys: ['Ctrl', 'K'], desc: 'Abrir paleta de comandos rápida' },
        { keys: ['F1'], desc: 'Ver esta lista de atajos de teclado' },
        { keys: ['Esc'], desc: 'Cerrar cualquier ventana modal activa' },
        { keys: ['Ctrl', '`'], desc: 'Alternar consola de actividad y logs' }
      ]
    },
    {
      group: 'Accesos Rápidos a Módulos',
      items: [
        { keys: ['Ctrl', 'O'], desc: 'Selector de discos y carpetas de destino' },
        { keys: ['Ctrl', ','], desc: 'Abrir ajustes y visibilidad' },
        { keys: ['Ctrl', 'D'], desc: 'Abrir ventana de apoyo / donación' },
        { keys: ['Ctrl', 'Shift', 'T'], desc: 'Alternar tema Claro / Oscuro' }
      ]
    }
  ];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border ${
        isDark ? 'bg-[#0c1527] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isDark ? 'bg-[#0e192f] border-slate-800/80' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-[#25b0ae]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Atajos de Teclado
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acelera tu flujo de trabajo en Windows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {shortcutGroups.map((grp, idx) => (
            <div key={idx} className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {grp.group}
              </span>
              <div className="space-y-1.5">
                {grp.items.map((it, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {it.desc}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {it.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 text-[11px] font-mono font-bold rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className={`px-6 py-3 border-t text-center text-xs text-slate-500 ${
          isDark ? 'bg-[#080d17] border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          Tip: Pulsa <kbd className="font-mono px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">F1</kbd> en cualquier momento para ver esta ayuda.
        </div>
      </div>
    </div>
  );
};
