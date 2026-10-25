import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  X,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  Square,
  Maximize2,
  Minimize2,
  FolderOpen
} from 'lucide-react';
import { nativeApi } from '../../services/nativeApi';

export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  details?: any;
}

export interface ActiveTaskState {
  isRunning: boolean;
  taskName: string;
  percentage: number;
  currentStep: string;
  canCancel?: boolean;
  onCancel?: () => void;
}

interface LogDrawerProps {
  isOpen: boolean;
  logs: LogEntry[];
  activeTask?: ActiveTaskState | null;
  isDark?: boolean;
  onClose: () => void;
  onClearLogs: () => void;
}

export const LogDrawer: React.FC<LogDrawerProps> = ({
  isOpen,
  logs,
  activeTask,
  isDark = false,
  onClose,
  onClearLogs
}) => {
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Feature 6: Persistir warn/error en disco automáticamente
  useEffect(() => {
    const last = logs[logs.length - 1];
    if (last && (last.level === 'warn' || last.level === 'error')) {
      nativeApi.writeLogToDisk(last.level, last.source, last.message).catch(() => {});
    }
  }, [logs]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesSearch =
      searchQuery === '' ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] [${l.source}]: ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-logs-${new Date().toISOString().slice(0, 10)}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    }
  };

  return (
    <aside
      aria-label="Consola de registro"
      className={`fixed bottom-8 left-0 right-0 z-40 border-t shadow-2xl transition-all duration-200 flex flex-col font-sans ${
        isExpanded ? 'h-[75vh]' : 'h-80 sm:h-96'
      } ${
        isDark ? 'bg-[#080d17] border-slate-800 text-slate-200' : 'bg-slate-900 border-slate-700 text-slate-100'
      }`}
    >
      {/* Header bar */}
      <div className="px-4 py-2.5 bg-[#0a1222] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#25b0ae]" />
            <span className="font-bold text-xs tracking-wider uppercase text-white">
              Consola de Actividad & Logs
            </span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {filteredLogs.length} eventos
          </span>

          {activeTask?.isRunning && (
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold">{activeTask.taskName}:</span>
              <span className="font-mono">{activeTask.percentage}%</span>
            </div>
          )}
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-1.5">
          {/* Search Input */}
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar registros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 py-1 pl-8 pr-2.5 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-[#25b0ae]"
            />
          </div>

          {/* Severity selector */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as any)}
            className="py-1 px-2 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-[#25b0ae] cursor-pointer"
          >
            <option value="all">Todos los niveles</option>
            <option value="info">Info</option>
            <option value="success">Éxito</option>
            <option value="warn">Avisos</option>
            <option value="error">Errores</option>
          </select>

          {/* Auto-scroll toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              autoScroll ? 'bg-[#25b0ae]/20 text-[#5eead4]' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={autoScroll ? 'Auto-scroll activo' : 'Auto-scroll pausado'}
          >
            {autoScroll ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* Copy logs */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Copiar registros visibles"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download logs */}
          <button
            type="button"
            onClick={handleDownloadLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Exportar archivo de logs (.log)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Abrir carpeta de logs en disco */}
          <button
            type="button"
            onClick={() => nativeApi.openLogsFolder()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#25b0ae] transition-colors cursor-pointer"
            title="Abrir carpeta de logs en disco (%AppData%)"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          {/* Clear logs */}
          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-400 text-slate-300 transition-colors cursor-pointer"
            title="Limpiar consola"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isExpanded ? 'Restaurar tamaño' : 'Maximizar consola'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background Active Task Banner (if processing) */}
      {activeTask?.isRunning && (
        <div className="px-4 py-2 bg-[#002a5b] border-b border-sky-800/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs text-white">
              <span className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#25b0ae] animate-ping" />
                {activeTask.taskName}
              </span>
              <span className="font-mono text-sky-200">{activeTask.currentStep} ({activeTask.percentage}%)</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#25b0ae] to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, activeTask.percentage))}%` }}
              />
            </div>
          </div>

          {activeTask.canCancel && activeTask.onCancel && (
            <button
              type="button"
              onClick={activeTask.onCancel}
              className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Abortar</span>
            </button>
          )}
        </div>
      )}

      {/* Log Output Stream */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs select-text scrollbar-thin scrollbar-thumb-slate-700"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 font-sans text-xs">
            No hay registros con los filtros actuales.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`py-1 px-2 rounded-md flex items-start gap-2.5 transition-colors ${
                log.level === 'error'
                  ? 'bg-red-950/30 text-red-300'
                  : log.level === 'warn'
                    ? 'bg-amber-950/20 text-amber-200'
                    : log.level === 'success'
                      ? 'bg-emerald-950/20 text-emerald-200'
                      : 'hover:bg-slate-800/40 text-slate-300'
              }`}
            >
              <span className="text-[10px] text-slate-500 shrink-0 select-none">
                {log.timestamp}
              </span>
              {getLevelBadge(log.level)}
              <span className="font-bold text-[11px] text-[#25b0ae] shrink-0">
                [{log.source}]
              </span>
              <span className="flex-1 break-all leading-relaxed">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
