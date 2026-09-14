import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IDroneStatus, IDetectionEvent, IMissingPerson } from '../types';
import { Layers, Focus } from 'lucide-react';

interface TacticalMapProps {
  droneStatus: IDroneStatus | null;
  events: IDetectionEvent[];
  missingPersons?: IMissingPerson[];
  selectedEvent: IDetectionEvent | null;
  onSelectEvent: (event: IDetectionEvent | null) => void;
}

const MapViewController: React.FC<{
  dronePos: [number, number] | null;
  selectedPos: [number, number] | null;
}> = ({ selectedPos }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPos) {
      map.flyTo(selectedPos, 16, { duration: 1.2 });
    }
  }, [selectedPos, map]);

  return null;
};

// Custom Light Theme Marker Generators (Matching Reference Screenshot)
const createDroneIcon = (source: string) => {
  return L.divIcon({
    className: 'custom-drone-marker',
    html: `
      <div class="tactical-pulse-marker flex items-center justify-center">
        <div class="tactical-pulse-ring"></div>
        <div class="w-8 h-8 bg-slate-900 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-lg text-white font-mono font-bold text-[10px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createPersonIcon = (isSimulated: boolean) => {
  return L.divIcon({
    className: 'custom-person-marker',
    html: `
      <div class="tactical-pulse-marker flex items-center justify-center">
        <div class="tactical-pulse-ring tactical-pulse-ring-person"></div>
        <div class="px-2 py-1 bg-blue-600 border-2 border-white text-white font-mono font-bold text-[10px] rounded-md shadow-md flex items-center space-x-1 uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>POTENTIAL PERSON</span>
        </div>
      </div>
    `,
    iconSize: [120, 24],
    iconAnchor: [60, 12],
  });
};

const createFireIcon = (isSimulated: boolean) => {
  return L.divIcon({
    className: 'custom-fire-marker',
    html: `
      <div class="tactical-pulse-marker flex items-center justify-center">
        <div class="tactical-pulse-ring tactical-pulse-ring-fire"></div>
        <div class="px-2 py-1 bg-amber-600 border-2 border-white text-white font-mono font-bold text-[10px] rounded-md shadow-md flex items-center space-x-1 uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>
          <span>FIRE / SMOKE HAZARD</span>
        </div>
      </div>
    `,
    iconSize: [130, 24],
    iconAnchor: [65, 12],
  });
};

const createMultipleIcon = (isSimulated: boolean) => {
  return L.divIcon({
    className: 'custom-multiple-marker',
    html: `
      <div class="tactical-pulse-marker flex items-center justify-center">
        <div class="tactical-pulse-ring tactical-pulse-ring-critical"></div>
        <div class="px-2 py-1 bg-rose-600 border-2 border-white text-white font-mono font-bold text-[10px] rounded-md shadow-md flex items-center space-x-1 uppercase animate-pulse">
          <span>CRITICAL: PERSON + FIRE</span>
        </div>
      </div>
    `,
    iconSize: [140, 24],
    iconAnchor: [70, 12],
  });
};

const createMissingPersonIcon = () => {
  return L.divIcon({
    className: 'custom-missing-marker',
    html: `
      <div class="tactical-pulse-marker flex items-center justify-center">
        <div class="tactical-pulse-ring tactical-pulse-ring-missing"></div>
        <div class="px-2 py-1 bg-purple-700 border-2 border-white text-white font-mono font-bold text-[10px] rounded-md shadow-md flex items-center space-x-1 uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>MISSING PIN</span>
        </div>
      </div>
    `,
    iconSize: [90, 24],
    iconAnchor: [45, 12],
  });
};

type MapStyleType = 'google_streets' | 'google_hybrid' | 'google_terrain' | 'osm';

export const TacticalMap: React.FC<TacticalMapProps> = ({
  droneStatus,
  events,
  missingPersons = [],
  selectedEvent,
  onSelectEvent,
}) => {
  const [mapStyle, setMapStyle] = useState<MapStyleType>('google_streets');

  const defaultCenter: [number, number] = droneStatus
    ? [droneStatus.latitude, droneStatus.longitude]
    : [28.6139, 77.2090];

  const selectedPos: [number, number] | null = selectedEvent
    ? [selectedEvent.latitude, selectedEvent.longitude]
    : null;

  return (
    <div className="relative w-full h-full border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-sm">
      {/* Map Header Overlay Bar & Layer Selector */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur border border-slate-200 rounded-md px-3 py-1.5 flex flex-wrap items-center gap-2 text-xs font-mono shadow-sm">
        <div className="flex items-center space-x-1.5 text-slate-900">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-bold text-slate-900">SITUATION GRID</span>
        </div>
        <div className="w-[1px] h-3.5 bg-slate-300 hidden sm:block"></div>

        {/* Map View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200">
          <button
            onClick={() => setMapStyle('google_streets')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'google_streets'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Google Maps Street View with Buildings & Footprints"
          >
            GMAPS STREETS
          </button>
          <button
            onClick={() => setMapStyle('google_hybrid')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'google_hybrid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Google Satellite Hybrid View"
          >
            SATELLITE
          </button>
          <button
            onClick={() => setMapStyle('google_terrain')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'google_terrain'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Google Terrain & Elevation Map"
          >
            TERRAIN
          </button>
          <button
            onClick={() => setMapStyle('osm')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
              mapStyle === 'osm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="OpenStreetMap Standard Vector"
          >
            OSM
          </button>
        </div>
      </div>

      {/* Center Drone Button Overlay */}
      {droneStatus && (
        <button
          onClick={() => onSelectEvent(null)}
          className="absolute top-3 right-3 z-[1000] bg-white/95 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 flex items-center space-x-1.5 text-xs font-mono transition shadow-sm font-semibold"
          title="Center on Drone Position"
        >
          <Focus className="w-3.5 h-3.5 text-blue-600" />
          <span>RE-CENTER DRONE</span>
        </button>
      )}

      {/* Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={16}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapViewController dronePos={defaultCenter} selectedPos={selectedPos} />

        {/* Dynamic Tile Layers with Google Maps Support */}
        {mapStyle === 'google_streets' && (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}
        {mapStyle === 'google_hybrid' && (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}
        {mapStyle === 'google_terrain' && (
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
        )}
        {mapStyle === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* 1. Live Drone Marker */}
        {droneStatus && (
          <Marker
            position={[droneStatus.latitude, droneStatus.longitude]}
            icon={createDroneIcon(droneStatus.source)}
          >
            <Popup>
              <div className="p-1 font-sans text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                  <span className="font-mono font-bold text-blue-700">
                    {droneStatus.droneId}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-1.5 py-0.5 rounded border border-blue-200 font-bold">
                    AIRBORNE
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-800">
                  <div>LAT: <span className="text-slate-900 font-bold">{droneStatus.latitude.toFixed(6)}° N</span></div>
                  <div>LNG: <span className="text-slate-900 font-bold">{droneStatus.longitude.toFixed(6)}° E</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    UPDATED: {new Date(droneStatus.lastUpdate).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 2. Drone Telemetry Event Markers */}
        {events.map((evt) => {
          let icon;
          if (evt.eventType === 'MULTIPLE') {
            icon = createMultipleIcon(evt.source === 'SIMULATION');
          } else if (evt.eventType === 'FIRE_SMOKE') {
            icon = createFireIcon(evt.source === 'SIMULATION');
          } else {
            icon = createPersonIcon(evt.source === 'SIMULATION');
          }

          return (
            <Marker
              key={evt._id}
              position={[evt.latitude, evt.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectEvent(evt),
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        evt.eventType === 'FIRE_SMOKE'
                          ? 'text-amber-700'
                          : evt.eventType === 'MULTIPLE'
                          ? 'text-rose-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {evt.eventType === 'MULTIPLE'
                        ? 'MULTIPLE EVENTS'
                        : evt.eventType === 'FIRE_SMOKE'
                        ? 'FIRE / SMOKE DETECTED'
                        : 'PERSON DETECTED'}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200 font-bold">
                      {evt.source}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-800">
                    <div>POSITION: {evt.latitude.toFixed(6)}, {evt.longitude.toFixed(6)}</div>
                    <div>TIME: {new Date(evt.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Reported Missing Person Pins */}
        {missingPersons.map((mp) => (
          <Marker
            key={mp._id}
            position={[mp.latitude, mp.longitude]}
            icon={createMissingPersonIcon()}
          >
            <Popup>
              <div className="p-1 font-sans text-xs min-w-[210px] space-y-1.5">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-1">
                  <img src={mp.photoUrl} alt={mp.name} className="w-9 h-9 rounded object-cover border border-slate-200" />
                  <div>
                    <div className="font-mono font-bold text-purple-700 text-xs">{mp.name}</div>
                    <div className="text-[10px] text-slate-600 font-mono">
                      {mp.age} YRS • STATUS: {mp.status}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[10px] text-slate-800">
                  <div>LAST SEEN: {mp.addressName}</div>
                  <div className="text-slate-600 italic">"{mp.description}"</div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
