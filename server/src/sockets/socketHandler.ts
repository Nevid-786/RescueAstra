import { Server as SocketIOServer, Socket } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const initSocket = (io: SocketIOServer): void => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized');
  }
  return ioInstance;
};

export const emitDronePosition = (payload: {
  droneId: string;
  latitude: number;
  longitude: number;
  lastUpdate: Date;
  source: string;
}): void => {
  if (ioInstance) {
    ioInstance.emit('drone_position_updated', payload);
  }
};

export const emitNewEvent = (eventData: any): void => {
  if (ioInstance) {
    ioInstance.emit('new_detection_event', eventData);
  }
};

export const emitEventStatusUpdate = (eventData: any): void => {
  if (ioInstance) {
    ioInstance.emit('event_status_changed', eventData);
  }
};

export const emitSimulationToggle = (isSimulating: boolean): void => {
  if (ioInstance) {
    ioInstance.emit('simulation_status_changed', { isSimulating });
  }
};

export const emitNewMissingPerson = (personData: any): void => {
  if (ioInstance) {
    ioInstance.emit('new_missing_person', personData);
  }
};

export const emitMissingPersonStatusUpdate = (personData: any): void => {
  if (ioInstance) {
    ioInstance.emit('missing_person_updated', personData);
  }
};

