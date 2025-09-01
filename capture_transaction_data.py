#!/usr/bin/env python3
"""
Capture real transaction data from Alchemy API to verify USD calculations.
"""
import asyncio
import json
import sys
import os
sys.path.append('backend')

from backend.services.ethereum_real import RealEthereumService
from backend.services.price_service import price_service
from dotenv import load_dotenv

# Load environment variables
load_dotenv('backend/.env')

async def capture_transaction_data():
    print('🔍 Capturing Real Transaction Data from Alchemy...\n')
    
    service = RealEthereumService()
    
    if not service.is_connected():
        print('❌ Failed to connect to Alchemy. Check your API key.')
        return
    
    try:
        # Get current ETH price for reference
        eth_price = await price_service.get_eth_price_usd()
        print(f'📊 Current ETH Price: ${eth_price:.2f}\n')
        
        # Get recent transactions
        print('🔄 Fetching recent transactions...')
        transactions = await service.get_recent_transactions(5)
        
        if not transactions:
            print('⚠️ No transactions found. This might be due to filtering.')
            return
        
        print(f'✅ Found {len(transactions)} transactions\n')
        
        for i, tx in enumerate(transactions, 1):
            print(f'{"="*60}')
            print(f'📋 TRANSACTION #{i}')
            print(f'{"="*60}')
            
            # Display all transaction fields
            for key, value in tx.items():
                if key == 'timestamp':
                    print(f'  {key:15}: {value} ({value.strftime("%Y-%m-%d %H:%M:%S")})')
                elif key in ['value', 'eth_value']:
                    print(f'  {key:15}: {value:.6f}')
                elif key == 'gas_price':
                    print(f'  {key:15}: {value:.2f} Gwei')
                else:
                    print(f'  {key:15}: {value}')
            
            # Show Etherscan URL for verification
            etherscan_url = f"https://etherscan.io/tx/{tx['hash']}"
            print(f'\n🔗 Verify on Etherscan: {etherscan_url}')
            
            # Analysis
            print(f'\n📊 USD Calculation Analysis:')
            if tx['eth_value'] > 0:
                calculated_usd = tx['eth_value'] * eth_price
                print(f'  Type: ETH Transaction')
                print(f'  ETH Amount: {tx["eth_value"]:.6f} ETH')
                print(f'  ETH Price: ${eth_price:.2f}')
                print(f'  Calculated USD: ${calculated_usd:.2f}')
                print(f'  Our USD Value: ${tx["value"]:.2f}')
                print(f'  Match: {"✅ YES" if abs(calculated_usd - tx["value"]) < 0.01 else "❌ NO"}')
            else:
                print(f'  Type: Contract Interaction / Token Transfer')
                print(f'  Our USD Value: ${tx["value"]:.2f}')
                if tx["value"] > 0:
                    print(f'  Likely: Token transfer (USDT/USDC/DAI)')
                else:
                    print(f'  Likely: Contract call with no token transfer')
            
            print(f'\n💡 To verify: Copy the hash and check on Etherscan!')
            print()
        
        # Show raw Web3 transaction for comparison
        print(f'{"="*60}')
        print(f'🔧 RAW WEB3 TRANSACTION SAMPLE')
        print(f'{"="*60}')
        
        latest_block = await service.get_latest_block_number()
        print(f'Getting raw transaction from block {latest_block}...')
        
        # Get raw block data
        import asyncio
        loop = asyncio.get_event_loop()
        block = await loop.run_in_executor(None, lambda: service.w3.eth.get_block(latest_block, full_transactions=True))
        
        if block.transactions:
            raw_tx = block.transactions[0]
            print(f'\n📋 Raw Web3 Transaction Structure:')
            print(f'  hash: {raw_tx.hash.hex()}')
            print(f'  from: {raw_tx["from"]}')
            print(f'  to: {raw_tx.to}')
            print(f'  value (wei): {raw_tx.value}')
            print(f'  value (ETH): {service.w3.from_wei(raw_tx.value, "ether")}')
            print(f'  gasPrice (wei): {raw_tx.gasPrice}')
            print(f'  gasPrice (Gwei): {service.w3.from_wei(raw_tx.gasPrice, "gwei")}')
            print(f'  gas: {raw_tx.gas}')
            print(f'  input: {raw_tx.input.hex()[:100]}...')
            
            # Get receipt
            receipt = service.w3.eth.get_transaction_receipt(raw_tx.hash)
            print(f'\n📋 Transaction Receipt:')
            print(f'  gasUsed: {receipt.gasUsed}')
            print(f'  status: {receipt.status}')
            print(f'  logs count: {len(receipt.logs)}')
            
            if receipt.logs:
                print(f'  First log address: {receipt.logs[0].address}')
                print(f'  First log topics: {[t.hex() for t in receipt.logs[0].topics]}')
        
    except Exception as e:
        print(f'❌ Error: {e}')
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(capture_transaction_data())
