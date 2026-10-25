import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Folder,
  Tv,
  Film,
  Layers,
  Laptop,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { isTauriApp } from '../utils/desktop';
import { nativeApi } from '../services/nativeApi';

export interface DriveItem {
  letter: string;
  name?: string;
  isRemovable?: boolean;
}

export interface QuickPathItem {
  label: string;
  path: string;
  icon?: 'usb' | 'drive' | 'user' | 'video';
}

interface DirectorySelectorModalProps {
  currentPath?: string;
  isDark?: boolean;
  onSelectPath: (path: string) => void;
  onClose: () => void;
}

export const DirectorySelectorModal: React.FC<DirectorySelectorModalProps> = ({
  currentPath = 'C:\\Proyectos\\Salida',
  isDark = false,
  onSelectPath,
  onClose
}) => {
  const [drives, setDrives] = useState<DriveItem[]>([
    { letter: 'C:', name: 'Disco Local (C:)', isRemovable: false },
    { letter: 'D:', name: 'Disco D:', isRemovable: false },
    { letter: 'E:', name: 'Disco E:', isRemovable: true },
    { letter: 'H:', name: 'Unidad USB H:', isRemovable: true },
    { letter: 'F:', name: 'Unidad F:', isRemovable: true },
    { letter: 'G:', name: 'Unidad G:', isRemovable: true }
  ]);

  const [selectedDrive, setSelectedDrive] = useState<string>('C:');
  const [finalPath, setFinalPath] = useState<string>(currentPath);

  // Quick paths
  const quickPaths: QuickPathItem[] = [
    { label: 'Disco D: (Proyectos)', path: 'D:\\Proyectos', icon: 'drive' },
    { label: 'Disco E: (Lote)', path: 'E:\\Archivos_Salida', icon: 'drive' },
    { label: 'Unidad USB H:', path: 'H:\\Archivos_USB', icon: 'usb' },
    { label: 'Archivos de Usuario', path: 'C:\\Proyectos\\Salida', icon: 'user' }
  ];

  // Try to query real drives from Rust Tauri backend if running natively
  useEffect(() => {
    if (isTauriApp()) {
      import('@tauri-apps/api/core').then(({ invoke }) => {
        invoke<any[]>('get_system_drives')
          .then((result) => {
            if (Array.isArray(result) && result.length > 0) {
              setDrives(result);
            }
          })
          .catch((err) => console.warn('Could not fetch system drives via Tauri:', err));
      }).catch(() => {});
    }
  }, []);

  const handleSelectDrive = (driveLetter: string) => {
    setSelectedDrive(driveLetter);
    // Replace drive prefix in current finalPath
    const restOfPath = finalPath.replace(/^[A-Za-z]:/, '');
    setFinalPath(`${driveLetter}${restOfPath || '\\Proyectos'}`);
  };

  const handleSelectQuickPath = (path: string) => {
    setFinalPath(path);
    const driveMatch = path.match(/^([A-Za-z]:)/);
    if (driveMatch) {
      setSelectedDrive(driveMatch[1].toUpperCase());
    }
  };

  const handleOpenNativeDialog = async () => {
    try {
      const selected = await nativeApi.openDirectoryDialog(finalPath);
      if (selected) {
        setFinalPath(selected);
        const driveMatch = selected.match(/^([A-Za-z]:)/);
        if (driveMatch) {
          setSelectedDrive(driveMatch[1].toUpperCase());
        }
      }
    } catch (e) {
      console.warn('Error al abrir diálogo nativo:', e);
    }
  };

  const handleConfirm = () => {
    if (isTauriApp()) {
      import('@tauri-apps/api/core').then(({ invoke }) => {
        invoke('validate_or_create_dir', { path: finalPath }).catch(() => {});
      }).catch(() => {});
    }
    onSelectPath(finalPath);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div
        className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border transition-colors ${
          isDark
            ? 'bg-[#0c1527] text-slate-100 border-slate-800'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 sm:px-7 py-5 border-b flex items-start justify-between gap-4 ${
          isDark ? 'bg-[#0e192f] border-slate-800/80' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xs shrink-0">
              <HardDrive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Seleccionar Unidad o Carpeta de Destino
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Elige tu disco USB externo (H:, D:) o escribe la ruta exacta para tus proyectos.
              </p>
            </div>
          </div>

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

        {/* Modal Content */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          {/* Section 1: Selecciona la unidad USB o disco */}
          <div className="space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Selecciona la unidad USB o disco:
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {drives.map((d) => {
                const isSelected = selectedDrive.toLowerCase() === d.letter.toLowerCase();
                return (
                  <button
                    key={d.letter}
                    type="button"
                    onClick={() => handleSelectDrive(d.letter)}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#002a5b] dark:bg-[#25b0ae] text-white dark:text-[#002a5b] border-transparent shadow-md font-extrabold ring-2 ring-[#25b0ae]/30 scale-102'
                        : isDark
                          ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/80 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold'
                    }`}
                  >
                    <HardDrive className={`w-5 h-5 mb-1 ${isSelected ? 'text-[#25b0ae] dark:text-[#002a5b]' : 'text-slate-400'}`} />
                    <span className="text-base font-mono font-black">{d.letter}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Rutas frecuentes rápidas */}
          <div className="space-y-3">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Rutas frecuentes rápidas:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickPaths.map((item, idx) => {
                const isSelected = finalPath.toLowerCase() === item.path.toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickPath(item.path)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      isSelected
                        ? 'border-[#25b0ae] ring-2 ring-[#25b0ae]/20 bg-sky-50/60 dark:bg-slate-800/80'
                        : isDark
                          ? 'bg-[#0a1222] hover:bg-slate-800/50 border-slate-800'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      isSelected
                        ? 'bg-[#002a5b] text-[#25b0ae]'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}>
                      {item.icon === 'user' ? <Laptop className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.path}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Ruta final que se usará para guardar */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Ruta final que se usará para guardar:
            </div>

            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#070d18] border-slate-700/80 focus-within:border-[#25b0ae]'
                : 'bg-white border-slate-300 focus-within:border-[#002a5b] shadow-2xs'
            }`}>
              <Folder className="w-5 h-5 text-amber-500 shrink-0" />
              <input
                type="text"
                value={finalPath}
                onChange={(e) => setFinalPath(e.target.value)}
                className="w-full bg-transparent font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden"
                placeholder="C:\Ruta\De\Destino..."
              />
              <button
                type="button"
                onClick={handleOpenNativeDialog}
                title="Abrir explorador de Windows para seleccionar carpeta"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Folder className="w-3.5 h-3.5 text-[#25b0ae]" />
                <span className="hidden sm:inline">Examinar...</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Si la carpeta no existe en el disco, se creará automáticamente al iniciar la tarea.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 sm:px-7 py-4 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-[#0e192f] border-slate-800' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <button
            type="button"
            onClick={handleOpenNativeDialog}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Folder className="w-4 h-4 text-[#25b0ae]" />
            <span className="hidden sm:inline">Explorador de Windows</span>
            <span className="sm:hidden">Examinar</span>
          </button>

          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#002a5b] hover:bg-[#001733] text-white dark:bg-[#25b0ae] dark:hover:bg-[#1fa09e] dark:text-[#002a5b] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Usar esta carpeta</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};
