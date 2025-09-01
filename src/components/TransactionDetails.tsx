import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  Shield, 
  AlertTriangle, 
  Clock, 
  Loader2, 
  FileText, 
  User,
  Info
} from "lucide-react";
import { Transaction, TransactionAnalysis } from "@/types/transaction";
import { AddressDisplay } from "./AddressDisplay";
import { RiskBadge } from "./RiskBadge";
import { ContractAnalysisResult } from "./ContractAnalysisResult";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow, format } from "date-fns";
import { useContractAnalysis } from "@/hooks/useContractAnalysis";
import { toast } from "react-hot-toast";

interface TransactionDetailsProps {
  transaction: Transaction | null;
}

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const contractAnalysis = useContractAnalysis(transaction?.to || '');

  const handleAnalyzeContract = async () => {
    if (!transaction || !transaction.isToContract) return;
    
    try {
      await contractAnalysis.analyze();
      toast.success('Contract analysis completed!');
    } catch (error) {
      console.error('Contract analysis failed:', error);
      toast.error('Contract analysis failed. Please try again.');
    }
  };

  if (!transaction) {
    return (
      <motion.div
        className="glass-card rounded-xl p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
          <p>Select a transaction to view detailed information and perform security analysis.</p>
        </div>
      </motion.div>
    );
  }

  // Use existing analysis from transaction data if available
  const displayAnalysis = analysis || (transaction.riskScore ? {
    riskScore: transaction.riskScore,
    confidence: transaction.confidence || 0,
    riskFactors: transaction.riskFactors || [],
    recommendation: transaction.riskScore > 70 
      ? "High Risk - Further investigation recommended" 
      : transaction.riskScore > 40
        ? "Medium Risk - Monitor closely"
        : "Low Risk - Transaction appears normal",
    riskLevel: transaction.riskLevel
  } as TransactionAnalysis : null);

  return (
    <motion.div
      className="glass-card rounded-xl p-6 space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Transaction Analysis
        </h3>
        <RiskBadge riskLevel={transaction.riskLevel} />
      </div>

      {/* Transaction Hash */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted p-2 rounded flex-1 font-mono">
            {transaction.hash}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://etherscan.io/tx/${transaction.hash}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contract Security Status */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Contract Security Status
        </h4>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">From</label>
            <div className="flex items-center gap-2">
              <AddressDisplay 
                address={transaction.from} 
                label={transaction.fromLabel}
              />
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                <User className="h-3 w-3" />
                <span>👤 EOA</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">To</label>
            <div className="flex items-center gap-2">
              <AddressDisplay 
                address={transaction.to} 
                label={transaction.toLabel || transaction.contractName || (transaction.isToContract ? 'Unknown Contract' : undefined)}
              />
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
            
            {transaction.isToContract && transaction.contractName && (
              <div className="mt-2 text-sm text-muted-foreground">
                Contract Name: <span className="font-medium text-foreground">{transaction.contractName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
        <div>
          <label className="text-muted-foreground">Amount</label>
          <p className="font-semibold">{transaction.amount.toLocaleString()} USDT</p>
        </div>
        <div>
          <label className="text-muted-foreground">USD Value</label>
          <p className="font-semibold">${transaction.amountUsd.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-muted-foreground">Block</label>
          <p className="font-semibold">#{transaction.blockNumber.toLocaleString()}</p>
        </div>
        <div>
          <label className="text-muted-foreground">Gas Fee</label>
          <p className="font-semibold">${transaction.gasFeeUsd.toFixed(2)}</p>
        </div>
        <div className="col-span-2">
          <label className="text-muted-foreground">Timestamp</label>
          <p className="font-semibold">
            {format(transaction.timestamp, 'PPpp')} 
            <span className="text-muted-foreground ml-2">
              ({formatDistanceToNow(transaction.timestamp, { addSuffix: true })})
            </span>
          </p>
        </div>
      </div>

      {/* Contract Analysis Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Contract Security Analysis</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={handleAnalyzeContract}
                    disabled={!transaction.isToContract || contractAnalysis.isAnalyzing}
                    size="sm"
                    variant={transaction.riskLevel === 'not-analyzed' ? 'default' : 'outline'}
                  >
                    {contractAnalysis.isAnalyzing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Analyze Contract Security
                  </Button>
                </div>
              </TooltipTrigger>
              {!transaction.isToContract && (
                <TooltipContent>
                  <p>Only contracts can be analyzed</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        <AnimatePresence mode="wait">
          {contractAnalysis.isAnalyzing && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {contractAnalysis.progress || 'Analyzing contract security...'}
              </div>
              <Progress value={75} className="w-full" />
            </motion.div>
          )}

          {contractAnalysis.error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Analysis Failed</span>
              </div>
              <p className="text-sm text-red-300 mt-1">{contractAnalysis.error}</p>
            </motion.div>
          )}

          {!contractAnalysis.isAnalyzing && contractAnalysis.analysis && (
            <motion.div
              key="analysis-result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ContractAnalysisResult analysis={contractAnalysis.analysis} />
            </motion.div>
          )}

          {!contractAnalysis.isAnalyzing && !contractAnalysis.analysis && !contractAnalysis.error && transaction.isToContract && (
            <motion.div
              key="not-analyzed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Shield className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">This contract has not been analyzed yet.</p>
              <p className="text-xs mt-1">Click "Analyze Contract Security" to perform security analysis.</p>
            </motion.div>
          )}

          {!transaction.isToContract && (
            <motion.div
              key="not-contract"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-8 text-muted-foreground"
            >
              <User className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">This transaction is to a regular wallet (EOA).</p>
              <p className="text-xs mt-1">Only smart contracts can be analyzed for security vulnerabilities.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}