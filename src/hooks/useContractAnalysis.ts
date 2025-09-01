import { useState, useCallback } from 'react';
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

    setIsAnalyzing(true);
    setError(null);
    setProgress('Submitting for analysis...');

    try {
      // Submit contract for analysis
      const { task_id } = await analyzeContract(contractAddress);
      
      // Poll for results
      const result = await pollAnalysisResult(task_id, (status) => {
        setProgress(status);
      });

      setAnalysis(result);
      setProgress('Analysis complete');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setProgress('');
    } finally {
      setIsAnalyzing(false);
    }
  }, [contractAddress]);

  const reset = useCallback(() => {
    setAnalysis(null);
    setIsAnalyzing(false);
    setProgress('');
    setError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    progress,
    error,
    analyze,
    reset
  };
}


