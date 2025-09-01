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
  riskLevel: 'not-analyzed' | 'safe' | 'suspicious' | 'malicious';
  riskScore?: number;
  confidence?: number;
  riskFactors?: string[];
  fromLabel?: string;
  toLabel?: string;
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

export interface DashboardStats {
  totalTransactions: number;
  todayTransactions: number;
  maliciousTransactions: number;
  isLive: boolean;
}