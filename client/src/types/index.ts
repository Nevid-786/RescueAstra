export type EventType = 'PERSON' | 'FIRE_SMOKE' | 'MULTIPLE';
export type EventSource = 'LIVE' | 'SIMULATION';
export type EventStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export type UserRole = 'RESCUE_TEAM' | 'CITIZEN' | 'ADMIN';
export type ActiveTab = 'COMMAND_CENTER' | 'MISSING_REGISTRY' | 'RESCUE_DASHBOARD' | 'ADMIN_PANEL';

export type MissingPersonStatus = 'MISSING' | 'SIGHTED' | 'RESCUED';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: IUser;
  };
}

export interface IDroneStatus {
  droneId: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  isOnline: boolean;
  source: EventSource;
}

export interface IDetectionEvent {
  _id: string;
  droneId: string;
  eventType: EventType;
  latitude: number;
  longitude: number;
  timestamp: string;
  source: EventSource;
  status: EventStatus;
}

export interface IMissingPerson {
  _id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl: string;
  latitude: number;
  longitude: number;
  addressName: string;
  description: string;
  contactPhone: string;
  status: MissingPersonStatus;
  reportedByRole: UserRole;
  matchedDetectionEventId?: string;
  rescuedAt?: string;
  createdAt: string;
}

export interface IMissionSummary {
  totalEvents: number;
  personEvents: number;
  fireEvents: number;
  activeAlerts: number;
  searchArea: {
    minLat: number | null;
    maxLat: number | null;
    minLng: number | null;
    maxLng: number | null;
  };
  latestEventTimestamp: string | null;
  simulationMode: boolean;
}
