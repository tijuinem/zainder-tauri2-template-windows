export type InterfaceLanguage = 'es' | 'en' | 'fr' | 'de';

export interface InterfaceStrings {
  // Navigation
  navIntro: string;
  navPhases: string;
  navPhaseSummary: string;
  navPhaseSummarySubtitle: string;
  navMenu2: string;
  navMenu3: string;
  navDonate: string;
  navPhasesDropdownHeader: string;
  phaseNames: string[];

  // Sub-header
  curriculumHeader: string;
  curriculumSubtitle: string;
  phaseLabel: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  fontSizeTitle: string;
  fontSizeSmall: string;
  fontSizeStandard: string;
  fontSizeXLarge: string;
  highContrastTitle: string;
  highContrastSubtitle: string;
  themeTitle: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  languageTitle: string;
  diagnosticsTitle: string;
  diagSpeech: string;
  diagStorage: string;
  diagOffline: string;
  close: string;

  // 3-Dots More Menu
  moreMenuTitle: string;
  moreMenuSettings: string;
  moreMenuSettingsSub: string;
  moreMenuCredits: string;
  moreMenuCreditsSub: string;
  moreMenuLicense: string;
  moreMenuLicenseSub: string;
  moreMenuShortcuts: string;
  moreMenuShortcutsSub: string;
  moreMenuLogs: string;
  moreMenuLogsSub: string;

  // Credits Modal
  creditsTitle: string;
  creditsSubtitle: string;
  appVersionLabel: string;

  // Donation Modal
  donationTitle: string;
  donationSubtitle: string;

  // Template View Strings
  templateOverviewTitle: string;
  templateOverviewSubtitle: string;
  templateCardTitle: string;
  templateCardDesc: string;
}

