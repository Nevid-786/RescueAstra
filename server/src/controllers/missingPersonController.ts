import { Request, Response } from 'express';
import { MissingPersonStore } from '../models/MissingPerson';
import { emitNewMissingPerson, emitMissingPersonStatusUpdate } from '../sockets/socketHandler';

export const getMissingPersons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const reports = await MissingPersonStore.getReports({
      status: status as string,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error: any) {
    console.error('[API] Error fetching missing persons:', error);
    res.status(500).json({ error: 'Internal server error fetching missing persons.' });
  }
};

export const createMissingPerson = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      age,
      gender,
      photoUrl,
      latitude,
      longitude,
      addressName,
      description,
      contactPhone,
      reportedByRole,
      status,
    } = req.body;

    if (!name || !age || !gender || latitude === undefined || longitude === undefined || !contactPhone) {
      res.status(400).json({ error: 'Missing required missing person fields (name, age, gender, lat, long, contactPhone).' });
      return;
    }

    const defaultPhoto = photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

    const newReport = await MissingPersonStore.createReport({
      name,
      age: Number(age),
      gender,
      photoUrl: defaultPhoto,
      latitude: Number(latitude),
      longitude: Number(longitude),
      addressName: addressName || 'Search Sector Coordinates',
      description: description || 'No extra description provided.',
      contactPhone,
      reportedByRole: reportedByRole || 'CITIZEN',
      status: status || 'MISSING',
    });

    // Broadcast real-time event to all connected clients
    emitNewMissingPerson(newReport);

    res.status(201).json({
      success: true,
      message: 'Missing person report registered successfully.',
      data: newReport,
    });
  } catch (error: any) {
    console.error('[API] Error creating missing person report:', error);
    res.status(500).json({ error: 'Internal server error submitting report.' });
  }
};

export const updateMissingPersonStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, matchedDetectionEventId } = req.body;

    if (!['MISSING', 'SIGHTED', 'RESCUED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be MISSING, SIGHTED, or RESCUED.' });
      return;
    }

    const updated = await MissingPersonStore.updateStatus(id, status, matchedDetectionEventId);

    if (!updated) {
      res.status(404).json({ error: 'Missing person record not found.' });
      return;
    }

    // Broadcast real-time status update to all connected clients
    emitMissingPersonStatusUpdate(updated);

    res.status(200).json({
      success: true,
      message: `Person status updated to ${status}.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('[API] Error updating missing person status:', error);
    res.status(500).json({ error: 'Internal server error updating person status.' });
  }
};

export const getMissingPersonStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await MissingPersonStore.countReports();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[API] Error fetching missing person stats:', error);
    res.status(500).json({ error: 'Internal server error fetching stats.' });
  }
};
