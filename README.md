# EXTREME HEATWAVE EARLY WARNING & HUMAN THERMAL STRESS INDEX
## Premium 3D AI Command Center + Emergency Alarm + Dual-Number Phone Escalation

A mission-critical environmental thermal-stress risk forecasting and emergency response platform combining multi-variable physics engines, machine learning classification, 3D WebGL atmospheric visualization, procedural audio alarm sirens, and automated dual-contact telephone escalation.

---

## 🌟 Key Features

1. **Environmental Ingestion & Physical Validation**:
   - Continuous 1-hour time-series ingestion with physical boundary validation.
   - Temperature, Relative Humidity, Dew Point, Wind Speed, Solar Radiation, Cloud Cover.
2. **Multi-Index Thermal Physics Engine**:
   - NOAA Steadman / Rothfusz **Heat Index ($HI$)**
   - Stull (2011) **Wet-Bulb Temperature ($T_w$)**
   - Australian Bureau of Meteorology **Simplified WBGT ($sWBGT$)**
   - Australian **Apparent Temperature ($AT$)** & Canadian **Humidex**
   - Explainable **Environmental Human Thermal Stress Score (0–100)**
3. **Machine Learning Classifier**:
   - Benchmark models evaluated: Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, Support Vector Classifier.
   - Chronological validation split (70% train / 15% validation / 15% test) to prevent temporal data leakage.
   - Priority recall optimization on `HIGH`, `VERY HIGH`, and `EXTREME` risk tiers.
4. **Mission Control 3D UI / UX**:
   - Three.js / React Three Fiber central atmospheric sphere, dynamic heat particle field, and solar radiation aura.
   - Circular HUD thermal stress gauge with real-time progress arc and risk confidence.
   - 8 environmental telemetry cards with trend sparklines and status badges.
   - Live time-series area charts via Recharts over high-frequency WebSockets.
   - Interactive Risk Contributors breakdown with detailed popup explanations.
   - Dynamic "Why Am I At Risk?" explainable reasoning bullets.
5. **Emergency State Machine & Dual Phone Call Escalation**:
   - Strict 6-state progression: `NORMAL` ➔ `WATCH` ➔ `WARNING` ➔ `DANGER` ➔ `EXTREME` ➔ `EMERGENCY`
   - Configurable persistence filter (default 60s) to prevent single noisy sensor spikes from triggering alarms.
   - Web Audio API procedural dual-tone siren synthesizer (zero audio asset dependencies).
   - Automated sequential escalation to **Contact 1 (Primary)** and **Contact 2 (Secondary)**.
   - Pluggable Telephony Provider abstraction (`TwilioProvider` for live carrier calling, `MockTelephonyProvider` for simulation/demos).
   - Anti-spam cooldown timer (default 10 minutes) and configurable call retries.
   - Manual emergency trigger button with operator confirmation modal.
   - Safe simulation test mode for demonstrations.
   - Comprehensive SQLite database audit logging and chronological timeline.

---

## 🏗️ Architecture & Project Structure

