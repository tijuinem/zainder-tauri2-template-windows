import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Copy, Check, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRASH CAPTURADO POR ERROR BOUNDARY:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopy = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `CRASH REPORT - PLANTILLA DESKTOP
Fecha: ${new Date().toISOString()}
Error: ${error?.name} - ${error?.message}
Stack:
${error?.stack || 'No stack trace'}

Component Stack:
${errorInfo?.componentStack || 'No component stack'}`;

    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2500);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#080d17] text-slate-100 flex items-center justify-center p-6 selection:bg-[#25b0ae]/30">
          <div className="w-full max-w-2xl bg-[#0c1527] border border-red-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 font-mono">
                  Error de Ejecución Inesperado
                </span>
                <h1 className="text-2xl font-black text-white">
                  Se ha producido una excepción en la interfaz
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              La aplicación ha detectado un fallo en el componente visual y ha detenido la renderización
              para evitar pérdidas de datos o estados inconsistentes.
            </p>

            {/* Error Message Box */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-2">
              <div className="text-xs font-bold text-red-300 font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{this.state.error?.name || 'Error'}: {this.state.error?.message}</span>
              </div>
              {this.state.error?.stack && (
                <pre className="text-[11px] font-mono text-slate-400 overflow-x-auto max-h-36 p-2 rounded-lg bg-black/40 scrollbar-none">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={this.handleCopy}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2 cursor-pointer border border-slate-700"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado al Portapapeles</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#25b0ae]" />
                    <span>Copiar Diagnóstico</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="px-4 py-2.5 rounded-xl hover:bg-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Borra la caché y reinicia la configuración a los valores por defecto"
                >
                  Restablecer caché
                </button>
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="px-5 py-2.5 rounded-xl bg-[#25b0ae] hover:bg-[#1fa09e] text-[#002a5b] font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar Aplicación</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
