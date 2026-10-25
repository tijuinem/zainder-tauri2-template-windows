/**
 * Desktop integration utility for Tauri
 * Provides safe desktop APIs (window controls, external links) with graceful web browser fallbacks.
 */

export function isTauriApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).__TAURI_INTERNALS__ ||
    (window as any).__TAURI__ ||
    (window as any).__TAURI_METADATA__
  );
}

export async function openExternal(url: string): Promise<void> {
  if (isTauriApp()) {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
      return;
    } catch (e) {
      console.warn('Tauri shell open failed, falling back to window.open', e);
    }
  }
  // Standard web browser fallback
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function minimizeWindow(): Promise<void> {
  if (isTauriApp()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch (e) {
      console.warn('Failed to minimize window', e);
    }
  }
}

export async function toggleMaximizeWindow(): Promise<void> {
  if (isTauriApp()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
    } catch (e) {
      console.warn('Failed to toggle maximize window', e);
    }
  }
}

export async function closeWindow(): Promise<void> {
  if (isTauriApp()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (e) {
      console.warn('Failed to close window', e);
    }
  } else {
    if (window.opener && !window.opener.closed) {
      window.close();
    }
  }
}

/**
 * Offline status detection and listener
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}
