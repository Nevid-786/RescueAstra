import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { SummaryCards } from '../components/SummaryCards';
import { TacticalMap } from '../components/TacticalMap';
import { AlertPanel } from '../components/AlertPanel';
import { DetectionHistory } from '../components/DetectionHistory';
import { MissionSummary } from '../components/MissionSummary';
import { ReportPersonModal } from '../components/ReportPersonModal';
import { AuthModal } from '../components/AuthModal';
import { MissingRegistry } from './MissingRegistry';
import { RescueDashboard } from './RescueDashboard';
import { AdminPanel } from './AdminPanel';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { IDroneStatus, IDetectionEvent, IMissionSummary, IMissingPerson, ActiveTab } from '../types';
import { fetchDroneStatus, fetchEvents, fetchMissionSummary, fetchMissingPersons } from '../services/api';
import { getSocket } from '../services/socket';

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'CITIZEN';

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('COMMAND_CENTER');

  const [droneStatus, setDroneStatus] = useState<IDroneStatus | null>(null);
  const [events, setEvents] = useState<IDetectionEvent[]>([]);
  const [missingPersons, setMissingPersons] = useState<IMissingPerson[]>([]);
  const [summary, setSummary] = useState<IMissionSummary | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<IDetectionEvent | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);

  const [showMissionSummaryModal, setShowMissionSummaryModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      const [statusData, eventsData, summaryData, missingData] = await Promise.all([
        fetchDroneStatus(),
        fetchEvents(),
        fetchMissionSummary(),
        fetchMissingPersons(),
      ]);

      setDroneStatus(statusData);
      setEvents(eventsData);
      setSummary(summaryData);
      setMissingPersons(missingData);
      setSimulationMode(summaryData.simulationMode);
      setIsOnline(true);
    } catch (err) {
      console.error('Failed to load command center data:', err);
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    // Socket.IO Real-Time Listener Setup
    const socket = getSocket();

    socket.on('connect', () => {
      setIsOnline(true);
    });

    socket.on('disconnect', () => {
      setIsOnline(false);
    });

    socket.on('drone_position_updated', (payload: any) => {
      setDroneStatus({
        droneId: payload.droneId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        lastUpdate: payload.lastUpdate,
        isOnline: true,
        source: payload.source,
      });
    });

    socket.on('new_detection_event', (newEvent: IDetectionEvent) => {
      setEvents((prev) => {
        if (prev.some((e) => e._id === newEvent._id)) return prev;
        return [newEvent, ...prev];
      });
      fetchMissionSummary().then(setSummary).catch(console.error);
    });

    socket.on('event_status_changed', (updatedEvent: IDetectionEvent) => {
      setEvents((prev) =>
        prev.map((evt) => (evt._id === updatedEvent._id ? updatedEvent : evt))
      );
      fetchMissionSummary().then(setSummary).catch(console.error);
    });

    socket.on('simulation_status_changed', (data: { isSimulating: boolean }) => {
      setSimulationMode(data.isSimulating);
    });

    socket.on('new_missing_person', (newPerson: IMissingPerson) => {
      setMissingPersons((prev) => [newPerson, ...prev]);
    });

    socket.on('missing_person_updated', (updatedPerson: IMissingPerson) => {
      setMissingPersons((prev) =>
        prev.map((p) => (p._id === updatedPerson._id ? updatedPerson : p))
      );
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('drone_position_updated');
      socket.off('new_detection_event');
      socket.off('event_status_changed');
      socket.off('simulation_status_changed');
      socket.off('new_missing_person');
      socket.off('missing_person_updated');
    };
  }, [loadDashboardData]);

  const handleFocusLocationOnMap = (lat: number, lng: number) => {
    setActiveTab('COMMAND_CENTER');
    setSelectedEvent({
      _id: 'focus_' + Date.now(),
      droneId: 'TARGET-PIN',
      eventType: 'PERSON',
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      source: 'LIVE',
      status: 'ACTIVE',
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">
      {/* 1. Header with Role-Protected Navigation */}
      <Header
        isOnline={isOnline}
        simulationMode={simulationMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSimulationToggle={setSimulationMode}
        onOpenMissionSummary={() => setShowMissionSummaryModal(true)}
        onOpenReportModal={() => setShowReportModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onEventUpdated={loadDashboardData}
      />

      {/* 2. Main Workspace Content View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'COMMAND_CENTER' && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Status Summary Cards */}
            <SummaryCards droneStatus={droneStatus} summary={summary} />

            {/* Split Screen Grid: Tactical Map + Live Alerts + History Table */}
            <main className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
                <div className="lg:col-span-8 h-full min-h-[300px]">
                  <TacticalMap
                    droneStatus={droneStatus}
                    events={events}
                    missingPersons={missingPersons}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                  />
                </div>
                <div className="lg:col-span-4 h-full min-h-[240px]">
                  <AlertPanel
                    events={events}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                    onEventUpdated={loadDashboardData}
                  />
                </div>
              </div>

              <div className="h-[220px] shrink-0">
                <DetectionHistory
                  events={events}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                  onEventUpdated={loadDashboardData}
                />
              </div>
            </main>
          </div>
        )}

        {activeTab === 'MISSING_REGISTRY' && (
          <MissingRegistry
            userRole={userRole}
            onOpenReportModal={() => setShowReportModal(true)}
            onFocusLocationOnMap={handleFocusLocationOnMap}
          />
        )}

        {activeTab === 'RESCUE_DASHBOARD' && (userRole === 'RESCUE_TEAM' || userRole === 'ADMIN') && (
          <RescueDashboard
            events={events}
            onFocusLocationOnMap={handleFocusLocationOnMap}
          />
        )}

        {activeTab === 'ADMIN_PANEL' && userRole === 'ADMIN' && (
          <AdminPanel />
        )}
      </div>

      {/* Mission Summary Modal */}
      {showMissionSummaryModal && (
        <MissionSummary
          summary={summary}
          onClose={() => setShowMissionSummaryModal(false)}
        />
      )}

      {/* Report Person Modal */}
      {showReportModal && (
        <ReportPersonModal
          userRole={userRole}
          onClose={() => setShowReportModal(false)}
          onReportCreated={() => loadDashboardData()}
          initialLat={droneStatus ? droneStatus.latitude : 28.6142}
          initialLng={droneStatus ? droneStatus.longitude : 77.2092}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default Dashboard;
