import React, { useState } from 'react';
import { HARDWARE_SPEC_PORTS } from '../data/scenarios';
import { ArrowRight, CornerDownRight, ShieldCheck, Check, Layers, AlertTriangle } from 'lucide-react';

export const HardwareSpecView: React.FC = () => {
  const [selectedPort, setSelectedPort] = useState<string>('wr_en');

  const inputPorts = HARDWARE_SPEC_PORTS.filter((p) => p.dir === 'input');
  const outputPorts = HARDWARE_SPEC_PORTS.filter((p) => p.dir === 'output');

  const currentPort = HARDWARE_SPEC_PORTS.find((p) => p.name === selectedPort) || HARDWARE_SPEC_PORTS[0];

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Target Hardware Architecture: SyncFIFO_8bit_16depth
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            8-bit data width • 16-word circular memory array • Cycle-accurate synchronous control
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Clock Domain: 1x Rising Edge</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Reset: Active-Low (rst_n)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        {/* Schematic Pinout Block Diagram */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-lg border border-slate-800/80 p-5 relative overflow-hidden">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>RTL Pinout & Interface Boundary</span>
            <span className="text-emerald-400">Click a port to inspect specification</span>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            {/* Input Signals Column */}
            <div className="flex flex-col gap-2.5 w-44">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-1">
                Inputs (Driving Stimulus)
              </div>
              {inputPorts.map((port) => (
                <button
                  key={port.name}
                  onClick={() => setSelectedPort(port.name)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-all text-left border ${
                    selectedPort === port.name
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold">{port.name}</span>
                  <span className="text-[10px] text-slate-400">[{port.width}b]</span>
                </button>
              ))}
            </div>

            {/* Central Hardware Core Box */}
            <div className="flex-1 max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 rounded-lg p-4 text-center shadow-md relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300 uppercase tracking-widest font-semibold">
                Core Logic
              </div>
              
              <div className="py-2">
                <div className="font-mono text-sm font-bold text-white tracking-wide">
                  SyncFIFO_8bit_16depth
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  16 x 8-bit Dual-Port SRAM
                </div>
              </div>

              <div className="my-3 py-2 px-3 rounded bg-slate-950/90 border border-slate-800/80 text-left font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>wr_ptr[3:0]:</span>
                  <span className="text-emerald-400">0x0 → 0xF (wrap)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>rd_ptr[3:0]:</span>
                  <span className="text-blue-400">0x0 → 0xF (wrap)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>occupancy[4:0]:</span>
                  <span className="text-purple-400">0 to 16 entries</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                Synchronous Single-Clock FIFO Controller
              </div>
            </div>

            {/* Output Signals Column */}
            <div className="flex flex-col gap-2.5 w-44">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold px-1 text-right">
                Outputs (Monitor/DUT)
              </div>
              {outputPorts.map((port) => (
                <button
                  key={port.name}
                  onClick={() => setSelectedPort(port.name)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-all text-right border ${
                    selectedPort === port.name
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">[{port.width}b]</span>
                  <span className="font-bold">{port.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Port Inspector & Verification Contract */}
        <div className="lg:col-span-4 bg-slate-950/60 rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                  {currentPort.dir.toUpperCase()}
                </span>
                <span className="font-mono text-sm font-bold text-white">
                  {currentPort.name}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {currentPort.width}-bit
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Functional Purpose
                </label>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentPort.description}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Type Definition
                </label>
                <code className="text-xs font-mono text-emerald-300 bg-slate-900 px-2 py-1 rounded block border border-slate-800">
                  {currentPort.type}
                </code>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                  Corner State Contracts
                </label>
                <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                  {currentPort.name === 'full' && (
                    <>
                      <div className="text-emerald-400">• High when count == 16</div>
                      <div>• Blocks subsequent writes unless simultaneous read occurs</div>
                    </>
                  )}
                  {currentPort.name === 'empty' && (
                    <>
                      <div className="text-emerald-400">• High on reset and when count == 0</div>
                      <div>• Inactivates subsequent read operations</div>
                    </>
                  )}
                  {currentPort.name === 'overflow' && (
                    <>
                      <div className="text-amber-400">• Sticky error flag</div>
                      <div>• Asserts when wr_en=1 while full=1 and rd_en=0</div>
                      <div>• Cleared solely by active-low rst_n</div>
                    </>
                  )}
                  {currentPort.name === 'underflow' && (
                    <>
                      <div className="text-amber-400">• Sticky error flag</div>
                      <div>• Asserts when rd_en=1 while empty=1</div>
                      <div>• Cleared solely by active-low rst_n</div>
                    </>
                  )}
                  {currentPort.name !== 'full' && currentPort.name !== 'empty' && currentPort.name !== 'overflow' && currentPort.name !== 'underflow' && (
                    <>
                      <div>• Evaluated synchronously on rising edge of clk</div>
                      <div>• Checked against golden model assertions on every cycle</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-4 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Self-Checking
            </span>
            <span>Zero-Exit C++17</span>
          </div>
        </div>
      </div>
    </div>
  );
};
