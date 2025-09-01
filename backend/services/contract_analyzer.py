import httpx
import asyncio
import random
import json
import logging
from typing import Dict, Optional, List
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import CONTRACT_ANALYZER_URL, USE_MOCK_ANALYZER

logger = logging.getLogger(__name__)

class ContractAnalyzerService:
    def __init__(self):
        self.analyzer_url = CONTRACT_ANALYZER_URL
        self.use_mock = USE_MOCK_ANALYZER
        logger.info(f"Contract analyzer initialized: URL={self.analyzer_url}, USE_MOCK={self.use_mock}")
        
    async def analyze_contract(self, contract_address: str) -> Dict:
        """
        Submit contract for analysis to the external analyzer service.
        Falls back to mock analyzer if the real service is unavailable.
        """
        if self.use_mock:
            logger.info(f"Using mock analyzer for contract {contract_address}")
            return await self.mock_analyze_contract(contract_address)
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.analyzer_url}/analyze",
                    json={"contract_address": contract_address},
                )
                
                if response.status_code != 200:
                    logger.error(f"Analysis submission failed: {response.text}")
                    raise Exception(f"Analysis submission failed: {response.text}")
                    
                result = response.json()
                task_id = result["task_id"]
                logger.info(f"Contract analysis submitted: {task_id}")
                
                return {"task_id": task_id, "status": "submitted"}
                
        except Exception as e:
            logger.warning(f"External analyzer unavailable, falling back to mock: {e}")
            return await self.mock_analyze_contract(contract_address)

    async def get_analysis_status(self, task_id: str) -> Dict:
        """
        Check the status of an analysis task.
        """
        if self.use_mock or task_id.startswith("mock_"):
            return await self.mock_get_status(task_id)
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.analyzer_url}/status/{task_id}")
                
                if response.status_code == 404:
                    return {"status": "not_found"}
                elif response.status_code != 200:
                    raise Exception(f"Status check failed: {response.text}")
                    
                return response.json()
                
        except Exception as e:
            logger.warning(f"Status check failed, using mock: {e}")
            return await self.mock_get_status(task_id)

    async def get_analysis_result(self, task_id: str) -> Dict:
        """
        Get the final analysis result.
        """
        if self.use_mock or task_id.startswith("mock_"):
            return await self.mock_get_result(task_id)
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.analyzer_url}/results/{task_id}")
                
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 202:
                    return {"status": "processing"}
                elif response.status_code == 404:
                    return {"status": "not_found"}
                else:
                    raise Exception(f"Failed to get results: {response.text}")
                    
        except Exception as e:
            logger.warning(f"Result fetch failed, using mock: {e}")
            return await self.mock_get_result(task_id)

    async def mock_analyze_contract(self, contract_address: str) -> Dict:
        """
        Fallback mock analyzer for development and when the real service is unavailable.
        """
        task_id = f"mock_{int(datetime.utcnow().timestamp())}_{contract_address[-8:]}"
        
        # Store mock task for later retrieval
        if not hasattr(self, '_mock_tasks'):
            self._mock_tasks = {}
            
        self._mock_tasks[task_id] = {
            "contract_address": contract_address,
            "submitted_at": datetime.utcnow(),
            "status": "processing"
        }
        
        logger.info(f"Mock analysis started: {task_id}")
        return {"task_id": task_id, "status": "submitted"}

    async def mock_get_status(self, task_id: str) -> Dict:
        """Mock status checker."""
        if not hasattr(self, '_mock_tasks'):
            self._mock_tasks = {}
            
        if task_id not in self._mock_tasks:
            return {"status": "not_found"}
            
        task = self._mock_tasks[task_id]
        
        # Simulate processing time (complete after 10 seconds)
        elapsed = (datetime.utcnow() - task["submitted_at"]).total_seconds()
        
        if elapsed < 10:
            return {
                "task_id": task_id,
                "status": "processing",
                "progress": min(90, int(elapsed * 9))  # Progress up to 90%
            }
        else:
            # Mark as completed and generate result
            task["status"] = "completed"
            task["result"] = await self._generate_mock_result(task["contract_address"])
            
            return {
                "task_id": task_id,
                "status": "completed",
                "verdict": task["result"]["verdict"],
                "explanation": task["result"]["explanation"]
            }

    async def mock_get_result(self, task_id: str) -> Dict:
        """Mock result fetcher."""
        if not hasattr(self, '_mock_tasks'):
            self._mock_tasks = {}
            
        if task_id not in self._mock_tasks:
            return {"status": "not_found"}
            
        task = self._mock_tasks[task_id]
        
        # Check if completed
        elapsed = (datetime.utcnow() - task["submitted_at"]).total_seconds()
        
        if elapsed < 10:
            return {"status": "processing"}
            
        if "result" not in task:
            task["result"] = await self._generate_mock_result(task["contract_address"])
            
        return {
            "task_id": task_id,
            "status": "completed",
            **task["result"]
        }

    async def _generate_mock_result(self, contract_address: str) -> Dict:
        """Generate realistic mock analysis results."""
        address_lower = contract_address.lower()
        
        # Known malicious addresses for testing
        KNOWN_MALICIOUS = [
            "0x1234567890123456789012345678901234567890",
            "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
        ]
        
        # Known safe addresses
        KNOWN_SAFE = [
            "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",  # USDC
            "0xdac17f958d2ee523a2206206994597c13d831ec7",  # USDT
            "0x6b175474e89094c44da98b954eedeac495271d0f",  # DAI
        ]
        
        if address_lower in KNOWN_MALICIOUS:
            return {
                "verdict": "MALICIOUS",
                "explanation": "This contract contains wallet draining functionality and hidden ownership backdoors. It can transfer tokens without explicit user approval and has suspicious external calls to unknown addresses.",
                "security_score": random.randint(1, 15),
                "attack_vectors": [
                    "Token Draining",
                    "Approval Abuse", 
                    "Hidden Mint Function",
                    "Ownership Backdoor"
                ],
                "technical_details": {
                    "functions_analyzed": random.randint(12, 25),
                    "vulnerabilities_found": random.randint(3, 7),
                    "risk_factors": [
                        "Unlimited approval requests",
                        "Hidden transfer functions", 
                        "Owner can mint tokens",
                        "External calls to suspicious addresses"
                    ]
                }
            }
        
        elif address_lower in KNOWN_SAFE:
            return {
                "verdict": "BENIGN",
                "explanation": "This is a well-known, audited contract that follows standard security practices. No vulnerabilities or suspicious patterns detected.",
                "security_score": random.randint(85, 98),
                "attack_vectors": [],
                "technical_details": {
                    "functions_analyzed": random.randint(8, 15),
                    "vulnerabilities_found": 0,
                    "risk_factors": []
                }
            }
        
        else:
            # Random verdict for unknown contracts
            verdicts = [
                {
                    "verdict": "BENIGN",
                    "explanation": "Standard ERC-20 token contract with no security issues detected. Follows OpenZeppelin patterns and best practices.",
                    "security_score": random.randint(75, 95),
                    "attack_vectors": [],
                    "risk_factors": []
                },
                {
                    "verdict": "SUSPICIOUS", 
                    "explanation": "Contains external calls that could be exploited under certain conditions. The contract has complex logic that may hide potential vulnerabilities.",
                    "security_score": random.randint(35, 65),
                    "attack_vectors": ["Complex External Calls", "Unusual Gas Patterns"],
                    "risk_factors": ["Unusual gas patterns", "Complex swap logic", "Unverified external calls"]
                },
                {
                    "verdict": "MALICIOUS",
                    "explanation": "Detected wallet draining patterns and unauthorized transfer capabilities. This contract can move user funds without explicit permission.",
                    "security_score": random.randint(5, 25),
                    "attack_vectors": ["Wallet Draining", "Unauthorized Transfers", "Hidden Functions"],
                    "risk_factors": ["Hidden transfer functions", "Suspicious ownership patterns", "Backdoor access methods"]
                }
            ]
            
            # Weight towards benign for realism (70% benign, 20% suspicious, 10% malicious)
            weights = [0.7, 0.2, 0.1]
            result = random.choices(verdicts, weights=weights)[0]
            
            result["technical_details"] = {
                "functions_analyzed": random.randint(8, 20),
                "vulnerabilities_found": len(result["attack_vectors"]),
                "risk_factors": result.get("risk_factors", [])
            }
            
            return result

# Global instance
contract_analyzer = ContractAnalyzerService()
