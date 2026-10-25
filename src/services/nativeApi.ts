/**
 * nativeApi.ts
 * Capa de abstracción transparente entre la UI (React) y el backend nativo (Tauri v2 / Rust).
 * Permite desarrollar y probar el 100% de la interfaz en navegador web con mocks inteligentes,
 * y se conecta automáticamente a las APIs reales de Tauri v2 cuando la app se ejecuta empaquetada.
 */

// Tipo de ayuda para detectar el entorno de ejecución
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI__' in window || '__TAURI_INTERNALS__' in window);
};

export interface SystemDiskInfo {
  name: string;
  mountPoint: string;
  totalSpaceGb: number;
  availableSpaceGb: number;
  diskType: 'SSD' | 'HDD' | 'USB';
}

export interface NativeTaskProgress {
  percentage: number;
  currentStep: string;
  totalItems?: number;
  processedItems?: number;
}

export type NativeErrorHandler = (detail: { command: string; error: any }) => void;

export class NativeBridge {
  private static instance: NativeBridge;
  private isMaximizedState: boolean = false;
  private errorListeners: NativeErrorHandler[] = [];

  private constructor() {}

  public static getInstance(): NativeBridge {
    if (!NativeBridge.instance) {
      NativeBridge.instance = new NativeBridge();
    }
    return NativeBridge.instance;
  }

  /**
   * Registra un callback para ser notificado cuando falle cualquier llamada nativa a Rust
   */
  public onError(handler: NativeErrorHandler): () => void {
    this.errorListeners.push(handler);
    return () => {
      this.errorListeners = this.errorListeners.filter((h) => h !== handler);
    };
  }

  private notifyError(command: string, error: any) {
    this.errorListeners.forEach((h) => {
      try {
        h({ command, error });
      } catch {}
    });
  }