export const INTERFACE_TRANSLATIONS: Record<InterfaceLanguage, InterfaceStrings> = {
  es: {
    navIntro: "Introducción",
    navPhases: "Fases",
    navPhaseSummary: "Resumen de fases",
    navPhaseSummarySubtitle: "Vista panorámica de módulos",
    navMenu2: "Menú 2",
    navMenu3: "Menú 3",
    navDonate: "Donar",
    navPhasesDropdownHeader: "Submenús y Fases",
    phaseNames: [
      "Submenú 1",
      "Submenú 2"
    ],

    curriculumHeader: "Módulos del Sistema:",
    curriculumSubtitle: "Selecciona un submenú para inspeccionar sus componentes",
    phaseLabel: "Submenú",

    settingsTitle: "Ajustes y Visibilidad",
    settingsSubtitle: "Comodidad visual y accesibilidad",
    fontSizeTitle: "Tamaño de Letra",
    fontSizeSmall: "Pequeña",
    fontSizeStandard: "Estándar",
    fontSizeXLarge: "Muy Grande",
    highContrastTitle: "Modo Contraste Alto",
    highContrastSubtitle: "Fondo negro y bordes amarillos luminosos",
    themeTitle: "Tema de Interfaz",
    themeLight: "Modo Claro",
    themeDark: "Modo Oscuro",
    themeSystem: "Predeterminado",
    languageTitle: "Idioma de la Interfaz",
    diagnosticsTitle: "Diagnóstico del Sistema",
    diagSpeech: "Síntesis de voz nativa",
    diagStorage: "Almacenamiento local",
    diagOffline: "Modo Offline autónomo",
    close: "Cerrar",

    moreMenuTitle: "Opciones",
    moreMenuSettings: "Ajustes y visibilidad",
    moreMenuSettingsSub: "Tema, letra y accesibilidad",
    moreMenuCredits: "Créditos y versión",
    moreMenuCreditsSub: "Información de la plantilla",
    moreMenuLicense: "Licencia y privacidad",
    moreMenuLicenseSub: "Términos, CC BY 4.0 y datos",
    moreMenuShortcuts: "Atajos de teclado",
    moreMenuShortcutsSub: "Guía rápida de teclas (F1)",
    moreMenuLogs: "Consola y actividad",
    moreMenuLogsSub: "Eventos en vivo y diagnóstico",

    creditsTitle: "Créditos & Versión",
    creditsSubtitle: "Información técnica y arquitectónica de la plantilla",
    appVersionLabel: "Versión de la Plantilla",

    donationTitle: "Apoyar el Proyecto",
    donationSubtitle: "Donaciones voluntarias para el mantenimiento y desarrollo",

    templateOverviewTitle: "Plantilla de Aplicación de Escritorio",
    templateOverviewSubtitle: "Entorno optimizado para Windows con soporte de alta densidad y temas adaptables.",
    templateCardTitle: "Componente Modular",
    templateCardDesc: "Estructura preparada para alojar tus vistas, flujos de trabajo y herramientas."
  },
  en: {
    navIntro: "Introduction",
    navPhases: "Phases",
    navPhaseSummary: "Phase Overview",
    navPhaseSummarySubtitle: "Panoramic view of modules",
    navMenu2: "Menu 2",
    navMenu3: "Menu 3",
    navDonate: "Donate",
    navPhasesDropdownHeader: "Submenus & Phases",
    phaseNames: [
      "Submenu 1",
      "Submenu 2"
    ],

    curriculumHeader: "System Modules:",
    curriculumSubtitle: "Select a submenu to inspect its components",
    phaseLabel: "Submenu",

    settingsTitle: "Display & Visibility Settings",
    settingsSubtitle: "Visual comfort and accessibility",
    fontSizeTitle: "Font Size",
    fontSizeSmall: "Small",
    fontSizeStandard: "Standard",
    fontSizeXLarge: "Extra Large",
    highContrastTitle: "High Contrast Mode",
    highContrastSubtitle: "Deep black background with vivid amber borders",
    themeTitle: "Interface Theme",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    themeSystem: "System Default",
    languageTitle: "Interface Language",
    diagnosticsTitle: "System Diagnostics",
    diagSpeech: "Native speech synthesis",
    diagStorage: "Local storage persistence",
    diagOffline: "Autonomous offline mode",
    close: "Close",

    moreMenuTitle: "Options",
    moreMenuSettings: "Settings & visibility",
    moreMenuSettingsSub: "Theme, font and accessibility",
    moreMenuCredits: "Credits & version",
    moreMenuCreditsSub: "Template architecture and info",
    moreMenuLicense: "License & privacy",
    moreMenuLicenseSub: "Terms, CC BY 4.0 & privacy",
    moreMenuShortcuts: "Keyboard shortcuts",
    moreMenuShortcutsSub: "Quick key guide (F1)",
    moreMenuLogs: "Activity & logs",
    moreMenuLogsSub: "Live events & diagnostics",

    creditsTitle: "Credits & Version",
    creditsSubtitle: "Technical and architectural details of the template",
    appVersionLabel: "Template Version",

    donationTitle: "Support the Project",
    donationSubtitle: "Voluntary donations for continuous maintenance and development",

    templateOverviewTitle: "Desktop Application Template",
    templateOverviewSubtitle: "Optimized for widescreen Windows displays with theme support and high DPI.",
    templateCardTitle: "Modular Component",
    templateCardDesc: "Ready to host your custom views, workflows, and tools."
  },
  fr: {
    navIntro: "Introduction",
    navPhases: "Phases",
    navPhaseSummary: "Aperçu des phases",
    navPhaseSummarySubtitle: "Vue d'ensemble des modules",
    navMenu2: "Menu 2",
    navMenu3: "Menu 3",
    navDonate: "Faire un don",
    navPhasesDropdownHeader: "Sous-menus et Phases",
    phaseNames: [
      "Sous-menu 1",
      "Sous-menu 2"
    ],

    curriculumHeader: "Modules du Système:",
    curriculumSubtitle: "Sélectionnez un sous-menu pour inspecter ses composants",
    phaseLabel: "Sous-menu",

    settingsTitle: "Paramètres d'Affichage & Visibilité",
    settingsSubtitle: "Confort visuel et accessibilité",
    fontSizeTitle: "Taille de Police",
    fontSizeSmall: "Petite",
    fontSizeStandard: "Standard",
    fontSizeXLarge: "Très Grand",
    highContrastTitle: "Mode Contraste Élevé",
    highContrastSubtitle: "Fond noir profond et bordures ambrées",
    themeTitle: "Thème d'Interface",
    themeLight: "Mode Clair",
    themeDark: "Mode Sombre",
    themeSystem: "Par Défaut",
    languageTitle: "Langue de l'Interface",
    diagnosticsTitle: "Diagnostic Système",
    diagSpeech: "Synthèse vocale native",
    diagStorage: "Stockage local persistant",
    diagOffline: "Mode hors ligne autonome",
    close: "Fermer",

    moreMenuTitle: "Options",
    moreMenuSettings: "Paramètres & visibilité",
    moreMenuSettingsSub: "Thème, police et accessibilité",
    moreMenuCredits: "Crédits et version",
    moreMenuCreditsSub: "Informations sur le modèle",
    moreMenuLicense: "Licence et confidentialité",
    moreMenuLicenseSub: "Conditions, CC BY 4.0 et données",
    moreMenuShortcuts: "Raccourcis clavier",
    moreMenuShortcutsSub: "Guide des touches rapides (F1)",
    moreMenuLogs: "Activité et journaux",
    moreMenuLogsSub: "Événements en direct et diagnostic",

    creditsTitle: "Crédits & Version",
    creditsSubtitle: "Détails techniques du modèle",
    appVersionLabel: "Version du Modèle",

    donationTitle: "Soutenir le Projet",
    donationSubtitle: "Dons volontaires pour la maintenance et les améliorations",

    templateOverviewTitle: "Modèle d'Application de Bureau",
    templateOverviewSubtitle: "Optimisé pour écrans larges Windows avec thèmes adaptatifs.",
    templateCardTitle: "Composant Modulaire",
    templateCardDesc: "Prêt à accueillir vos outils et vues personnalisées."
  },
  de: {
    navIntro: "Einführung",
    navPhases: "Phasen",
    navPhaseSummary: "Phasenübersicht",
    navPhaseSummarySubtitle: "Gesamtüberblick aller Module",
    navMenu2: "Menü 2",
    navMenu3: "Menú 3",
    navDonate: "Spenden",
    navPhasesDropdownHeader: "Untermenüs und Phasen",
    phaseNames: [
      "Untermenü 1",
      "Untermenü 2"
    ],

    curriculumHeader: "Systemmodule:",
    curriculumSubtitle: "Wählen Sie ein Untermenü zur Ansicht von Komponenten",
    phaseLabel: "Untermenü",

    settingsTitle: "Anzeige- & Sichtbarkeitseinstellungen",
    settingsSubtitle: "Visueller Komfort und Barrierefreiheit",
    fontSizeTitle: "Schriftgröße",
    fontSizeSmall: "Klein",
    fontSizeStandard: "Standard",
    fontSizeXLarge: "Sehr Groß",
    highContrastTitle: "Hoher Kontrastmodus",
    highContrastSubtitle: "Tiefschwarzer Hintergrund mit bernsteinfarbenen Rändern",
    themeTitle: "Oberflächenthema",
    themeLight: "Heller Modus",
    themeDark: "Dunkler Modus",
    themeSystem: "Systemstandard",
    languageTitle: "Oberflächensprache",
    diagnosticsTitle: "Systemdiagnose",
    diagSpeech: "Native Sprachsynthese",
    diagStorage: "Lokale Speicherung",
    diagOffline: "Autonomer Offline-Modus",
    close: "Schließen",

    moreMenuTitle: "Optionen",
    moreMenuSettings: "Einstellungen & Sichtbarkeit",
    moreMenuSettingsSub: "Design, Schriftart und Barrierefreiheit",
    moreMenuCredits: "Credits und Version",
    moreMenuCreditsSub: "Vorlagenarchitektur und Details",
    moreMenuLicense: "Lizenz und Datenschutz",
    moreMenuLicenseSub: "Bedingungen, CC BY 4.0 und Daten",
    moreMenuShortcuts: "Tastaturkürzel",
    moreMenuShortcutsSub: "Schnellübersicht der Tasten (F1)",
    moreMenuLogs: "Aktivität und Protokolle",
    moreMenuLogsSub: "Live-Ereignisse und Diagnose",

    creditsTitle: "Credits & Version",
    creditsSubtitle: "Technische Informationen zur Vorlage",
    appVersionLabel: "Vorlagenversion",

    donationTitle: "Projekt unterstützen",
    donationSubtitle: "Freiwillige Spenden für laufende Wartung und Entwicklung",

    templateOverviewTitle: "Desktop-Anwendungsvorlage",
    templateOverviewSubtitle: "Optimiert für Windows-Breitbildschirme mit Designunterstützung.",
    templateCardTitle: "Modulare Komponente",
    templateCardDesc: "Bereit für eigene Ansichten, Arbeitsabläufe und Werkzeuge."
  }
};
