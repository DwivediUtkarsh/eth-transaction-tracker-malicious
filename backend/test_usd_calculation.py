#!/usr/bin/env python3
"""
Test script for USD calculation improvements.
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print('🔍 Environment Variables:')
print(f'USE_REAL_ETHEREUM: {os.getenv("USE_REAL_ETHEREUM")}')
print(f'ETHEREUM_RPC_URL: {os.getenv("ETHEREUM_RPC_URL")}')
print(f'DISABLE_MOCK_TRANSACTIONS: {os.getenv("DISABLE_MOCK_TRANSACTIONS")}')

from services.ethereum_real import RealEthereumService
from services.price_service import price_service

async def test_price_service():
    print('\n🔍 Testing Price Service...')
    try:
        eth_price = await price_service.get_eth_price_usd()
        usdt_price = await price_service.get_token_price_usd('usdt')
        usdc_price = await price_service.get_token_price_usd('usdc')
        
        print(f'✅ ETH Price: ${eth_price:.2f}')
        print(f'✅ USDT Price: ${usdt_price:.4f}')
        print(f'✅ USDC Price: ${usdc_price:.4f}')
        
        return True
    except Exception as e:
        print(f'❌ Price Service Error: {e}')
        return False

async def test_ethereum_service():
    print('\n🔍 Testing Real Ethereum Service...')
    service = RealEthereumService()
    
    try:
        if service.is_connected():
            print('✅ Connected to Ethereum network')
            latest_block = await service.get_latest_block_number()
            print(f'✅ Latest block: {latest_block}')
            
            # Get one transaction to test USD calculation
            transactions = await service.get_recent_transactions(1)
            if transactions:
                tx = transactions[0]
                print(f'\n📊 Sample Transaction with USD Calculation:')
                print(f'  Hash: {tx["hash"]}')
                print(f'  Value (USD): ${tx["value"]:.2f}')
                print(f'  ETH Value: {tx["eth_value"]:.6f} ETH')
                print(f'  Is Contract: {tx["is_contract"]}')
                print(f'  Block: {tx["block_number"]}')
                print(f'  Timestamp: {tx["timestamp"]}')
                return True
            else:
                print('⚠️ No transactions found')
                return False
        else:
            print('❌ Failed to connect to Ethereum network')
            return False
                
    except Exception as e:
        print(f'❌ Ethereum Service Error: {e}')
        return False

async def main():
    print('🚀 Testing USD Calculation Improvements\n')
    
    # Test price service first
    price_ok = await test_price_service()
    
    # Test ethereum service
    eth_ok = await test_ethereum_service()
    
    print('\n📋 Test Results:')
    print(f'  Price Service: {"✅ PASS" if price_ok else "❌ FAIL"}')
    print(f'  Ethereum Service: {"✅ PASS" if eth_ok else "❌ FAIL"}')
    
    if price_ok and eth_ok:
        print('\n🎉 All tests passed! USD calculations should now be accurate.')
    else:
        print('\n⚠️ Some tests failed. Check the errors above.')

if __name__ == "__main__":
    asyncio.run(main())
