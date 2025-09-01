import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Wallet, Zap } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Transaction, FilterState, DashboardStats } from "@/types/transaction";
import { mockTransactions } from "@/data/mockTransactions";
import { StatsBar } from "@/components/StatsCard";
import { FilterBar } from "@/components/FilterBar";
import { TransactionCard } from "@/components/TransactionCard";
import { TransactionDetails } from "@/components/TransactionDetails";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    amountRange: [0, 1000000],
    showOnly: 'all',
    searchQuery: ''
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 24789,
    todayTransactions: 1247,
    maliciousTransactions: 23,
    isLive: true
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Amount range filter
      if (tx.amountUsd < filters.amountRange[0] || tx.amountUsd > filters.amountRange[1]) {
        return false;
      }

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
  }, [transactions, filters]);

  // Simulate real-time updates
  useEffect(() => {
    if (!stats.isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      
      // Randomly add new transactions
      if (Math.random() > 0.7) {
        const newTx: Transaction = {
          ...mockTransactions[Math.floor(Math.random() * mockTransactions.length)],
          id: Date.now().toString(),
          timestamp: new Date(),
          status: 'new',
          riskLevel: 'not-analyzed'
        };
        
        setTransactions(prev => [newTx, ...prev.slice(0, 19)]); // Keep only 20 transactions
        setStats(prev => ({
          ...prev,
          totalTransactions: prev.totalTransactions + 1,
          todayTransactions: prev.todayTransactions + 1
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [stats.isLive]);

  const handleToggleLive = () => {
    setStats(prev => ({ ...prev, isLive: !prev.isLive }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      
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
          totalTransactions={stats.totalTransactions}
          todayTransactions={stats.todayTransactions}
          maliciousTransactions={stats.maliciousTransactions}
          isLive={stats.isLive}
          onToggleLive={handleToggleLive}
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
              </h2>
              
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {filteredTransactions.map((transaction, index) => (
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
                ))}
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
          isConnected={true}
          lastUpdate={lastUpdate}
          network="Ethereum Mainnet"
        />
      </div>
    </div>
  );
};

export default Index;