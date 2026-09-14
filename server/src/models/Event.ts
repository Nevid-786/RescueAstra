import mongoose, { Schema, Document } from 'mongoose';
import { isMongoConnected } from '../config/db';

export type EventType = 'PERSON' | 'FIRE_SMOKE' | 'MULTIPLE';
export type EventSource = 'LIVE' | 'SIMULATION';
export type EventStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface IEventData {
  _id: string;
  droneId: string;
  eventType: EventType;
  latitude: number;
  longitude: number;
  timestamp: Date;
  source: EventSource;
  status: EventStatus;
}

export interface IEvent extends Document {
  droneId: string;
  eventType: EventType;
  latitude: number;
  longitude: number;
  timestamp: Date;
  source: EventSource;
  status: EventStatus;
}

const EventSchema: Schema = new Schema(
  {
    droneId: { type: String, required: true, default: 'DRONE-01' },
    eventType: {
      type: String,
      enum: ['PERSON', 'FIRE_SMOKE', 'MULTIPLE'],
      required: true,
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    source: {
      type: String,
      enum: ['LIVE', 'SIMULATION'],
      default: 'LIVE',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);

// In-Memory Storage Fallback
const inMemoryEvents: IEventData[] = [];

export class EventStore {
  public static async createEvent(data: {
    droneId: string;
    eventType: EventType;
    latitude: number;
    longitude: number;
    timestamp?: Date;
    source: EventSource;
    status?: EventStatus;
  }): Promise<IEventData> {
    const timestamp = data.timestamp || new Date();
    const status = data.status || 'ACTIVE';

    if (isMongoConnected) {
      const doc = await EventModel.create({ ...data, timestamp, status });
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        droneId: obj.droneId,
        eventType: obj.eventType,
        latitude: obj.latitude,
        longitude: obj.longitude,
        timestamp: obj.timestamp,
        source: obj.source,
        status: obj.status,
      };
    } else {
      const newEvt: IEventData = {
        _id: 'evt_' + Math.random().toString(36).substr(2, 9),
        droneId: data.droneId,
        eventType: data.eventType,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp,
        source: data.source,
        status,
      };
      inMemoryEvents.unshift(newEvt);
      return newEvt;
    }
  }

  public static async getEvents(filters?: {
    type?: string;
    source?: string;
    status?: string;
    limit?: number;
  }): Promise<IEventData[]> {
    if (isMongoConnected) {
      const query: any = {};
      if (filters?.type) query.eventType = filters.type;
      if (filters?.source) query.source = filters.source;
      if (filters?.status) query.status = filters.status;

      const docs = await EventModel.find(query)
        .sort({ timestamp: -1 })
        .limit(filters?.limit || 100);
      return docs.map((d) => {
        const obj = d.toObject();
        return {
          _id: obj._id.toString(),
          droneId: obj.droneId,
          eventType: obj.eventType,
          latitude: obj.latitude,
          longitude: obj.longitude,
          timestamp: obj.timestamp,
          source: obj.source,
          status: obj.status,
        };
      });
    } else {
      let filtered = [...inMemoryEvents];
      if (filters?.type) filtered = filtered.filter((e) => e.eventType === filters.type);
      if (filters?.source) filtered = filtered.filter((e) => e.source === filters.source);
      if (filters?.status) filtered = filtered.filter((e) => e.status === filters.status);
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return filtered.slice(0, filters?.limit || 100);
    }
  }

  public static async updateStatus(id: string, status: EventStatus): Promise<IEventData | null> {
    if (isMongoConnected) {
      const doc = await EventModel.findByIdAndUpdate(id, { status }, { new: true });
      if (!doc) return null;
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        droneId: obj.droneId,
        eventType: obj.eventType,
        latitude: obj.latitude,
        longitude: obj.longitude,
        timestamp: obj.timestamp,
        source: obj.source,
        status: obj.status,
      };
    } else {
      const evt = inMemoryEvents.find((e) => e._id === id);
      if (evt) {
        evt.status = status;
        return { ...evt };
      }
      return null;
    }
  }

  public static async countEvents(query?: any): Promise<number> {
    if (isMongoConnected) {
      return await EventModel.countDocuments(query || {});
    } else {
      if (!query || Object.keys(query).length === 0) return inMemoryEvents.length;
      return inMemoryEvents.filter((e) => {
        if (query.eventType && query.eventType.$in) {
          if (!query.eventType.$in.includes(e.eventType)) return false;
        } else if (query.eventType && e.eventType !== query.eventType) {
          return false;
        }
        if (query.status && e.status !== query.status) return false;
        return true;
      }).length;
    }
  }

  public static async getSummary(): Promise<{
    totalEvents: number;
    personEvents: number;
    fireEvents: number;
    activeAlerts: number;
    minLat: number | null;
    maxLat: number | null;
    minLng: number | null;
    maxLng: number | null;
    latestEventTimestamp: Date | null;
  }> {
    const all = await this.getEvents({ limit: 1000 });
    const personEvents = all.filter((e) => e.eventType === 'PERSON' || e.eventType === 'MULTIPLE').length;
    const fireEvents = all.filter((e) => e.eventType === 'FIRE_SMOKE' || e.eventType === 'MULTIPLE').length;
    const activeAlerts = all.filter((e) => e.status === 'ACTIVE').length;

    let minLat: number | null = null;
    let maxLat: number | null = null;
    let minLng: number | null = null;
    let maxLng: number | null = null;

    if (all.length > 0) {
      minLat = Math.min(...all.map((e) => e.latitude));
      maxLat = Math.max(...all.map((e) => e.latitude));
      minLng = Math.min(...all.map((e) => e.longitude));
      maxLng = Math.max(...all.map((e) => e.longitude));
    }

    const latestEventTimestamp = all.length > 0 ? new Date(all[0].timestamp) : null;

    return {
      totalEvents: all.length,
      personEvents,
      fireEvents,
      activeAlerts,
      minLat,
      maxLat,
      minLng,
      maxLng,
      latestEventTimestamp,
    };
  }
}
