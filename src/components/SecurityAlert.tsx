import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Eye } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";

interface SecurityAlertProps {
  transaction: Transaction;
  onViewTransaction: (transaction: Transaction) => void;
  onDismiss: () => void;
}

export function SecurityAlert({ transaction, onViewTransaction, onDismiss }: SecurityAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Wait for exit animation
  };

  const handleViewTransaction = () => {
    onViewTransaction(transaction);
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md"
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="glass-card rounded-xl p-4 border-2 border-red-500 bg-red-500/10 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              {/* Alert Icon */}
              <motion.div
                className="p-2 rounded-full bg-red-500/20 flex-shrink-0"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0.4)",
                    "0 0 0 10px rgba(239, 68, 68, 0)",
                    "0 0 0 0 rgba(239, 68, 68, 0)"
                  ]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </motion.div>

              {/* Alert Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-red-400">
                    🚨 MALICIOUS CONTRACT DETECTED
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-red-200 mb-3 leading-relaxed">
                  A transaction involving a malicious contract was detected. 
                  {transaction.contractName && ` Contract: ${transaction.contractName}`}
                </p>

                {/* Transaction Info */}
                <div className="bg-red-500/10 rounded-lg p-2 mb-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-red-300">Amount:</span>
                    <span className="font-mono text-red-200">
                      ${transaction.amountUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-300">To:</span>
                    <span className="font-mono text-red-200 truncate ml-2">
                      {transaction.to.slice(0, 10)}...{transaction.to.slice(-8)}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleViewTransaction}
                  size="sm"
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50"
                >
                  <Eye className="h-3 w-3 mr-2" />
                  View Transaction Details
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div
              className="mt-3 h-1 bg-red-500/20 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface SecurityAlertManagerProps {
  alerts: Array<{
    id: string;
    transaction: Transaction;
  }>;
  onViewTransaction: (transaction: Transaction) => void;
  onDismissAlert: (id: string) => void;
}

export function SecurityAlertManager({ 
  alerts, 
  onViewTransaction, 
  onDismissAlert 
}: SecurityAlertManagerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: index * 0.1 }
            }}
          >
            <SecurityAlert
              transaction={alert.transaction}
              onViewTransaction={onViewTransaction}
              onDismiss={() => onDismissAlert(alert.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}


