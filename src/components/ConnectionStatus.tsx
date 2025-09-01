import { motion } from "framer-motion";
import { Wifi, WifiOff, Globe, Clock } from "lucide-react";
import { format } from "date-fns";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdate: Date;
  network?: string;
}

export function ConnectionStatus({ 
  isConnected = true, 
  lastUpdate = new Date(), 
  network = "Ethereum Mainnet" 
}: ConnectionStatusProps) {
  return (
    <motion.footer 
      className="glass-card rounded-xl p-4 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}
            animate={{
              scale: isConnected ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isConnected ? Infinity : 0,
            }}
          />
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            Connected to {network}
          </span>
        </div>

        {/* Last Update */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last update: {format(lastUpdate, 'HH:mm:ss')}</span>
        </div>

        {/* WebSocket Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-green-400">WebSocket Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-400" />
              <span className="text-red-400">WebSocket Disconnected</span>
            </>
          )}
        </div>
      </div>
    </motion.footer>
  );
}