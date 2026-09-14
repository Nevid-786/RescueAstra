import React, { useState, useEffect } from 'react';
import { IMissingPerson, UserRole, MissingPersonStatus } from '../types';
import { fetchMissingPersons, updateMissingPersonStatus } from '../services/api';
import { UserCheck, MapPin, Search, Plus, Phone, ShieldCheck, HeartHandshake, Eye } from 'lucide-react';

interface MissingRegistryProps {
  userRole: UserRole;
  onOpenReportModal: () => void;
  onFocusLocationOnMap?: (lat: number, lng: number) => void;
}

export const MissingRegistry: React.FC<MissingRegistryProps> = ({
  userRole,
  onOpenReportModal,
  onFocusLocationOnMap,
}) => {
  const [persons, setPersons] = useState<IMissingPerson[]>([]);
  const [statusFilter, setStatusFilter] = useState<MissingPersonStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadMissingPersons = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMissingPersons({
        status: statusFilter,
        search: searchQuery,
      });
      setPersons(data);
    } catch (err) {
      console.error('Error loading missing persons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMissingPersons();
  }, [statusFilter, searchQuery]);

  const handleMarkRescued = async (id: string) => {
    try {
      await updateMissingPersonStatus(id, 'RESCUED');
      loadMissingPersons();
    } catch (err) {
      console.error('Error marking as rescued:', err);
    }
  };

  const activeMissingCount = persons.filter((p) => p.status === 'MISSING' || p.status === 'SIGHTED').length;
  const rescuedCount = persons.filter((p) => p.status === 'RESCUED').length;

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden p-4 space-y-4 font-sans text-slate-800">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h1 className="text-sm font-mono font-bold tracking-widest text-slate-900 uppercase">
              MISSING PERSONS REGISTRY & LOCATION MATCHING
            </h1>
            <span className="bg-purple-100 border border-purple-300 text-purple-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              CITIZEN & RESPONDER FEED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geo-tagged missing persons reported by citizens and field teams. Cross-reference photos and coordinates with drone detection alerts.
          </p>
        </div>

        {/* Counter Summary & Controls */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-semibold">ACTIVE MISSING:</span>
            <span className="text-amber-600 font-bold">{activeMissingCount}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center space-x-2">
            <span className="text-[10px] text-slate-500 font-semibold">RESCUED:</span>
            <span className="text-emerald-600 font-bold">{rescuedCount}</span>
          </div>

          {/* Action Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded font-mono text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>POST MISSING PERSON</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
        <div className="flex items-center space-x-2">
          {/* Status Tabs */}
          {(['ALL', 'MISSING', 'RESCUED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'ALL PERSONS' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded px-3 py-1 w-64 text-xs font-mono">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-800 focus:outline-none w-full font-medium placeholder-slate-400"
          />
        </div>
      </div>

      {/* Photo Cards Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center font-mono text-slate-400 text-xs">
            Loading missing persons registry...
          </div>
        ) : persons.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center font-mono text-slate-400 text-xs border border-dashed border-slate-300 rounded-lg p-6 bg-white">
            <HeartHandshake className="w-10 h-10 stroke-[1.5] mb-2 text-slate-300" />
            <p className="font-semibold">NO MISSING PERSON RECORDS FOUND</p>
            <button
              onClick={onOpenReportModal}
              className="mt-3 text-purple-700 font-bold hover:underline text-xs"
            >
              + Submit New Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
            {persons.map((person) => {
              const isRescued = person.status === 'RESCUED';

              return (
                <div
                  key={person._id}
                  className={`bg-white border rounded-lg overflow-hidden flex flex-col transition hover:shadow-md ${
                    isRescued ? 'border-emerald-300' : 'border-slate-200'
                  }`}
                >
                  {/* Photo Header with Overlay */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden group">
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shadow-sm ${
                          isRescued
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-amber-100 border-amber-300 text-amber-900'
                        }`}
                      >
                        {person.status}
                      </span>
                    </div>

                    {/* Role Tag */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[9px] font-mono bg-white/90 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">
                        {person.reportedByRole === 'CITIZEN'
                          ? 'PUBLIC REPORT'
                          : person.reportedByRole === 'ADMIN'
                          ? 'ADMIN DISPATCH'
                          : 'RESCUE TEAM'}
                      </span>
                    </div>

                    {/* Name & Basic Meta Overlay */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="font-mono font-bold text-sm text-white tracking-wide leading-tight drop-shadow-sm">
                        {person.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-200 mt-0.5 font-medium">
                        {person.age} YRS • {person.gender}
                      </p>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 font-mono text-xs text-slate-700">
                    {/* Location */}
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
                      <div className="flex items-center space-x-1.5 text-purple-700 font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">
                          {person.addressName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 pl-5 font-medium">
                        {person.latitude.toFixed(6)}° N, {person.longitude.toFixed(6)}° E
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="text-[11px] text-slate-600 line-clamp-2 italic font-medium">
                      "{person.description}"
                    </div>

                    {/* Contact Phone */}
                    <div className="flex items-center space-x-1 text-[11px] text-slate-700 pt-1 border-t border-slate-100 font-medium">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{person.contactPhone}</span>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between space-x-2">
                      {onFocusLocationOnMap && (
                        <button
                          onClick={() => onFocusLocationOnMap(person.latitude, person.longitude)}
                          className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded text-[10px] font-mono font-bold flex items-center justify-center space-x-1 transition"
                          title="View coordinates on Tactical Map"
                        >
                          <Eye className="w-3 h-3 text-sky-600" />
                          <span>MAP PIN</span>
                        </button>
                      )}

                      {!isRescued && userRole === 'RESCUE_TEAM' && (
                        <button
                          onClick={() => handleMarkRescued(person._id)}
                          className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-mono font-bold flex items-center justify-center space-x-1 transition shadow-sm"
                        >
                          <ShieldCheck className="w-3 h-3 text-white" />
                          <span>MARK RESCUED</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
