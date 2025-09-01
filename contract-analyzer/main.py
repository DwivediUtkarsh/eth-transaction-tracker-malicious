from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import json
import uuid
import asyncio
from typing import Dict, Optional
from datetime import datetime
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart Contract Security Analyzer", version="1.0.0")

# In-memory storage for analysis results (replace with Redis/DB in production)
analysis_results: Dict[str, dict] = {}

class ContractAnalysisRequest(BaseModel):
    contract_address: str

class AnalysisResponse(BaseModel):
    task_id: str
    status: str
    message: str

class AnalysisResult(BaseModel):
    task_id: str
    status: str
    contract_address: Optional[str] = None
    verdict: Optional[str] = None
    explanation: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

SECURITY_PROMPT = """
You are a security auditor AI specializing in Ethereum smart contracts.
Your goal is to analyze Solidity source code and determine if it is malicious or benign.
Malicious contracts may attempt wallet draining, hidden owner-only access, phishing, reentrancy, or unauthorized transfers.

Instructions:
1. Read the provided Solidity contract code carefully.
2. Look for red flags, such as:
 - Use of tx.origin for access control (often used in wallet drainers).
 - Hidden privileged calls to arbitrary addresses.
 - Batch/multicall execution with unvalidated data.
 - External low-level calls (call, delegatecall, staticcall) with untrusted input.
 - Storage slots used to store owner/target addresses without proper initialization.
 - Functions allowing transfer of ETH/tokens to attacker-controlled addresses.
 - Opaque function names like func_xxxx that obscure intent.
3. Think step by step about how an attacker could exploit the contract.
4. Based on the reasoning, output one of the following verdicts:
 - MALICIOUS - if the contract has wallet draining or exploitable logic.
 - SUSPICIOUS - if it contains potential vulnerabilities but not outright malicious.
 - BENIGN - if it appears safe and implements common patterns without hidden risks.

Output Format (strict JSON):
{
 "verdict": "MALICIOUS | SUSPICIOUS | BENIGN",
 "explanation": "short explanation of why this verdict was chosen",
 "security_score": 0-100,
 "attack_vectors": ["list", "of", "potential", "attack", "methods"]
}
"""

def get_decompiled_contract(contract_address: str) -> str:
    """Fetch decompiled contract code from ethervm.io"""
    try:
        url = f"https://ethervm.io/decompile/{contract_address}"
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, "html.parser")
        code_div = soup.find("div", class_="code javascript")
        
        if code_div:
            return code_div.get_text()
        else:
            return "Code not found"
    except Exception as e:
        logger.error(f"Error fetching contract {contract_address}: {str(e)}")
        raise Exception(f"Failed to fetch contract code: {str(e)}")

def analyze_contract(contract_source: str) -> dict:
    """Analyze a Solidity contract with Gemini and return structured verdict."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = SECURITY_PROMPT + "\n\nContract Source:\n" + contract_source
        
        response = model.generate_content(prompt)
        raw_output = response.text.strip()
        
        # Try parsing JSON
        try:
            result = json.loads(raw_output)
        except json.JSONDecodeError:
            # Fallback: extract JSON substring
            start, end = raw_output.find("{"), raw_output.rfind("}") + 1
            if start != -1 and end != -1:
                result = json.loads(raw_output[start:end])
            else:
                result = {"verdict": "UNKNOWN", "explanation": raw_output}
        
        return result
    except Exception as e:
        logger.error(f"Error analyzing contract: {str(e)}")
        raise Exception(f"Failed to analyze contract: {str(e)}")

async def process_contract_analysis(task_id: str, contract_address: str):
    """Background task to process contract analysis"""
    try:
        logger.info(f"Starting analysis for task {task_id}, contract {contract_address}")
        
        # Update status to processing
        analysis_results[task_id].update({
            "status": "processing",
            "contract_address": contract_address
        })
        
        # Fetch decompiled contract
        decompiled_code = get_decompiled_contract(contract_address)
        
        if decompiled_code == "Code not found":
            analysis_results[task_id].update({
                "status": "failed",
                "error": "Contract code not found or could not be decompiled",
                "completed_at": datetime.utcnow()
            })
            return
        
        # Analyze contract with Gemini
        verdict = analyze_contract(decompiled_code)
        
        # Update results
        analysis_results[task_id].update({
            "status": "completed",
            "verdict": verdict.get("verdict", "UNKNOWN"),
            "explanation": verdict.get("explanation", "No explanation provided"),
            "security_score": verdict.get("security_score", 50),
            "attack_vectors": verdict.get("attack_vectors", []),
            "completed_at": datetime.utcnow()
        })
        
        logger.info(f"Analysis completed for task {task_id}: {verdict.get('verdict')}")
        
    except Exception as e:
        logger.error(f"Analysis failed for task {task_id}: {str(e)}")
        analysis_results[task_id].update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.utcnow()
        })

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_contract_endpoint(
    request: ContractAnalysisRequest, 
    background_tasks: BackgroundTasks
):
    """Submit a contract for security analysis"""
    
    # Validate contract address format (basic validation)
    contract_address = request.contract_address.strip()
    if not contract_address.startswith("0x") or len(contract_address) != 42:
        raise HTTPException(
            status_code=400, 
            detail="Invalid contract address format. Must be a 42-character hex string starting with 0x"
        )
    
    # Generate unique task ID
    task_id = str(uuid.uuid4())
    
    # Initialize task in storage
    analysis_results[task_id] = {
        "task_id": task_id,
        "status": "queued",
        "contract_address": contract_address,
        "created_at": datetime.utcnow()
    }
    
    # Add background task
    background_tasks.add_task(process_contract_analysis, task_id, contract_address)
    
    logger.info(f"Analysis queued for contract {contract_address} with task ID {task_id}")
    
    return AnalysisResponse(
        task_id=task_id,
        status="queued",
        message="Analysis has been queued. Use the task_id to check status."
    )

@app.get("/status/{task_id}", response_model=AnalysisResult)
async def get_analysis_status(task_id: str):
    """Get the status and results of an analysis task"""
    
    if task_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Task not found")
    
    result = analysis_results[task_id]
    return AnalysisResult(**result)

@app.get("/results/{task_id}")
async def get_analysis_results(task_id: str):
    """Get the final analysis results in the original JSON format"""
    
    if task_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Task not found")
    
    result = analysis_results[task_id]
    
    if result["status"] == "completed":
        return {
            "verdict": result["verdict"],
            "explanation": result["explanation"]
        }
    elif result["status"] == "failed":
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {result.get('error', 'Unknown error')}"
        )
    else:
        raise HTTPException(
            status_code=202, 
            detail=f"Analysis is still {result['status']}. Please check back later."
        )

@app.delete("/cleanup")
async def cleanup_old_results():
    """Clean up old analysis results (for maintenance)"""
    current_time = datetime.utcnow()
    to_delete = []
    
    for task_id, result in analysis_results.items():
        # Delete results older than 24 hours
        if result.get("completed_at"):
            age = current_time - result["completed_at"]
            if age.total_seconds() > 86400:  # 24 hours
                to_delete.append(task_id)
    
    for task_id in to_delete:
        del analysis_results[task_id]
    
    return {"message": f"Cleaned up {len(to_delete)} old results"}

@app.get("/")
async def root():
    """API health check and info"""
    return {
        "message": "Smart Contract Security Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "POST /analyze": "Submit contract for analysis",
            "GET /status/{task_id}": "Check analysis status",
            "GET /results/{task_id}": "Get final results",
            "DELETE /cleanup": "Clean up old results"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

