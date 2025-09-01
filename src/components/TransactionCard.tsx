import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { RiskBadge } from "./RiskBadge";
import { AddressDisplay } from "./AddressDisplay";
import { formatDistanceToNow } from "date-fns";

interface TransactionCardProps {
  transaction: Transaction;
  isSelected: boolean;
  onClick: () => void;
}

export function TransactionCard({ transaction, isSelected, onClick }: TransactionCardProps) {
  const formatAmount = (amount: number) => {
    return `${amount.toLocaleString()} USDT`;
  };

  const formatUsdAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      onClick={onClick}
      className={`glass-card rounded-xl p-6 cursor-pointer transition-smooth border ${
        isSelected 
          ? 'border-primary shadow-lg shadow-primary/20' 
          : 'border-transparent hover:border-white/20'
      }`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            transaction.status === 'new' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-xs text-muted-foreground">
            {transaction.status === 'new' ? 'New' : 'Processed'}
          </span>
        </div>
        <RiskBadge riskLevel={transaction.riskLevel} />
      </div>

      <div className="space-y-4">
        {/* Address Flow */}
        <div className="flex items-center justify-between">
          <AddressDisplay 
            address={transaction.from} 
            label={transaction.fromLabel}
            className="flex-1"
          />
          <ArrowRight className="h-5 w-5 text-muted-foreground mx-4 flex-shrink-0" />
          <AddressDisplay 
            address={transaction.to} 
            label={transaction.toLabel}
            className="flex-1"
          />
        </div>

        {/* Amount */}
        <div className="text-center py-2">
          <div className="text-2xl font-bold gradient-text">
            {formatAmount(transaction.amount)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatUsdAmount(transaction.amountUsd)}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDistanceToNow(transaction.timestamp, { addSuffix: true })}</span>
        </div>
      </div>
    </motion.div>
  );
}