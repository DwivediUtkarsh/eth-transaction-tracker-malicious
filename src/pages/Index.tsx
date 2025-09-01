import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, Zap, Wifi, WifiOff } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Transaction, FilterState } from "@/types/transaction";
import { StatsBar } from "@/components/StatsCard";
import { FilterBar } from "@/components/FilterBar";
import { TransactionCard } from "@/components/TransactionCard";
import { TransactionDetails } from "@/components/TransactionDetails";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { SecurityAlertManager } from "@/components/SecurityAlert";
import { Button } from "@/components/ui/button";
import { 
  useTransactions, 
  useStats, 
  useWebSocket, 
  useConnectionStatus 
} from "@/hooks/useTransactions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Index = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    amountRange: [0, 1000000],
    showOnly: 'all',
    searchQuery: ''
  });
  const [securityAlerts, setSecurityAlerts] = useState<Array<{
    id: string;
    transaction: Transaction;
  }>>([]);

  // API hooks
  const { 
    data: transactionData, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions 
  } = useTransactions({
    page: 1,
    pageSize: 20,
    minValue: filters.amountRange[0],
    maxValue: filters.amountRange[1],
  });

  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useStats();

  const { isConnected: wsConnected, lastMessage } = useWebSocket();
  const { 
    isBackendConnected, 
    isWebSocketConnected, 
    backendStatus 
  } = useConnectionStatus();

  // Filter transactions based on current filters (client-side filtering for search and showOnly)
  const filteredTransactions = useMemo(() => {
    if (!transactionData?.transactions) return [];
    
    return transactionData.transactions.filter(tx => {
      // Show only filter
      if (filters.showOnly === 'large' && tx.amountUsd <= 10000) {
        return false;
      }
      if (filters.showOnly === 'suspicious' && !['suspicious', 'malicious'].includes(tx.riskLevel)) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return tx.hash.toLowerCase().includes(query) ||
               tx.from.toLowerCase().includes(query) ||
               tx.to.toLowerCase().includes(query);
      }

      return true;
    });
  }, [transactionData?.transactions, filters]);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'new_transaction':
          // Transaction list will be automatically updated via React Query invalidation
          console.log('New transaction received:', lastMessage.data.transaction);
          break;
        case 'analysis_complete':
          console.log('Analysis completed:', lastMessage.data);
          // Check if the analysis result is malicious and show alert
          if (lastMessage.data.verdict === 'MALICIOUS') {
            const transaction = filteredTransactions.find(tx => tx.to === lastMessage.data.contract_address);
            if (transaction) {
              const alertId = `alert_${Date.now()}`;
              setSecurityAlerts(prev => [...prev, { id: alertId, transaction }]);
            }
          }
          break;
        case 'stats_update':
          console.log('Stats updated:', lastMessage.data.stats);
          break;
      }
    }
  }, [lastMessage, filteredTransactions]);

  // Check for malicious transactions and show alerts
  useEffect(() => {
    if (filteredTransactions) {
      const maliciousTransactions = filteredTransactions.filter(
        tx => tx.riskLevel === 'malicious' && tx.isToContract
      );
      
      maliciousTransactions.forEach(transaction => {
        // Check if we already have an alert for this transaction
        const existingAlert = securityAlerts.find(alert => alert.transaction.id === transaction.id);
        if (!existingAlert) {
          const alertId = `alert_${transaction.id}_${Date.now()}`;
          setSecurityAlerts(prev => [...prev, { id: alertId, transaction }]);
        }
      });
    }
  }, [filteredTransactions]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDismissAlert = (alertId: string) => {
    setSecurityAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Show loading state
  if (transactionsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading USDT Tracker...</h2>
          <p className="text-muted-foreground">Connecting to backend services</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (transactionsError || statsError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <WifiOff className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to connect to the backend API. Please make sure the backend is running on port 8000.
          </p>
          <Button onClick={() => {
            refetchTransactions();
            window.location.reload();
          }}>
            Retry Connection
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Backend should be running at: http://localhost:8000</p>
            <p>Check console for detailed error information</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      
      {/* Connection Status Alert */}
      {!isBackendConnected && (
        <Alert className="m-4 border-yellow-500 bg-yellow-500/10">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Backend connection lost. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="p-2 rounded-xl gradient-primary">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text animate-pulse-glow">
                USDT Tracker
              </h1>
              {/* Connection indicators */}
              <div className="flex items-center gap-2 ml-4">
                <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-muted-foreground">API</span>
                <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </motion.div>
            
            <Button 
              variant="outline" 
              className="gradient-primary text-white border-none hover:bg-primary/90"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Bar */}
        <StatsBar
          totalTransactions={stats?.totalTransactions || 0}
          todayTransactions={stats?.todayTransactions || 0}
          maliciousTransactions={stats?.maliciousTransactions || 0}
          contractsAnalyzedToday={stats?.contractsAnalyzedToday || 0}
          isLive={isWebSocketConnected}
          onToggleLive={() => {
            // In the real implementation, this could pause/resume WebSocket connection
            console.log('Toggle live updates');
          }}
        />

        {/* Filter Bar */}
        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          {/* Left Section - Transaction List */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Live USDT Transactions
                <span className="text-sm text-muted-foreground">
                  ({filteredTransactions.length} shown)
                </span>
                {isWebSocketConnected && (
                  <Wifi className="h-4 w-4 text-green-400" />
                )}
              </h2>
              
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No transactions match your current filters.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFilters({
                        amountRange: [0, 1000000],
                        showOnly: 'all',
                        searchQuery: ''
                      })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TransactionCard
                        transaction={transaction}
                        isSelected={selectedTransaction?.id === transaction.id}
                        onClick={() => setSelectedTransaction(transaction)}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Section - Transaction Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TransactionDetails transaction={selectedTransaction} />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <ConnectionStatus 
          isConnected={isBackendConnected}
          lastUpdate={new Date()}
          network="Ethereum Mainnet"
        />
      </div>

      {/* Security Alerts */}
      <SecurityAlertManager
        alerts={securityAlerts}
        onViewTransaction={handleViewTransaction}
        onDismissAlert={handleDismissAlert}
      />
    </div>
  );
};

export default Index;
