import React from 'react';
import { Terminal, Command, Folder, Keyboard, AlertCircle } from 'lucide-react';
import { isTauriEnvironment } from '../services/nativeApi';

interface StatusBarProps {
  currentPath: string;
  isDark?: boolean;
  logCount?: number;
  errorCount?: number;
  isLogDrawerOpen?: boolean;
  onOpenDirectorySelector: () => void;
  onOpenCommandPalette: () => void;
  onToggleLogDrawer: () => void;
  onOpenShortcuts: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPath,
  isDark = false,
  logCount = 0,
  errorCount = 0,
  isLogDrawerOpen = false,
  onOpenDirectorySelector,
  onOpenCommandPalette,
  onToggleLogDrawer,
  onOpenShortcuts
}) => {
  const isTauri = isTauriEnvironment();

  return (
    <footer className={`h-8 w-full border-t flex items-center justify-between px-4 sm:px-6 select-none text-[11px] font-medium transition-colors shrink-0 z-30 ${
      isDark
        ? 'bg-[#080d17] border-slate-800/90 text-slate-400'
        : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
    }`}>
      {/* Left side: System status & active path */}
      <div className="flex items-center gap-3 truncate">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {isTauri ? 'Nativo Windows' : 'Modo Vista Previa'}
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

        {/* Clickable Destination Path */}
        <button
          type="button"
          onClick={onOpenDirectorySelector}
          className="flex items-center gap-1.5 hover:text-[#002a5b] dark:hover:text-[#25b0ae] transition-colors truncate cursor-pointer group"
          title="Cambiar carpeta o disco de destino"
        >
          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-mono truncate">{currentPath}</span>
        </button>
      </div>

      {/* Right side: Logs toggle, Shortcuts, Command Palette */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Toggle Logs Drawer */}
        <button
          type="button"
          onClick={onToggleLogDrawer}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
            isLogDrawerOpen
              ? 'bg-[#002a5b] text-white dark:bg-[#25b0ae] dark:text-[#002a5b] font-bold'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
          title="Alternar Consola de Logs (Ctrl+`)"
        >
          <Terminal className="w-3 h-3 text-[#25b0ae] dark:text-current" />
          <span>Consola</span>
          {errorCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center gap-0.5">
              <AlertCircle className="w-2.5 h-2.5" />
              {errorCount}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">({logCount})</span>
          )}
        </button>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

        {/* Shortcuts Cheat Sheet */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title="Ver Atajos de Teclado (F1)"
        >
          <Keyboard className="w-3 h-3 text-slate-400" />
          <span>Atajos</span>
          <kbd className="font-mono text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            F1
          </kbd>
        </button>

        {/* Command Palette */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Command className="w-3 h-3 text-[#25b0ae]" />
          <span>Comandos</span>
          <kbd className="font-mono text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-mono text-[10px]">
          <span>v1.0</span>
        </div>
      </div>
    </footer>
  );
};
