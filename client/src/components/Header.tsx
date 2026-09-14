import React, { useState, useEffect } from 'react';
import { Radio, Play, Square, FileText, Send, UserCheck, ShieldCheck, Plus, LogIn, LogOut, User, Key } from 'lucide-react';
import { toggleSimulationMode, sendSyntheticTelemetry } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ActiveTab } from '../types';

interface HeaderProps {
  isOnline: boolean;
  simulationMode: boolean;
  activeTab: ActiveTab;
  onTabChange: (newTab: ActiveTab) => void;
  onSimulationToggle: (newMode: boolean) => void;
  onOpenMissionSummary: () => void;
  onOpenReportModal: () => void;
  onOpenAuthModal: () => void;
  onEventUpdated?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  simulationMode,
  activeTab,
  onTabChange,
  onSimulationToggle,
  onOpenMissionSummary,
  onOpenReportModal,
  onOpenAuthModal,
  onEventUpdated,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [timeUtc, setTimeUtc] = useState<string>('');
  const [timeLocal, setTimeLocal] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const userRole = user?.role || 'CITIZEN';

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
      setTimeLocal(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClocks();
    const timer = setInterval(updateClocks, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSim = async () => {
    try {
      const res = await toggleSimulationMode();
      onSimulationToggle(res.simulationMode);
    } catch (err) {
      console.error('Failed to toggle simulation:', err);
    }
  };

  const handleTriggerTestLivePayload = async () => {
    setIsSendingTest(true);
    try {
      const lat = 28.6140 + (Math.random() - 0.5) * 0.005;
      const lng = 77.2090 + (Math.random() - 0.5) * 0.005;
      const isPerson = Math.random() > 0.3;
      const isFire = Math.random() > 0.6;

      await sendSyntheticTelemetry({
        droneId: 'DRONE-01',
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        personDetected: isPerson,
        fireDetected: isFire,
        source: 'LIVE',
      });
      if (onEventUpdated) {
        onEventUpdated();
      }
    } catch (err) {
      console.error('Failed to send test payload:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm">
      {/* Brand & Dynamic Page Navigation Tabs */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-2.5">
          <div className="bg-slate-900 p-1.5 rounded text-white shadow-sm">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold tracking-widest text-slate-900 text-base">
                SK¥_P@TROL
              </span>
              <span className="bg-slate-100 text-slate-700 text-[9px] font-mono px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                STAGE 3
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wide text-slate-500">
              AI SEARCH & RESCUE GROUND COMMAND CENTER
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="flex items-center space-x-1 font-mono text-xs pl-3 border-l border-slate-200">
          <button
            onClick={() => onTabChange('COMMAND_CENTER')}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'COMMAND_CENTER'
                ? 'bg-slate-900 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            COMMAND CENTER
          </button>

          <button
            onClick={() => onTabChange('MISSING_REGISTRY')}
            className={`px-3 py-1.5 rounded transition flex items-center space-x-1.5 ${
              activeTab === 'MISSING_REGISTRY'
                ? 'bg-purple-700 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>MISSING REGISTRY</span>
          </button>

          {(userRole === 'RESCUE_TEAM' || userRole === 'ADMIN') && (
            <button
              onClick={() => onTabChange('RESCUE_DASHBOARD')}
              className={`px-3 py-1.5 rounded transition flex items-center space-x-1.5 ${
                activeTab === 'RESCUE_DASHBOARD'
                  ? 'bg-emerald-700 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RESCUE DASHBOARD</span>
            </button>
          )}

          {userRole === 'ADMIN' && (
            <button
              onClick={() => onTabChange('ADMIN_PANEL')}
              className={`px-3 py-1.5 rounded transition flex items-center space-x-1.5 ${
                activeTab === 'ADMIN_PANEL'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>ADMIN PANEL</span>
            </button>
          )}
        </nav>
      </div>

      {/* Auth Status & System Controls */}
      <div className="flex items-center space-x-3">
        {/* User Auth Profile Badge or Login Button */}
        {isAuthenticated && user ? (
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded border border-slate-200 text-xs font-mono">
            <User className="w-3.5 h-3.5 text-slate-700" />
            <span className="font-bold text-slate-900 max-w-[120px] truncate">{user.name}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                user.role === 'ADMIN'
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : user.role === 'RESCUE_TEAM'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-purple-100 text-purple-800 border border-purple-300'
              }`}
            >
              {user.role}
            </span>
            <button
              onClick={logout}
              className="p-1 text-slate-500 hover:text-rose-600 transition ml-1"
              title="Logout User"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold rounded text-xs transition shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-400" />
            <span>LOGIN / REGISTER</span>
          </button>
        )}

        {/* Connection Status */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isOnline ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className={`text-[11px] font-mono font-bold ${isOnline ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isOnline ? 'ONLINE' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 font-mono">
          {/* Post Missing Person Trigger */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded text-xs font-bold transition shadow-sm"
            title="Report Missing or Found Person"
          >
            <Plus className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">REPORT PERSON</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={handleToggleSim}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold transition border ${
              simulationMode
                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Drone Flight & Detection Simulation"
          >
            {simulationMode ? (
              <>
                <Square className="w-3 h-3 text-amber-600 fill-amber-600" />
                <span>SIM [ON]</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-slate-500" />
                <span>SIM [OFF]</span>
              </>
            )}
          </button>

          {/* Inject Telemetry */}
          <button
            onClick={handleTriggerTestLivePayload}
            disabled={isSendingTest}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-blue-600 rounded transition disabled:opacity-50"
            title="Inject real-time drone telemetry payload"
          >
            <Send className="w-3.5 h-3.5" />
          </button>

          {/* Mission Summary */}
          <button
            onClick={onOpenMissionSummary}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded transition"
            title="Open Mission Intelligence Summary"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
