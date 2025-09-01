import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Skull, Clock, Loader2 } from "lucide-react";
import { Transaction } from "@/types/transaction";

interface RiskBadgeProps {
  riskLevel: Transaction['riskLevel'];
  className?: string;
}

export function RiskBadge({ riskLevel, className }: RiskBadgeProps) {
  const configs = {
    'not-analyzed': {
      variant: 'secondary' as const,
      text: 'Not Analyzed',
      icon: <Clock className="h-3 w-3" />,
      bgColor: 'bg-gray-500/20 text-gray-400'
    },
    'analyzing': {
      variant: 'secondary' as const,
      text: 'Analyzing...',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      bgColor: 'bg-yellow-500/20 text-yellow-400'
    },
    'safe': {
      variant: 'default' as const,
      text: '✅ Safe',
      icon: <Shield className="h-3 w-3" />,
      bgColor: 'bg-green-500/20 text-green-400'
    },
    'suspicious': {
      variant: 'destructive' as const,
      text: '⚠️ Suspicious',
      icon: <AlertTriangle className="h-3 w-3" />,
      bgColor: 'bg-orange-500/20 text-orange-400'
    },
    'malicious': {
      variant: 'destructive' as const,
      text: '🚨 MALICIOUS',
      icon: <Skull className="h-3 w-3" />,
      bgColor: 'bg-red-500/20 text-red-400 animate-pulse'
    }
  };

  const config = configs[riskLevel];

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${className}`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}