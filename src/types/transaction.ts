export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: number;
  amountUsd: number;
  timestamp: Date;
  blockNumber: number;
  gasPrice: string;
  gasFee: string;
  gasFeeUsd: number;
  status: 'new' | 'old';
  riskLevel: 'not-analyzed' | 'analyzing' | 'safe' | 'suspicious' | 'malicious';
  riskScore?: number;
  confidence?: number;
  riskFactors?: string[];
  fromLabel?: string;
  toLabel?: string;
  // Contract-related fields
  isToContract?: boolean;
  isFromContract?: boolean;
  contractName?: string;
  analysisTaskId?: string;
  securityScore?: number;
  attackVectors?: string[];
}

export interface TransactionAnalysis {
  riskScore: number;
  confidence: number;
  riskFactors: string[];
  recommendation: string;
  riskLevel: 'safe' | 'suspicious' | 'malicious';
}

export interface FilterState {
  amountRange: [number, number];
  showOnly: 'all' | 'large' | 'suspicious';
  searchQuery: string;
}

export interface ContractAnalysis {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  verdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
  explanation?: string;
  security_score?: number;
  attack_vectors?: string[];
  contract_name?: string;
  technical_details?: {
    functions_analyzed: number;
    vulnerabilities_found: number;
    risk_factors: string[];
  };
}

export interface DashboardStats {
  totalTransactions: number;
  todayTransactions: number;
  maliciousTransactions: number;
  contractsAnalyzedToday: number;
  isLive: boolean;
}