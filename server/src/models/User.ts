import mongoose, { Schema, Document } from 'mongoose';
import { isMongoConnected } from '../config/db';

export type UserRole = 'CITIZEN' | 'RESCUE_TEAM' | 'ADMIN';

export interface IUserData {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: Date;
}

export interface IUser extends Document, Omit<IUserData, '_id'> {}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['CITIZEN', 'RESCUE_TEAM', 'ADMIN'],
      default: 'CITIZEN',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);

// In-Memory Storage Fallback
const inMemoryUsers: IUserData[] = [];

export class UserStore {
  public static async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUserData> {
    const role = data.role || 'CITIZEN';
    const email = data.email.toLowerCase().trim();
    const createdAt = new Date();

    if (isMongoConnected) {
      const doc = await UserModel.create({
        name: data.name,
        email,
        password: data.password,
        role,
      });
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        name: obj.name,
        email: obj.email,
        password: obj.password,
        role: obj.role,
        createdAt: obj.createdAt || createdAt,
      };
    } else {
      const newUser: IUserData = {
        _id: 'usr_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        email,
        password: data.password,
        role,
        createdAt,
      };
      inMemoryUsers.push(newUser);
      return newUser;
    }
  }

  public static async upsertUser(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<IUserData> {
    const role = data.role;
    const email = data.email.toLowerCase().trim();
    const createdAt = new Date();

    if (isMongoConnected) {
      const doc = await UserModel.findOneAndUpdate(
        { email },
        { name: data.name, email, password: data.password, role },
        { upsert: true, new: true }
      );
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        name: obj.name,
        email: obj.email,
        password: obj.password,
        role: obj.role,
        createdAt: obj.createdAt || createdAt,
      };
    } else {
      const existingIdx = inMemoryUsers.findIndex((u) => u.email === email);
      const userObj: IUserData = {
        _id: existingIdx >= 0 ? inMemoryUsers[existingIdx]._id : 'usr_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        email,
        password: data.password,
        role,
        createdAt,
      };
      if (existingIdx >= 0) {
        inMemoryUsers[existingIdx] = userObj;
      } else {
        inMemoryUsers.push(userObj);
      }
      return userObj;
    }
  }

  public static async findByEmail(email: string): Promise<IUserData | null> {
    const targetEmail = email.toLowerCase().trim();
    if (isMongoConnected) {
      const doc = await UserModel.findOne({ email: targetEmail });
      if (!doc) return null;
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        name: obj.name,
        email: obj.email,
        password: obj.password,
        role: obj.role,
        createdAt: obj.createdAt,
      };
    } else {
      const found = inMemoryUsers.find((u) => u.email === targetEmail);
      return found ? { ...found } : null;
    }
  }

  public static async findById(id: string): Promise<IUserData | null> {
    if (isMongoConnected) {
      const doc = await UserModel.findById(id).select('-password');
      if (!doc) return null;
      const obj = doc.toObject();
      return {
        _id: obj._id.toString(),
        name: obj.name,
        email: obj.email,
        role: obj.role,
        createdAt: obj.createdAt,
      };
    } else {
      const found = inMemoryUsers.find((u) => u._id === id);
      if (!found) return null;
      const { password, ...rest } = found;
      return { ...rest };
    }
  }
}
