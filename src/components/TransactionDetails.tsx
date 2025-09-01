import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Shield, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Transaction, TransactionAnalysis } from "@/types/transaction";
import { AddressDisplay } from "./AddressDisplay";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow, format } from "date-fns";

interface TransactionDetailsProps {
  transaction: Transaction | null;
}

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!transaction) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis result
    const mockAnalysis: TransactionAnalysis = {
      riskScore: transaction.riskScore || Math.floor(Math.random() * 100),
      confidence: transaction.confidence || Math.floor(Math.random() * 40) + 60,
      riskFactors: transaction.riskFactors || [
        "Normal transaction pattern",
        "Verified addresses",
        "Standard gas usage"
      ],
      recommendation: transaction.riskScore && transaction.riskScore > 70 
        ? "High Risk - Further investigation recommended" 
        : transaction.riskScore && transaction.riskScore > 40
          ? "Medium Risk - Monitor closely"
          : "Low Risk - Transaction appears normal",
      riskLevel: transaction.riskLevel === 'not-analyzed' 
        ? (Math.random() > 0.7 ? 'suspicious' : 'safe')
        : transaction.riskLevel
    };
    
    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
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

  return (
    <motion.div
      className="glass-card rounded-xl p-6 space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transaction Details</h3>
        <RiskBadge riskLevel={transaction.riskLevel} />
      </div>

      <div className="space-y-4">
        {/* Transaction Hash */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Transaction Hash</label>
          <AddressDisplay 
            address={transaction.hash} 
            truncate={false}
            className="text-xs"
          />
        </div>

        {/* Block Number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Block Number</label>
            <p className="font-mono text-sm">{transaction.blockNumber.toLocaleString()}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Gas Fee</label>
            <p className="font-mono text-sm">{transaction.gasFee} ETH</p>
            <p className="text-xs text-muted-foreground">${transaction.gasFeeUsd}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">From Address</label>
            <AddressDisplay 
              address={transaction.from} 
              label={transaction.fromLabel}
              truncate={false}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">To Address</label>
            <AddressDisplay 
              address={transaction.to} 
              label={transaction.toLabel}
              truncate={false}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="text-center py-4 glass-card rounded-lg">
          <div className="text-3xl font-bold gradient-text">
            {transaction.amount.toLocaleString()} USDT
          </div>
          <div className="text-muted-foreground">
            ${transaction.amountUsd.toLocaleString()} USD
          </div>
        </div>

        {/* Timestamp */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
          <p className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            {format(transaction.timestamp, 'PPpp')}
            <span className="text-muted-foreground">
              ({formatDistanceToNow(transaction.timestamp, { addSuffix: true })})
            </span>
          </p>
        </div>

        {/* Analysis Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full gradient-primary animate-pulse-glow disabled:animate-none"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Analyzing Transaction...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5 mr-2" />
              Analyze Transaction
            </>
          )}
        </Button>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              className="space-y-4 pt-4 border-t border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="font-semibold text-primary">Analysis Results</h4>
              
              {/* Risk Score */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Risk Score</span>
                  <span className={`text-sm font-bold ${
                    analysis.riskScore >= 70 ? 'text-red-400' :
                    analysis.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {analysis.riskScore}/100
                  </span>
                </div>
                <Progress 
                  value={analysis.riskScore} 
                  className={`h-2 ${
                    analysis.riskScore >= 70 ? '[&>div]:bg-red-500' :
                    analysis.riskScore >= 40 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                  }`}
                />
              </div>

              {/* Confidence */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Confidence</span>
                <span className="text-sm font-bold text-primary">{analysis.confidence}%</span>
              </div>

              {/* Risk Factors */}
              <div className="space-y-2">
                <span className="text-sm font-medium">Risk Factors</span>
                <div className="space-y-1">
                  {analysis.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {analysis.riskScore >= 70 ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      ) : (
                        <Shield className="h-4 w-4 text-green-400 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-3 rounded-lg border ${
                analysis.riskScore >= 70 ? 'bg-red-500/10 border-red-500/20' :
                analysis.riskScore >= 40 ? 'bg-yellow-500/10 border-yellow-500/20' : 
                'bg-green-500/10 border-green-500/20'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {analysis.riskScore >= 70 ? (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  ) : (
                    <Shield className="h-4 w-4 text-green-400" />
                  )}
                  <span className="font-medium text-sm">Recommendation</span>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}