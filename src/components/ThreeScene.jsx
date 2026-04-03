import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Thermometer, Wind, Waves, Activity, AlertTriangle, Gauge, Zap } from 'lucide-react';

// ── Zone definitions ─────────────────────────────────────────────────────────
// data-position and data-normal are in model-viewer's coordinate space.
// These are reasonable defaults; adjust if beacons appear off-model.
const ZONES = [
  {
    id: 'thermal',
    label: 'Thermal Core',
    icon: Thermometer,
    color: 'cyan',
    colorHex: '#06b6d4',
    glowRgb: '6,182,212',
    // Hotspot anchor: top/centre area of factory structure
    position: '0 1.8 0.5',
    normal: '0 1 0',
    // Camera zoom target
    cameraOrbit: '15deg 70deg 55%',
    fov: '22deg',
    description: 'Primary heat exchange and environmental monitoring cluster',
    sensors: (data) => [
      { label: 'Temperature', value: data?.dht11?.temp?.toFixed(1), unit: '°C', icon: Thermometer, warn: data?.dht11?.temp > 30 },
      { label: 'Humidity',    value: data?.dht11?.humidity?.toFixed(1), unit: '%',  icon: Waves,       warn: false },
    ],
  },
  {
    id: 'ventilation',
    label: 'Ventilation System',
    icon: Wind,
    color: 'emerald',
    colorHex: '#10b981',
    glowRgb: '16,185,129',
    position: '-0.8 1.2 -0.3',
    normal: '-1 0 0',
    cameraOrbit: '-40deg 75deg 55%',
    fov: '22deg',
    description: 'Air circulation, CO₂ scrubbing and flow-rate control systems',
    sensors: (data) => [
      { label: 'CO₂ Level', value: data?.co2,  unit: 'ppm', icon: Wind,  warn: data?.co2 > 800 },
      { label: 'Flow Rate', value: data?.flow ?? '--', unit: 'L/s', icon: Gauge, warn: false },
    ],
  },
  {
    id: 'combustion',
    label: 'Combustion Chamber',
    icon: AlertTriangle,
    color: 'rose',
    colorHex: '#f43f5e',
    glowRgb: '244,63,94',
    position: '0.9 0.8 0.2',
    normal: '1 0 0',
    cameraOrbit: '60deg 80deg 50%',
    fov: '20deg',
    description: 'High-risk combustion monitoring — CO & thermal safety sensors',
    sensors: (data) => [
      { label: 'CO Level',    value: data?.co,                unit: 'ppm', icon: AlertTriangle, warn: data?.co > 20 },
      { label: 'Temperature', value: data?.dht11?.temp?.toFixed(1), unit: '°C',  icon: Thermometer,   warn: data?.dht11?.temp > 32 },
    ],
  },
  {
    id: 'acoustic',
    label: 'Acoustic Array',
    icon: Activity,
    color: 'amber',
    colorHex: '#f59e0b',
    glowRgb: '245,158,11',
    position: '0.1 0.5 1.1',
    normal: '0 0 1',
    cameraOrbit: '5deg 85deg 50%',
    fov: '24deg',
    description: 'Vibration, noise emission and mechanical stress telemetry',
    sensors: (data) => [
      { label: 'Noise Level',  value: data?.noise, unit: 'mV', icon: Activity, warn: data?.noise > 600 },
      { label: 'Vibration',    value: data?.noise ? (data.noise / 1024 * 9.8).toFixed(2) : '--', unit: 'm/s²', icon: Zap, warn: false },
    ],
  },
];

const DEFAULT_ORBIT = '30deg 75deg 75%';
const DEFAULT_FOV   = '30deg';

