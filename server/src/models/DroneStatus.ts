import mongoose, { Schema, Document } from 'mongoose';
import { isMongoConnected } from '../config/db';

export interface IDroneStatusData {
  droneId: string;
  latitude: number;
  longitude: number;
  lastUpdate: Date;
  isOnline: boolean;
  source: 'LIVE' | 'SIMULATION';
}

export interface IDroneStatus extends Document, IDroneStatusData {}

const DroneStatusSchema: Schema = new Schema(
  {
    droneId: { type: String, required: true, unique: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    lastUpdate: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: true },
    source: { type: String, enum: ['LIVE', 'SIMULATION'], default: 'LIVE' },
  },
  {
    timestamps: true,
  }
);

export const DroneStatusModel = mongoose.model<IDroneStatus>('DroneStatus', DroneStatusSchema);

// In-Memory Fallback Store
const inMemoryDroneStatus: Map<string, IDroneStatusData> = new Map();

export class DroneStatusStore {
  public static async updateStatus(data: {
    droneId: string;
    latitude: number;
    longitude: number;
    lastUpdate?: Date;
    isOnline?: boolean;
    source?: 'LIVE' | 'SIMULATION';
  }): Promise<IDroneStatusData> {
    const payload = {
      droneId: data.droneId,
      latitude: data.latitude,
      longitude: data.longitude,
      lastUpdate: data.lastUpdate || new Date(),
      isOnline: data.isOnline !== undefined ? data.isOnline : true,
      source: data.source || 'LIVE',
    };

    if (isMongoConnected) {
      const doc = await DroneStatusModel.findOneAndUpdate(
        { droneId: data.droneId },
        payload,
        { upsert: true, new: true }
      );
      return doc.toObject() as IDroneStatusData;
    } else {
      inMemoryDroneStatus.set(data.droneId, payload);
      return { ...payload };
    }
  }

  public static async getStatus(droneId: string = 'DRONE-01'): Promise<IDroneStatusData> {
    if (isMongoConnected) {
      let doc = await DroneStatusModel.findOne({ droneId });
      if (!doc) {
        doc = await DroneStatusModel.create({
          droneId,
          latitude: 28.6139,
          longitude: 77.2090,
          lastUpdate: new Date(),
          isOnline: true,
          source: 'LIVE',
        });
      }
      return doc.toObject() as IDroneStatusData;
    } else {
      let existing = inMemoryDroneStatus.get(droneId);
      if (!existing) {
        existing = {
          droneId,
          latitude: 28.6139,
          longitude: 77.2090,
          lastUpdate: new Date(),
          isOnline: true,
          source: 'LIVE',
        };
        inMemoryDroneStatus.set(droneId, existing);
      }
      return { ...existing };
    }
  }
}
