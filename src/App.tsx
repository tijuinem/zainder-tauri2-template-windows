import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { CreditsModal } from './components/CreditsModal';
import { LicensePrivacyModal } from './components/LicensePrivacyModal';
import { DirectorySelectorModal } from './components/DirectorySelectorModal';
import { CommandPalette, CommandItem } from './components/CommandPalette';
import { StatusBar } from './components/StatusBar';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { FileDropzone } from './components/ui/FileDropzone';
import { LogDrawer, LogEntry, LogLevel, ActiveTaskState } from './components/ui/LogDrawer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { InterfaceLanguage, INTERFACE_TRANSLATIONS } from './i18n/interfaceTranslations';
import { nativeApi, isTauriEnvironment } from './services/nativeApi';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Activity,
  CheckCircle2,
  Sliders,
  ChevronRight,
  FolderKanban,
  FileText,
  Search,
  Filter,
  Info,
  Maximize2,
  HardDrive,
  Folder,
  Trash2,
  Play,
  RotateCcw,
  Check,
  Command,
  LayoutDashboard,
  ShieldCheck,
  Keyboard,
  Terminal,
  X
} from 'lucide-react';

function AppContent() {
  const [currentView, setCurrentView] = useState<'theory' | 'phase' | 'menu2' | 'menu3'>('theory');
  const [currentPhaseNumber, setCurrentPhaseNumber] = useState<number>(1);
  const [destinationPath, setDestinationPath] = useState<string>('C:\\Proyectos\\Salida');

  // Modals state
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showCreditsModal, setShowCreditsModal] = useState<boolean>(false);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);

  // Background Task & Logs state
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'System',
      message: `Entorno detectado: ${isTauriEnvironment() ? 'Tauri Nativo (Windows)' : 'Vista Previa Web (Mocks activos)'}`
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      source: 'Storage',
      message: 'Persistencia local lista y conectada al almacenamiento de usuario.'
    },
    {
      id: 'log-3',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      source: 'UI',
      message: 'Canvas panorámico 1720px inicializado a 60 FPS.'
    }
  ]);

  const [activeTask, setActiveTask] = useState<ActiveTaskState | null>(null);
  const taskIntervalRef = useRef<number | null>(null);

  const addLog = (level: LogLevel, source: string, message: string) => {
    const newEntry: LogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toLocaleTimeString(),
      level,
      source,
      message
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Confirm dialog state
  const [confirmData, setConfirmData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Master-Detail sample state for Menú 2
  const [selectedItemId, setSelectedItemId] = useState<number>(1);

  const toast = useToast();

  // Settings State: Default to standard (18px) and Light Mode
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedLang = (localStorage.getItem('plantilla_ui_lang') as InterfaceLanguage) || 'es';
    const savedFontSize = (localStorage.getItem('plantilla_font_size') as 'small' | 'standard' | 'xlarge') || 'standard';
    const savedHighContrast = localStorage.getItem('plantilla_high_contrast') === 'true';

    return {
      language: ['es', 'en', 'fr', 'de'].includes(savedLang) ? savedLang : 'es',
      theme: 'light',
      fontSize: ['small', 'standard', 'xlarge'].includes(savedFontSize) ? savedFontSize : 'standard',
      highContrast: savedHighContrast
    };
  });

  const [isDark, setIsDark] = useState<boolean>(() => settings.theme === 'dark');

  // Apply settings to HTML document root
  useEffect(() => {
    const root = document.documentElement;

    root.lang = settings.language;
    localStorage.setItem('plantilla_ui_lang', settings.language);

    root.classList.remove('text-size-small', 'text-size-standard', 'text-size-large', 'text-size-xlarge');
    root.classList.add(`text-size-${settings.fontSize}`);
    localStorage.setItem('plantilla_font_size', settings.fontSize);

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('plantilla_high_contrast', String(settings.highContrast));

    root.classList.remove('dark');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
    } else {
      setIsDark(false);
    }
    localStorage.setItem('plantilla_theme', settings.theme);

  }, [settings]);

  // Cargar configuración persistente desde disco (AppData/settings.json) al arrancar
  useEffect(() => {
    nativeApi.loadSettingsFromDisk<AppSettings>().then((saved) => {
      if (saved && typeof saved === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...saved
        }));
        addLog('info', 'AppData', 'Configuración restaurada desde disco (%APPDATA%\\settings.json)');
      }
    }).catch(() => {});
  }, []);

  // Capturador global de errores nativos de Rust / Tauri
  useEffect(() => {
    const unsubscribe = nativeApi.onError(({ command, error }) => {
      const errorMsg = typeof error === 'string' ? error : error?.message || JSON.stringify(error);
      addLog('error', 'NativeBridge', `Fallo en comando [${command}]: ${errorMsg}`);
      toast.error('Error Nativo', `Fallo al ejecutar "${command}": ${errorMsg}`);
    });
    return unsubscribe;
  }, []);

  // Global Keyboard shortcuts listener (Ctrl+K, Ctrl+O, F1, Ctrl+`, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K -> Paleta de comandos
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
      // Ctrl+O -> Selector de carpetas y discos de destino
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setShowDirectoryModal(true);
      }
      // Ctrl+, -> Ajustes y preferencias
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettingsModal(true);
      }
      // F1 -> Atajos de teclado
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
      // Ctrl + ` (o Ctrl + J) -> Alternar Consola de Logs
      if ((e.ctrlKey || e.metaKey) && (e.key === '`' || e.key.toLowerCase() === 'j')) {
        e.preventDefault();
        setShowLogDrawer((prev) => !prev);
      }
      // Esc -> Cerrar consola si está abierta
      if (e.key === 'Escape' && showLogDrawer) {
        setShowLogDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogDrawer]);

  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      nativeApi.saveSettingsToDisk(updated).catch(() => {});
      return updated;
    });
  };

  const t = INTERFACE_TRANSLATIONS[settings.language];

  const handleNavigate = (view: string, phaseNum?: number) => {
    if (view === 'phase' && phaseNum) {
      setCurrentPhaseNumber(phaseNum);
      setCurrentView('phase');
    } else {
      setCurrentView(view as any);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para simular procesamiento en segundo plano
  const startBackgroundBatchTask = (itemName: string) => {
    if (taskIntervalRef.current) {
      clearInterval(taskIntervalRef.current);
    }

    setShowLogDrawer(true);
    addLog('info', 'TaskRunner', `Iniciando procesamiento de "${itemName}"...`);
    toast.info('Proceso Iniciado', `Ejecutando lote "${itemName}" en segundo plano.`);

    let progress = 0;
    const steps = [
      'Analizando archivos locales...',
      'Verificando integridad y suma de comprobación...',
      'Procesando flujo de datos en paralelo...',
      'Escribiendo resultados en disco de destino...',
      'Finalizando y generando índice...'
    ];

    setActiveTask({
      isRunning: true,
      taskName: itemName,
      percentage: 0,
      currentStep: steps[0],
      canCancel: true,
      onCancel: () => {
        if (taskIntervalRef.current) {
          clearInterval(taskIntervalRef.current);
          taskIntervalRef.current = null;
        }
        setActiveTask(null);
        addLog('warn', 'TaskRunner', `Procesamiento de "${itemName}" abortado por el usuario.`);
        toast.warning('Operación Cancelada', `Se detuvo la ejecución de ${itemName}.`);
      }
    });

    taskIntervalRef.current = window.setInterval(() => {
      progress += 20;
      const stepIdx = Math.min(Math.floor(progress / 20), steps.length - 1);

      if (progress <= 100) {
        addLog('info', 'TaskRunner', `[${progress}%] ${steps[stepIdx]}`);
        setActiveTask((prev) =>
          prev
            ? {
                ...prev,
                percentage: progress,
                currentStep: steps[stepIdx]
              }
            : null
        );
      }

      if (progress >= 100) {
        if (taskIntervalRef.current) {
          clearInterval(taskIntervalRef.current);
          taskIntervalRef.current = null;
        }
        setActiveTask(null);
        addLog('success', 'TaskRunner', `¡Lote "${itemName}" completado con éxito! Archivos procesados.`);
        toast.success('Lote Completado', `Se procesó correctamente "${itemName}".`);
      }
    }, 900);
  };

  // Commands list for Ctrl+K
  const commandList: CommandItem[] = [
    {
      id: 'cmd-intro',
      title: 'Ir a Introducción',
      category: 'Navegación',
      icon: LayoutDashboard,
      action: () => handleNavigate('theory')
    },
    {
      id: 'cmd-sub1',
      title: 'Ir a Submenú 1',
      category: 'Módulos',
      icon: FolderKanban,
      action: () => handleNavigate('phase', 1)
    },
    {
      id: 'cmd-sub2',
      title: 'Ir a Submenú 2',
      category: 'Módulos',
      icon: FolderKanban,
      action: () => handleNavigate('phase', 2)
    },
    {
      id: 'cmd-menu2',
      title: 'Ir a Menú 2 (Maestro-Detalle)',
      category: 'Navegación',
      icon: Layers,
      action: () => handleNavigate('menu2')
    },
    {
      id: 'cmd-menu3',
      title: 'Ir a Menú 3',
      category: 'Navegación',
      icon: FileText,
      action: () => handleNavigate('menu3')
    },
    {
      id: 'cmd-logs',
      title: showLogDrawer ? 'Ocultar Consola de Logs' : 'Abrir Consola de Actividad y Logs',
      category: 'Diagnóstico',
      icon: Terminal,
      action: () => setShowLogDrawer((prev) => !prev)
    },
    {
      id: 'cmd-shortcuts',
      title: 'Ver Atajos de Teclado (F1)',
      category: 'Ayuda',
      icon: Keyboard,
      action: () => setShowShortcutsModal(true)
    },
    {
      id: 'cmd-dest',
      title: 'Seleccionar Carpeta / Disco de Destino',
      category: 'Sistema',
      icon: HardDrive,
      action: () => setShowDirectoryModal(true)
    },
    {
      id: 'cmd-appdata',
      title: 'Abrir Carpeta de Configuración (%APPDATA%)',
      category: 'Sistema',
      icon: HardDrive,
      action: () => {
        nativeApi.openAppDataFolder();
        toast.info('AppData', 'Abriendo carpeta de datos en el Explorador de Windows.');
      }
    },
    {
      id: 'cmd-settings',
      title: 'Ajustes y Visibilidad',
      category: 'Preferencias',
      icon: Sliders,
      action: () => setShowSettingsModal(true)
    },
    {
      id: 'cmd-theme',
      title: isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro',
      category: 'Preferencias',
      icon: Sparkles,
      action: () => handleUpdateSettings({ theme: isDark ? 'light' : 'dark' })
    },
    {
      id: 'cmd-license',
      title: 'Términos, Licencia y Privacidad',
      category: 'Acerca de',
      icon: ShieldCheck,
      action: () => setShowLicenseModal(true)
    },
    {
      id: 'cmd-credits',
      title: 'Créditos y Versión',
      category: 'Acerca de',
      icon: Sparkles,
      action: () => setShowCreditsModal(true)
    },
  ];

  // Master-detail sample items
  const masterItems = [
    { id: 1, title: 'Conversión Lote 01', files: '14 archivos', status: 'Listo', date: 'Hoy, 18:20' },
    { id: 2, title: 'Exportación Proyecto Alpha', files: '8 archivos', status: 'En cola', date: 'Ayer' },
    { id: 3, title: 'Copia de Seguridad USB', files: '32 archivos', status: 'Completado', date: '21 Oct' },
    { id: 4, title: 'Índice de Recursos Multimedia', files: '120 archivos', status: 'Listo', date: '19 Oct' }
  ];

  const currentSelectedItem = masterItems.find((i) => i.id === selectedItemId) || masterItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#25b0ae]/20 selection:text-[#002a5b]">
      {/* Top Main Navigation */}
      <Navbar
        currentView={currentView}
        currentPhaseNumber={currentPhaseNumber}
        language={settings.language}
        isDark={isDark}
        onNavigate={handleNavigate}
        onOpenSummary={() => setShowSummaryModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenCredits={() => setShowCreditsModal(true)}
        onOpenLicense={() => setShowLicenseModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onOpenLogs={() => setShowLogDrawer((prev) => !prev)}
        onChangeLanguage={(lang) => handleUpdateSettings({ language: lang })}
      />

      {/* Sub-Header for Phase Navigation */}
      {currentView === 'phase' && (
        <div className="bg-white dark:bg-[#0c1527] border-b border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-[#002a5b] dark:text-[#25b0ae]">{t.curriculumHeader}</span>
                <span className="hidden md:inline">{t.curriculumSubtitle}</span>
              </div>

              {/* Submenu navigation pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {t.phaseNames.map((name, idx) => {
                  const pNum = idx + 1;
                  const isActive = currentPhaseNumber === pNum;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handleNavigate('phase', pNum)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#002a5b] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{name}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#25b0ae]" />}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowSummaryModal(true)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#002a5b] dark:text-[#25b0ae] hover:bg-sky-50 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 border border-sky-200/60 dark:border-slate-700 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.navPhaseSummary}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area (Widescreen Windows Canvas: max-w-[1720px]) */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        {/* ========================================================= */}
        {/* VIEW 1: INTRODUCCIÓN / OVERVIEW                           */}
        {/* ========================================================= */}
        {currentView === 'theory' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002a5b] via-[#003875] to-[#126892] text-white p-8 sm:p-10 shadow-xl border border-sky-900/40">
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase text-[#5eead4]">
                  <Sparkles className="w-3.5 h-3.5 text-[#25b0ae]" />
                  <span>Plantilla Base · Windows Desktop</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {t.templateOverviewTitle}
                </h1>
                <p className="text-base sm:text-lg text-sky-100/90 leading-relaxed font-normal">
                  {t.templateOverviewSubtitle}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleNavigate('menu2')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25b0ae] hover:bg-[#1fa09e] text-[#002a5b] font-bold text-sm shadow-md transition-all cursor-pointer group"
                  >
                    <span>Abrir Panel Maestro-Detalle</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setShowDirectoryModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4 text-[#25b0ae]" />
                    <span>Seleccionar Carpeta / Discos</span>
                  </button>
                </div>
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none bg-gradient-to-l from-white to-transparent" />
              <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-[#25b0ae]/20 blur-3xl pointer-events-none" />
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Destino Activo', val: destinationPath.slice(0, 16) + '...', desc: 'Carpeta de trabajo configurada', icon: HardDrive, color: 'text-amber-500' },
                { title: 'Rendimiento', val: '60 FPS', desc: 'Aceleración por GPU nativa', icon: Activity, color: 'text-emerald-500' },
                { title: 'Resolución Desktop', val: '1720 px', desc: 'Canvas panorámico adaptable', icon: Maximize2, color: 'text-[#25b0ae]' },
                { title: 'Paleta Comandos', val: 'Ctrl + K', desc: 'Atajos y búsqueda rápida', icon: Command, color: 'text-indigo-500' }
              ].map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex items-start justify-between"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {card.title}
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {card.val}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {card.desc}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <IconComponent className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions & Demo Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-[#0c1527] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Herramientas Rápidas Integradas
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Componentes listos para invocar desde cualquier vista.
                    </p>
                  </div>
                  <button
                    onClick={() => toast.success('Prueba de Toast', 'El sistema de notificaciones funciona a la perfección.')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800 cursor-pointer"
                  >
                    Probar Toast
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => setShowDirectoryModal(true)}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-[#25b0ae]/50 transition-all space-y-2 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Acceso a Discos
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#25b0ae] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Selector de Unidades y Carpetas
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ventana modal estilo Windows para elegir discos USB, rutas rápidas o crear carpetas.
                    </p>
                  </div>

                  <div
                    onClick={() => setShowCommandPalette(true)}
                    className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-[#25b0ae]/50 transition-all space-y-2 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-[#002a5b] dark:text-[#25b0ae] border border-sky-200 dark:border-slate-700">
                        Atajos Rápidos
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#25b0ae] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Paleta de Comandos (Ctrl + K)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Buscador flotante para saltar entre menús, cambiar temas o ejecutar acciones con el teclado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Side Info Panel */}
              <div className="bg-white dark:bg-[#0c1527] rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  <span>Ruta de Destino Actual</span>
                </h3>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Carpeta configurada:</div>
                  <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">
                    {destinationPath}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDirectoryModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#002a5b] hover:bg-[#001733] text-white dark:bg-[#25b0ae] dark:hover:bg-[#1fa09e] dark:text-[#002a5b] font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Folder className="w-4 h-4" />
                  <span>Modificar Unidad o Ruta</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: FASES (SUBMENÚ 1 Y 2)                              */}
        {/* ========================================================= */}
        {currentView === 'phase' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-[#0c1527] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-slate-800 text-xs font-bold text-[#002a5b] dark:text-[#25b0ae]">
                    <span>SUBMENÚ ACTIVO</span>
                    <span>·</span>
                    <span>{t.phaseNames[currentPhaseNumber - 1] || `Submenú ${currentPhaseNumber}`}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {t.phaseNames[currentPhaseNumber - 1] || `Submenú ${currentPhaseNumber}`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Vista modular para la gestión de procesos o módulos específicos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSummaryModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#25b0ae]" />
                    <span>Ver Resumen</span>
                  </button>
                </div>
              </div>

              {/* Sample Submenu Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((cardIdx) => (
                  <div
                    key={cardIdx}
                    className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#002a5b] text-white flex items-center justify-center font-bold text-sm font-mono">
                      #{cardIdx}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Sección {cardIdx} — {t.phaseNames[currentPhaseNumber - 1]}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Estructura modular preparada para añadir paneles, métricas o formularios en este submenú.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: MENÚ 2 — PATRÓN MAESTRO-DETALLE (MASTER-DETAIL)     */}
        {/* ========================================================= */}
        {currentView === 'menu2' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-6 h-6 text-[#25b0ae]" />
                  <span>Menú 2 — Patrón Maestro-Detalle</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Estructura optimizada para monitorear lotes, proyectos y arrastrar archivos directamente.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDirectoryModal(true)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#25b0ae] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <HardDrive className="w-4 h-4 text-amber-500" />
                  <span className="font-mono text-[11px] truncate max-w-[140px]">{destinationPath.split('\\').pop() || destinationPath}</span>
                </button>
              </div>
            </div>

            {/* Master-Detail 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Master List: 4 cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-[#0c1527] rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Elementos ({masterItems.length})
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">Lotes</span>
                </div>

                <div className="space-y-2">
                  {masterItems.map((item) => {
                    const isSelected = item.id === selectedItemId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#002a5b] text-white border-transparent shadow-md'
                            : isDark
                              ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-200'
                              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {item.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-white/20 text-[#5eead4]'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className={`flex items-center justify-between text-[11px] mt-2 ${
                          isSelected ? 'text-sky-200' : 'text-slate-400'
                        }`}>
                          <span>{item.files}</span>
                          <span className="font-mono">{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (Detail View: 8 cols) */}
              <div className="lg:col-span-8 bg-white dark:bg-[#0c1527] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#25b0ae] font-mono">
                      Detalle del Elemento #{currentSelectedItem.id}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {currentSelectedItem.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmData({
                          isOpen: true,
                          title: '¿Reiniciar este elemento?',
                          message: 'Se restablecerán los contadores y archivos temporales de este lote.',
                          onConfirm: () => {
                            setConfirmData(null);
                            toast.info('Lote reiniciado', 'El elemento se ha restablecido a su estado inicial.');
                          }
                        });
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reiniciar</span>
                    </button>

                    <button
                      type="button"
                      disabled={activeTask?.isRunning}
                      onClick={() => startBackgroundBatchTask(currentSelectedItem.title)}
                      className="px-4 py-2 rounded-xl bg-[#002a5b] hover:bg-[#001733] text-white dark:bg-[#25b0ae] dark:hover:bg-[#1fa09e] dark:text-[#002a5b] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{activeTask?.isRunning ? 'Procesando...' : 'Ejecutar'}</span>
                    </button>
                  </div>
                </div>

                {/* Drag and Drop Zone embedded */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Arrastrar Archivos al Lote
                  </div>
                  <FileDropzone
                    isDark={isDark}
                    onFilesSelected={(files) => {
                      toast.success('Archivos recibidos', `${files.length} archivo(s) listos para procesar.`);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: MENÚ 3                                            */}
        {/* ========================================================= */}
        {currentView === 'menu3' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white dark:bg-[#0c1527] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6">
              <div className="pb-6 border-b border-slate-100 dark:border-slate-800 space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-slate-800 text-xs font-bold text-[#002a5b] dark:text-[#25b0ae] border border-teal-200/60 dark:border-slate-700">
                  <FileText className="w-3.5 h-3.5 text-[#25b0ae]" />
                  <span>SECCIÓN SECUNDARIA</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t.navMenu3}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Espacio de trabajo modular preparado para herramientas de informe o configuración.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Panel Principal de Menú 3
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Bloque de presentación estructurado. Perfecto para cuadros de mandos, configuraciones o visores de documentos.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Panel Secundario de Menú 3
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Bloque complementario para registros, gráficos analíticos o controles específicos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Log Drawer — Consola de Actividad en Tiempo Real */}
      <LogDrawer
        isOpen={showLogDrawer}
        logs={logs}
        activeTask={activeTask}
        isDark={isDark}
        onClose={() => setShowLogDrawer(false)}
        onClearLogs={clearLogs}
      />

      {/* Subtle Desktop Status Bar (Bottom of Window) */}
      <StatusBar
        currentPath={destinationPath}
        isDark={isDark}
        logCount={logs.length}
        errorCount={logs.filter((l) => l.level === 'error').length}
        isLogDrawerOpen={showLogDrawer}
        onOpenDirectorySelector={() => setShowDirectoryModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onToggleLogDrawer={() => setShowLogDrawer((prev) => !prev)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
      />

      {/* Directory / Drive Selector Modal */}
      {showDirectoryModal && (
        <DirectorySelectorModal
          currentPath={destinationPath}
          isDark={isDark}
          onSelectPath={(newPath) => {
            setDestinationPath(newPath);
            toast.success('Ruta actualizada', `Destino configurado en: ${newPath}`);
          }}
          onClose={() => setShowDirectoryModal(false)}
        />
      )}

      {/* Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        isDark={isDark}
        commands={commandList}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Generic Confirm Modal */}
      {confirmData && (
        <ConfirmModal
          isOpen={confirmData.isOpen}
          title={confirmData.title}
          message={confirmData.message}
          isDark={isDark}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-[#0c1527] text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-[#002a5b] dark:text-[#25b0ae]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{t.navPhaseSummary}</h3>
                  <p className="text-xs text-slate-500">{t.navPhaseSummarySubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto">
              {t.phaseNames.map((name, i) => (
                <div
                  key={i}
                  onClick={() => {
                    handleNavigate('phase', i + 1);
                    setShowSummaryModal(false);
                  }}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#002a5b] text-white flex items-center justify-center text-xs font-bold font-mono">
                      #{i + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm group-hover:text-[#002a5b] dark:group-hover:text-[#25b0ae]">
                        {name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Acceder a la vista modular
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#25b0ae] transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          isDark={isDark}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Credits & Version Modal */}
      {showCreditsModal && (
        <CreditsModal
          language={settings.language}
          isDark={isDark}
          onClose={() => setShowCreditsModal(false)}
        />
      )}

      {/* License & Privacy Modal */}
      {showLicenseModal && (
        <LicensePrivacyModal
          language={settings.language}
          isDark={isDark}
          onClose={() => setShowLicenseModal(false)}
        />
      )}


      {/* Keyboard Shortcuts Cheat Sheet (F1) */}
      {showShortcutsModal && (
        <ShortcutsModal
          language={settings.language}
          isDark={isDark}
          onClose={() => setShowShortcutsModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
