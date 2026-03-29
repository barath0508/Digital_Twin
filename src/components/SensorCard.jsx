import { motion } from 'framer-motion';

const SensorCard = ({ title, value, unit, icon: Icon, percentage, status = 'normal' }) => {
  // Determine color based on status
  const getColorClasses = () => {
    switch (status) {
      case 'danger': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-800/40 text-blue-400 border-blue-500/30';
    }
  };

  const getBarColor = () => {
    switch (status) {
      case 'danger': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]';
      case 'warning': return 'bg-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]';
      case 'success': return 'bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]';
      default: return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className={`glass-panel p-5 rounded-xl border relative overflow-hidden flex flex-col justify-between h-full ${status === 'danger' ? 'animate-[pulse_2s_infinite]' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-300 font-medium text-sm z-10">{title}</h3>
        <div className={`p-2 rounded-lg ${getColorClasses()} z-10`}>
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <div className="mb-4 z-10">
        <div className="flex items-baseline gap-1">
          <motion.span
            key={value}
            initial={{ scale: 1.2, color: '#fff' }}
            animate={{ scale: 1, color: 'rgb(243, 244, 246)' }}
            transition={{ duration: 0.3 }}
            className="text-3xl font-bold tracking-tight"
          >
            {value}
          </motion.span>
          <span className="text-gray-400 font-medium ml-1">{unit}</span>
        </div>
      </div>

      <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-1 z-10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 10 }}
          className={`h-1.5 rounded-full ${getBarColor()}`}
        />
      </div>

      {/* Background soft glow based on status */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none ${status === 'danger' ? 'bg-red-500' :
          status === 'warning' ? 'bg-yellow-500' :
            status === 'success' ? 'bg-green-500' : 'bg-blue-500'
        }`} />
    </motion.div>
  );
};

export default SensorCard;
