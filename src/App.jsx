import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Wind, Waves, Gauge, AlertTriangle, Wifi, WifiOff, HardDrive } from 'lucide-react';
import useMqtt from './useMqtt';
import SensorCard from './components/SensorCard';
import ThreeScene from './components/ThreeScene';

function App() {
  const { data, connected } = useMqtt();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
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
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">

      {/* Header */}
      <header className="flex justify-between items-end mb-6 pb-4 border-b border-slate-800/60 relative z-20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
              Environmental Digital Twin Dashboard
            </h1>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <HardDrive size={14} /> Node Monitor: <span className="text-slate-200 font-semibold">{data?.node || 'Scanning...'}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm backdrop-blur-md transition-colors duration-500 ${connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : data
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
            {connected ? (
              <><Wifi size={16} /> <span className="font-medium tracking-wide">MQTT ONLINE</span></>
            ) : data ? (
              <><Activity size={16} /> <span className="font-medium tracking-wide">SIMULATING</span></>
            ) : (
              <><WifiOff size={16} /> <span className="font-medium tracking-wide">CONNECTING...</span></>
            )}
            <div className={`w-2 h-2 rounded-full ml-1 ${connected ? 'bg-emerald-500 animate-pulse' : data ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'
              }`} />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 relative z-10">

        {/* Left Panel: 3D Environment */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col relative h-[50vh] lg:h-full">
          <div className="absolute top-4 left-4 z-20 glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-300 border-slate-700/50">
            <Activity size={12} className="text-blue-400" />
            3D SPATIAL VIEW
          </div>
          <ThreeScene data={data} />

          {/* Disconnected Overlay — only shown before ANY data (simulated or real) arrives */}
          {!connected && !data && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center p-6 glass-panel rounded-2xl border-red-500/30 text-red-400">
                <AlertTriangle size={48} className="mb-4 animate-pulse opacity-80" />
                <h3 className="text-xl font-bold mb-2">Initialising...</h3>
                <p className="text-sm text-slate-400">Starting simulation — attempting MQTT connection...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Sensor Cards */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full overflow-y-auto pr-1 pb-4 hide-scrollbar space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-1">Live Telemetry</h2>

          <div className="grid grid-cols-2 gap-4">
            <SensorCard
              title="Temperature"
              value={data?.dht11?.temp?.toFixed(1) || '--'}
              unit="°C"
              icon={Thermometer}
              percentage={data ? (data.dht11.temp / 50) * 100 : 0}
              status={getTempStatus}
            />
            <SensorCard
              title="Humidity"
              value={data?.dht11?.humidity?.toFixed(1) || '--'}
              unit="%"
              icon={Waves}
              percentage={data?.dht11?.humidity || 0}
              status="success"
            />
          </div>

          <SensorCard
            title="Barometric Pressure"
            value={data?.bmp180?.pressure?.toFixed(2) || '--'}
            unit="hPa"
            icon={Gauge}
            percentage={data ? ((data.bmp180.pressure - 900) / 200) * 100 : 0}
            status="normal"
          />

          <div className="grid grid-cols-2 gap-4">
            <SensorCard
              title="Noise Level"
              value={data?.noise || '--'}
              unit="mV"
              icon={Activity}
              percentage={data ? (data.noise / 1024) * 100 : 0}
              status={getNoiseStatus}
            />
            <SensorCard
              title="Flow Rate"
              value={data?.flow?.toFixed(1) || '--'}
              unit="L/min"
              icon={Wind}
              percentage={data ? (data.flow / 10) * 100 : 0}
              status="normal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-auto">
            <SensorCard
              title="CO₂ Level"
              value={data?.co2 || '--'}
              unit="ppm"
              icon={AlertTriangle}
              percentage={data ? (data.co2 / 2000) * 100 : 0}
              status={getCO2Status}
            />
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

      {/* Footer / Status Bar */}
      <footer className="mt-6 flex justify-between items-center text-xs text-slate-500 font-medium z-20">
        <div className="flex items-center gap-2">
          <span>Last Update:</span>
          {data ? (
            <span className="text-slate-300 bg-slate-800/50 px-2 py-1 rounded">
              {new Date(data.timestamp).toLocaleTimeString() || '--'}
            </span>
          ) : (
            <span className="text-slate-500 bg-slate-900/50 px-2 py-1 rounded">Waiting for data...</span>
          )}
        </div>
        <div>
          System Time: {currentTime}
        </div>
      </footer>

    </div>
  );
}

export default App;
