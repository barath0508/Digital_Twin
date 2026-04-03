import React, { useEffect, useRef } from 'react';
import { Activity, ShieldAlert, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const AiAnalysisPanel = ({ analysis }) => {
  const panelRef = useRef(null);
  const cardRef = useRef([]);

  useEffect(() => {
    // GSAP entrance animation
    const ctx = gsap.context(() => {
      gsap.from(panelRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
      
      gsap.from('.insight-item', {
        x: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 0.5,
        delay: 0.4,
        ease: 'power2.out'
      });
    }, panelRef);
    
    return () => ctx.revert();
  }, []);

  const { riskScore, insights, status, timestamp } = analysis;

  return (
    <div 
      ref={panelRef}
      className="glass-panel shimmer-card h-[400px] lg:h-full flex flex-col p-5 border-l-4"
      style={{ 
        borderLeftColor: status === 'critical' ? '#f43f5e' : status === 'warning' ? '#f59e0b' : '#10b981' 
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className={`w-8 h-8 ${status === 'computing' ? 'text-indigo-400 animate-spin-slow' : status === 'critical' ? 'text-rose-500' : 'text-cyan-400'}`} />
            <div className={`absolute -inset-1 rounded-full opacity-30 blur-sm animate-pulse ${status === 'computing' ? 'bg-indigo-500' : status === 'critical' ? 'bg-rose-500' : 'bg-cyan-500'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white uppercase text-glow-cyan">Neural Core Analysis</h3>
            <p className="text-[10px] font-medium text-slate-500 tracking-widest uppercase">Real-time Environmental Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/60 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono font-bold text-slate-400 self-end sm:self-auto tech-pill tech-pill-cyan">
           TS: {timestamp}
        </div>
      </div>

      {/* Main Analysis Gauge */}
      <div className="relative flex justify-center items-center py-6 mb-4">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke="rgba(15, 23, 42, 0.5)"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            fill="none"
            stroke={status === 'computing' ? '#818cf8' : status === 'critical' ? '#f43f5e' : status === 'warning' ? '#f59e0b' : '#06b6d4'}
            strokeWidth="8"
            strokeDasharray={364}
            strokeDashoffset={364 - (364 * riskScore) / 100}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${status === 'computing' ? 'opacity-50' : 'opacity-100'}`}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${status === 'computing' ? 'text-indigo-300 animate-pulse' : 'text-white'}`}>{riskScore}%</span>
          <span className="text-[9px] font-bold text-slate-500 tracking-tighter uppercase">Risk Level</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 self-center text-xs font-black uppercase tracking-widest transition-colors duration-500 ${
        status === 'computing'
          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
          : status === 'critical' 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
            : status === 'warning' 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      }`}>
        <div className={`w-2 h-2 rounded-full animate-ping ${status === 'computing' ? 'bg-indigo-500' : status === 'critical' ? 'bg-rose-500' : 'bg-cyan-500'}`} />
        {status === 'computing' ? 'Analyzing Nodes...' : `${status} State Confirmed`}
      </div>

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Activity size={12} className="text-cyan-400" />
          Critical Observations
        </h4>
        {insights.map((insight, idx) => (
          <div 
            key={idx}
            className="insight-item group flex gap-3 p-3 bg-slate-900/40 border border-slate-800/50 rounded-xl hover:border-cyan-500/30 hover:shadow-[0_4px_20px_-4px_rgba(6,182,212,0.3)] transition-all duration-300 magnetic-item"
          >
            <div className="flex-shrink-0 mt-0.5">
              {insight.type === 'danger' ? (
                <ShieldAlert size={16} className="text-rose-500" />
              ) : insight.type === 'warning' ? (
                <ShieldAlert size={16} className="text-amber-500" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-500" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs leading-relaxed text-slate-300 font-medium">
                {insight.text}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-500/60 uppercase group-hover:text-cyan-400 transition-colors">
                 Action required <ChevronRight size={10} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiAnalysisPanel;
