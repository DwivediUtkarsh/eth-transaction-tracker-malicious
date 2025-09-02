import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, and_, func
from sqlalchemy.orm import sessionmaker, Session
from contextlib import asynccontextmanager

from config import API_HOST, API_PORT, DATABASE_URL, ALLOWED_ORIGINS, MOCK_TRANSACTION_INTERVAL, USE_REAL_ETHEREUM, DISABLE_MOCK_TRANSACTIONS
from models import Base, Transaction, ContractAnalysis
from schemas import (
    TransactionResponse, TransactionListResponse, AnalysisRequest, 
    AnalysisStatusResponse, AnalysisResultResponse, StatsResponse, 
    HealthResponse, WebSocketMessage
)
from services.ethereum import ethereum_service
from services.ethereum_real import real_ethereum_service
from services.contract_analyzer import contract_analyzer
from services.cache import transaction_cache, analysis_cache, stats_cache
from websocket_manager import manager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database setup
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Background task for handling transactions
async def handle_transactions():
    """Background task that handles real or mock transactions."""
    if USE_REAL_ETHEREUM and real_ethereum_service.is_connected():
        logger.info("🔄 Starting real Ethereum transaction monitoring...")
        await real_ethereum_service.start_real_time_monitoring(process_new_transaction)
    else:
        logger.info("🔄 Starting mock transaction generation...")
        await generate_mock_transactions()

async def process_new_transaction(tx_data: dict):
    """Process a new transaction (real or mock) and save to database."""
    db = SessionLocal()
    try:
        db_transaction = Transaction(**tx_data)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        
        # Convert to response format
        tx_response = TransactionResponse(
            hash=db_transaction.hash,
            from_address=db_transaction.from_address,
            to_address=db_transaction.to_address,
            value=db_transaction.value,
            value_usd=db_transaction.value,
            eth_value=db_transaction.eth_value,
            block_number=db_transaction.block_number,
            timestamp=db_transaction.timestamp,
            is_contract=db_transaction.is_contract,
            gas_used=db_transaction.gas_used,
            gas_price=db_transaction.gas_price
        )
        
        # Broadcast to WebSocket clients
        await manager.broadcast_transaction(tx_response.dict())
        
        source = "real" if USE_REAL_ETHEREUM else "mock"
        logger.info(f"Processed {source} transaction: {db_transaction.hash}")
        
    except Exception as e:
        logger.error(f"Failed to save transaction: {e}")
        db.rollback()
    finally:
        db.close()

# Background task for generating mock transactions (fallback)
async def generate_mock_transactions():
    """Background task that generates mock transactions every few seconds."""
    if DISABLE_MOCK_TRANSACTIONS:
        logger.info("🚫 Mock transactions disabled by DISABLE_MOCK_TRANSACTIONS flag")
        return
        
    while True:
        try:
            # Generate a new transaction
            mock_tx = ethereum_service.generate_mock_transaction()
            await process_new_transaction(mock_tx)
            
        except Exception as e:
            logger.error(f"Error in mock transaction generation: {e}")
        
        await asyncio.sleep(MOCK_TRANSACTION_INTERVAL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")
    
    # Start background task for transactions (real or mock)
    task = asyncio.create_task(handle_transactions())
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

# Create FastAPI app
app = FastAPI(
    title="Ethereum Transaction Tracker API",
    description="Backend API for Ethereum transaction tracking with smart contract security analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        services={
            "database": "connected",
            "websocket": f"{manager.get_connection_count()} connections",
            "analyzer": "available" if not contract_analyzer.use_mock else "mock"
        }
    )

# Transaction endpoints
@app.get("/api/transactions", response_model=TransactionListResponse)
async def get_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    min_value: Optional[float] = Query(None, ge=0),
    max_value: Optional[float] = Query(None, ge=0),
    db: Session = Depends(get_db)
):
    """Get list of transactions with pagination and filtering."""
    
    # Build cache key
    cache_key = f"transactions:{page}:{page_size}:{min_value}:{max_value}"
    cached_result = transaction_cache.get(cache_key)
    if cached_result:
        return cached_result
    
    # Build query
    query = db.query(Transaction)
    
    # Apply filters
    if min_value is not None:
        query = query.filter(Transaction.value >= min_value)
    if max_value is not None:
        query = query.filter(Transaction.value <= max_value)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    transactions = query.order_by(Transaction.timestamp.desc()).offset(offset).limit(page_size).all()
    
    # Convert to response format
    transaction_responses = []
    for tx in transactions:
        # Get latest analysis if available
        latest_analysis = db.query(ContractAnalysis).filter(
            ContractAnalysis.contract_address == tx.to_address
        ).order_by(ContractAnalysis.analyzed_at.desc()).first()
        
        tx_response = TransactionResponse(
            hash=tx.hash,
            from_address=tx.from_address,
            to_address=tx.to_address,
            value=tx.value,
            value_usd=tx.value,
            eth_value=tx.eth_value,
            block_number=tx.block_number,
            timestamp=tx.timestamp,
            is_contract=tx.is_contract,
            gas_used=tx.gas_used,
            gas_price=tx.gas_price,
            analysis_status=latest_analysis.status if latest_analysis else None,
            verdict=latest_analysis.verdict if latest_analysis else None,
            security_score=latest_analysis.security_score if latest_analysis else None
        )
        transaction_responses.append(tx_response)
    
    result = TransactionListResponse(
        transactions=transaction_responses,
        total=total,
        page=page,
        page_size=page_size,
        has_next=offset + page_size < total
    )
    
    # Cache the result
    transaction_cache.set(cache_key, result, ttl=60)
    
    return result

