import { motion } from 'framer-motion';

const SensorCard = ({ title, value, unit, icon: Icon, percentage, status = 'normal' }) => {
  // Determine color based on status
  const getColorClasses = () => {
    switch (status) {
      case 'danger': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  const getBarColor = () => {
    switch (status) {
      case 'danger': return 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]';
      case 'warning': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]';
      case 'success': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]';
      default: return 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-panel shimmer-card p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between h-full group ${
        status === 'danger' ? 'animate-[pulse_2s_infinite]' : ''
      }`}
    >
      {/* Subtle Scanner Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase z-10">{title}</h3>
        <div className={`p-2 rounded-xl border ${getColorClasses()} z-10 transition-all duration-300 group-hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]`}>
          {Icon && <Icon size={16} />}
        </div>
      </div>

      <div className="mb-4 z-10">
        <div className="flex items-baseline gap-1">
          <motion.span
            key={value}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-black tracking-tighter italic text-white"
          >
            {value}
          </motion.span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{unit}</span>
        </div>
      </div>

      <div className="space-y-2 z-10">
        <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
           <span>Range</span>
           <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden p-[2px] border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 12 }}
            className={`h-full rounded-full ${getBarColor()}`}
          />
        </div>
      </div>

      {/* Decorative pulse element */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none transition-all duration-700 ease-out group-hover:scale-150 group-hover:opacity-40 ${
        status === 'danger' ? 'bg-rose-500' :
        status === 'warning' ? 'bg-amber-500' :
        status === 'success' ? 'bg-emerald-500' : 'bg-cyan-500'
      }`} />
    </motion.div>
  );
};

export default SensorCard;
