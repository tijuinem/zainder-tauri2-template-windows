import React, { useState, useRef, useEffect } from 'react';
import { ZainderLogo } from './ZainderLogo';
import {
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Settings,
  MoreVertical,
  Globe,
  Check,
  Layers,
  FileText,
  Sliders,
  ShieldCheck,
  Keyboard,
  Terminal
} from 'lucide-react';
import { InterfaceLanguage, INTERFACE_TRANSLATIONS } from '../i18n/interfaceTranslations';
import { WindowControls } from './ui/WindowControls';
import { nativeApi } from '../services/nativeApi';

interface NavbarProps {
  currentView: string;
  currentPhaseNumber: number;
  language: InterfaceLanguage;
  isDark?: boolean;
  onNavigate: (view: string, phaseNum?: number) => void;
  onOpenSummary: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  onOpenLicense: () => void;
  onOpenShortcuts?: () => void;
  onOpenLogs?: () => void;
  onChangeLanguage: (lang: InterfaceLanguage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  currentPhaseNumber,
  language,
  isDark = false,
  onNavigate,
  onOpenSummary,
  onOpenSettings,
  onOpenCredits,
  onOpenLicense,
  onOpenShortcuts,
  onOpenLogs,
  onChangeLanguage
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [phaseDropdownOpen, setPhaseDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  const phaseDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  const t = INTERFACE_TRANSLATIONS[language];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        phaseDropdownRef.current &&
        !phaseDropdownRef.current.contains(event.target as Node)
      ) {
        setPhaseDropdownOpen(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const phaseNames = t.phaseNames.map((name, idx) => ({
    num: idx + 1,
    name
  }));

  const languagesList: { code: InterfaceLanguage; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: 'ES' },
    { code: 'en', label: 'English', flag: 'GB' },
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'de', label: 'Deutsch', flag: 'DE' }
  ];

  const currentLangLabel = languagesList.find(l => l.code === language)?.flag || 'ES';

  // Drag de ventana: solo activar si el clic es en el header o en un elemento con data-drag
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    // Ignorar clics en botones, inputs, selects, links o elementos interactivos
    const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]');
    if (!isInteractive && e.button === 0) {
      e.preventDefault();
      nativeApi.startDragging();
    }
  };

  const handleHeaderDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]');
    if (!isInteractive) {
      nativeApi.toggleMaximizeWindow();
    }
  };

  return (
    <header
      onMouseDown={handleHeaderMouseDown}
      onDoubleClick={handleHeaderDoubleClick}
      className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1527]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors select-none"
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <button
            onClick={() => onNavigate('theory')}
            className="flex items-center gap-2 group text-left focus:outline-hidden cursor-pointer"
          >
            <ZainderLogo size="md" light={isDark} showSubtitle={false} brandName="ZAINDER" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            {/* Introducción */}
            <button
              onClick={() => onNavigate('theory')}
              className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'theory'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#002a5b] dark:text-[#25b0ae] font-bold'
                  : 'hover:text-[#002a5b] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {t.navIntro}
            </button>

            {/* Fases Dropdown Selector (Generic Submenus + Resumen de fases) */}
            <div className="relative" ref={phaseDropdownRef}>
              <button
                onClick={() => {
                  setPhaseDropdownOpen(!phaseDropdownOpen);
                  setLangDropdownOpen(false);
                  setMoreDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'phase'
                    ? 'bg-[#002a5b] text-white font-bold shadow-xs'
                    : 'hover:text-[#002a5b] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{t.navPhases}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${phaseDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {phaseDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#0c1527] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-fadeIn"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                    {t.navPhasesDropdownHeader}
                  </div>

                  {/* Submenús Genéricos (Submenú 1 y Submenú 2) */}
                  <div className="space-y-0.5">
                    {phaseNames.map((p) => (
                      <button
                        key={p.num}
                        onClick={() => {
                          onNavigate('phase', p.num);
                          setPhaseDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          currentView === 'phase' && currentPhaseNumber === p.num
                            ? 'bg-sky-50 dark:bg-slate-800 text-[#002a5b] dark:text-[#25b0ae] font-bold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#002a5b]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#25b0ae]" />
                          <span>{p.name}</span>
                        </div>
                        {currentView === 'phase' && currentPhaseNumber === p.num && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#002a5b] dark:bg-[#25b0ae]" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />

                  {/* Resumen de Fases */}
                  <button
                    onClick={() => {
                      onOpenSummary();
                      setPhaseDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-2.5 text-[#002a5b] dark:text-sky-300 hover:bg-sky-50/80 dark:hover:bg-slate-800/60 group cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#25b0ae] shrink-0 group-hover:rotate-12 transition-transform" />
                    <div>
                      <div className="font-bold text-xs sm:text-sm">
                        {t.navPhaseSummary}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        {t.navPhaseSummarySubtitle}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Menú 2 */}
            <button
              onClick={() => onNavigate('menu2')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'menu2'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#002a5b] dark:text-[#25b0ae] font-bold'
                  : 'hover:text-[#002a5b] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.navMenu2}</span>
            </button>

            {/* Menú 3 */}
            <button
              onClick={() => onNavigate('menu3')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                currentView === 'menu3'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#002a5b] dark:text-[#25b0ae] font-bold'
                  : 'hover:text-[#002a5b] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.navMenu3}</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="hidden sm:flex items-center gap-2">

            {/* 1. Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setPhaseDropdownOpen(false);
                  setMoreDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  isDark
                    ? langDropdownOpen
                      ? 'border-[#25b0ae] ring-2 ring-[#25b0ae]/20 text-[#25b0ae] bg-slate-800'
                      : 'text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700'
                    : langDropdownOpen
                      ? 'border-[#002a5b] ring-2 ring-[#002a5b]/15 text-[#002a5b] bg-sky-50 shadow-2xs'
                      : 'text-slate-700 hover:text-[#002a5b] bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
                aria-label="Language selector"
              >
                <Globe className={`w-4 h-4 ${isDark ? 'text-[#25b0ae]' : 'text-[#002a5b]'}`} />
                <span className={`font-mono tracking-wider font-extrabold ${isDark ? 'text-slate-100' : 'text-[#002a5b]'}`}>
                  {currentLangLabel}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  langDropdownOpen ? 'rotate-180' : ''
                } text-slate-400`} />
              </button>

              {/* Language Dropdown Menu */}
              {langDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn border ${
                    isDark
                      ? 'bg-[#0c1527] border-slate-800 ring-1 ring-slate-800'
                      : 'bg-white border-slate-200/90 shadow-xl ring-1 ring-slate-900/5'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 mb-1 flex items-center justify-between border-b ${
                    isDark
                      ? 'text-slate-400 border-slate-800/80'
                      : 'text-slate-400 border-slate-100'
                  }`}>
                    <span>Idioma / Language</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25b0ae]" />
                  </div>

                  <div className="space-y-1">
                    {languagesList.map((langItem) => {
                      const isSelected = language === langItem.code;
                      return (
                        <button
                          key={langItem.code}
                          type="button"
                          onClick={() => {
                            onChangeLanguage(langItem.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? isDark
                                ? 'bg-[#002a5b] text-white shadow-md border border-[#25b0ae]/50 font-bold'
                                : 'bg-[#002a5b] text-white shadow-md font-bold'
                              : isDark
                                ? 'text-slate-200 hover:text-white hover:bg-slate-800/70 font-semibold'
                                : 'text-slate-700 hover:text-[#002a5b] hover:bg-sky-50/80 font-semibold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`font-mono text-[11px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md ${
                              isSelected
                                ? isDark
                                  ? 'text-[#25b0ae] bg-slate-900/60'
                                  : 'text-[#25b0ae] bg-[#001c3d]'
                                : isDark
                                  ? 'text-slate-400 bg-slate-800/80 group-hover:text-white'
                                  : 'text-slate-500 bg-slate-100 group-hover:text-[#002a5b] group-hover:bg-[#25b0ae]/15'
                            }`}>
                              {langItem.flag}
                            </span>
                            <span className={isSelected ? 'text-white' : ''}>
                              {langItem.label}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#25b0ae] stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Settings Gear Button (Ruleta / Tuerca: reservada para el futuro sin acción) */}
            <button
              type="button"
              className={`p-2.5 rounded-xl transition-all border group cursor-default ${
                isDark
                  ? 'text-slate-400 bg-slate-800/50 border-slate-700/60 hover:text-slate-300'
                  : 'text-slate-400 bg-white hover:bg-slate-50 border-slate-200 shadow-2xs hover:text-slate-600'
              }`}
              title="Ajustes (Reservado)"
              aria-label="Ajustes"
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
            </button>

            {/* 3. Three Vertical Dots (Menú activo con submenús: Ajustes, Créditos, Licencia) */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setMoreDropdownOpen(!moreDropdownOpen);
                  setLangDropdownOpen(false);
                  setPhaseDropdownOpen(false);
                }}
                className={`p-2.5 rounded-xl transition-all border group cursor-pointer ${
                  isDark
                    ? moreDropdownOpen
                      ? 'border-[#25b0ae] ring-2 ring-[#25b0ae]/20 text-[#25b0ae] bg-slate-800'
                      : 'text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:text-white'
                    : moreDropdownOpen
                      ? 'border-[#002a5b] ring-2 ring-[#002a5b]/15 text-[#002a5b] bg-sky-50 shadow-2xs'
                      : 'text-slate-700 hover:text-[#002a5b] bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
                title={t.moreMenuTitle}
                aria-label={t.moreMenuTitle}
              >
                <MoreVertical className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>

              {/* Dropdown de opciones activas de los tres puntos */}
              {moreDropdownOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn border ${
                    isDark
                      ? 'bg-[#0c1527] border-slate-800 ring-1 ring-slate-800'
                      : 'bg-white border-slate-200/90 shadow-xl ring-1 ring-slate-900/5'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 mb-1 flex items-center justify-between border-b ${
                    isDark
                      ? 'text-slate-400 border-slate-800/80'
                      : 'text-slate-400 border-slate-100'
                  }`}>
                    <span>{t.moreMenuTitle}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25b0ae]" />
                  </div>

                  <div className="space-y-1">
                    {/* Opción 1: Ajustes y visibilidad */}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                        isDark
                          ? 'text-slate-200 hover:text-white hover:bg-slate-800/70'
                          : 'text-slate-700 hover:text-[#002a5b] hover:bg-sky-50/80'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-slate-800 flex items-center justify-center text-[#002a5b] dark:text-[#25b0ae] group-hover:scale-105 transition-transform">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t.moreMenuSettings}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{t.moreMenuSettingsSub}</div>
                      </div>
                    </button>

                    {/* Opción 2: Créditos y versión */}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onOpenCredits();
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                        isDark
                          ? 'text-slate-200 hover:text-white hover:bg-slate-800/70'
                          : 'text-slate-700 hover:text-[#002a5b] hover:bg-sky-50/80'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-[#25b0ae] group-hover:scale-105 transition-transform">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t.moreMenuCredits}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{t.moreMenuCreditsSub}</div>
                      </div>
                    </button>

                    {/* Opción 3: Licencia y privacidad */}
                    <button
                      type="button"
                      onClick={() => {
                        setMoreDropdownOpen(false);
                        onOpenLicense();
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                        isDark
                          ? 'text-slate-200 hover:text-white hover:bg-slate-800/70'
                          : 'text-slate-700 hover:text-[#002a5b] hover:bg-sky-50/80'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">{t.moreMenuLicense}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{t.moreMenuLicenseSub}</div>
                      </div>
                    </button>

                    {/* Opción 4: Atajos de teclado */}
                    {onOpenShortcuts && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreDropdownOpen(false);
                          onOpenShortcuts();
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                          isDark
                            ? 'text-slate-200 hover:text-white hover:bg-slate-800/70'
                            : 'text-slate-700 hover:text-[#002a5b] hover:bg-sky-50/80'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                          <Keyboard className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{t.moreMenuShortcuts}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{t.moreMenuShortcutsSub}</div>
                        </div>
                      </button>
                    )}

                    {/* Opción 5: Consola de actividad y logs */}
                    {onOpenLogs && (
                      <button
                        type="button"
                        onClick={() => {
                          setMoreDropdownOpen(false);
                          onOpenLogs();
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-3 cursor-pointer group ${
                          isDark
                            ? 'text-slate-200 hover:text-white hover:bg-slate-800/70'
                            : 'text-slate-700 hover:text-[#002a5b] hover:bg-sky-50/80'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-slate-800 flex items-center justify-center text-[#25b0ae] group-hover:scale-105 transition-transform">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{t.moreMenuLogs}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{t.moreMenuLogsSub}</div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Controles de Ventana Frameless (Minimizar, Maximizar, Cerrar) */}
            <WindowControls isDark={isDark} />
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-1.5">

            {/* Language pill on mobile */}
            <button
              type="button"
              onClick={() => {
                const nextLang: Record<InterfaceLanguage, InterfaceLanguage> = {
                  es: 'en',
                  en: 'fr',
                  fr: 'de',
                  de: 'es'
                };
                onChangeLanguage(nextLang[language]);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#25b0ae]" />
              <span className="font-mono">{currentLangLabel}</span>
            </button>

            {/* Mobile Three-Dots Action */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-[#002a5b] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Ajustes"
            >
              <Sliders className="w-4 h-4 text-[#25b0ae]" />
            </button>

            {/* Controles de Ventana en mobile/pantalla pequeña */}
            <WindowControls isDark={isDark} />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-[#002a5b] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1527] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('theory');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {t.navIntro}
            </button>

            <div className="pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
              {t.navPhases}
            </div>

            <div className="grid grid-cols-2 gap-1.5 pl-2">
              {phaseNames.map((p) => (
                <button
                  key={p.num}
                  onClick={() => {
                    onNavigate('phase', p.num);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer ${
                    currentView === 'phase' && currentPhaseNumber === p.num
                      ? 'bg-[#002a5b] text-white border-[#002a5b]'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onOpenSummary();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#002a5b] dark:text-[#25b0ae] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.navPhaseSummary}</span>
            </button>

            <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

            {/* Menú 2 y Menú 3 en móvil */}
            <button
              onClick={() => {
                onNavigate('menu2');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.navMenu2}</span>
            </button>

            <button
              onClick={() => {
                onNavigate('menu3');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#25b0ae]" />
              <span>{t.navMenu3}</span>
            </button>


            {/* Acciones de Ajustes, Créditos y Licencia */}
            <button
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#25b0ae]" />
              <span>{t.moreMenuSettings}</span>
            </button>

            <button
              onClick={() => {
                onOpenCredits();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#25b0ae]" />
              <span>{t.moreMenuCredits}</span>
            </button>

            <button
              onClick={() => {
                onOpenLicense();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.moreMenuLicense}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
