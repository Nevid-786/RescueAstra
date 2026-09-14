import React from 'react';
import { Navigation, UserCheck, Flame, AlertTriangle } from 'lucide-react';
import { IDroneStatus, IMissionSummary } from '../types';

interface SummaryCardsProps {
  droneStatus: IDroneStatus | null;
  summary: IMissionSummary | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ droneStatus, summary }) => {
  const latFormatted = droneStatus ? droneStatus.latitude.toFixed(6) : '28.613900';
  const lngFormatted = droneStatus ? droneStatus.longitude.toFixed(6) : '77.209000';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-2.5 bg-[#f8fafc] border-b border-slate-200 shrink-0">
      {/* 1. Drone Position */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-slate-500 font-bold uppercase">
            DRONE POSITION
          </div>
          <div className="text-sm font-mono font-bold text-blue-600 mt-0.5 tracking-tight flex items-baseline space-x-1">
            <span>{latFormatted}° N</span>
            <span className="text-slate-300">|</span>
            <span>{lngFormatted}° E</span>
          </div>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200 shrink-0">
          <Navigation className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Person Detections */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-slate-500 font-bold uppercase">
            PERSON DETECTIONS
          </div>
          <div className="text-lg font-mono font-bold text-blue-700 mt-0.5 leading-none">
            {summary ? String(summary.personEvents).padStart(2, '0') : '00'}
            <span className="text-[10px] font-normal text-slate-500 ml-1.5 font-sans">EVENTS RECORDED</span>
          </div>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-md border border-blue-200 shrink-0">
          <UserCheck className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Fire/Smoke Events */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-slate-500 font-bold uppercase">
            FIRE / SMOKE EVENTS
          </div>
          <div className="text-lg font-mono font-bold text-amber-600 mt-0.5 leading-none">
            {summary ? String(summary.fireEvents).padStart(2, '0') : '00'}
            <span className="text-[10px] font-normal text-slate-500 ml-1.5 font-sans">HAZARDS LOGGED</span>
          </div>
        </div>
        <div className="p-2 bg-amber-50 text-amber-600 rounded-md border border-amber-200 shrink-0">
          <Flame className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Active Alerts */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[10px] font-mono tracking-wider text-slate-500 font-bold uppercase">
            ACTIVE ALERTS
          </div>
          <div className="text-lg font-mono font-bold text-rose-600 mt-0.5 leading-none">
            {summary ? String(summary.activeAlerts).padStart(2, '0') : '00'}
            <span className="text-[10px] font-normal text-slate-500 ml-1.5 font-sans">ATTENTION REQUIRED</span>
          </div>
        </div>
        <div className="p-2 bg-rose-50 text-rose-600 rounded-md border border-rose-200 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
