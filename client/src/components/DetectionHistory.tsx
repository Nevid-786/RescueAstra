import React, { useState } from 'react';
import { IDetectionEvent, EventType, EventSource, EventStatus } from '../types';
import { Search, Filter, Eye, CheckCircle2, CheckSquare, History } from 'lucide-react';
import { updateEventStatus } from '../services/api';

interface DetectionHistoryProps {
  events: IDetectionEvent[];
  selectedEvent: IDetectionEvent | null;
  onSelectEvent: (event: IDetectionEvent) => void;
  onEventUpdated: () => void;
}

const formatTimestamp = (rawTs: any) => {
  if (!rawTs) return { time: 'N/A', date: 'N/A' };
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

  if (isNaN(d.getTime())) return { time: 'N/A', date: 'N/A' };

  return {
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
    date: d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
  };
};

export const DetectionHistory: React.FC<DetectionHistoryProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onEventUpdated,
}) => {
  const [filterType, setFilterType] = useState<EventType | 'ALL'>('ALL');
  const [filterSource, setFilterSource] = useState<EventSource | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleStatusChange = async (id: string, status: EventStatus) => {
    try {
      await updateEventStatus(id, status);
      onEventUpdated();
    } catch (err) {
      console.error('Error changing event status:', err);
    }
  };

  // Filter events logic
  const filteredEvents = events.filter((evt) => {
    if (filterType !== 'ALL' && evt.eventType !== filterType) return false;
    if (filterSource !== 'ALL' && evt.source !== filterSource) return false;
    if (filterStatus !== 'ALL' && evt.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const coords = `${evt.latitude},${evt.longitude}`.toLowerCase();
      const drone = evt.droneId.toLowerCase();
      const typeStr = evt.eventType.toLowerCase();
      return coords.includes(q) || drone.includes(q) || typeStr.includes(q);
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      {/* Header Bar with Filters */}
      <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-sky-600" />
          <h2 className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase">
            DETECTION HISTORY & EVENT LOG
          </h2>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-200 px-2 py-0.5 rounded font-semibold">
            {filteredEvents.length} RECORDED
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Event Type Filter */}
          <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded px-2 py-1 shadow-sm">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="PERSON">PERSON DETECTED</option>
              <option value="FIRE_SMOKE">FIRE / SMOKE</option>
              <option value="MULTIPLE">MULTIPLE</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded px-2 py-1 shadow-sm">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value as any)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="ALL">ALL SOURCES</option>
              <option value="LIVE">LIVE ONLY</option>
              <option value="SIMULATION">SIMULATION ONLY</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded px-2 py-1 shadow-sm">
            <Search className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search lat, long, drone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none text-xs w-36 font-medium placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* History Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-2.5 px-3 font-bold uppercase">TIME</th>
              <th className="py-2.5 px-3 font-bold uppercase">EVENT</th>
              <th className="py-2.5 px-3 font-bold uppercase">SOURCE</th>
              <th className="py-2.5 px-3 font-bold uppercase">LOCATION (LAT, LNG)</th>
              <th className="py-2.5 px-3 font-bold uppercase">STATUS</th>
              <th className="py-2.5 px-3 font-bold uppercase text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No matching detection events found in database.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => {
                const isSelected = selectedEvent?._id === evt._id;
                const formatted = formatTimestamp(evt.timestamp);
                return (
                  <tr
                    key={evt._id}
                    onClick={() => onSelectEvent(evt)}
                    className={`cursor-pointer transition hover:bg-slate-50 ${
                      isSelected ? 'bg-slate-100/80 border-l-4 border-l-sky-600' : ''
                    }`}
                  >
                    {/* Time */}
                    <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                      {formatted.time}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {formatted.date}
                      </span>
                    </td>

                    {/* Event Type */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          evt.eventType === 'MULTIPLE'
                            ? 'text-rose-600'
                            : evt.eventType === 'FIRE_SMOKE'
                            ? 'text-amber-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {evt.eventType === 'MULTIPLE'
                          ? 'MULTIPLE EVENTS'
                          : evt.eventType === 'FIRE_SMOKE'
                          ? 'FIRE / SMOKE DETECTED'
                          : 'PERSON DETECTED'}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          evt.source === 'SIMULATION'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}
                      >
                        {evt.source}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 text-slate-800 font-mono font-semibold">
                      {evt.latitude.toFixed(6)}° N, {evt.longitude.toFixed(6)}° E
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          evt.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : evt.status === 'ACKNOWLEDGED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectEvent(evt)}
                          className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded transition"
                          title="Center Map on Target"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {evt.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(evt._id, 'ACKNOWLEDGED')}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded text-[10px] font-bold transition"
                            title="Mark as Acknowledged"
                          >
                            ACK
                          </button>
                        )}
                        {evt.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleStatusChange(evt._id, 'RESOLVED')}
                            className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold transition"
                            title="Mark as Resolved"
                          >
                            RESOLVE
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
