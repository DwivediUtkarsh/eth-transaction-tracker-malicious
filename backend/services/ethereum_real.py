import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional
from web3 import Web3
# from web3.middleware import geth_poa_middleware  # Not needed for mainnet
import json
import os
from dotenv import load_dotenv
from .price_service import price_service

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class RealEthereumService:
    def __init__(self):
        # Configuration
        self.rpc_url = os.getenv("ETHEREUM_RPC_URL", "https://eth.public-rpc.com")
        self.etherscan_api_key = os.getenv("ETHERSCAN_API_KEY", "")
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Add middleware for some networks (commented out for now)
        # if "polygon" in self.rpc_url.lower() or "bsc" in self.rpc_url.lower():
        #     self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Check connection
        try:
            if self.w3.is_connected():
                logger.info(f"✅ Connected to Ethereum network: {self.rpc_url}")
                logger.info(f"📊 Latest block: {self.w3.eth.block_number}")
            else:
                logger.error("❌ Failed to connect to Ethereum network")
        except Exception as e:
            logger.error(f"❌ Ethereum connection error: {e}")
    
    def is_connected(self) -> bool:
        """Check if connected to Ethereum network."""
        try:
            return self.w3.is_connected()
        except:
            return False
    
    async def get_latest_block_number(self) -> int:
        """Get the latest block number."""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, lambda: self.w3.eth.block_number)
        except Exception as e:
            logger.error(f"Error getting latest block: {e}")
            return 0
    
    async def get_block_transactions(self, block_number: int) -> List[Dict]:
        """Get all transactions from a specific block."""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            block = await loop.run_in_executor(None, lambda: self.w3.eth.get_block(block_number, full_transactions=True))
            transactions = []
            
            for tx in block.transactions:
                # Filter for USDT transactions (you can modify this filter)
                if self.is_usdt_transaction(tx):
                    transaction_data = await self.format_transaction(tx, block)
                    if transaction_data:
                        transactions.append(transaction_data)
            
            return transactions
        except Exception as e:
            logger.error(f"Error getting block {block_number}: {e}")
            return []
    
    def is_usdt_transaction(self, tx) -> bool:
        """Check if transaction is related to USDT or other stablecoins."""
        # USDT contract addresses
        usdt_addresses = {
            "0xdac17f958d2ee523a2206206994597c13d831ec7",  # USDT (Ethereum)
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",  # USDC
            "0x6b175474e89094c44da98b954eedeac495271d0f",  # DAI
        }
        
        # Check if transaction is to/from USDT contracts
        if tx.to and tx.to.lower() in usdt_addresses:
            return True
        
        # Check if transaction has input data (contract interaction)
        if tx.input and len(tx.input) > 10:
            return True
        
        # Include high-value ETH transactions
        if tx.value > self.w3.to_wei(1, 'ether'):
            return True
        
        return False
    
    async def format_transaction(self, tx, block) -> Optional[Dict]:
        """Format transaction data for our application with proper USD calculations."""
        try:
            # Get transaction receipt for more details
            receipt = self.w3.eth.get_transaction_receipt(tx.hash)
            
            # Calculate gas fee
            gas_used = receipt.gasUsed
            gas_price = tx.gasPrice
            gas_fee_wei = gas_used * gas_price
            gas_fee_eth = self.w3.from_wei(gas_fee_wei, 'ether')
            
            # Get real-time ETH price
            eth_price_usd = await price_service.get_eth_price_usd()
            
            # Check if addresses are contracts
            is_to_contract = await self.is_contract_address(tx.to) if tx.to else False
            is_from_contract = await self.is_contract_address(tx['from'])
            
            # Determine transaction value and type
            value_usd = 0.0
            value_eth = 0.0
            
            if tx.value > 0:
                # ETH transaction - show ETH amount and USD equivalent
                value_eth = float(self.w3.from_wei(tx.value, 'ether'))
                value_usd = value_eth * eth_price_usd
                logger.debug(f"ETH tx: {value_eth} ETH = ${value_usd:.2f}")
            else:
                # Contract interaction - try to decode token transfer
                token_transfer = await self.decode_token_transfer(tx, receipt)
                if token_transfer:
                    # For stablecoins (USDT/USDC/DAI), the token amount IS the USD value
                    value_usd = token_transfer["amount"]
                    # Calculate ETH equivalent for reference
                    value_eth = value_usd / eth_price_usd if eth_price_usd > 0 else 0
                    logger.debug(f"Token tx: {token_transfer['symbol']} {value_usd} ≈ {value_eth:.6f} ETH")
                else:
                    # Contract interaction with no token transfer
                    value_usd = 0.0
                    value_eth = 0.0
            
            return {
                "hash": tx.hash.hex(),
                "from_address": tx['from'],
                "to_address": tx.to or "0x0000000000000000000000000000000000000000",
                "value": value_usd,  # USD value (either ETH->USD or token amount)
                "eth_value": value_eth,  # ETH equivalent
                "block_number": block.number,
                "timestamp": datetime.fromtimestamp(block.timestamp),
                "is_contract": is_to_contract,
                "gas_used": gas_used,
                "gas_price": float(self.w3.from_wei(gas_price, 'gwei'))
            }
        except Exception as e:
            logger.error(f"Error formatting transaction {tx.hash.hex()}: {e}")
            return None
    
    async def is_contract_address(self, address: str) -> bool:
        """Check if an address is a smart contract."""
        if not address:
            return False
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            code = await loop.run_in_executor(None, lambda: self.w3.eth.get_code(Web3.to_checksum_address(address)))
            return len(code) > 0
        except Exception as e:
            logger.error(f"Error checking contract status for {address}: {e}")
            return False
    
    async def decode_token_transfer(self, tx, receipt) -> Optional[Dict]:
        """Decode token transfer amount and details from transaction logs."""
        try:
            # ERC-20 Transfer event signature
            transfer_signature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
            
            # Known token contracts with their details
            known_tokens = {
                "0xdac17f958d2ee523a2206206994597c13d831ec7": {"symbol": "USDT", "decimals": 6},
                "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {"symbol": "USDC", "decimals": 6},
                "0x6b175474e89094c44da98b954eedeac495271d0f": {"symbol": "DAI", "decimals": 18},
            }
            
            for log in receipt.logs:
                if len(log.topics) > 0 and log.topics[0].hex() == transfer_signature:
                    contract_address = log.address.lower()
                    
                    # Check if this is a known token
                    token_info = known_tokens.get(contract_address)
                    if not token_info:
                        continue  # Skip unknown tokens
                    
                    # Decode transfer amount
                    if len(log.data) >= 66:  # 0x + 64 hex chars
                        amount_hex = log.data[-64:]
                        amount_wei = int(amount_hex, 16)
                        
                        decimals = token_info["decimals"]
                        amount = amount_wei / (10 ** decimals)
                        
                        return {
                            "amount": float(amount),
                            "symbol": token_info["symbol"],
                            "contract": contract_address,
                            "decimals": decimals
                        }
            
            return None
        except Exception as e:
            logger.error(f"Error decoding token transfer: {e}")
            return None
    
    async def get_recent_transactions(self, count: int = 20) -> List[Dict]:
        """Get recent transactions from the latest blocks."""
        try:
            latest_block = await self.get_latest_block_number()
            transactions = []
            
            # Look through the last few blocks
            for block_num in range(latest_block, latest_block - 10, -1):
                if len(transactions) >= count:
                    break
                
                block_txs = await self.get_block_transactions(block_num)
                transactions.extend(block_txs)
            
            # Sort by timestamp and return the most recent
            transactions.sort(key=lambda x: x['timestamp'], reverse=True)
            return transactions[:count]
        
        except Exception as e:
            logger.error(f"Error getting recent transactions: {e}")
            return []
    
    async def start_real_time_monitoring(self, callback_func):
        """Start monitoring new blocks for transactions."""
        logger.info("🔄 Starting real-time transaction monitoring...")
        
        last_block = await self.get_latest_block_number()
        
        while True:
            try:
                current_block = await self.get_latest_block_number()
                
                # Process new blocks
                if current_block > last_block:
                    for block_num in range(last_block + 1, current_block + 1):
                        transactions = await self.get_block_transactions(block_num)
                        
                        for tx in transactions:
                            await callback_func(tx)
                    
                    last_block = current_block
                
                # Wait before checking again
                await asyncio.sleep(12)  # Ethereum block time is ~12 seconds
                
            except Exception as e:
                logger.error(f"Error in real-time monitoring: {e}")
                await asyncio.sleep(30)  # Wait longer on error

# Global instance
real_ethereum_service = RealEthereumService()
