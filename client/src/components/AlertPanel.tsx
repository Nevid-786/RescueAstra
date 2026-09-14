import React from 'react';
import { IDetectionEvent } from '../types';
import { AlertCircle, UserCheck, Flame, ShieldAlert, Eye, CheckCircle2 } from 'lucide-react';
import { updateEventStatus } from '../services/api';

interface AlertPanelProps {
  events: IDetectionEvent[];
  selectedEvent: IDetectionEvent | null;
  onSelectEvent: (event: IDetectionEvent) => void;
  onEventUpdated: () => void;
}

const formatTimestamp = (rawTs: any) => {
  if (!rawTs) return 'N/A';
  let d: Date;
  if (typeof rawTs === 'number') {
    d = rawTs < 1e11 ? new Date(rawTs * 1000) : new Date(rawTs);
  } else if (typeof rawTs === 'string') {
    const num = Number(rawTs);
    if (!isNaN(num) && rawTs.trim() !== '') {
      d = num < 1e11 ? new Date(num * 1000) : new Date(num);
    } else {
      d = new Date(rawTs);
    }
  } else {
    d = new Date(rawTs);
  }
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
};

export const AlertPanel: React.FC<AlertPanelProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onEventUpdated,
}) => {
  const sortedEvents = [...events].sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleAcknowledge = async (e: React.MouseEvent, evtId: string) => {
    e.stopPropagation();
    try {
      await updateEventStatus(evtId, 'ACKNOWLEDGED');
      onEventUpdated();
    } catch (err) {
      console.error('Failed to acknowledge event:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="bg-slate-100 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase">
            OPERATOR ALERT CENTER
          </h2>
        </div>
        <span className="text-[10px] font-mono bg-rose-100 border border-rose-300 text-rose-800 px-2 py-0.5 rounded font-bold">
          {events.filter((e) => e.status === 'ACTIVE').length} ACTIVE ALERTS
        </span>
      </div>

      {/* Events Stream List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 bg-slate-50/50">
        {sortedEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 font-mono text-xs">
            <ShieldAlert className="w-8 h-8 stroke-[1.5] mb-2 text-slate-300" />
            <p>NO DETECTION EVENTS RECORDED</p>
            <p className="text-[10px] text-slate-400 mt-1">
              System standing by for telemetry feed
            </p>
          </div>
        ) : (
          sortedEvents.map((evt) => {
            const isSelected = selectedEvent?._id === evt._id;
            const isMultiple = evt.eventType === 'MULTIPLE';
            const isFire = evt.eventType === 'FIRE_SMOKE';

            let cardBorder = 'border-slate-200';
            let bgStyle = 'bg-white';
            let titleText = 'POTENTIAL PERSON DETECTED';
            let badgeBg = 'bg-blue-100 text-blue-800 border-blue-300';
            let IconComponent = UserCheck;

            if (isMultiple) {
              cardBorder = 'border-rose-300';
              bgStyle = 'bg-rose-50/40';
              titleText = 'CRITICAL: PERSON + FIRE DETECTED';
              badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
              IconComponent = AlertCircle;
            } else if (isFire) {
              cardBorder = 'border-amber-300';
              bgStyle = 'bg-amber-50/40';
              titleText = 'FIRE / SMOKE DETECTED';
              badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
              IconComponent = Flame;
            }

            if (isSelected) {
              cardBorder = 'border-blue-600 ring-1 ring-blue-500/40';
            }

            return (
              <div
                key={evt._id}
                onClick={() => onSelectEvent(evt)}
                className={`p-3 rounded-lg border ${cardBorder} ${bgStyle} transition cursor-pointer hover:shadow-md space-y-2`}
              >
                {/* Top Row: Event Title Badge & Source Tag */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badgeBg}`}>
                      {titleText}
                    </span>
                  </div>

                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-300 font-bold">
                    {evt.source}
                  </span>
                </div>

                {/* Location Coordinates & Timestamp */}
                <div className="bg-slate-100 p-2 rounded border border-slate-200 font-mono text-[11px] flex justify-between items-center text-slate-800">
                  <span>
                    {evt.latitude.toFixed(6)}° N, {evt.longitude.toFixed(6)}° E
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {formatTimestamp(evt.timestamp)}
                  </span>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      evt.status === 'ACTIVE'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : evt.status === 'ACKNOWLEDGED'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    STATUS: {evt.status}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="p-1 text-slate-600 hover:text-blue-600 hover:bg-slate-200 rounded transition"
                      title="Focus on Map"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {evt.status === 'ACTIVE' && (
                      <button
                        onClick={(e) => handleAcknowledge(e, evt._id)}
                        className="flex items-center space-x-1 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-mono font-bold transition shadow-sm"
                        title="Acknowledge Alert"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>ACK</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
