import React from 'react';
import { Cpu, Terminal, Cloud, CheckCircle, RefreshCw, Download } from 'lucide-react';

interface HeaderProps {
  onRunPipeline: () => void;
  isRunning: boolean;
  verifiedCount: number;
  totalCount: number;
  driveConfigured: boolean;
  onExportAll: () => void;
  onOpenDriveModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRunPipeline,
  isRunning,
  verifiedCount,
  totalCount,
  driveConfigured,
  onExportAll,
  onOpenDriveModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: Branding & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                Pre-Silicon Verification Architect Cockpit
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                8-bit Sync FIFO (16-Entry)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous C++17 Testbench Generator • @google/genai • Google Drive API
            </p>
          </div>
        </div>

        {/* Right: Status Pills & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Progress badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700 text-xs font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Verified TBs:</span>
            <span className="text-emerald-400 font-bold">{verifiedCount}/{totalCount}</span>
          </div>

          {/* Drive Status Badge */}
          <button
            onClick={onOpenDriveModal}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
              driveConfigured
                ? 'bg-blue-950/40 border-blue-800/50 text-blue-300 hover:bg-blue-900/40'
                : 'bg-amber-950/40 border-amber-800/50 text-amber-300 hover:bg-amber-900/40'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Drive: {driveConfigured ? 'Ready' : 'Setup Required'}</span>
          </button>

          {/* Export button */}
          <button
            onClick={onExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Download all verified C++ testbenches"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Suite</span>
          </button>

          {/* Run Pipeline Button */}
          <button
            onClick={onRunPipeline}
            disabled={isRunning}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all ${
              isRunning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-95'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                <span>Pipeline Running...</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5" />
                <span>Execute Pipeline</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
