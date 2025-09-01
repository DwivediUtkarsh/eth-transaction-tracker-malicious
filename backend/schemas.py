from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List
import re

class TransactionResponse(BaseModel):
    hash: str
    from_address: str
    to_address: str
    value: float
    value_usd: float
    eth_value: float
    block_number: int
    timestamp: datetime
    is_contract: bool
    gas_used: int
    gas_price: float
    analysis_status: Optional[str] = None
    verdict: Optional[str] = None
    security_score: Optional[int] = None
    
    class Config:
        from_attributes = True

class AnalysisRequest(BaseModel):
    contract_address: str = Field(..., min_length=42, max_length=42)
    transaction_hash: Optional[str] = Field(None, min_length=66, max_length=66)
    
    @validator('contract_address')
    def validate_contract_address(cls, v):
        if not re.match(r'^0x[a-fA-F0-9]{40}$', v):
            raise ValueError('Invalid Ethereum address format')
        return v.lower()
    
    @validator('transaction_hash')
    def validate_transaction_hash(cls, v):
        if v and not re.match(r'^0x[a-fA-F0-9]{64}$', v):
            raise ValueError('Invalid transaction hash format')
        return v.lower() if v else v

class AnalysisStatusResponse(BaseModel):
    task_id: str
    status: str
    verdict: Optional[str] = None
    explanation: Optional[str] = None
    security_score: Optional[int] = None
    attack_vectors: Optional[List[str]] = None
    analyzed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AnalysisResultResponse(BaseModel):
    task_id: str
    contract_address: str
    status: str
    verdict: Optional[str] = None
    explanation: Optional[str] = None
    security_score: Optional[int] = None
    attack_vectors: Optional[List[str]] = None
    analyzed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_transactions: int
    today_transactions: int
    malicious_contracts: int
    contracts_analyzed_today: int
    is_live: bool = True

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str = "1.0.0"
    services: dict

class WebSocketMessage(BaseModel):
    type: str
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    has_next: bool

