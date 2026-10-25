import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { nativeApi } from '../../services/nativeApi';

interface WindowControlsProps {
  isDark?: boolean;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ isDark = false }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Comprobar estado inicial de maximizado
    nativeApi.isWindowMaximized().then(setIsMaximized);
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await nativeApi.minimizeWindow();
  };

  const handleToggleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const state = await nativeApi.toggleMaximizeWindow();
    setIsMaximized(state);
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await nativeApi.closeWindow();
  };

  return (
    <div 
      className="flex items-center h-full select-none ml-2 border-l border-slate-200/60 dark:border-slate-800/80 pl-2"
      data-tauri-drag-region="false"
    >
      {/* Botón Minimizar */}
      <button
        type="button"
        onClick={handleMinimize}
        title="Minimizar"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
        data-tauri-drag-region="false"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* Botón Maximizar / Restaurar */}
      <button
        type="button"
        onClick={handleToggleMaximize}
        title={isMaximized ? "Restaurar" : "Maximizar"}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
        data-tauri-drag-region="false"
      >
        {isMaximized ? (
          <Copy className="w-3.5 h-3.5 rotate-180" />
        ) : (
          <Square className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Botón Cerrar (hover rojo corporativo) */}
      <button
        type="button"
        onClick={handleClose}
        title="Cerrar"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white dark:text-slate-400 hover:bg-rose-600 dark:hover:bg-rose-600 transition-colors cursor-pointer group"
        data-tauri-drag-region="false"
      >
        <X className="w-3.5 h-3.5 group-hover:text-white" />
      </button>
    </div>
  );
};
