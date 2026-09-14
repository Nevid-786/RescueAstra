import React, { useState, useEffect } from 'react';
import { IDetectionEvent, IMissingPerson } from '../types';
import { fetchEvents, fetchMissingPersons, updateMissingPersonStatus } from '../services/api';
import { ShieldCheck, UserCheck, Radio, MapPin, CheckCircle2, Crosshair, ArrowRight, AlertTriangle } from 'lucide-react';

interface RescueDashboardProps {
  events: IDetectionEvent[];
  onFocusLocationOnMap?: (lat: number, lng: number) => void;
}

export const RescueDashboard: React.FC<RescueDashboardProps> = ({ events, onFocusLocationOnMap }) => {
  const [missingPersons, setMissingPersons] = useState<IMissingPerson[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<IMissingPerson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const missingData = await fetchMissingPersons();
      setMissingPersons(missingData);
      if (missingData.length > 0 && !selectedPerson) {
        setSelectedPerson(missingData[0]);
      }
    } catch (err) {
      console.error('Error loading rescue dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRescued = async (personId: string, matchedEventId?: string) => {
    try {
      await updateMissingPersonStatus(personId, 'RESCUED', matchedEventId);
      loadData();
    } catch (err) {
      console.error('Error marking person as rescued:', err);
    }
  };

  // Find person detections from drone stream
  const dronePersonDetections = events.filter(
    (e) => e.eventType === 'PERSON' || e.eventType === 'MULTIPLE'
  );

  const activeMissing = missingPersons.filter((p) => p.status === 'MISSING' || p.status === 'SIGHTED');
  const rescuedSurvivors = missingPersons.filter((p) => p.status === 'RESCUED');

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden p-4 space-y-4 font-sans text-slate-800">
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 border border-emerald-300 rounded text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-mono font-bold tracking-widest text-slate-900 uppercase">
                RESCUE TEAM DISPATCH & SURVIVOR DASHBOARD
              </h1>
              <span className="bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                FIELD RESPONDER WORKSPACE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cross-reference live drone person detection coordinates with citizen missing person photos and dispatch rescue operations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-semibold">DRONE DETECTIONS:</span>
            <span className="text-sky-700 font-bold">{dronePersonDetections.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-semibold">PENDING MATCHES:</span>
            <span className="text-amber-600 font-bold">{activeMissing.length}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-semibold">RESCUED SURVIVORS:</span>
            <span className="text-emerald-600 font-bold">{rescuedSurvivors.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Cross-Reference Matcher + Survivor Log */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Drone Detection vs Missing Persons Cross-Reference (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 flex flex-col min-h-0 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3 shrink-0">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider">
                LIVE DRONE DETECTIONS VS MISSING REGISTRY MATCHING
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">SELECT RECORD TO MATCH</span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto">
            {/* 1. Drone Telemetry Person Detections Stream */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2 flex flex-col">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-sky-700 pb-1.5 border-b border-slate-200">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>DRONE DETECTIONS ({dronePersonDetections.length})</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {dronePersonDetections.length === 0 ? (
                  <div className="h-40 flex items-center justify-center font-mono text-[11px] text-slate-400">
                    No active drone person detections
                  </div>
                ) : (
                  dronePersonDetections.map((det) => (
                    <div
                      key={det._id}
                      className="p-2.5 bg-white border border-slate-200 rounded text-xs font-mono space-y-1 hover:border-sky-400 transition shadow-sm"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-sky-700 font-bold">POTENTIAL PERSON</span>
                        <span className="text-slate-400">{new Date(det.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-800 font-bold">
                        LAT: {det.latitude.toFixed(6)}° N, LNG: {det.longitude.toFixed(6)}° E
                      </div>
                      {onFocusLocationOnMap && (
                        <button
                          onClick={() => onFocusLocationOnMap(det.latitude, det.longitude)}
                          className="mt-1 text-[10px] text-sky-700 hover:underline flex items-center space-x-1 font-bold"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>View on Map</span>
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Reported Missing Persons List */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2 flex flex-col">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-amber-700 pb-1.5 border-b border-slate-200">
                <UserCheck className="w-3.5 h-3.5" />
                <span>REPORTED MISSING ({activeMissing.length})</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {activeMissing.length === 0 ? (
                  <div className="h-40 flex items-center justify-center font-mono text-[11px] text-slate-400">
                    No missing persons registered
                  </div>
                ) : (
                  activeMissing.map((p) => {
                    const isSelected = selectedPerson?._id === p._id;
                    return (
                      <div
                        key={p._id}
                        onClick={() => setSelectedPerson(p)}
                        className={`p-2 rounded border cursor-pointer transition flex items-center space-x-2.5 ${
                          isSelected ? 'bg-purple-50 border-purple-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded object-cover shrink-0 border border-slate-200" />
                        <div className="flex-1 min-w-0 font-mono text-xs">
                          <div className="font-bold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium truncate">{p.addressName}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Person Match Inspector & Survivor Registry (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 flex flex-col min-h-0 space-y-4 shadow-sm">
          {/* Inspector Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3 font-mono">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-200 pb-2">
              <UserCheck className="w-4 h-4 text-purple-700" />
              <span>LOCATION PHOTO & IDENTITY MATCH INSPECTOR</span>
            </div>

            {selectedPerson ? (
              <div className="space-y-3 text-xs">
                <div className="flex space-x-3 items-start">
                  <img
                    src={selectedPerson.photoUrl}
                    alt={selectedPerson.name}
                    className="w-20 h-20 rounded border border-slate-300 object-cover shrink-0 shadow-sm"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{selectedPerson.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedPerson.age} YRS • {selectedPerson.gender}
                    </p>
                    <div className="text-[10px] text-purple-800 font-bold">
                      LAST SEEN: {selectedPerson.addressName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-semibold">
                      COORDS: {selectedPerson.latitude.toFixed(6)}°, {selectedPerson.longitude.toFixed(6)}°
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200 text-[11px] text-slate-700 italic font-medium">
                  "{selectedPerson.description}"
                </div>

                {selectedPerson.status !== 'RESCUED' ? (
                  <button
                    onClick={() => handleMarkRescued(selectedPerson._id)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs tracking-wider uppercase transition flex items-center justify-center space-x-1.5 shadow"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MARK AS RESCUED BY TEAM</span>
                  </button>
                ) : (
                  <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded text-center text-xs font-bold">
                    ✓ STATUS: RESCUED BY FIELD TEAM
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-medium">
                Select a missing person record to inspect
              </div>
            )}
          </div>

          {/* Rescued Survivors Registry Table */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col min-h-0">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-700 pb-2 border-b border-slate-200 shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>RESCUED SURVIVORS LOG ({rescuedSurvivors.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto pt-2">
              <table className="w-full font-mono text-xs text-left">
                <thead className="text-[10px] text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="pb-1">NAME</th>
                    <th className="pb-1">LOCATION</th>
                    <th className="pb-1 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rescuedSurvivors.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 text-xs">
                        No rescued records confirmed yet
                      </td>
                    </tr>
                  ) : (
                    rescuedSurvivors.map((survivor) => (
                      <tr key={survivor._id} className="hover:bg-white transition">
                        <td className="py-1.5 font-bold text-slate-900">{survivor.name}</td>
                        <td className="py-1.5 text-slate-600 text-[10px] font-medium truncate max-w-[120px]">
                          {survivor.addressName}
                        </td>
                        <td className="py-1.5 text-right">
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                            RESCUED
                          </span>
                        </td>
                      </tr>
                    ))
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
