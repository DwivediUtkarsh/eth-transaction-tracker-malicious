import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterState } from "@/types/transaction";
import { motion } from "framer-motion";

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      className="glass-card rounded-xl p-6 space-y-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by address or transaction hash..."
          value={filters.searchQuery}
          onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          className="pl-10 bg-input border-border focus:border-primary transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Amount Range
            </label>
            <span className="text-xs text-muted-foreground">
              {formatAmount(filters.amountRange[0])} - {formatAmount(filters.amountRange[1])}
            </span>
          </div>
          <Slider
            value={filters.amountRange}
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              amountRange: value as [number, number] 
            })}
            min={0}
            max={1000000}
            step={1}
            className="w-full"
          />
        </div>

        {/* Filter Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Show Only</label>
          <Select
            value={filters.showOnly}
            onValueChange={(value: FilterState['showOnly']) => 
              onFiltersChange({ ...filters, showOnly: value })
            }
          >
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="large">Large (&gt;$10k)</SelectItem>
              <SelectItem value="suspicious">Suspicious Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </motion.div>
  );
}