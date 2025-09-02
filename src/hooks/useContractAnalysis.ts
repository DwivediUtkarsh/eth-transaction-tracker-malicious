import { useState, useCallback } from 'react';
import * as React from 'react';
import { ContractAnalysis } from '@/types/transaction';
import { analyzeContract, pollAnalysisResult, isValidAddress } from '@/lib/api';

export function useContractAnalysis(contractAddress: string) {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    if (!contractAddress || !isValidAddress(contractAddress)) {
      setError('Invalid contract address');
      return;
    }

    console.log(`🔍 Starting analysis for contract: ${contractAddress}`);

    // Clear previous state
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(true);
    setProgress('Submitting contract for analysis...');

    try {
      // Submit contract for analysis
      console.log(`📤 Submitting contract for analysis...`);
      const { task_id } = await analyzeContract(contractAddress);
      console.log(`✅ Analysis submitted with task ID: ${task_id}`);
      
      // Poll for results with better progress tracking
      const result = await pollAnalysisResult(task_id, (status) => {
        console.log(`📊 Progress update: ${status}`);
        setProgress(status);
      });

      console.log(`🎉 Analysis completed:`, result);
      
      // Ensure we have a complete result before setting
      if (result && result.status === 'completed') {
        setAnalysis(result);
        setProgress('Analysis complete - Results ready!');
      } else {
        throw new Error('Analysis completed but result is incomplete');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      console.error(`❌ Analysis failed:`, errorMessage, err);
      setError(errorMessage);
      setProgress('');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [contractAddress]);

  const reset = useCallback(() => {
    console.log(`🔄 Resetting contract analysis state`);
    setAnalysis(null);
    setIsAnalyzing(false);
    setProgress('');
    setError(null);
  }, []);

  // Reset analysis when contract address changes
  React.useEffect(() => {
    if (contractAddress && isValidAddress(contractAddress)) {
      reset();
    }
  }, [contractAddress, reset]);

  return {
    analysis,
    isAnalyzing,
    progress,
    error,
    analyze,
    reset
  };
}