@app.get("/api/transaction/{tx_hash}", response_model=TransactionResponse)
async def get_transaction(tx_hash: str, db: Session = Depends(get_db)):
    """Get a single transaction by hash."""
    
    if not ethereum_service.validate_transaction_hash(tx_hash):
        raise HTTPException(status_code=400, detail="Invalid transaction hash format")
    
    transaction = db.query(Transaction).filter(Transaction.hash == tx_hash.lower()).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Get latest analysis if available
    latest_analysis = db.query(ContractAnalysis).filter(
        ContractAnalysis.contract_address == transaction.to_address
    ).order_by(ContractAnalysis.analyzed_at.desc()).first()
    
    return TransactionResponse(
        hash=transaction.hash,
        from_address=transaction.from_address,
        to_address=transaction.to_address,
        value=transaction.value,
        value_usd=transaction.value,
        eth_value=transaction.eth_value,
        block_number=transaction.block_number,
        timestamp=transaction.timestamp,
        is_contract=transaction.is_contract,
        gas_used=transaction.gas_used,
        gas_price=transaction.gas_price,
        analysis_status=latest_analysis.status if latest_analysis else None,
        verdict=latest_analysis.verdict if latest_analysis else None,
        security_score=latest_analysis.security_score if latest_analysis else None
    )

