# SK¥_P@TROL — AI Search & Rescue Ground Command Center (Stage 3)

**Smart India Hackathon 2026 (PS 26177)**  
*Deployable AI-powered autonomous drone system for search-and-rescue operations.*

---

## 🛰️ System Scope & Principles

Stage 3 is the **Ground Command Center**, responsible for receiving telemetry observations from the Stage 1 Airborne Drone & Stage 2 On-Board Intelligence and converting them into actionable rescue intelligence.

### Data Scope
The Ground Command Center processes real incoming telemetry parameters:
1. `latitude`
2. `longitude`
3. `personDetected` (boolean)
4. `fireDetected` (boolean)
5. `timestamp`
6. `droneId`
7. `source` (`LIVE` vs `SIMULATION`)
8. `status` (`ACTIVE` / `ACKNOWLEDGED` / `RESOLVED`)

### UI Aesthetics & Rescue Terminology
- **High-Density Tactical UI**: Emergency operations center dark palette (`#080c14`), cartographic dark basemaps, high-contrast monospace indicators, zero clutter.
- **Accurate Terminology**:
  - Person detection is logged as **"Person Detected"** / **"Potential Person Detected"** (YOLO detection does not confirm survivor status).
  - Fire detection is logged as **"Fire/Smoke Detected"**.
  - Metrics reflect **Detection Log Events**, not unique objects/people.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Leaflet / React-Leaflet, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, Socket.IO Server.
- **Database**: MongoDB with automatic in-memory fallback.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm run install:all

# 2. Run Backend (Terminal 1)
cd server
npm run dev

# 3. Run Frontend (Terminal 2)
cd client
npm run dev
```

Open `http://localhost:5173` to access the Command Center.
