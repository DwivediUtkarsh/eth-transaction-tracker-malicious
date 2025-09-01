import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText, User, AlertTriangle } from "lucide-react";
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

  const isMalicious = transaction.riskLevel === 'malicious';
  const cardBorderClass = isMalicious 
    ? 'border-red-500 shadow-lg shadow-red-500/20' 
    : isSelected 
      ? 'border-primary shadow-lg shadow-primary/20' 
      : 'border-transparent hover:border-white/20';

  const cardGlowClass = isMalicious ? 'shadow-red-500/30' : '';

  return (
    <motion.div
      onClick={onClick}
      className={`glass-card rounded-xl p-6 cursor-pointer transition-smooth border ${cardBorderClass} ${cardGlowClass}`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={isMalicious ? {
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)'
      } : {}}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            transaction.status === 'new' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-xs text-muted-foreground">
            {transaction.status === 'new' ? 'New' : 'Processed'}
          </span>
          {/* Contract/EOA Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
            {transaction.isToContract ? (
              <>
                <FileText className="h-3 w-3" />
                <span>📄 Contract</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                <span>👤 EOA</span>
              </>
            )}
          </div>
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
          <div className="flex-1 relative">
            <AddressDisplay 
              address={transaction.to} 
              label={transaction.toLabel || transaction.contractName}
              className="w-full"
            />
            {isMalicious && (
              <div className="absolute -top-1 -right-1">
                <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-2">
          <div className={`text-2xl font-bold ${isMalicious ? 'line-through text-red-400' : 'gradient-text'}`}>
            {formatAmount(transaction.amount)}
          </div>
          <div className={`text-sm ${isMalicious ? 'line-through text-red-300' : 'text-muted-foreground'}`}>
            {formatUsdAmount(transaction.amountUsd)}
          </div>
          {isMalicious && (
            <div className="text-xs text-red-400 mt-1 font-medium">
              ⚠️ Do not send funds
            </div>
          )}
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