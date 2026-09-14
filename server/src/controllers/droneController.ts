import { Request, Response } from 'express';
import { DroneStatusStore } from '../models/DroneStatus';
import { EventStore, EventType, EventSource } from '../models/Event';
import { emitDronePosition, emitNewEvent } from '../sockets/socketHandler';

const parseTimestamp = (rawTs: any): Date => {
  if (!rawTs) return new Date();
  if (typeof rawTs === 'number') {
    return rawTs < 1e11 ? new Date(rawTs * 1000) : new Date(rawTs);
  }
  if (typeof rawTs === 'string') {
    const num = Number(rawTs);
    if (!isNaN(num) && rawTs.trim() !== '') {
      return num < 1e11 ? new Date(num * 1000) : new Date(num);
    }
    const d = new Date(rawTs);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
};

export const postDroneEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { droneId, latitude, longitude, personDetected, fireDetected, timestamp, source } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ error: 'Latitude and Longitude are required.' });
      return;
    }

    const targetDroneId = droneId || 'DRONE-01';
    const eventSource: EventSource = source === 'SIMULATION' ? 'SIMULATION' : 'LIVE';
    const eventTime = parseTimestamp(timestamp);

    // 1. Update Drone Location
    const updatedStatus = await DroneStatusStore.updateStatus({
      droneId: targetDroneId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      lastUpdate: eventTime,
      isOnline: true,
      source: eventSource,
    });

    // Broadcast Drone Position via Socket.IO
    emitDronePosition({
      droneId: updatedStatus.droneId,
      latitude: updatedStatus.latitude,
      longitude: updatedStatus.longitude,
      lastUpdate: updatedStatus.lastUpdate,
      source: updatedStatus.source,
    });

    let createdEvent = null;

    // 2. Log Detection Event if personDetected or fireDetected is true
    if (personDetected || fireDetected) {
      let eventType: EventType = 'PERSON';
      if (personDetected && fireDetected) {
        eventType = 'MULTIPLE';
      } else if (fireDetected) {
        eventType = 'FIRE_SMOKE';
      }

      createdEvent = await EventStore.createEvent({
        droneId: targetDroneId,
        eventType,
        latitude: Number(latitude),
        longitude: Number(longitude),
        timestamp: eventTime,
        source: eventSource,
        status: 'ACTIVE',
      });

      console.log(`[API] Created telemetry detection event: ${eventType} from ${eventSource}`);

      // Broadcast Event via Socket.IO
      emitNewEvent(createdEvent);
    }

    res.status(200).json({
      success: true,
      message: 'Drone telemetry updated successfully.',
      droneStatus: updatedStatus,
      event: createdEvent,
    });
  } catch (error: any) {
    console.error('[API] Error handling drone telemetry event:', error);
    res.status(500).json({ error: 'Internal server error processing drone telemetry.' });
  }
};

export const getDroneStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const droneId = (req.query.droneId as string) || 'DRONE-01';
    const status = await DroneStatusStore.getStatus(droneId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    console.error('[API] Error fetching drone status:', error);
    res.status(500).json({ error: 'Internal server error fetching drone status.' });
  }
};
