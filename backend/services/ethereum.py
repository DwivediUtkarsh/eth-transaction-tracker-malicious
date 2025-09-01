import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import hashlib
import json

# Known contracts for realistic data
KNOWN_CONTRACTS = {
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT", 
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap V2 Router",
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "UNI Token",
    "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI Stablecoin",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "Wrapped Bitcoin",
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "Wrapped Ether",
    "0x514910771af9ca656af840dff83e8264ecf986ca": "Chainlink Token",
    "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce": "Shiba Inu",
    "0x1234567890123456789012345678901234567890": "FakeUSDT (Malicious)",
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef": "Wallet Drainer (Malicious)",
}

# Exchange and known addresses
EXCHANGE_ADDRESSES = {
    "0x742d35cc6634c0532925a3b844bc9e7595f0beb5": "Binance Hot Wallet",
    "0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed": "Coinbase Exchange",
    "0x8ba1f109551bd432803012645hac136c22c177ec": "Kraken Exchange",
    "0xd8da6bf26964af9d7eed9e03e53415d37aa96045": "Bitfinex Hot Wallet",
}

class EthereumService:
    def __init__(self):
        self.current_block = 18500000
        self.eth_price_usd = 2100.0  # Mock ETH price
        
    def is_contract_address(self, address: str) -> bool:
        """
        Determine if an address is a contract.
        Uses known contracts list and random logic for unknown addresses.
        """
        address_lower = address.lower()
        
        # Check known contracts
        if address_lower in KNOWN_CONTRACTS:
            return True
            
        # For unknown addresses, use deterministic pseudo-random based on address
        # This ensures consistency across calls
        hash_obj = hashlib.md5(address_lower.encode())
        hash_int = int(hash_obj.hexdigest()[:8], 16)
        
        # 30% chance an unknown address is a contract
        return (hash_int % 100) < 30
    
    def get_contract_name(self, address: str) -> Optional[str]:
        """Get the name of a known contract."""
        return KNOWN_CONTRACTS.get(address.lower())
    
    def get_address_label(self, address: str) -> Optional[str]:
        """Get a human-readable label for an address."""
        address_lower = address.lower()
        
        # Check contracts first
        if address_lower in KNOWN_CONTRACTS:
            return KNOWN_CONTRACTS[address_lower]
            
        # Check exchanges
        if address_lower in EXCHANGE_ADDRESSES:
            return EXCHANGE_ADDRESSES[address_lower]
            
        return None
    
    def generate_random_address(self) -> str:
        """Generate a random Ethereum address."""
        return "0x" + "".join([random.choice("0123456789abcdef") for _ in range(40)])
    
    def generate_transaction_hash(self) -> str:
        """Generate a random transaction hash."""
        return "0x" + "".join([random.choice("0123456789abcdef") for _ in range(64)])
    
    def generate_mock_transaction(self) -> Dict:
        """Generate a realistic mock transaction."""
        # Choose addresses (mix of known and random)
        if random.random() < 0.4:  # 40% chance to use known addresses
            from_addr = random.choice(list(KNOWN_CONTRACTS.keys()) + list(EXCHANGE_ADDRESSES.keys()))
        else:
            from_addr = self.generate_random_address()
            
        if random.random() < 0.5:  # 50% chance to use known addresses for 'to'
            to_addr = random.choice(list(KNOWN_CONTRACTS.keys()) + list(EXCHANGE_ADDRESSES.keys()))
        else:
            to_addr = self.generate_random_address()
        
        # Generate transaction values
        usdt_value = round(random.uniform(10, 1000000), 2)  # $10 to $1M
        eth_value = round(usdt_value / self.eth_price_usd, 6)
        
        # Gas values
        gas_used = random.randint(21000, 500000)
        gas_price = round(random.uniform(10, 100), 1)  # Gwei
        
        # Block and timestamp
        self.current_block += random.randint(1, 5)
        timestamp = datetime.utcnow() - timedelta(seconds=random.randint(0, 3600))
        
        transaction = {
            "hash": self.generate_transaction_hash(),
            "from_address": from_addr,
            "to_address": to_addr,
            "value": usdt_value,
            "eth_value": eth_value,
            "block_number": self.current_block,
            "timestamp": timestamp,
            "is_contract": self.is_contract_address(to_addr),
            "gas_used": gas_used,
            "gas_price": gas_price,
        }
        
        return transaction
    
    def get_transaction_risk_level(self, transaction: Dict) -> str:
        """Determine risk level based on transaction characteristics."""
        to_addr = transaction["to_address"].lower()
        value = transaction["value"]
        
        # Known malicious addresses
        if to_addr in ["0x1234567890123456789012345678901234567890", 
                       "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"]:
            return "malicious"
        
        # High value transactions to unknown contracts are suspicious
        if transaction["is_contract"] and value > 100000 and to_addr not in KNOWN_CONTRACTS:
            return "suspicious"
        
        # Large transactions from exchanges might be suspicious
        from_label = self.get_address_label(transaction["from_address"])
        if from_label and "Exchange" in from_label and value > 500000:
            return "suspicious"
        
        # Random chance for variety
        if random.random() < 0.05:  # 5% chance
            return "suspicious"
        
        return "safe"
    
    def generate_batch_transactions(self, count: int = 20) -> List[Dict]:
        """Generate a batch of mock transactions."""
        transactions = []
        for _ in range(count):
            tx = self.generate_mock_transaction()
            transactions.append(tx)
        
        # Sort by timestamp (newest first)
        transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        return transactions
    
    def validate_address(self, address: str) -> bool:
        """Validate Ethereum address format."""
        if not address or len(address) != 42:
            return False
        if not address.startswith("0x"):
            return False
        try:
            int(address[2:], 16)
            return True
        except ValueError:
            return False
    
    def validate_transaction_hash(self, tx_hash: str) -> bool:
        """Validate transaction hash format."""
        if not tx_hash or len(tx_hash) != 66:
            return False
        if not tx_hash.startswith("0x"):
            return False
        try:
            int(tx_hash[2:], 16)
            return True
        except ValueError:
            return False

# Global instance
ethereum_service = EthereumService()