# Contract analysis endpoints
@app.post("/api/analyze-contract")
async def analyze_contract_endpoint(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Submit a contract for security analysis."""
    
    # Note: Basic address format validation is already handled by Pydantic schema
    
    # Check if address is actually a contract (with a more permissive approach)
    if not ethereum_service.is_contract_address(request.contract_address):
        logger.warning(f"Address {request.contract_address} not detected as contract by validation, but proceeding with analysis")
        # Instead of blocking, we'll just log a warning and proceed
        # The contract analyzer service will determine if it can actually analyze this address
    
    # Check for existing recent analysis (but only if it was successful)
    recent_analysis = db.query(ContractAnalysis).filter(
        and_(
            ContractAnalysis.contract_address == request.contract_address.lower(),
            ContractAnalysis.analyzed_at > datetime.utcnow() - timedelta(hours=24),
            ContractAnalysis.status == "completed",
            ContractAnalysis.verdict.isnot(None),  # Only return if analysis has real results
            ContractAnalysis.explanation.isnot(None)
        )
    ).first()
    
    if recent_analysis:
        logger.info(f"Found recent successful analysis for {request.contract_address}: {recent_analysis.verdict}")
        return {
            "task_id": recent_analysis.task_id,
            "status": "completed",
            "message": "Recent analysis found"
        }
    
    # If we found a recent analysis but it was incomplete/failed, log it but continue with new analysis
    old_analysis = db.query(ContractAnalysis).filter(
        and_(
            ContractAnalysis.contract_address == request.contract_address.lower(),
            ContractAnalysis.analyzed_at > datetime.utcnow() - timedelta(hours=24)
        )
    ).first()
    
    if old_analysis:
        logger.info(f"Found recent incomplete analysis for {request.contract_address}, running fresh analysis")
    
    try:
        # Submit to analyzer service
        result = await contract_analyzer.analyze_contract(request.contract_address)
        task_id = result["task_id"]
        
        # Save analysis record
        analysis = ContractAnalysis(
            contract_address=request.contract_address.lower(),
            task_id=task_id,
            status="processing",
            transaction_hash=request.transaction_hash.lower() if request.transaction_hash else None
        )
        db.add(analysis)
        db.commit()
        
        # Broadcast analysis started
        await manager.broadcast_analysis_started(request.contract_address, task_id)
        
        # Start background task to poll for results
        background_tasks.add_task(poll_analysis_result, task_id, db)
        
        logger.info(f"Contract analysis started: {request.contract_address} -> {task_id}")
        
        return {
            "task_id": task_id,
            "status": "submitted",
            "message": "Analysis started"
        }
        
    except Exception as e:
        logger.error(f"Failed to start analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/analysis-status/{task_id}", response_model=AnalysisStatusResponse)
async def get_analysis_status(task_id: str, db: Session = Depends(get_db)):
    """Get the status of a contract analysis."""
    
    analysis = db.query(ContractAnalysis).filter(ContractAnalysis.task_id == task_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # If completed, return stored result
    if analysis.status == "completed":
        attack_vectors = []
        if analysis.attack_vectors:
            try:
                import json
                attack_vectors = json.loads(analysis.attack_vectors)
            except:
                pass
        
        return AnalysisStatusResponse(
            task_id=analysis.task_id,
            status=analysis.status,
            verdict=analysis.verdict,
            explanation=analysis.explanation,
            security_score=analysis.security_score,
            attack_vectors=attack_vectors,
            analyzed_at=analysis.analyzed_at
        )
    
    # Otherwise, check with analyzer service
    try:
        result = await contract_analyzer.get_analysis_status(task_id)
        
        # Update database if status changed
        if result.get("status") != analysis.status:
            analysis.status = result.get("status", analysis.status)
            db.commit()
        
        return AnalysisStatusResponse(
            task_id=task_id,
            status=result.get("status", "unknown"),
            verdict=result.get("verdict"),
            explanation=result.get("explanation")
        )
        
    except Exception as e:
        logger.error(f"Failed to get analysis status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analysis status")

@app.get("/api/analysis-result/{task_id}", response_model=AnalysisResultResponse)
async def get_analysis_result(task_id: str, db: Session = Depends(get_db)):
    """Get the result of a contract analysis."""
    
    analysis = db.query(ContractAnalysis).filter(ContractAnalysis.task_id == task_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if analysis.status != "completed":
        raise HTTPException(status_code=202, detail="Analysis not completed yet")
    
    attack_vectors = []
    if analysis.attack_vectors:
        try:
            import json
            attack_vectors = json.loads(analysis.attack_vectors)
        except:
            pass
    
    return AnalysisResultResponse(
        task_id=analysis.task_id,
        contract_address=analysis.contract_address,
        status=analysis.status,
        verdict=analysis.verdict,
        explanation=analysis.explanation,
        security_score=analysis.security_score,
        attack_vectors=attack_vectors,
        analyzed_at=analysis.analyzed_at
    )

# Statistics endpoint
@app.get("/api/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    
    # Check cache first
    cached_stats = stats_cache.get("dashboard_stats")
    if cached_stats:
        return cached_stats
    
    # Calculate stats
    total_transactions = db.query(Transaction).count()
    
    today = datetime.utcnow().date()
    today_transactions = db.query(Transaction).filter(
        func.date(Transaction.timestamp) == today
    ).count()
    
    malicious_contracts = db.query(ContractAnalysis).filter(
        ContractAnalysis.verdict == "MALICIOUS"
    ).count()
    
    contracts_analyzed_today = db.query(ContractAnalysis).filter(
        func.date(ContractAnalysis.analyzed_at) == today
    ).count()
    
    stats = StatsResponse(
        total_transactions=total_transactions,
        today_transactions=today_transactions,
        malicious_contracts=malicious_contracts,
        contracts_analyzed_today=contracts_analyzed_today,
        is_live=True
    )
    
    # Cache for 1 minute
    stats_cache.set("dashboard_stats", stats, ttl=60)
    
    return stats

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Echo back for now (can be extended for client commands)
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background task to poll analysis results
async def poll_analysis_result(task_id: str, db: Session):
    """Background task to poll for analysis results and update database."""
    max_attempts = 60  # 5 minutes with 5-second intervals
    attempt = 0
    
    while attempt < max_attempts:
        try:
            result = await contract_analyzer.get_analysis_result(task_id)
            logger.info(f"📊 Polling result for {task_id}: {result}")
            
            # Check if result has actual analysis data (not just status)
            if result.get("verdict") and result.get("explanation"):
                # Update database with results
                analysis = db.query(ContractAnalysis).filter(
                    ContractAnalysis.task_id == task_id
                ).first()
                
                if analysis:
                    analysis.status = "completed"
                    analysis.verdict = result.get("verdict")
                    analysis.explanation = result.get("explanation")
                    analysis.security_score = result.get("security_score")
                    
                    # Store attack vectors as JSON
                    if result.get("attack_vectors"):
                        import json
                        analysis.attack_vectors = json.dumps(result["attack_vectors"])
                    
                    db.commit()
                    
                    # Broadcast completion
                    await manager.broadcast_analysis_complete({
                        "task_id": task_id,
                        "contract_address": analysis.contract_address,
                        "verdict": analysis.verdict,
                        "explanation": analysis.explanation,
                        "security_score": analysis.security_score,
                        "attack_vectors": result.get("attack_vectors", [])
                    })
                    
                    logger.info(f"Analysis completed: {analysis.contract_address} -> {analysis.verdict}")
                
                break
                
            elif result.get("status") == "failed":
                # Mark as failed
                analysis = db.query(ContractAnalysis).filter(
                    ContractAnalysis.task_id == task_id
                ).first()
                
                if analysis:
                    analysis.status = "failed"
                    db.commit()
                
                logger.error(f"Analysis failed for task: {task_id}")
                break
                
        except Exception as e:
            logger.error(f"Error polling analysis result: {e}")
        
        attempt += 1
        await asyncio.sleep(5)  # Wait 5 seconds before next attempt
    
    if attempt >= max_attempts:
        # Mark as failed due to timeout
        analysis = db.query(ContractAnalysis).filter(
            ContractAnalysis.task_id == task_id
        ).first()
        
        if analysis and analysis.status == "processing":
            analysis.status = "failed"
            db.commit()
            logger.error(f"Analysis timed out for task: {task_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT)