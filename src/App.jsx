import React, { useState, useEffect, useRef } from 'react';
import { Activity, Thermometer, Wind, Waves, Gauge, AlertTriangle, Wifi, WifiOff, HardDrive, BrainCircuit } from 'lucide-react';
import gsap from 'gsap';
import useMqtt from './useMqtt';
import useAiAnalysis from './hooks/useAiAnalysis';
import SensorCard from './components/SensorCard';
import ThreeScene from './components/ThreeScene';
import AiAnalysisPanel from './components/AiAnalysisPanel';

function App() {
  const { data, connected } = useMqtt();
  const analysis = useAiAnalysis(data);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const cardsContainerRef = useRef(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.header-element', 
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: 'power3.out' }
      );

      gsap.fromTo('.sensor-card-anim', 
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, stagger: 0.1, duration: 0.8, delay: 0.3, ease: 'back.out(1.5)' }
      );

      gsap.fromTo('.hologram-container',
        { opacity: 0, filter: 'blur(10px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 1.5, delay: 0.1, ease: 'power3.out' }
      );
      
      gsap.fromTo('.footer-element',
         { opacity: 0, y: 20 },
         { opacity: 1, y: 0, stagger: 0.1, duration: 1, delay: 0.8, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  // Compute status for different sensors based on thresholds
  const getStatus = (value, warning, danger) => {
    if (value >= danger) return 'danger';
    if (value >= warning) return 'warning';
    return 'success';
  };

  const getCO2Status = data ? getStatus(data.co2, 800, 1000) : 'normal';
  const getCOStatus = data ? getStatus(data.co, 20, 50) : 'normal';
  const getNoiseStatus = data ? getStatus(data.noise, 600, 700) : 'normal';
  const getTempStatus = data ? getStatus(data.dht11.temp, 30, 35) : 'normal';

  return (
    <div className="min-h-screen font-sans flex flex-col p-4 md:p-6 lg:p-8 overflow-x-hidden lg:overflow-hidden lg:h-screen text-slate-200 relative">
      <div className="mesh-gradient pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 pb-4 border-b border-slate-800/60 relative z-20">
        <div className="header-element magnetic-item">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <BrainCircuit className="text-cyan-400 w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400">
               Energize Digital Twin
            </h1>
            <div className={`h-2 w-2 rounded-full ${connected ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} />
          </div>
          <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 opacity-70">
            <HardDrive size={12} /> System Node: <span className="text-cyan-400">{data?.node || 'SCANNING...'}</span>
          </p>
        </div>

        <div className="header-element flex flex-col items-end gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black tracking-widest uppercase backdrop-blur-md transition-all duration-500 ${connected
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_-5px_rgba(6,182,212,0.5)]'
              : data
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
            {connected ? (
              <><Wifi size={14} /> <span>Link Established</span></>
            ) : data ? (
              <><Activity size={14} /> <span>Simulation Active</span></>
            ) : (
              <><WifiOff size={14} /> <span>Connecting...</span></>
            )}
            <div className={`w-2 h-2 rounded-full ml-1 ${connected ? 'bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]' : data ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse'
              }`} />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 relative z-10">

        {/* Left Panel: 3D Environment (8 cols) */}
        <div className="lg:col-span-8 flex flex-col relative h-[50vh] min-h-[400px] lg:h-full hologram-container">
          <div className="absolute top-4 left-4 z-20 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black tracking-widest text-cyan-400 border-cyan-500/30 uppercase bg-slate-900/60 shadow-lg">
            <Activity size={12} className="animate-pulse" />
            Spatial Core Runtime
          </div>
          <ThreeScene data={data} analysis={analysis} />

          {/* Disconnected Overlay */}
          {!connected && !data && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center p-8 glass-panel border-cyan-500/20 text-cyan-400 text-center">
                <BrainCircuit size={64} className="mb-6 animate-pulse opacity-80" />
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Initialising Neural Link</h3>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Synchronizing with system nodes...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: AI & Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col lg:h-full lg:overflow-hidden space-y-4">
          
          {/* AI Analysis Section */}
          <div className="flex-shrink-0 lg:h-[40%] h-auto">
             <AiAnalysisPanel analysis={analysis} />
          </div>

          {/* Telemetry Cards Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-3 flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-500 rounded-full" />
              Live Telemetry Stream
            </h2>

            <div ref={cardsContainerRef} className="flex-1 overflow-y-auto pr-1 pb-4 hide-scrollbar space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="sensor-card-anim">
                  <SensorCard
                    title="Temperature"
                    value={data?.dht11?.temp?.toFixed(1) || '--'}
                    unit="°C"
                    icon={Thermometer}
                    percentage={data ? (data.dht11.temp / 50) * 100 : 0}
                    status={getTempStatus}
                  />
                </div>
                <div className="sensor-card-anim">
                  <SensorCard
                    title="Humidity"
                    value={data?.dht11?.humidity?.toFixed(1) || '--'}
                    unit="%"
                    icon={Waves}
                    percentage={data?.dht11?.humidity || 0}
                    status="success"
                  />
                </div>
              </div>

              <div className="sensor-card-anim">
                <SensorCard
                  title="Noise Level"
                  value={data?.noise || '--'}
                  unit="mV"
                  icon={Activity}
                  percentage={data ? (data.noise / 1024) * 100 : 0}
                  status={getNoiseStatus}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="sensor-card-anim">
                  <SensorCard
                    title="CO₂ Level"
                    value={data?.co2 || '--'}
                    unit="ppm"
                    icon={AlertTriangle}
                    percentage={data ? (data.co2 / 2000) * 100 : 0}
                    status={getCO2Status}
                  />
                </div>
                <div className="sensor-card-anim">
                  <SensorCard
                    title="CO Level"
                    value={data?.co || '--'}
                    unit="ppm"
                    icon={AlertTriangle}
                    percentage={data ? (data.co / 100) * 100 : 0}
                    status={getCOStatus}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-600 tracking-widest uppercase z-20 px-2 footer-element">
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div className="flex items-center gap-2 footer-element">
            <span className="opacity-50">Last Update:</span>
            <span className="text-cyan-500/80 bg-cyan-500/5 px-2 py-1 rounded border border-cyan-500/10">
              {data ? new Date(data.timestamp).toLocaleTimeString() : 'WAITING...'}
            </span>
          </div>
          <div className="hidden sm:block h-1 w-1 rounded-full bg-slate-800" />
          <span className="opacity-50 footer-element">Refresh Rate: 5,000ms</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 opacity-80 footer-element">
          <span className="opacity-50">System Local Time:</span> {currentTime}
        </div>
      </footer>

    </div>
  );
}

export default App;
