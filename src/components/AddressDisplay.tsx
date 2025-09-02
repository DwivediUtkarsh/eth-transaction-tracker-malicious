import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface AddressDisplayProps {
  address: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

export function AddressDisplay({ address, label, truncate = true, className }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = truncate 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied!', {
        duration: 2000,
        style: {
          background: 'hsl(0 0% 8%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 0% 20%)',
        }
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const openEtherscan = () => {
    const formattedAddress = address.startsWith('0x') ? address : '0x' + address;
    window.open(`https://etherscan.io/address/${formattedAddress}`, '_blank');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col">
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
        <span className="font-mono text-sm">{displayAddress}</span>
      </div>
      <div className="flex items-center gap-1">
        <motion.button
          onClick={copyToClipboard}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          )}
        </motion.button>
        <motion.button
          onClick={openEtherscan}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </motion.button>
      </div>
    </div>
  );
}