// ── Color helpers ─────────────────────────────────────────────────────────────
const colorMap = {
  cyan:    { border: 'border-cyan-500/60',    bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  emerald: { border: 'border-emerald-500/60', bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  rose:    { border: 'border-rose-500/60',    bg: 'bg-rose-500/10',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  amber:   { border: 'border-amber-500/60',   bg: 'bg-amber-500/10',   text: 'text-amber-400',  badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

// ── Component ─────────────────────────────────────────────────────────────────
const ThreeScene = ({ data, analysis }) => {
  const modelRef   = useRef(null);
  const [activeZone, setActiveZone]   = useState(null);
  const [isZooming,  setIsZooming]    = useState(false);
  const { riskScore, status } = analysis || { riskScore: 0, status: 'stable' };
  const isAnomaly = status === 'critical';

  // Apply camera orbit when a zone is selected / deselected
  useEffect(() => {
    const mv = modelRef.current;
    if (!mv) return;

    if (activeZone) {
      setIsZooming(true);
      mv.setAttribute('auto-rotate', '');  // pause auto-rotate while zoomed
      mv.setAttribute('camera-orbit', activeZone.cameraOrbit);
      mv.setAttribute('field-of-view', activeZone.fov);
      // remove auto-rotate attr so it stops spinning
      mv.removeAttribute('auto-rotate');
      setTimeout(() => setIsZooming(false), 800);
    } else {
      mv.setAttribute('camera-orbit', DEFAULT_ORBIT);
      mv.setAttribute('field-of-view', DEFAULT_FOV);
      mv.setAttribute('auto-rotate', '');
    }
  }, [activeZone]);

  const handleZoneClick = (zone) => {
    setActiveZone(prev => prev?.id === zone.id ? null : zone);
  };

  const handleClose = () => setActiveZone(null);

  const zone  = activeZone;
  const c     = zone ? colorMap[zone.color] : null;
  const sensorRows = zone && data ? zone.sensors(data) : [];

  return (
    <div className="w-full h-full relative border border-slate-700/40 rounded-2xl overflow-hidden bg-slate-950">

      {/* 3D Model Viewer */}
      <model-viewer
        ref={modelRef}
        alt="Factory Industrial Installation 3D Model"
        src="/factory_industrial_installation.glb"
        autoplay
        auto-rotate
        camera-controls
        touch-action="pan-y"
        camera-orbit={DEFAULT_ORBIT}
        field-of-view={DEFAULT_FOV}
        min-camera-orbit="auto 40deg auto"
        max-camera-orbit="auto 90deg auto"
        shadow-intensity="1.5"
        environment-intensity="1.2"
        exposure="1.2"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {/* Hotspot Beacons — one per zone */}
        {ZONES.map((z) => (
          <button
            key={z.id}
            slot={`hotspot-${z.id}`}
            data-position={z.position}
            data-normal={z.normal}
            className={`hotspot-beacon ${
              z.color === 'rose'  ? 'danger-zone'  :
              z.color === 'amber' ? 'warning-zone' : ''
            }`}
            onClick={() => handleZoneClick(z)}
            title={z.label}
            style={{ '--zone-color': z.colorHex }}
          >
            {/* Inner dot */}
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: z.colorHex,
              boxShadow: `0 0 6px ${z.colorHex}`,
              display: 'block'
            }} />
          </button>
        ))}
      </model-viewer>

      {/* Holographic Scanner Effects */}
      <div className="absolute inset-0 pointer-events-none hologram-scan opacity-20" />

      {/* Corner Brackets (Scanner HUD) */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-32 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-32 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30 rounded-br-lg pointer-events-none" />

      {/* Zone Legend Pills (top bar) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
        {!activeZone && ZONES.map((z) => (
          <div key={z.id} className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
            style={{ background: `${z.colorHex}18`, border: `1px solid ${z.colorHex}40`, color: z.colorHex }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: z.colorHex, display: 'inline-block' }} />
            {z.label.split(' ')[0]}
          </div>
        ))}
        {activeZone && (
          <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse"
            style={{ background: `${zone.colorHex}20`, border: `1px solid ${zone.colorHex}60`, color: zone.colorHex }}>
            🔍 Zoomed: {zone.label}
          </div>
        )}
      </div>

      {/* ── Zone Detail Panel ── */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            key={activeZone.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="zone-panel"
          >
            <div
              className={`glass-panel p-5 rounded-2xl border-l-4 shadow-2xl`}
              style={{
                borderLeftColor: zone.colorHex,
                boxShadow: `0 0 40px -10px rgba(${zone.glowRgb},0.5), 0 20px 60px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl border" style={{ background: `${zone.colorHex}18`, borderColor: `${zone.colorHex}40` }}>
                    <zone.icon size={18} style={{ color: zone.colorHex }} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-white">{zone.label}</h4>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Zone ID: {zone.id.toUpperCase()}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all duration-200 pointer-events-auto"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4 border-l-2 pl-3"
                style={{ borderColor: `${zone.colorHex}50` }}>
                {zone.description}
              </p>

              {/* Live Sensor Readings */}
              <div className="space-y-2 mb-4">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2">Live Telemetry</p>
                {sensorRows.length > 0 ? sensorRows.map((row, i) => (
                  <div key={i}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300 ${
                      row.warn
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : `border-slate-700/50 bg-slate-800/40`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <row.icon size={13} className={row.warn ? 'text-rose-400' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-lg font-black tracking-tighter ${row.warn ? 'text-rose-300' : 'text-white'}`}>
                        {row.value ?? '--'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{row.unit}</span>
                    </div>
                  </div>
                )) : (
                  <div className="px-3 py-4 rounded-xl border border-slate-700/30 bg-slate-800/20 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Awaiting sensor feed...
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                  Neural Risk Score
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${riskScore}%`,
                        background: riskScore > 70 ? '#f43f5e' : riskScore > 30 ? '#f59e0b' : zone.colorHex,
                        boxShadow: `0 0 8px ${zone.colorHex}`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-black" style={{ color: zone.colorHex }}>{riskScore}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact status HUD (only when no zone is active) */}
      {!activeZone && data && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className={`flex items-center gap-4 px-4 py-2.5 rounded-full backdrop-blur-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
            status === 'computing' ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300'
            : isAnomaly            ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
            :                        'bg-slate-900/80 border-cyan-500/30 text-cyan-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              status === 'computing' ? 'bg-indigo-400 animate-bounce'
              : isAnomaly            ? 'bg-rose-400 animate-ping'
              :                        'bg-cyan-400'
            }`} />
            <span>{data.node || 'SYS'} · {status}</span>
            <span className="text-slate-500">|</span>
            <span>{data.dht11?.temp?.toFixed(1)}°C</span>
            <span className="text-slate-500">|</span>
            <span>CO₂ {data.co2} ppm</span>
            <span className="text-slate-500">|</span>
            <span>Risk <span style={{ color: isAnomaly ? '#f43f5e' : '#06b6d4' }}>{riskScore}%</span></span>
          </div>
        </div>
      )}

      {/* Dynamic Glow Overlay for Critical States */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isAnomaly ? 'opacity-30' : 'opacity-0'}`}>
        <div className="w-full h-full bg-rose-500/20 mix-blend-overlay" />
      </div>

      {/* Decorative gradient for the bottom of the 3D window */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default ThreeScene;
