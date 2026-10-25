import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, X } from 'lucide-react';

interface FileDropzoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  isDark?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFilesSelected,
  accept = '*/*',
  isDark = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      setSelectedFiles(fileList);
      if (onFilesSelected) onFilesSelected(fileList);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setSelectedFiles(fileList);
      if (onFilesSelected) onFilesSelected(fileList);
    }
  };

  const removeFile = (idx: number) => {
    const updated = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(updated);
    if (onFilesSelected) onFilesSelected(updated);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
          isDragging
            ? 'border-[#25b0ae] bg-[#25b0ae]/10 ring-4 ring-[#25b0ae]/15 scale-[1.01]'
            : isDark
              ? 'border-slate-700/80 hover:border-[#25b0ae]/60 bg-[#0a1222]/60 hover:bg-[#0c1527]'
              : 'border-slate-300 hover:border-[#002a5b]/60 bg-slate-50/60 hover:bg-white shadow-2xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
          isDragging ? 'scale-110 bg-[#25b0ae] text-white' : 'bg-sky-50 dark:bg-slate-800 text-[#002a5b] dark:text-[#25b0ae]'
        }`}>
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            Arrastra y suelta tus archivos aquí
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            o haz clic para explorar carpetas de tu equipo Windows
          </div>
        </div>
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Archivos seleccionados ({selectedFiles.length}):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shadow-2xs text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <File className="w-4 h-4 text-[#25b0ae] shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
