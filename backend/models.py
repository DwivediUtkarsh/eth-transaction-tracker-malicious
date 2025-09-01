from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Transaction(Base):
    __tablename__ = "transactions"
    
    hash = Column(String(66), primary_key=True, index=True)  # 0x + 64 hex chars
    from_address = Column(String(42), nullable=False, index=True)  # 0x + 40 hex chars
    to_address = Column(String(42), nullable=False, index=True)
    value = Column(Float, nullable=False)  # in USDT
    eth_value = Column(Float, nullable=False)  # in ETH
    block_number = Column(Integer, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    is_contract = Column(Boolean, nullable=False, default=False)
    gas_used = Column(Integer, nullable=False)
    gas_price = Column(Float, nullable=False)  # in Gwei
    
    # Relationship to contract analysis
    analyses = relationship("ContractAnalysis", back_populates="transaction")
    
    def __repr__(self):
        return f"<Transaction(hash={self.hash}, value={self.value})>"

class ContractAnalysis(Base):
    __tablename__ = "contract_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    contract_address = Column(String(42), nullable=False, index=True)
    task_id = Column(String(100), nullable=False, unique=True, index=True)
    status = Column(String(20), nullable=False, default="pending")  # pending/processing/completed/failed
    verdict = Column(String(20), nullable=True)  # MALICIOUS/SUSPICIOUS/BENIGN
    explanation = Column(Text, nullable=True)
    security_score = Column(Integer, nullable=True)  # 0-100
    attack_vectors = Column(Text, nullable=True)  # JSON string of attack vectors
    analyzed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    transaction_hash = Column(String(66), ForeignKey("transactions.hash"), nullable=True)
    
    # Relationship to transaction
    transaction = relationship("Transaction", back_populates="analyses")
    
    def __repr__(self):
        return f"<ContractAnalysis(contract={self.contract_address}, verdict={self.verdict})>"