  /**
   * Invoca un comando nativo de Rust con captura global de errores y fallback seguro en desarrollo web
   */
  public async invoke<T = any>(command: string, args: Record<string, any> = {}): Promise<T> {
    if (isTauriEnvironment()) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        return await invoke(command, args);
      } catch (err) {
        try {
          const globalInvoke = (window as any).__TAURI__?.core?.invoke || (window as any).__TAURI__?.tauri?.invoke;
          if (globalInvoke) {
            return await globalInvoke(command, args);
          }
        } catch (err2) {
          console.error(`[NativeBridge] Error en invoke('${command}'):`, err2);
          this.notifyError(command, err2);
          throw err2;
        }
        console.error(`[NativeBridge] Error en invoke('${command}'):`, err);
        this.notifyError(command, err);
        throw err;
      }
    }

    // Modo Web Mock para desarrollo ágil
    console.debug(`[NativeBridge Mock] invoke('${command}', ${JSON.stringify(args)})`);
    return this.mockCommandHandler<T>(command, args);
  }

  /**
   * Obtiene la versión oficial de la aplicación desde Rust (Cargo.toml)
   */
  public async getAppVersion(): Promise<string> {
    if (isTauriEnvironment()) {
      try {
        return await this.invoke<string>('get_app_version');
      } catch (err) {
        console.warn('[NativeBridge] Falló get_app_version en Rust:', err);
      }
    }
    return '1.0.0';
  }

  /**
   * Prueba de conectividad nativa UI <-> Rust
   */
  public async ping(): Promise<string> {
    if (isTauriEnvironment()) {
      try {
        return await this.invoke<string>('ping_rust');
      } catch (err) {
        console.warn('[NativeBridge] Falló ping_rust en Rust:', err);
      }
    }
    return 'pong (mock)';
  }

  /**
   * Abre el selector nativo de carpetas de Windows usando tauri-plugin-dialog
   */
  public async openDirectoryDialog(defaultPath?: string): Promise<string | null> {
    if (isTauriEnvironment()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          defaultPath: defaultPath || undefined,
          title: 'Seleccionar carpeta de destino'
        });
        return typeof selected === 'string' ? selected : null;
      } catch (e) {
        console.warn('[NativeBridge] Falló plugin dialog, intentando fallback global:', e);
        try {
          const globalDialog = (window as any).__TAURI__?.dialog;
          if (globalDialog?.open) {
            const selected = await globalDialog.open({
              directory: true,
              multiple: false,
              defaultPath: defaultPath || undefined
            });
            return typeof selected === 'string' ? selected : null;
          }
        } catch (err2) {
          console.error('[NativeBridge] Falló dialog nativo:', err2);
        }
      }
    }

    // Fallback para entorno web (Edge / Chrome File System Access API)
    if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        if (dirHandle && dirHandle.name) {
          return `C:\\Proyectos\\${dirHandle.name}`;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return null;
      }
    }

    // Fallback estándar en navegador
    if (typeof window !== 'undefined') {
      const userPath = window.prompt('Introduce la ruta de carpeta deseada:', defaultPath || 'C:\\Proyectos\\Salida');
      return userPath && userPath.trim().length > 0 ? userPath.trim() : null;
    }

    return null;
  }

  /**
   * Abre un archivo o ruta en el Explorador de archivos de Windows
   */
  public async openInExplorer(path: string): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('open_path_in_explorer', { path });
        return;
      } catch {
        try {
          const { open } = await import('@tauri-apps/plugin-shell');
          await open(path);
          return;
        } catch {
          try {
            const globalShell = (window as any).__TAURI__?.shell;
            if (globalShell?.open) {
              await globalShell.open(path);
              return;
            }
          } catch (err) {
            console.error('[NativeBridge] Error al abrir en explorador:', err);
          }
        }
      }
    }
    console.debug(`[NativeBridge Mock] Abriendo en Explorador: ${path}`);
  }

  /**
   * Obtiene la información de unidades de disco (C:, D:, USBs, etc.)
   */
  public async getAvailableDisks(): Promise<SystemDiskInfo[]> {
    if (isTauriEnvironment()) {
      try {
        return await this.invoke<SystemDiskInfo[]>('get_system_disks');
      } catch (err) {
        console.warn('[NativeBridge] Falló comando get_system_disks en Rust:', err);
      }
    }

    // Unidades simuladas para desarrollo web
    return [
      { name: 'Disco Local (C:)', mountPoint: 'C:\\', totalSpaceGb: 476, availableSpaceGb: 198, diskType: 'SSD' },
      { name: 'Almacenamiento (D:)', mountPoint: 'D:\\', totalSpaceGb: 1863, availableSpaceGb: 642, diskType: 'HDD' },
      { name: 'NVMe Trabajo (H:)', mountPoint: 'H:\\', totalSpaceGb: 953, availableSpaceGb: 412, diskType: 'SSD' },
      { name: 'Pendrive USB (E:)', mountPoint: 'E:\\', totalSpaceGb: 64, availableSpaceGb: 28, diskType: 'USB' }
    ];
  }

  /**
   * Helpers para obtener la instancia de ventana de Tauri v2
   */
  private async getAppWindow() {
    if (!isTauriEnvironment()) return null;
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      return getCurrentWindow();
    } catch {
      return (window as any).__TAURI__?.window?.getCurrentWindow?.() || (window as any).__TAURI__?.window?.appWindow;
    }
  }

  /**
   * Control de ventana nativa de Windows (Frameless Window Controls)
   */
  public async minimizeWindow(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('app_minimize');
        return;
      } catch (err) {
        console.warn('Error en app_minimize:', err);
      }
    }
    console.debug('[NativeBridge Mock] Ventana Minimizar');
  }

  public async toggleMaximizeWindow(): Promise<boolean> {
    if (isTauriEnvironment()) {
      try {
        const state = await this.invoke<boolean>('app_toggle_maximize');
        this.isMaximizedState = state;
        return state;
      } catch (err) {
        console.warn('Error en app_toggle_maximize:', err);
      }
    }
    this.isMaximizedState = !this.isMaximizedState;
    console.debug('[NativeBridge Mock] Ventana Toggle Maximizar ->', this.isMaximizedState);
    return this.isMaximizedState;
  }

  public async closeWindow(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('app_close');
        return;
      } catch (err) {
        console.warn('Error en app_close:', err);
      }
    }
    console.debug('[NativeBridge Mock] Ventana Cerrar');
  }

  public async isWindowMaximized(): Promise<boolean> {
    if (isTauriEnvironment()) {
      try {
        return await this.invoke<boolean>('app_is_maximized');
      } catch (err) {
        console.warn('Error en app_is_maximized:', err);
      }
    }
    return this.isMaximizedState;
  }

  public async startDragging(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('app_start_dragging');
        return;
      } catch (err) {
        console.warn('Error en app_start_dragging:', err);
      }
    }
  }

  /**
   * Guarda la configuración en AppData (settings.json) mediante comando Rust nativo
   */
  public async saveSettingsToDisk(settings: Record<string, any>): Promise<void> {
    const jsonStr = JSON.stringify(settings, null, 2);
    if (isTauriEnvironment()) {
      try {
        await this.invoke('save_app_settings', { settingsJson: jsonStr });
        return;
      } catch (err) {
        console.warn('[NativeBridge] Falló save_app_settings en Rust:', err);
      }
    }
    try {
      localStorage.setItem('app_settings_backup', jsonStr);
    } catch {
      // Ignorar
    }
  }

  /**
   * Carga la configuración desde AppData (settings.json) mediante comando Rust nativo
   */
  public async loadSettingsFromDisk<T = any>(): Promise<T | null> {
    if (isTauriEnvironment()) {
      try {
        const jsonStr = await this.invoke<string>('load_app_settings');
        if (jsonStr && jsonStr.trim().length > 0) {
          return JSON.parse(jsonStr) as T;
        }
      } catch (err) {
        console.warn('[NativeBridge] Falló load_app_settings en Rust:', err);
      }
    }
    try {
      const fallback = localStorage.getItem('app_settings_backup');
      return fallback ? (JSON.parse(fallback) as T) : null;
    } catch {
      return null;
    }
  }

  /**
   * Feature 5: Envía una notificación nativa de Windows (toast notification)
   * Si la ventana está minimizada o en segundo plano, aparece en la esquina inferior derecha.
   */
  public async sendNativeNotification(title: string, body: string, icon?: string): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        const { sendNotification, isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
        let granted = await isPermissionGranted();
        if (!granted) {
          const permission = await requestPermission();
          granted = permission === 'granted';
        }
        if (granted) {
          sendNotification({ title, body, icon });
          return;
        }
      } catch (err) {
        console.warn('[NativeBridge] Falló plugin-notification:', err);
      }
    }
    // Fallback web: usa la Notifications API del navegador
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') new Notification(title, { body });
        });
      }
    }
    console.debug(`[NativeBridge Mock] Notificación: ${title} — ${body}`);
  }

  /**
   * Feature 6: Escribe un evento de log en disco (AppData/logs/YYYY-MM-DD.log)
   * Solo persiste niveles 'warn' y 'error' por defecto para no saturar el disco.
   */
  public async writeLogToDisk(level: 'info' | 'success' | 'warn' | 'error', source: string, message: string): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('write_log_to_disk', { level, source, message });
        return;
      } catch (err) {
        console.warn('[NativeBridge] Falló write_log_to_disk:', err);
      }
    }
    // En web solo console
    console.debug(`[NativeBridge Mock] Log disk [${level.toUpperCase()}] [${source}]: ${message}`);
  }

  /**
   * Feature 6: Abre la carpeta de logs en el Explorador de Windows
   */
  public async openLogsFolder(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('open_logs_dir');
        return;
      } catch (err) {
        console.warn('[NativeBridge] Falló open_logs_dir:', err);
      }
    }
    console.debug('[NativeBridge Mock] Abriendo carpeta de logs');
  }

  /**
   * Abre la carpeta de datos de la aplicación en el Explorador de Windows (%APPDATA%)
   */
  public async openAppDataFolder(): Promise<void> {
    if (isTauriEnvironment()) {
      try {
        await this.invoke('open_app_data_dir');
        return;
      } catch (err) {
        console.warn('[NativeBridge] Falló open_app_data_dir:', err);
      }
    }
    console.debug('[NativeBridge Mock] Abriendo carpeta AppData');
  }

  /**
   * Simulación o dispatch de comandos mock cuando se programa en navegador
   */
  private mockCommandHandler<T>(command: string, _args: Record<string, any>): Promise<T> {
    switch (command) {
      case 'ping':
        return Promise.resolve('pong' as unknown as T);
      case 'get_app_version':
        return Promise.resolve('1.0.0' as unknown as T);
      case 'is_hardware_accelerated':
        return Promise.resolve(true as unknown as T);
      default:
        return Promise.resolve({ ok: true, mock: true } as unknown as T);
    }
  }
}

export const nativeApi = NativeBridge.getInstance();
