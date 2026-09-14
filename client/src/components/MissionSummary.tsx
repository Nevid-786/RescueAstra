import React from 'react';
import { IMissionSummary } from '../types';
import { X, FileText, Compass, AlertCircle, ShieldCheck } from 'lucide-react';

interface MissionSummaryProps {
  summary: IMissionSummary | null;
  onClose: () => void;
}

export const MissionSummary: React.FC<MissionSummaryProps> = ({ summary, onClose }) => {
  if (!summary) return null;

  const minLat = summary.searchArea.minLat !== null ? summary.searchArea.minLat.toFixed(6) : 'N/A';
  const maxLat = summary.searchArea.maxLat !== null ? summary.searchArea.maxLat.toFixed(6) : 'N/A';
  const minLng = summary.searchArea.minLng !== null ? summary.searchArea.minLng.toFixed(6) : 'N/A';
  const maxLng = summary.searchArea.maxLng !== null ? summary.searchArea.maxLng.toFixed(6) : 'N/A';

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-mono font-bold tracking-wider text-slate-800 uppercase">
              MISSION INTELLIGENCE SUMMARY
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 font-mono text-xs text-slate-700">
          {/* Section 1: Aggregate Metrics */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-2">
              DETECTION EVENT TOTALS
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded text-center">
                <div className="text-xl font-bold text-slate-900">{summary.totalEvents}</div>
                <div className="text-[10px] font-semibold text-slate-500 mt-1">TOTAL EVENTS</div>
              </div>
              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-center">
                <div className="text-xl font-bold text-blue-700">{summary.personEvents}</div>
                <div className="text-[10px] font-semibold text-blue-600 mt-1">PERSON EVENTS</div>
              </div>
              <div className="bg-rose-50/70 border border-rose-200 p-3 rounded text-center">
                <div className="text-xl font-bold text-rose-700">{summary.fireEvents}</div>
                <div className="text-[10px] font-semibold text-rose-600 mt-1">FIRE/SMOKE EVENTS</div>
              </div>
            </div>
          </div>

          {/* Section 2: Search Area Bounding Box */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded space-y-2">
            <div className="flex items-center space-x-2 text-sky-700">
              <Compass className="w-4 h-4" />
              <span className="font-bold text-xs uppercase">GEOGRAPHIC SEARCH BOUNDS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 font-medium">LAT RANGE:</span>{' '}
                <span className="text-slate-900 font-bold">{minLat}° to {maxLat}° N</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">LNG RANGE:</span>{' '}
                <span className="text-slate-900 font-bold">{minLng}° to {maxLng}° E</span>
              </div>
            </div>
          </div>

          {/* Section 3: Latest Event & Mode */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded flex justify-between items-center text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] font-medium">LATEST TELEMETRY REC:</span>
              <span className="text-emerald-700 font-bold">
                {summary.latestEventTimestamp
                  ? new Date(summary.latestEventTimestamp).toLocaleString()
                  : 'No events logged'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] font-medium">OPERATIONAL MODE:</span>
              <span
                className={`font-bold ${
                  summary.simulationMode ? 'text-amber-700' : 'text-emerald-700'
                }`}
              >
                {summary.simulationMode ? 'SIMULATION' : 'LIVE'}
              </span>
            </div>
          </div>

          {/* Footnote */}
          <div className="flex items-start space-x-2 text-[10px] text-slate-600 bg-slate-100 p-2.5 rounded border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Metrics reflect verified detection log events processed by Stage 2 On-Board Intelligence.
              Counts represent recorded event occurrences in the search area.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-mono font-bold transition"
          >
            CLOSE SUMMARY
          </button>
        </div>
      </div>
    </div>
  );
};
