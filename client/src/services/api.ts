import axios from 'axios';
import {
  IDroneStatus,
  IDetectionEvent,
  IMissionSummary,
  IMissingPerson,
  IUser,
  AuthResponse,
  EventType,
  EventSource,
  EventStatus,
  MissingPersonStatus,
  UserRole,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skypetrol_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* Auth API */
export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/register', payload);
  return res.data;
};

export const createResponderAccount = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: 'RESCUE_TEAM' | 'ADMIN';
}): Promise<{ success: boolean; message: string; data?: IUser }> => {
  const res = await api.post<{ success: boolean; message: string; data?: IUser }>('/auth/create-responder', payload);
  return res.data;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>('/auth/login', payload);
  return res.data;
};

export const fetchCurrentUser = async (): Promise<IUser> => {
  const res = await api.get<{ success: boolean; data: IUser }>('/auth/me');
  return res.data.data;
};

/* Telemetry & Drone API */
export const fetchDroneStatus = async (droneId: string = 'DRONE-01'): Promise<IDroneStatus> => {
  const res = await api.get<{ success: boolean; data: IDroneStatus }>(`/drone/status?droneId=${droneId}`);
  return res.data.data;
};

export const fetchEvents = async (filters?: {
  type?: EventType | 'ALL';
  source?: EventSource | 'ALL';
  status?: EventStatus | 'ALL';
  limit?: number;
}): Promise<IDetectionEvent[]> => {
  const params: any = {};
  if (filters?.type && filters.type !== 'ALL') params.type = filters.type;
  if (filters?.source && filters.source !== 'ALL') params.source = filters.source;
  if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
  if (filters?.limit) params.limit = filters.limit;

  const res = await api.get<{ success: boolean; count: number; data: IDetectionEvent[] }>('/events', { params });
  return res.data.data;
};

export const updateEventStatus = async (id: string, status: EventStatus): Promise<IDetectionEvent> => {
  const res = await api.patch<{ success: boolean; data: IDetectionEvent }>(`/events/${id}/status`, { status });
  return res.data.data;
};

export const fetchMissionSummary = async (): Promise<IMissionSummary> => {
  const res = await api.get<{ success: boolean; data: IMissionSummary }>('/mission/summary');
  return res.data.data;
};

export const toggleSimulationMode = async (): Promise<{ simulationMode: boolean }> => {
  const res = await api.post<{ success: boolean; simulationMode: boolean }>('/simulation/toggle');
  return res.data;
};

export const sendSyntheticTelemetry = async (payload: {
  droneId?: string;
  latitude: number;
  longitude: number;
  personDetected: boolean;
  fireDetected: boolean;
  source?: 'LIVE' | 'SIMULATION';
}): Promise<any> => {
  const res = await api.post('/drone/events', payload);
  return res.data;
};

/* Missing Persons API */
export const fetchMissingPersons = async (filters?: {
  status?: MissingPersonStatus | 'ALL';
  search?: string;
}): Promise<IMissingPerson[]> => {
  const params: any = {};
  if (filters?.status && filters.status !== 'ALL') params.status = filters.status;
  if (filters?.search) params.search = filters.search;

  const res = await api.get<{ success: boolean; count: number; data: IMissingPerson[] }>('/missing-persons', { params });
  return res.data.data;
};

export const createMissingPersonReport = async (payload: {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  photoUrl: string;
  latitude: number;
  longitude: number;
  addressName?: string;
  description: string;
  contactPhone: string;
  reportedByRole?: UserRole;
  status?: MissingPersonStatus;
}): Promise<IMissingPerson> => {
  const res = await api.post<{ success: boolean; data: IMissingPerson }>('/missing-persons', payload);
  return res.data.data;
};

export const updateMissingPersonStatus = async (
  id: string,
  status: MissingPersonStatus,
  matchedDetectionEventId?: string
): Promise<IMissingPerson> => {
  const res = await api.patch<{ success: boolean; data: IMissingPerson }>(`/missing-persons/${id}/status`, {
    status,
    matchedDetectionEventId,
  });
  return res.data.data;
};
