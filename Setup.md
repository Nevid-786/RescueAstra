# SK¥_P@TROL Ground Command Center Setup Guide

## Quick Start (Zero Config Ready)

1. **Install Dependencies**
   Run from project root:
   ```bash
   npm run install:all
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   *Note: If MongoDB local service is running, it connects automatically to `mongodb://localhost:27017/skypetrol`. If MongoDB is not running, it gracefully falls back to MongoDB In-Memory Server automatically.*

3. **Start Frontend Command Center**
   In a second terminal:
   ```bash
   cd client
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## API Endpoints Reference

### 1. Ingest Telemetry Event
- **Endpoint**: `POST /api/drone/events`
- **Body**:
  ```json
  {
    "droneId": "DRONE-01",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "personDetected": true,
    "fireDetected": false,
    "source": "LIVE"
  }
  ```

### 2. Get Drone Status
- **Endpoint**: `GET /api/drone/status`

### 3. Get Filtered Detection Events
- **Endpoint**: `GET /api/events?type=PERSON&source=LIVE`

### 4. Mission Intelligence Summary
- **Endpoint**: `GET /api/mission/summary`

### 5. Toggle Simulation Mode
- **Endpoint**: `POST /api/simulation/toggle`
