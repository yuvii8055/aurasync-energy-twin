# AuraSync Energy Twin 🌐⚡
### A Campus Digital Twin for Sustainable Microgrid Monitoring, AI Optimization & Transparent ESG Governance
**Built for:** Dayananda Sagar Academy of Technology and Management (DSATM), Udayapura, Kanakapura Main Road, Bengaluru, Karnataka, India  
**Developed by:** **O(1) Outlaws: AIML Engineers of DSATM**

---

## 🏆 Project Overview

**AuraSync Energy Twin** is a high-stakes, 100% software-based campus digital twin engineered for **DSATM**. It unifies:
1. **Procedural 3D Spatial Digital Twin** of the DSATM campus (featuring the Main Academic Complex, Dayananda Sagar Business Academy, Mechanical & Civil Block, Block-C, Basketball Court, Boys Hostel 1, and ElectricPe EV Charging Point).
2. **Ghost Twin Technology** that computes the real-time gap between real consumption and ideal occupancy-derived baseline, isolating 8 deterministic energy ghosts.
3. **Movable, Portal-Based Dynamic Island** HUD with 9+ smooth layout morphs, right-click-hold physics dragging, anchor snapping, and rotating Dayananda Sagar institutional statements.
4. **Privacy-Preserving Edge Computer Vision** with client-side TensorFlow.js inference and smartphone WebRTC camera pairing.
5. **GenAI Energy Coach ("Aura AI")** powered by Gemini API proxy with zero-latency offline rule-based fallback, delivering quantified savings in Indian Rupees (₹) and kg CO₂e.
6. **Campus Helpdesk & Worker Action Center** with 3-tap student reporting, HOD Kanban dispatch with Smart-Assign, and mandatory after-photo evidence.
7. **Complete ESG & Carbon Accounting Hub** tracking Scope 1, Scope 2, and Scope 3 emissions, solar self-consumption, and instant Green Audit PDF exports.

---

## 🏛️ Institution & Team Recognition

- **Institution:** Dayananda Sagar Academy of Technology and Management (DSATM)
- **Parent Group:** Dayananda Sagar Institutions (Bengaluru)
- **Location:** Udayapura, Kanakapura Main Road, Bengaluru, Karnataka – 560082
- **Institutional Statement Source:** `/client/src/config/institution.json` & `/server/src/config/institution.json`
- **Team Credit:** **Developed by O(1) Outlaws: AIML Engineers of DSATM**
- **Currency & Grouping:** Indian Rupees (`₹`) using `Intl.NumberFormat('en-IN')` everywhere.
- **Default Baseline:** Grid emission factor 0.71 kg CO₂e/kWh; BESCOM commercial HT slab rate assumed at ₹8.25/kWh (editable in Settings).

---

## ⚡ Quick Start & Run Commands

### 1. Prerequisites
- Node.js (v18.x or v20.x+)
- npm (v9.x or v10.x+)

### 2. Installation & Setup
From the root directory:
```bash
# 1. Install root, server, and client dependencies
npm run install:all

# 2. Seed database (creates 5 demo accounts, 40 sample tickets, 12 workers, 6 lifts, 60 bins, 14 days telemetry)
npm run seed

# 3. Start both Backend Server (Port 5000) and Frontend Client (Port 5173) concurrently
npm run dev
```

### 3. Build for Production
```bash
npm run build:client
npm start
```

---

## 🔑 Demo Accounts & Passkeys

| Role | Email | Password | Passkey PIN | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@aurasync.demo` | `Admin@12345` | `123456` | Principal Office (Full campus master control) |
| **HOD** | `hod.aiml@aurasync.demo` | `Hod@12345` | `123456` | Dr. Sandhya V. (HOD AIML & Department Board) |
| **Faculty** | `faculty@aurasync.demo` | `Faculty@12345` | `123456` | Prof. Ananya Rao (Assistant Professor) |
| **Student** | `student@aurasync.demo` | `Student@12345` | `123456` | Nikhil Sharma (USN: 1DT23AI045) |
| **Worker** | `worker@aurasync.demo` | `Worker@12345` | `123456` | Manjunath Gowda (Lead Technician) |

> **Note:** Demo mode includes a 1-click credential chip on `/login` to switch between roles instantly.

---

## 🏝️ The Dynamic Island (Positioning & Drag Physics)

The Dynamic Island is rendered through a React Portal directly into `document.body` with `position: fixed` and `z-index: 99999` to eliminate CSS transform/filter nesting bugs.

- **How to Move:** **Right-Click and Hold for 300ms** (or press the **M key** on your keyboard, or long-press on mobile) to pick up the island with lifted shadow and grab cursor.
- **Snap Anchors:** Top-Center (Default), Top-Left, Top-Right, Bottom-Center, Bottom-Left, Bottom-Right, or Free Drag.
- **Reset:** Double-click the island or click "Reset Island Position" in Settings.
- **States:**
  1. `IDLE`: Pulsing campus status, live kW, and rotating Dayananda Sagar statement.
  2. `ENERGY_ALERT`: Severity alert, building + room, quick action dismiss.
  3. `CV_OCCUPANCY`: Real-time person count inferred from camera.
  4. `GENAI_INSIGHT`: Quantified efficiency strategy from Aura AI.
  5. `AUTO_CONTROL`: Realtime notification of automated relay actuation.
  6. `SECURITY`: High-stakes master switch authorization alert.
  7. `ACHIEVEMENT`: Confetti celebratory alert when saving carbon or resolving tickets.

---

## 🛠️ Bluetooth GATT Profile & ESP32 Hardware Integration

All physical actuation and telemetry interfaces are abstracted behind the `DeviceAdapter` pattern (`SimulatedRelay`, `MQTT`, `Bluetooth-GATT`, `HTTP-Webhook`). Real IoT hardware can be connected directly via the Web Bluetooth API.

### GATT Service Specification
- **Service UUID:** `0x181A` (Environmental Sensing)
- **Custom Power Characteristic:** `0x2A6E` (Active Power in Watts, Read/Notify)
- **Custom Relay Switch Characteristic:** `0x2A56` (Digital Output, Read/Write)

### ESP32 Arduino Sketch (`esp32_aurasync_meter.ino`)
```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "0000181A-0000-1000-8000-00805F9B34FB"
#define POWER_CHAR_UUID     "00002A6E-0000-1000-8000-00805F9B34FB"
#define RELAY_CHAR_UUID     "00002A56-0000-1000-8000-00805F9B34FB"
#define RELAY_PIN           26

