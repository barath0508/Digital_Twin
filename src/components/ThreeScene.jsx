import React from 'react';

const ThreeScene = ({ data }) => {
  const isAnomaly = data && (data.co2 > 900 || data.co > 35 || data?.dht11?.temp > 35);

  return (
    <div className="w-full h-full relative border border-slate-700/40 rounded-2xl overflow-hidden" style={{ background: '#020817' }}>
      
      {/* 3D Model Viewer using the Web Component */}
      {/* Note: React 19 supports web components nicely without casing workarounds */}
      <model-viewer
        alt="Factory Industrial Installation 3D Model"
        src="/factory_industrial_installation.glb"
        autoplay
        auto-rotate
        camera-controls
        touch-action="pan-y"
        disable-zoom
        camera-orbit="30deg 75deg 105%"
        min-camera-orbit="auto 75deg auto"
        max-camera-orbit="auto 75deg auto"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      ></model-viewer>

      {/* Embedded HUD Overlay mimicking the old 3D HUD */}
      {data && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-20">
          <div className={`rounded-xl backdrop-blur-md px-3 py-2 text-white text-[11px] font-mono border shadow-2xl transition-all duration-300
            ${isAnomaly
              ? 'bg-red-950/80 border-red-500/70 animate-pulse'
              : 'bg-slate-900/80 border-cyan-500/50'}`}
            style={{ minWidth: 150 }}>
            <div className="font-bold text-center mb-1 tracking-widest text-[10px] text-cyan-400">
              {data.node ? data.node.toUpperCase() : 'NODE'} {isAnomaly ? '⚠ ALERT' : '● NOMINAL'}
            </div>
            <div className="flex justify-between gap-3">
              <span>🌡 {data.dht11?.temp?.toFixed(1) || '--'}°C</span>
              <span>💧 {data.dht11?.humidity?.toFixed(0) || '--'}%</span>
            </div>
            <div className="flex justify-between gap-3 mt-0.5">
              <span>CO₂ {data.co2 || '--'}</span>
              <span>CO {data.co || '--'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Decorative gradient for the bottom of the 3D window */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default ThreeScene;
