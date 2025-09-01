import { motion } from "framer-motion";
import { TrendingUp, Activity, Shield, Zap } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  animated?: boolean;
}

export function StatsCard({ label, value, icon, trend, animated = false }: StatsCardProps) {
  const formatValue = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  return (
    <motion.div
      className="glass-card rounded-xl p-4 transition-smooth hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg glass-card">
            {icon}
          </div>
          <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <motion.p 
              className="text-2xl font-bold"
              initial={animated ? { scale: 1 } : {}}
              animate={animated ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              {formatValue(value)}
            </motion.p>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-muted-foreground'
          }`}>
            <TrendingUp className="h-4 w-4" />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface StatsBarProps {
  totalTransactions: number;
  todayTransactions: number;
  maliciousTransactions: number;
  contractsAnalyzedToday: number;
  isLive: boolean;
  onToggleLive: () => void;
}

export function StatsBar({ 
  totalTransactions, 
  todayTransactions, 
  maliciousTransactions,
  contractsAnalyzedToday,
  isLive, 
  onToggleLive 
}: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <StatsCard
        label="Total Tracked"
        value={totalTransactions}
        icon={<Activity className="h-5 w-5 text-primary" />}
        trend={12}
        animated={isLive}
      />
      <StatsCard
        label="Today"
        value={todayTransactions}
        icon={<Zap className="h-5 w-5 text-yellow-400" />}
        trend={8}
        animated={isLive}
      />
      <motion.div
        className={`glass-card rounded-xl p-4 transition-smooth hover:scale-105 ${
          maliciousTransactions > 0 ? 'animate-pulse' : ''
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg glass-card">
              <Shield className={`h-5 w-5 ${maliciousTransactions > 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Malicious Contracts</p>
              <motion.p 
                className={`text-2xl font-bold ${maliciousTransactions > 0 ? 'text-red-400' : 'text-green-400'}`}
                animate={maliciousTransactions > 0 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.6, ease: "easeInOut", repeat: maliciousTransactions > 0 ? Infinity : 0, repeatDelay: 2 }}
              >
                {maliciousTransactions}
              </motion.p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm ${
            maliciousTransactions > 0 ? 'text-red-400' : 'text-green-400'
          }`}>
            <TrendingUp className="h-4 w-4" />
            <span>-5%</span>
          </div>
        </div>
      </motion.div>
      <StatsCard
        label="Contracts Analyzed Today"
        value={contractsAnalyzedToday}
        icon={<Shield className="h-5 w-5 text-blue-400" />}
        trend={15}
        animated={isLive}
      />
      <motion.div
        className="glass-card rounded-xl p-4 flex items-center justify-between"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">
            {isLive ? 'Live Updates' : 'Paused'}
          </span>
        </div>
        <motion.button
          onClick={onToggleLive}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-smooth ${
            isLive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {isLive ? 'Pause' : 'Resume'}
        </motion.button>
      </motion.div>
    </div>
  );
}