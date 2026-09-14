import { DroneStatusStore } from '../models/DroneStatus';
import { EventStore, EventType } from '../models/Event';
import { emitDronePosition, emitNewEvent, emitSimulationToggle } from '../sockets/socketHandler';

class SimulationEngine {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private droneId: string = 'DRONE-01';

  private centerLat: number = 28.6139;
  private centerLng: number = 77.2090;
  private stepIndex: number = 0;

  private routeOffsets = [
    { dLat: 0.000, dLng: 0.000 },
    { dLat: 0.001, dLng: 0.002 },
    { dLat: 0.002, dLng: 0.004 },
    { dLat: 0.002, dLng: 0.008 },
    { dLat: 0.001, dLng: 0.010 },
    { dLat: 0.000, dLng: 0.012 },
    { dLat: -0.001, dLng: 0.010 },
    { dLat: -0.002, dLng: 0.008 },
    { dLat: -0.002, dLng: 0.004 },
    { dLat: -0.001, dLng: 0.002 },
  ];

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public startSimulation(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('[SIMULATION] Engine started.');
    emitSimulationToggle(true);

    this.tick();

    this.intervalId = setInterval(() => {
      this.tick();
    }, 4000);
  }

  public stopSimulation(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('[SIMULATION] Engine stopped.');
    emitSimulationToggle(false);
  }

  public toggleSimulation(): boolean {
    if (this.isRunning) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
    return this.isRunning;
  }

  private async tick(): Promise<void> {
    try {
      const offset = this.routeOffsets[this.stepIndex % this.routeOffsets.length];
      this.stepIndex++;

      const noiseLat = (Math.random() - 0.5) * 0.0003;
      const noiseLng = (Math.random() - 0.5) * 0.0003;

      const currentLat = Number((this.centerLat + offset.dLat + noiseLat).toFixed(6));
      const currentLng = Number((this.centerLng + offset.dLng + noiseLng).toFixed(6));

      const updatedStatus = await DroneStatusStore.updateStatus({
        droneId: this.droneId,
        latitude: currentLat,
        longitude: currentLng,
        lastUpdate: new Date(),
        isOnline: true,
        source: 'SIMULATION',
      });

      emitDronePosition({
        droneId: this.droneId,
        latitude: currentLat,
        longitude: currentLng,
        lastUpdate: updatedStatus.lastUpdate,
        source: 'SIMULATION',
      });

      const rand = Math.random();
      if (rand < 0.35) {
        let personDetected = false;
        let fireDetected = false;

        const subRand = Math.random();
        if (subRand < 0.45) {
          personDetected = true;
        } else if (subRand < 0.85) {
          fireDetected = true;
        } else {
          personDetected = true;
          fireDetected = true;
        }

        let eventType: EventType = 'PERSON';
        if (personDetected && fireDetected) {
          eventType = 'MULTIPLE';
        } else if (fireDetected) {
          eventType = 'FIRE_SMOKE';
        }

        const newEvent = await EventStore.createEvent({
          droneId: this.droneId,
          eventType,
          latitude: currentLat,
          longitude: currentLng,
          timestamp: new Date(),
          source: 'SIMULATION',
          status: 'ACTIVE',
        });

        console.log(`[SIMULATION] Generated detection event: ${eventType} at [${currentLat}, ${currentLng}]`);
        emitNewEvent(newEvent);
      }
    } catch (err) {
      console.error('[SIMULATION] Error during simulation tick:', err);
    }
  }
}

export const simulationEngine = new SimulationEngine();