BLECharacteristic *pPowerChar;
BLECharacteristic *pRelayChar;

class RelayCallback : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    uint8_t* val = pCharacteristic->getData();
    if (val != nullptr) {
      digitalWrite(RELAY_PIN, val[0] == 0x01 ? HIGH : LOW);
      Serial.printf("AuraSync Relay set to: %d\n", val[0]);
    }
  }
};

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);

  BLEDevice::init("AuraSync-DSATM-Meter-01");
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);

  pPowerChar = pService->createCharacteristic(
    POWER_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pPowerChar->addDescriptor(new BLE2902());

  pRelayChar = pService->createCharacteristic(
    RELAY_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE
  );
  pRelayChar->setCallbacks(new RelayCallback());

  pService->start();
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->start();
  Serial.println("AuraSync BLE Energy Meter Broadcasting...");
}

void loop() {
  // Read CT sensor or simulated power
  uint32_t activeWatts = 1950; // e.g. Lab 204 AC draw
  pPowerChar->setValue((uint8_t*)&activeWatts, sizeof(activeWatts));
  pPowerChar->notify();
  delay(2000);
}
```

---

## 📹 IP / RTSP Camera Bridge Setup

For streaming institutional ONVIF/RTSP CCTV feeds into the Vision Lab, run a lightweight Node.js `fluent-ffmpeg` bridge:
```bash
# Example conversion of campus RTSP stream to WebRTC/MJPEG endpoint:
ffmpeg -rtsp_transport tcp -i rtsp://admin:dsatm2026@192.168.1.120:554/live/ch0 \
  -f mjpeg -q:v 3 -r 10 http://localhost:8080/feed/lab204.mjpg
```

---

## 🗺️ How Any College Can Adopt AuraSync

AuraSync is 100% config-driven. To deploy for another university:
1. Copy `/server/src/data/campus.json` and adjust building footprints, heights, and coordinates.
2. Update `/server/src/config/institution.json` with the new university name, parent group, and mission statements.
3. Update sanctioned kVA and local state grid tariff slabs in Settings.

---

## 🌟 Hackathon 3-Minute Flawless Demo Script

1. **Landing Page:** Open `http://localhost:5173`. Scroll through the Apple-style story, DSATM statements, and projected savings counters.
2. **Login:** Click Sign In, select **"HOD (AIML Dept)"** on the demo credentials chip, and submit.
3. **Dynamic Island:** Greeted with live campus draw (142 kW) and rotating Dayananda Sagar statement. Right-click and hold (300ms) to drag the island to a corner.
4. **3D DSATM Twin (`/campus`):** Fly through the 3D campus. Toggle **"Explode Floors 3D"** to see separated levels. Toggle **"GAP"** overlay to see Lab 204 pulsing in red.
5. **Population Simulator (`/simulate`):** Drag the **Students Present** slider to 1000 and watch Real kW rise. Select scenario "Fest Day".
6. **Vision Lab (`/vision`):** Click **"Operator Leaves Room"**. Notice the Dynamic Island instantly triggers an Energy Ghost Alert.
7. **Aura AI Coach (`/coach`):** Ask Aura AI for a peak demand clipping strategy. Switch to **CFO Mode** to view Indian Rupee savings. Click **"Simulate in What-If Engine"**.
8. **Campus Eco Switch (`/control`):** Open Master Switch. Enter Passkey PIN `123456`. Watch 48 kW shed with celebratory confetti.
9. **Helpdesk Lifecycle (`/helpdesk`):**
   - Submit a 3-tap report: "Overflowing bin near Block-C".
   - Open HOD Kanban (`/helpdesk/board`), click **Smart Assign** to dispatch Suma Narayana.
   - Open Worker Tasks (`/helpdesk/my-tasks`), click **Complete & Transmit Evidence** with after-photo.
10. **Carbon Center (`/carbon`):** Review Scope 1, 2, 3 breakdown and click **"Download Green Audit PDF"** to export the official report.
11. **About Page (`/about`):** Type **"o1"** anywhere on the keyboard to trigger the O(1) Outlaws celebration easter egg!

---
*Developed with pride by **O(1) Outlaws: AIML Engineers of DSATM** for Dayananda Sagar Academy of Technology & Management.*
