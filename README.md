# ⚡ Energize Digital Twin

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![MQTT](https://img.shields.io/badge/MQTT-Live-purple?style=for-the-badge&logo=mqtt&logoColor=white)

**A real-time AI-powered industrial digital twin dashboard for ESP32-based environmental monitoring, featuring interactive 3D visualization, live telemetry streaming, and Google Gemini neural analysis.**

[Live Demo](https://github.com/barath0508/Digital_Twin) · [Report Bug](https://github.com/barath0508/Digital_Twin/issues)

</div>

---

## ✨ Features

### 🤖 AI-Powered Neural Analysis
- **Google Gemini 2.5 Flash** integration for real-time environmental intelligence
- Structured JSON response schema — generates risk scores (0–100), status (`stable` / `warning` / `critical`), and up to 3 prioritized insights
- Smart **15-second throttle** to prevent API quota exhaustion during high-frequency MQTT streams
- Visual **"Computing"** state (indigo pulsing) shows when Gemini is analyzing data
- Graceful fallback mode when API key is not configured

### 🏭 Interactive 3D Factory Scene
- **`<model-viewer>`** rendering a full GLB factory model with environment mapping and auto-rotation
- **4 interactive zone beacons** — click to zoom the camera into that factory area:
  - 🔵 **Thermal Core** — Temperature & Humidity sensors
  - 🟢 **Ventilation System** — CO₂ & Flow Rate
  - 🔴 **Combustion Chamber** — Carbon Monoxide & Thermal safety
  - 🟡 **Acoustic Array** — Noise levels & Vibration
- Zone detail panels slide in with **live telemetry**, warning highlights, and risk scores
- Camera animates smoothly back to default orbit on close

### 📡 Live Telemetry Streaming
- **MQTT over WebSocket** — connects directly to ESP32 sensor node
- Live sensor cards: **Temperature, Humidity, CO₂, CO, Noise**
- Animated progress bars with spring physics (Framer Motion)
- Status-aware color themes: cyan (normal) → amber (warning) → rose (critical)

### 🎨 Premium Energize Design System
- Glassmorphism panels with `backdrop-blur` and layered borders
- **Mesh gradient** background with violet/cyan radial blurs (ported from Energize 2026)
- **Shimmer card** sweep-light effect on hover (ported from Portfolio)
- **Magnetic micro-animations** via `framer-motion` spring physics
- **GSAP entrance timeline** — staggered `fromTo` animations on mount
- **Hologram scan** sweeping line overlay on 3D viewer
- Pulsing beacon rings with `@keyframes beacon-ring` expand animations

### 📱 Mobile Responsive
- Stacked vertical layout on small screens; side-by-side grid on desktop (`lg:grid-cols-12`)
- 3D zone detail panel repositions from bottom-sheet (mobile) to right sidebar (desktop)
- Footer wraps and centers on narrow viewports
- Touch-friendly beacon hotspot sizing

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS 4 + Vanilla CSS |
| 3D Viewer | `<model-viewer>` Web Component |
| Animations | GSAP 3, Framer Motion 12 |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| IoT Protocol | MQTT over WebSocket |
| Icons | Lucide React |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- An ESP32 running firmware that publishes MQTT sensor data
- A Google AI Studio API key (for Gemini integration)

### Installation

```bash
git clone https://github.com/barath0508/Digital_Twin.git
cd Digital_Twin
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_THINGSPEAK_CHANNEL=your_channel_id
VITE_THINGSPEAK_API_KEY=your_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

> Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📊 Sensor Mapping

| Sensor | Field | Warning Threshold | Critical Threshold |
|--------|-------|-------------------|-------------------|
| Temperature | `dht11.temp` | > 30°C | > 35°C |
| Humidity | `dht11.humidity` | — | — |
| CO₂ | `co2` | > 800 ppm | > 1000 ppm |
| Carbon Monoxide | `co` | > 20 ppm | > 50 ppm |
| Noise | `noise` | > 600 mV | > 700 mV |

---

## 🔌 MQTT Payload Format

Expected JSON published from the ESP32:

```json
{
  "node": "THERMAL_PLANT_01",
  "timestamp": 1712345678000,
  "dht11": {
    "temp": 29.5,
    "humidity": 62.1
  },
  "co2": 710,
  "co": 8,
  "noise": 480,
  "flow": 3.2
}
```

---

## 🧠 AI Analysis Logic

The `useAiAnalysis` hook sends sensor readings to Gemini every **15 seconds** (throttled) and requests a structured response:

```json
{
  "riskScore": 45,
  "status": "warning",
  "insights": [
    { "type": "warning", "text": "CO₂ trending above 800ppm — ventilation recommended." },
    { "type": "danger",  "text": "Temperature approaching thermal stress threshold." }
  ]
}
```

The dashboard renders these insights in the **Neural Core Analysis** panel with appropriate icon and color coding.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ThreeScene.jsx       # Interactive 3D viewer with zone hotspots & detail panels
│   ├── AiAnalysisPanel.jsx  # Gemini output panel — risk gauge, insights list
│   └── SensorCard.jsx       # Individual telemetry metric cards
├── hooks/
│   └── useAiAnalysis.js     # Gemini 2.5 Flash integration with throttle + fallback
├── useMqtt.js               # MQTT WebSocket connection hook
├── App.jsx                  # Root layout, GSAP entrance, sensor status logic
└── index.css                # Design system — glassmorphism, beacons, animations
```

---

## 📸 Screenshots

> Desktop — all panels live with telemetry streaming and zone detail open on the Ventilation System beacon.

---

## 📄 License

MIT © [Barath](https://github.com/barath0508)
