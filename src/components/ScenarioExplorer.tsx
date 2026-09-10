import React, { useState } from 'react';
import { VerificationScenario } from '../types';
import { FileCode, Search, CheckCircle, Copy, Check, Download, ExternalLink, ShieldAlert } from 'lucide-react';

interface ScenarioExplorerProps {
  scenarios: VerificationScenario[];
  selectedScenario: VerificationScenario | null;
  onSelectScenario: (s: VerificationScenario) => void;
}

export const ScenarioExplorer: React.FC<ScenarioExplorerProps> = ({
  scenarios,
  selectedScenario,
  onSelectScenario,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const filteredScenarios = scenarios.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.focus.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'reset') return s.name.includes('reset');
    if (filterCategory === 'burst') return s.name.includes('burst') || s.name.includes('drain') || s.name.includes('fill');
    if (filterCategory === 'boundary') return s.name.includes('overflow') || s.name.includes('underflow') || s.name.includes('rw_at');
    if (filterCategory === 'simultaneous') return s.name.includes('simultaneous') || s.name.includes('ping_pong');
    if (filterCategory === 'stress') return s.name.includes('stress') || s.name.includes('sweep') || s.name.includes('handshake');
    return true;
  });

  const activeScenario = selectedScenario || scenarios[0];

  const handleCopyCode = () => {
    if (activeScenario?.codeSnippet) {
      navigator.clipboard.writeText(activeScenario.codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSingle = () => {
    if (!activeScenario?.codeSnippet) return;
    const blob = new Blob([activeScenario.codeSnippet], { type: 'text/x-c++src' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeScenario.name}.cpp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-sm">
      {/* Header with Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            Pre-Silicon Testbench Suite ({scenarios.length} Scenarios)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Self-checking C++17 testbenches featuring cycle-accurate driver, scoreboard & assertions
          </p>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded-md bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-[11px] font-mono">
            {['all', 'reset', 'burst', 'boundary', 'simultaneous', 'stress'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-slate-800 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Scenario List (Left Sidebar) */}
        <div className="lg:col-span-5 flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredScenarios.map((scenario) => {
            const isSelected = activeScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-medium">
                      #{String(scenario.id).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {scenario.title}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle className="w-3 h-3" /> C++17
                  </span>
                </div>

                <div className="font-mono text-[11px] text-emerald-400/90 mt-1">
                  {scenario.name}.cpp
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {scenario.focus}
                </p>
              </button>
            );
          })}
        </div>

        {/* Scenario Inspector & Code Viewer (Right) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-lg border border-slate-800 p-4 flex flex-col justify-between max-h-[600px] overflow-hidden">
          {/* Metadata banner */}
          <div className="pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Scenario #{activeScenario.id}
                </span>
                <span className="font-mono text-xs text-white font-medium">
                  {activeScenario.name}.cpp
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-300 mt-1">
                {activeScenario.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                title="Copy C++ source code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadSingle}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 transition-colors"
                title="Download .cpp file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .cpp</span>
              </button>
            </div>
          </div>

          {/* Verification Focus & Assertions */}
          <div className="py-2.5 px-3 my-2.5 rounded bg-slate-900/90 border border-slate-800/80 font-mono text-[11px] text-slate-300">
            <span className="text-emerald-400 font-semibold">Verification Contract: </span>
            {activeScenario.focus}
          </div>

          {/* Syntax-styled Code Area */}
          <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded border border-slate-800/60 p-3 font-mono text-[11px] text-slate-300 leading-relaxed max-h-[380px]">
            <pre className="whitespace-pre">
              {activeScenario.codeSnippet || '// C++ testbench loading...'}
            </pre>
          </div>

          {/* Footer stats */}
          <div className="pt-3 border-t border-slate-800/80 mt-2 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>Compiler target: g++ -std=c++17</span>
            <span>Self-Checking: &lt;cassert&gt; &amp; Cycle Accurate</span>
            <span className="text-emerald-400">Exit Code: 0 (Zero-Exit Guaranteed)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
