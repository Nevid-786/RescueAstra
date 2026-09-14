import { Request, Response } from 'express';
import { EventStore } from '../models/Event';
import { emitEventStatusUpdate } from '../sockets/socketHandler';
import { simulationEngine } from '../services/simulationService';

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, source, status, limit } = req.query;

    const events = await EventStore.getEvents({
      type: type as string,
      source: source as string,
      status: status as string,
      limit: limit ? parseInt(limit as string, 10) : 100,
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error('[API] Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error fetching events.' });
  }
};

export const updateEventStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value. Must be ACTIVE, ACKNOWLEDGED, or RESOLVED.' });
      return;
    }

    const updatedEvent = await EventStore.updateStatus(id, status);

    if (!updatedEvent) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    // Broadcast status change via Socket.IO
    emitEventStatusUpdate(updatedEvent);

    res.status(200).json({
      success: true,
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error('[API] Error updating event status:', error);
    res.status(500).json({ error: 'Internal server error updating event status.' });
  }
};

export const getMissionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await EventStore.getSummary();

    res.status(200).json({
      success: true,
      data: {
        totalEvents: summary.totalEvents,
        personEvents: summary.personEvents,
        fireEvents: summary.fireEvents,
        activeAlerts: summary.activeAlerts,
        searchArea: {
          minLat: summary.minLat,
          maxLat: summary.maxLat,
          minLng: summary.minLng,
          maxLng: summary.maxLng,
        },
        latestEventTimestamp: summary.latestEventTimestamp,
        simulationMode: simulationEngine.getIsRunning(),
      },
    });
  } catch (error: any) {
    console.error('[API] Error generating mission summary:', error);
    res.status(500).json({ error: 'Internal server error generating mission summary.' });
  }
};

export const toggleSimulation = async (req: Request, res: Response): Promise<void> => {
  try {
    const isRunning = simulationEngine.toggleSimulation();
    res.status(200).json({
      success: true,
      simulationMode: isRunning,
      message: isRunning ? 'Simulation mode started.' : 'Simulation mode stopped.',
    });
  } catch (error: any) {
    console.error('[API] Error toggling simulation:', error);
    res.status(500).json({ error: 'Internal server error toggling simulation mode.' });
  }
};
