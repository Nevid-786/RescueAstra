import mongoose, { Schema, Document } from 'mongoose';
import { isMongoConnected } from '../config/db';

export type MissingPersonStatus = 'MISSING' | 'SIGHTED' | 'RESCUED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface IMissingPersonData {
  _id: string;
  name: string;
  age: number;
  gender: Gender;
  photoUrl: string;
  latitude: number;
  longitude: number;
  addressName: string;
  description: string;
  contactPhone: string;
  status: MissingPersonStatus;
  reportedByRole: 'CITIZEN' | 'RESCUE_TEAM' | 'ADMIN';
  matchedDetectionEventId?: string;
  rescuedAt?: Date;
  createdAt: Date;
}

export interface IMissingPerson extends Document, Omit<IMissingPersonData, '_id'> {}

const MissingPersonSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    photoUrl: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    addressName: { type: String, default: 'Search Area Sector' },
    description: { type: String, required: true },
    contactPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ['MISSING', 'SIGHTED', 'RESCUED'],
      default: 'MISSING',
      required: true,
    },
    reportedByRole: {
      type: String,
      enum: ['CITIZEN', 'RESCUE_TEAM', 'ADMIN'],
      default: 'CITIZEN',
      required: true,
    },
    matchedDetectionEventId: { type: String },
    rescuedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const MissingPersonModel = mongoose.model<IMissingPerson>('MissingPerson', MissingPersonSchema);

// In-Memory Fallback Storage
const inMemoryMissingPersons: IMissingPersonData[] = [];

export class MissingPersonStore {
  public static async createReport(data: {
    name: string;
    age: number;
    gender: Gender;
    photoUrl: string;
    latitude: number;
    longitude: number;
    addressName?: string;
    description: string;
    contactPhone: string;
    reportedByRole?: 'CITIZEN' | 'RESCUE_TEAM' | 'ADMIN';
    status?: MissingPersonStatus;
  }): Promise<IMissingPersonData> {
    const status = data.status || 'MISSING';
    const reportedByRole = data.reportedByRole || 'CITIZEN';
    const addressName = data.addressName || 'Search Area Sector';
    const createdAt = new Date();

    if (isMongoConnected) {
      const doc = await MissingPersonModel.create({
        ...data,
        status,
        reportedByRole,
        addressName,
      });
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        name: obj.name,
        age: obj.age,
        gender: obj.gender,
        photoUrl: obj.photoUrl,
        latitude: obj.latitude,
        longitude: obj.longitude,
        addressName: obj.addressName,
        description: obj.description,
        contactPhone: obj.contactPhone,
        status: obj.status,
        reportedByRole: obj.reportedByRole,
        matchedDetectionEventId: obj.matchedDetectionEventId,
        rescuedAt: obj.rescuedAt,
        createdAt: obj.createdAt || createdAt,
      };
    } else {
      const newPerson: IMissingPersonData = {
        _id: 'mp_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        age: data.age,
        gender: data.gender,
        photoUrl: data.photoUrl,
        latitude: data.latitude,
        longitude: data.longitude,
        addressName,
        description: data.description,
        contactPhone: data.contactPhone,
        status,
        reportedByRole,
        createdAt,
      };
      inMemoryMissingPersons.unshift(newPerson);
      return newPerson;
    }
  }

  public static async getReports(filters?: {
    status?: string;
    search?: string;
  }): Promise<IMissingPersonData[]> {
    if (isMongoConnected) {
      const query: any = {};
      if (filters?.status && filters.status !== 'ALL') {
        query.status = filters.status;
      }
      if (filters?.search) {
        query.name = { $regex: filters.search, $options: 'i' };
      }
      const docs = await MissingPersonModel.find(query).sort({ createdAt: -1 });
      return docs.map((d) => {
        const obj = d.toObject();
        return {
          _id: obj._id.toString(),
          name: obj.name,
          age: obj.age,
          gender: obj.gender,
          photoUrl: obj.photoUrl,
          latitude: obj.latitude,
          longitude: obj.longitude,
          addressName: obj.addressName,
          description: obj.description,
          contactPhone: obj.contactPhone,
          status: obj.status,
          reportedByRole: obj.reportedByRole,
          matchedDetectionEventId: obj.matchedDetectionEventId,
          rescuedAt: obj.rescuedAt,
          createdAt: obj.createdAt || new Date(),
        };
      });
    } else {
      let filtered = [...inMemoryMissingPersons];
      if (filters?.status && filters.status !== 'ALL') {
        filtered = filtered.filter((p) => p.status === filters.status);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) => p.name.toLowerCase().includes(q) || p.addressName.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  }

  public static async updateStatus(
    id: string,
    status: MissingPersonStatus,
    matchedDetectionEventId?: string
  ): Promise<IMissingPersonData | null> {
    const rescuedAt = status === 'RESCUED' ? new Date() : undefined;

    if (isMongoConnected) {
      const updateData: any = { status };
      if (rescuedAt) updateData.rescuedAt = rescuedAt;
      if (matchedDetectionEventId) updateData.matchedDetectionEventId = matchedDetectionEventId;

      const doc = await MissingPersonModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!doc) return null;
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        name: obj.name,
        age: obj.age,
        gender: obj.gender,
        photoUrl: obj.photoUrl,
        latitude: obj.latitude,
        longitude: obj.longitude,
        addressName: obj.addressName,
        description: obj.description,
        contactPhone: obj.contactPhone,
        status: obj.status,
        reportedByRole: obj.reportedByRole,
        matchedDetectionEventId: obj.matchedDetectionEventId,
        rescuedAt: obj.rescuedAt,
        createdAt: obj.createdAt,
      };
    } else {
      const person = inMemoryMissingPersons.find((p) => p._id === id);
      if (person) {
        person.status = status;
        if (rescuedAt) person.rescuedAt = rescuedAt;
        if (matchedDetectionEventId) person.matchedDetectionEventId = matchedDetectionEventId;
        return { ...person };
      }
      return null;
    }
  }

  public static async countReports(): Promise<{ missing: number; rescued: number; total: number }> {
    const all = await this.getReports();
    const missing = all.filter((p) => p.status === 'MISSING' || p.status === 'SIGHTED').length;
    const rescued = all.filter((p) => p.status === 'RESCUED').length;
    return { missing, rescued, total: all.length };
  }
}