```
d:\Heatwave Early Warning & Human Thermal Stres Index/
├── backend/
│   ├── main.py                     # FastAPI entrypoint
│   ├── config.py                   # System configuration & environment loading
│   ├── api/
│   │   ├── routes.py               # REST API endpoints (/api/status, /api/predict, /api/alerts)
│   │   ├── emergency_routes.py     # Emergency controls (/api/emergency/call, /api/emergency/test)
│   │   └── websocket.py            # High-frequency telemetry streaming (/ws/live)
│   ├── ml/
│   │   ├── preprocessing.py        # Data ingestion & range validation
│   │   ├── feature_engineering.py  # Solar proxies, rates of change, rolling stats
│   │   ├── train.py                # Multi-model training & chronological evaluation
│   │   └── predict.py              # Real-time inference engine & probability estimation
│   ├── thermal/
│   │   ├── heat_index.py           # NOAA Rothfusz Heat Index
│   │   ├── wet_bulb.py             # Stull empirical Wet Bulb
│   │   ├── wbgt.py                 # Simplified WBGT & vapor pressure
│   │   ├── utci.py                 # Apparent Temperature & Humidex
│   │   └── thermal_score.py        # 0-100 explainable composite score
│   ├── emergency/
│   │   ├── emergency_service.py    # Multi-state machine & timeline manager
│   │   ├── call_manager.py         # Dual-contact sequential calling & cooldown
│   │   ├── telephony_provider.py   # Abstract telephony interface
│   │   └── twilio_provider.py      # Production Twilio & Mock simulation providers
│   ├── database/
│   │   ├── database.py             # SQLite engine & session management
│   │   ├── models.py               # SQLAlchemy schema
│   │   └── repositories.py         # CRUD repository helpers
│   ├── models/
│   │   ├── thermal_stress_model.pkl
│   │   ├── preprocessor.pkl
│   │   └── metadata.json
│   ├── data/
│   │   └── dataset.csv             # Supplied Open-Meteo climate dataset
│   └── tests/
│       └── test_system.py          # End-to-end 8 scenario test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Thermal3DScene.jsx      # Three.js / R3F Atmospheric Core
│   │   │   ├── ThermalGauge.jsx        # 0-100 HUD Circular Gauge
│   │   │   ├── EnvironmentCards.jsx    # 8 Telemetry Cards with Sparklines
│   │   │   ├── LiveThermalChart.jsx    # Real-time WebSocket Area Chart
│   │   │   ├── HeatwaveStatus.jsx      # Tactical Heatwave Regime Panel
│   │   │   ├── RiskContributors.jsx    # Interactive Contributor Bars & AI Explainability
│   │   │   ├── EmergencyPanel.jsx      # Flashing Banner, Siren Controls, Call Status
│   │   │   ├── EmergencyTimeline.jsx   # Chronological Audit Event Timeline
│   │   │   └── AlertHistory.jsx        # Historical Incidents Table
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Main Live Command Center
│   │   │   ├── Analytics.jsx           # ML Models Benchmark & Feature Importance
│   │   │   ├── Emergency.jsx           # Dedicated Telephony Escalation View
│   │   │   └── Settings.jsx            # Thresholds, Timers, Contacts Admin
│   │   ├── services/
│   │   │   ├── api.js                  # REST API Client
│   │   │   ├── websocket.js            # Live WebSocket Client
│   │   │   └── AudioAlarm.js           # Web Audio API Siren Synthesizer
│   │   ├── hooks/
│   │   │   └── useLiveThermalData.js   # Live Telemetry & Siren Sync Hook
│   │   ├── App.jsx                     # Root Component with HUD Navigation
│   │   └── index.css                   # Futuristic Glassmorphic Dark Design System
│   └── package.json
└── .env
```

---

## 🚀 Running the System

### 1. Backend Server
```powershell
# In project root:
py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`
WebSocket live stream at: `ws://127.0.0.1:8000/ws/live`

### 2. Frontend Development Server
```powershell
# In frontend/ directory:
cd frontend
npm run dev
```
Open your browser at: `http://localhost:5173/`

### 3. Running Verification Test Suite
```powershell
# In project root:
py -m unittest backend/tests/test_system.py
```
Validates all 8 scenarios:
1. `LOW` (No alarm, no calls)
2. `MODERATE` (Normal status, no calls)
3. `HIGH` (Elevated thermal index, no calls)
4. `VERY HIGH` (Warning flag, no automated calls)
5. `EXTREME` (Visual & audible alarm)
6. `EXTREME + Persistence` (Transition to EMERGENCY ➔ Call Contact 1 ➔ Call Contact 2)
7. `Emergency Clears` (Conditions subside, alarm turns off)
8. `Emergency Cooldown` (Suppresses rapid repeat calling)

---

## 🔒 Security & Privacy

1. **Sensitive Contacts**: Stored strictly backend-side in `.env` (`EMERGENCY_CONTACT_1`, `EMERGENCY_CONTACT_2`).
2. **Number Masking**: Frontend APIs and WebSocket payloads only transmit masked phone numbers (`+91******3210`).
3. **Safety Switch**: `EMERGENCY_CALL_ENABLED=false` and `SIMULATION_MODE=true` by default to prevent accidental outbound carrier toll charges until explicitly verified.

---

## ⚠️ Academic & Medical Safety Disclaimer
This system provides algorithmic estimation of environmental human thermal-stress risk based on ambient meteorological indicators. It is **NOT** a medical diagnostic device and does not diagnose physiological heatstroke or core body temperature. If an individual displays signs of severe heat illness, seek emergency medical care immediately.
