import React, { useState } from 'react';
import { FIFOSimulatorState } from '../types';
import { Play, RotateCcw, FastForward, CheckCircle2, AlertOctagon, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';

export const InteractiveSimulator: React.FC = () => {
  const [state, setState] = useState<FIFOSimulatorState>({
    clk: false,
    rst_n: true,
    wr_en: false,
    rd_en: false,
    data_in: 0x42,
    data_out: 0x00,
    full: false,
    empty: true,
    overflow: false,
    underflow: false,
    mem: new Array(16).fill(0),
    wr_ptr: 0,
    rd_ptr: 0,
    count: 0,
    cycleCount: 0,
    history: [],
  });

  // Cycle evaluation logic mirroring the C++ hardware specification
  const evaluateCycle = (
    current: FIFOSimulatorState,
    wr_en: boolean,
    rd_en: boolean,
    data_in: number,
    rst_n: boolean
  ): FIFOSimulatorState => {
    const nextMem = [...current.mem];
    let nextWrPtr = current.wr_ptr;
    let nextRdPtr = current.rd_ptr;
    let nextCount = current.count;
    let nextDataOut = current.data_out;
    let nextOverflow = current.overflow;
    let nextUnderflow = current.underflow;

    if (!rst_n) {
      // Active-low reset
      return {
        ...current,
        clk: !current.clk,
        rst_n: false,
        wr_en: false,
        rd_en: false,
        data_out: 0x00,
        full: false,
        empty: true,
        overflow: false,
        underflow: false,
        wr_ptr: 0,
        rd_ptr: 0,
        count: 0,
        cycleCount: current.cycleCount + 1,
        history: [
          {
            cycle: current.cycleCount + 1,
            rst_n: false,
            wr_en: false,
            rd_en: false,
            data_in,
            data_out: 0x00,
            full: false,
            empty: true,
            count: 0,
            overflow: false,
            underflow: false,
          },
          ...current.history.slice(0, 9),
        ],
      };
    }

    const canRead = nextCount > 0;
    const canWrite = nextCount < 16 || (rd_en && canRead);

    // Overflow check
    if (wr_en && nextCount === 16 && !rd_en) {
      nextOverflow = true;
    }

    // Underflow check
    if (rd_en && nextCount === 0) {
      nextUnderflow = true;
    }

    // Execute Read
    if (rd_en && canRead) {
      nextDataOut = nextMem[nextRdPtr];
      nextRdPtr = (nextRdPtr + 1) % 16;
    }

    // Execute Write
    if (wr_en && canWrite) {
      nextMem[nextWrPtr] = data_in & 0xFF;
      nextWrPtr = (nextWrPtr + 1) % 16;
    }

    // Occupancy counter update
    const didWrite = wr_en && canWrite;
    const didRead = rd_en && canRead;

    if (didWrite && !didRead) {
      nextCount++;
    } else if (!didWrite && didRead) {
      nextCount--;
    }

    const nextFull = nextCount === 16;
    const nextEmpty = nextCount === 0;

    return {
      clk: !current.clk,
      rst_n: true,
      wr_en,
      rd_en,
      data_in,
      data_out: nextDataOut,
      full: nextFull,
      empty: nextEmpty,
      overflow: nextOverflow,
      underflow: nextUnderflow,
      mem: nextMem,
      wr_ptr: nextWrPtr,
      rd_ptr: nextRdPtr,
      count: nextCount,
      cycleCount: current.cycleCount + 1,
      history: [
        {
          cycle: current.cycleCount + 1,
          rst_n: true,
          wr_en,
          rd_en,
          data_in,
          data_out: nextDataOut,
          full: nextFull,
          empty: nextEmpty,
          count: nextCount,
          overflow: nextOverflow,
          underflow: nextUnderflow,
        },
        ...current.history.slice(0, 9),
      ],
    };
  };

  const handleStepCycle = () => {
    setState((prev) => evaluateCycle(prev, prev.wr_en, prev.rd_en, prev.data_in, prev.rst_n));
  };

  const handleReset = () => {
    setState((prev) => {
      const resetState = evaluateCycle(prev, false, false, 0, false);
      return evaluateCycle(resetState, false, false, 0, true);
    });
  };

  // Quick Stimulus Sequences
  const runStimulusSequence = (type: 'burst_fill' | 'burst_drain' | 'overflow' | 'underflow' | 'ping_pong') => {
    setState((prev) => {
      let cur = { ...prev };
      if (type === 'burst_fill') {
        for (let i = 0; i < 16; ++i) {
          cur = evaluateCycle(cur, true, false, 0x10 + i, true);
        }
        cur.wr_en = false;
      } else if (type === 'burst_drain') {
        for (let i = 0; i < 16; ++i) {
          cur = evaluateCycle(cur, false, true, 0x00, true);
        }
        cur.rd_en = false;
      } else if (type === 'overflow') {
        // write 17 times
        for (let i = 0; i < 17; ++i) {
          cur = evaluateCycle(cur, true, false, 0xAA + i, true);
        }
        cur.wr_en = false;
      } else if (type === 'underflow') {
        cur = evaluateCycle(cur, false, true, 0x00, true);
        cur.rd_en = false;
      } else if (type === 'ping_pong') {
        for (let i = 0; i < 10; ++i) {
          cur = evaluateCycle(cur, true, false, 0x50 + i, true);
          cur = evaluateCycle(cur, false, true, 0x00, true);
        }
        cur.wr_en = false;
        cur.rd_en = false;
      }
      return cur;
    });
  };

  const toHex = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(2, '0');

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Interactive Pre-Silicon Cycle Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time C++ cycle-accurate logic simulation • Memory array visualizer • Port assertion monitor
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (rst_n=0)</span>
          </button>
          <button
            onClick={handleStepCycle}
            className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-semibold text-white shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Clock Step</span>
          </button>
        </div>
      </div>

      {/* Simulator Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        
        {/* Left: Signal Controls & Status Flags */}
        <div className="lg:col-span-4 bg-slate-950/80 rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
              Clock & Signal Stimulus
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Reset Signal */}
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-300">rst_n (Active-Low):</span>
                <button
                  onClick={() => setState((p) => ({ ...p, rst_n: !p.rst_n }))}
                  className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
                    state.rst_n
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {state.rst_n ? '1 (Normal)' : '0 (RESET)'}
                </button>
              </div>

              {/* Write Enable & Data In */}
              <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> wr_en (Write):
                  </span>
                  <button
                    onClick={() => setState((p) => ({ ...p, wr_en: !p.wr_en }))}
                    className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
                      state.wr_en
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {state.wr_en ? 'HIGH (1)' : 'LOW (0)'}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">data_in[7:0]:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={toHex(state.data_in)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 16);
                        if (!isNaN(val)) setState((p) => ({ ...p, data_in: val & 0xFF }));
                      }}
                      className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-right text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setState((p) => ({ ...p, data_in: Math.floor(Math.random() * 256) }))}
                      className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                      title="Random byte"
                    >
                      Rand
                    </button>
                  </div>
                </div>
              </div>

              {/* Read Enable & Data Out */}
              <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" /> rd_en (Read):
                  </span>
                  <button
                    onClick={() => setState((p) => ({ ...p, rd_en: !p.rd_en }))}
                    className={`px-2.5 py-0.5 rounded font-bold transition-colors ${
                      state.rd_en
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {state.rd_en ? 'HIGH (1)' : 'LOW (0)'}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">data_out[7:0]:</span>
                  <span className="font-bold text-blue-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {toHex(state.data_out)} ({state.data_out})
                  </span>
                </div>
              </div>
            </div>

            {/* Hardware Status Flags Grid */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                Hardware Status Flags
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                {/* Full Flag */}
                <div className={`p-2 rounded border flex items-center justify-between ${
                  state.full ? 'bg-amber-950/40 border-amber-600/60 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <span>FULL:</span>
                  <span className="font-bold">{state.full ? '1 (ASSERT)' : '0'}</span>
                </div>

                {/* Empty Flag */}
                <div className={`p-2 rounded border flex items-center justify-between ${
                  state.empty ? 'bg-blue-950/40 border-blue-600/60 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <span>EMPTY:</span>
                  <span className="font-bold">{state.empty ? '1 (ASSERT)' : '0'}</span>
                </div>

                {/* Overflow Sticky Flag */}
                <div className={`p-2 rounded border flex items-center justify-between ${
                  state.overflow ? 'bg-red-950/50 border-red-500/70 text-red-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <span className="flex items-center gap-1">
                    {state.overflow && <AlertOctagon className="w-3 h-3" />} OVERFLOW:
                  </span>
                  <span className="font-bold">{state.overflow ? 'STICKY' : '0'}</span>
                </div>

                {/* Underflow Sticky Flag */}
                <div className={`p-2 rounded border flex items-center justify-between ${
                  state.underflow ? 'bg-red-950/50 border-red-500/70 text-red-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <span className="flex items-center gap-1">
                    {state.underflow && <AlertOctagon className="w-3 h-3" />} UNDERFLOW:
                  </span>
                  <span className="font-bold">{state.underflow ? 'STICKY' : '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stimulus Macros */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Automated Stimulus Injection
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              <button
                onClick={() => runStimulusSequence('burst_fill')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors"
              >
                ⚡ Burst Fill 16
              </button>
              <button
                onClick={() => runStimulusSequence('burst_drain')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left transition-colors"
              >
                ⚡ Burst Drain 16
              </button>
              <button
                onClick={() => runStimulusSequence('overflow')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-300 text-left transition-colors"
              >
                ⚡ Trigger Overflow
              </button>
              <button
                onClick={() => runStimulusSequence('underflow')}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-300 text-left transition-colors"
              >
                ⚡ Trigger Underflow
              </button>
            </div>
          </div>
        </div>

        {/* Right: Circular Memory Array & Occupancy Visualizer */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-lg border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            {/* Occupancy bar */}
            <div className="flex items-center justify-between mb-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase text-[11px]">Buffer Occupancy:</span>
                <span className="font-bold text-white">{state.count} / 16 Entries</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                wr_ptr: <span className="text-emerald-400 font-bold">{toHex(state.wr_ptr)}</span> | rd_ptr: <span className="text-blue-400 font-bold">{toHex(state.rd_ptr)}</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-5">
              <div
                className={`h-full transition-all duration-200 ${
                  state.count === 16 ? 'bg-amber-500' : state.count > 12 ? 'bg-purple-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(state.count / 16) * 100}%` }}
              />
            </div>

            {/* Memory Cells Grid (16 entries) */}
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Dual-Port SRAM Array (16 x 8-bit)</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> WR_PTR
                </span>
                <span className="flex items-center gap-1 text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> RD_PTR
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 my-3">
              {state.mem.map((val, idx) => {
                const isWr = state.wr_ptr === idx;
                const isRd = state.rd_ptr === idx;
                const hasData = state.count > 0 && (
                  state.wr_ptr > state.rd_ptr
                    ? idx >= state.rd_ptr && idx < state.wr_ptr
                    : state.wr_ptr < state.rd_ptr
                    ? idx >= state.rd_ptr || idx < state.wr_ptr
                    : state.count === 16
                );

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-md border font-mono text-center relative transition-all ${
                      hasData
                        ? 'bg-slate-900 border-slate-700 shadow-sm text-slate-100'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    } ${isWr ? 'ring-2 ring-emerald-500/80' : ''} ${isRd ? 'ring-2 ring-blue-500/80' : ''}`}
                  >
                    <div className="text-[9px] text-slate-400 uppercase font-semibold flex justify-between">
                      <span>[{idx}]</span>
                      <div className="flex gap-0.5">
                        {isWr && <span className="text-[8px] px-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">W</span>}
                        {isRd && <span className="text-[8px] px-1 rounded bg-blue-500/20 text-blue-300 font-bold">R</span>}
                      </div>
                    </div>
                    <div className="text-sm font-bold mt-1 text-slate-200">
                      {toHex(val)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cycle Execution Log */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              Recent Cycle History (Last 5 Clock Ticks)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px] text-slate-300">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800/80">
                    <th className="py-1 px-2">Cycle</th>
                    <th className="py-1 px-2">wr_en</th>
                    <th className="py-1 px-2">rd_en</th>
                    <th className="py-1 px-2">data_in</th>
                    <th className="py-1 px-2">data_out</th>
                    <th className="py-1 px-2">Count</th>
                    <th className="py-1 px-2">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {state.history.slice(0, 5).map((h) => (
                    <tr key={h.cycle} className="border-b border-slate-900/60 hover:bg-slate-900/40">
                      <td className="py-1 px-2 text-slate-400">#{h.cycle}</td>
                      <td className="py-1 px-2">{h.wr_en ? <span className="text-emerald-400">1</span> : '0'}</td>
                      <td className="py-1 px-2">{h.rd_en ? <span className="text-blue-400">1</span> : '0'}</td>
                      <td className="py-1 px-2 text-slate-300">{toHex(h.data_in)}</td>
                      <td className="py-1 px-2 text-slate-300">{toHex(h.data_out)}</td>
                      <td className="py-1 px-2 font-bold">{h.count}</td>
                      <td className="py-1 px-2">
                        {h.full && <span className="text-amber-400 mr-1">FULL</span>}
                        {h.empty && <span className="text-blue-400 mr-1">EMPTY</span>}
                        {h.overflow && <span className="text-red-400 mr-1">OVF</span>}
                        {h.underflow && <span className="text-red-400">UDF</span>}
                      </td>
                    </tr>
                  ))}
                  {state.history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-2 px-2 text-slate-400 text-center">
                        Step clock tick or inject stimulus to record cycle execution traces.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
