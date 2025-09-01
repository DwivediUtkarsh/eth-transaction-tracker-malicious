import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Shield, AlertTriangle, Skull, CheckCircle } from "lucide-react";
import { ContractAnalysis } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ContractAnalysisResultProps {
  analysis: ContractAnalysis;
}

export function ContractAnalysisResult({ analysis }: ContractAnalysisResultProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!analysis || analysis.status !== 'completed') {
    return null;
  }

  const getVerdictConfig = () => {
    switch (analysis.verdict) {
      case 'BENIGN':
        return {
          icon: <CheckCircle className="h-8 w-8" />,
          title: '✅ BENIGN - This contract appears safe',
          bgColor: 'bg-green-500/20 border-green-500/50 text-green-400',
          textColor: 'text-green-400'
        };
      case 'SUSPICIOUS':
        return {
          icon: <AlertTriangle className="h-8 w-8" />,
          title: '⚠️ SUSPICIOUS - Potential security risks detected',
          bgColor: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
          textColor: 'text-orange-400'
        };
      case 'MALICIOUS':
        return {
          icon: <Skull className="h-8 w-8" />,
          title: '🚨 MALICIOUS - WARNING: Wallet drainer detected!',
          bgColor: 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse',
          textColor: 'text-red-400'
        };
      default:
        return {
          icon: <Shield className="h-8 w-8" />,
          title: 'Analysis Complete',
          bgColor: 'bg-gray-500/20 border-gray-500/50 text-gray-400',
          textColor: 'text-gray-400'
        };
    }
  };

  const verdictConfig = getVerdictConfig();

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Verdict Badge */}
      <motion.div
        className={`glass-card rounded-xl p-6 border-2 ${verdictConfig.bgColor}`}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={verdictConfig.textColor}>
            {verdictConfig.icon}
          </div>
          <h3 className={`text-xl font-bold ${verdictConfig.textColor}`}>
            {verdictConfig.title}
          </h3>
        </div>
        
        {/* Security Score */}
        {analysis.security_score !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Security Score</span>
              <span className={`text-sm font-bold ${verdictConfig.textColor}`}>
                {analysis.security_score}/100
              </span>
            </div>
            <Progress 
              value={analysis.security_score} 
              className="h-2"
            />
          </div>
        )}

        {/* Explanation */}
        <p className="text-foreground/90 leading-relaxed">
          {analysis.explanation}
        </p>
      </motion.div>

      {/* Malicious Warning Banner */}
      {analysis.verdict === 'MALICIOUS' && (
        <motion.div
          className="glass-card rounded-xl p-6 border-2 border-red-500 bg-red-500/10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h4 className="text-lg font-bold text-red-400">
              ⚠️ DO NOT INTERACT WITH THIS CONTRACT
            </h4>
          </div>
          
          {analysis.attack_vectors && analysis.attack_vectors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-300 mb-2">Detected Attack Vectors:</p>
              <ul className="space-y-1">
                {analysis.attack_vectors.map((vector, index) => (
                  <li key={index} className="text-sm text-red-200 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {vector}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Contract Information */}
      {analysis.contract_name && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract Name</p>
              <p className="font-medium">{analysis.contract_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Technical Details */}
      {analysis.technical_details && (
        <div className="glass-card rounded-xl overflow-hidden">
          <Button
            variant="ghost"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full p-4 justify-between hover:bg-white/5"
          >
            <span className="font-medium">View Technical Details</span>
            {showTechnicalDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {showTechnicalDetails && (
            <motion.div
              className="px-4 pb-4 space-y-4 border-t border-border/50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {analysis.technical_details.functions_analyzed}
                  </p>
                  <p className="text-sm text-muted-foreground">Functions Analyzed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {analysis.technical_details.vulnerabilities_found}
                  </p>
                  <p className="text-sm text-muted-foreground">Vulnerabilities Found</p>
                </div>
              </div>
              
              {analysis.technical_details.risk_factors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {analysis.technical_details.risk_factors.map((factor, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}


