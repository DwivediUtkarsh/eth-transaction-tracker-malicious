import { useState, useEffect } from 'react';
import { Transaction, DashboardStats } from '@/types/transaction';

const API_BASE_URL = 'http://localhost:8000';

// Real API hooks for backend integration
export function useTransactions(params?: {
  page?: number;
  pageSize?: number;
  minValue?: number;
  maxValue?: number;
}) {
  const [data, setData] = useState<{ transactions: Transaction[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
        if (params?.minValue !== undefined) queryParams.append('min_value', params.minValue.toString());
        if (params?.maxValue !== undefined) queryParams.append('max_value', params.maxValue.toString());

        const response = await fetch(`${API_BASE_URL}/api/transactions?${queryParams}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Transform backend response to match frontend expectations
        const transformedTransactions = result.transactions.map((tx: any) => ({
          id: tx.hash,
          hash: tx.hash,
          from: tx.from_address,
          to: tx.to_address,
          amount: tx.value,
          amountUsd: tx.value_usd,
          timestamp: new Date(tx.timestamp),
          blockNumber: tx.block_number,
          gasPrice: tx.gas_price.toString(),
          gasFee: (tx.gas_used * tx.gas_price / 1e9).toFixed(6), // Convert to ETH
          gasFeeUsd: (tx.gas_used * tx.gas_price / 1e9) * 2100, // Approximate USD
          status: 'old' as const,
          riskLevel: tx.verdict ? 
            (tx.verdict.toLowerCase() === 'malicious' ? 'malicious' :
             tx.verdict.toLowerCase() === 'suspicious' ? 'suspicious' : 'safe') as const :
            'not-analyzed' as const,
          riskScore: tx.security_score,
          confidence: tx.security_score ? Math.min(95, tx.security_score + 20) : undefined,
          riskFactors: [],
          fromLabel: undefined,
          toLabel: undefined,
          isToContract: tx.is_contract,
          isFromContract: false,
          contractName: undefined,
          analysisTaskId: undefined,
          securityScore: tx.security_score,
          attackVectors: []
        }));

        setData({ transactions: transformedTransactions });
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [params?.page, params?.pageSize, params?.minValue, params?.maxValue]);

  const refetch = () => {
    setIsLoading(true);
    setError(null);
    // Trigger useEffect again by updating a dependency
  };

  return { data, isLoading, error, refetch };
}

export function useStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/stats`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        const stats: DashboardStats = {
          totalTransactions: result.total_transactions,
          todayTransactions: result.today_transactions,
          maliciousTransactions: result.malicious_contracts,
          contractsAnalyzedToday: result.contracts_analyzed_today,
          isLive: result.is_live
        };
        
        setData(stats);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let isComponentMounted = true;
    let reconnectAttempts = 0;

    const connect = () => {
      // Don't connect if component is unmounted
      if (!isComponentMounted) return;
      
      try {
        // Close existing connection if any
        if (ws) {
          ws.close();
        }

        ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onopen = () => {
          if (!isComponentMounted) return;
          console.log('🔌 WebSocket connected');
          setIsConnected(true);
          reconnectAttempts = 0; // Reset on successful connection
        };
        
        ws.onmessage = (event) => {
          if (!isComponentMounted) return;
          try {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket message:', message);
            setLastMessage(message);
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
          }
        };
        
        ws.onclose = (event) => {
          if (!isComponentMounted) return;
          
          console.log('🔌 WebSocket disconnected');
          setIsConnected(false);
          
          // Only reconnect if it wasn't deliberate and we haven't exceeded max attempts
          if (event.code !== 1000 && reconnectAttempts < 5) {
            const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff
            console.log(`⏰ Reconnecting in ${delay/1000}s (attempt ${reconnectAttempts + 1}/5)`);
            
            reconnectTimer = setTimeout(() => {
              if (isComponentMounted) {
                reconnectAttempts++;
                connect();
              }
            }, delay);
          }
        };
        
        ws.onerror = (error) => {
          if (!isComponentMounted) return;
          console.error('🚨 WebSocket error:', error);
          setIsConnected(false);
        };
        
      } catch (err) {
        if (!isComponentMounted) return;
        console.error('Failed to create WebSocket connection:', err);
        setIsConnected(false);
        
        // Retry with backoff
        if (reconnectAttempts < 5) {
          const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectTimer = setTimeout(() => {
            if (isComponentMounted) {
              reconnectAttempts++;
              connect();
            }
          }, delay);
        }
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      isComponentMounted = false;
      
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      
      if (ws) {
        ws.onclose = null; // Prevent reconnection attempts
        ws.close(1000, 'Component unmounting');
        ws = null;
      }
    };
  }, []);

  return { isConnected, lastMessage };
}

export function useConnectionStatus() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [backendStatus, setBackendStatus] = useState('connecting');

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          timeout: 5000
        } as any);
        
        if (response.ok) {
          setIsBackendConnected(true);
          setBackendStatus('connected');
        } else {
          setIsBackendConnected(false);
          setBackendStatus('error');
        }
      } catch (err) {
        console.error('Backend connection check failed:', err);
        setIsBackendConnected(false);
        setBackendStatus('disconnected');
      }
    };

    const checkWebSocketConnection = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onopen = () => {
          setIsWebSocketConnected(true);
          ws.close();
        };
        
        ws.onerror = () => {
          setIsWebSocketConnected(false);
        };
        
        ws.onclose = () => {
          // Connection was successful if we got here after onopen
        };
        
      } catch (err) {
        setIsWebSocketConnected(false);
      }
    };

    // Initial checks
    checkBackendConnection();
    checkWebSocketConnection();

    // Periodic checks every 30 seconds
    const interval = setInterval(() => {
      checkBackendConnection();
      checkWebSocketConnection();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isBackendConnected,
    isWebSocketConnected,
    backendStatus
  };
}

