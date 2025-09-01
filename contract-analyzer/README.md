# 🤖 Contract Analyzer Service Documentation

AI-powered smart contract security analysis service using Google's Gemini AI for detecting malicious contracts, vulnerabilities, and security risks.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Backend       │    │ Contract        │    │ External        │
│   Service       │◄──►│ Analyzer        │◄──►│ Services        │
│                 │    │ (FastAPI)       │    │                 │
└─────────────────┘    │                 │    └─────────────────┘
                       │ ┌─────────────┐ │            │
                       │ │ Gemini AI   │ │    ┌───────────────┐
                       │ │ Analysis    │ │    │ ethervm.io    │
                       │ └─────────────┘ │    │ (Bytecode)    │
                       │                 │    └───────────────┘
                       │ ┌─────────────┐ │
                       │ │ Task Queue  │ │
                       │ │ Management  │ │
                       │ └─────────────┘ │
                       └─────────────────┘
```

## 🚀 Quick Start

### Installation
```bash
cd contract-analyzer
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Configuration
Set up your Gemini API key:
```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

### Running the Service
```bash
source venv/bin/activate
python main.py
```

The service will start on `http://localhost:8001`

## 🤖 AI Analysis Features

### 🔍 Vulnerability Detection
- **Wallet Draining**: Detects unauthorized fund transfer mechanisms
- **Reentrancy Attacks**: Identifies vulnerable external calls
- **Access Control Issues**: Finds privilege escalation vulnerabilities
- **Hidden Functions**: Discovers obfuscated malicious functionality
- **Approval Abuse**: Detects unlimited token approval exploits

### 🧠 Gemini AI Integration
- **Advanced Pattern Recognition**: Uses Google's latest AI model
- **Natural Language Explanations**: Human-readable security assessments
- **Contextual Analysis**: Understands contract logic and intent
- **Multi-layered Detection**: Combines multiple analysis techniques

### 📊 Analysis Results
- **Verdict Classification**: MALICIOUS / SUSPICIOUS / BENIGN
- **Detailed Explanations**: Why the verdict was reached
- **Security Scoring**: 0-100 risk assessment
- **Attack Vectors**: Specific vulnerability types found
- **Technical Details**: Function-level analysis results

## 🛠️ Configuration

### Environment Variables
```bash
# Required: Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Optional: Server Configuration
HOST=0.0.0.0
PORT=8001
LOG_LEVEL=INFO
```

### Configuration File
**config.py**
```python
import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8001"))

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
```

## 📁 File Structure

```
contract-analyzer/
├── main.py                    # FastAPI application entry point
├── config.py                  # Configuration management
├── requirements.txt           # Python dependencies
├── README.md                  # This documentation
└── venv/                     # Virtual environment
```

## 🔌 API Endpoints

### Service Information
```http
GET /
```
Returns service information and available endpoints.

**Response:**
```json
{
  "message": "Smart Contract Security Analyzer API",
  "version": "1.0.0",
  "endpoints": {
    "POST /analyze": "Submit contract for analysis",
    "GET /status/{task_id}": "Check analysis status",
    "GET /results/{task_id}": "Get final results",
    "DELETE /cleanup": "Clean up old results"
  }
}
```

### Submit Contract for Analysis
```http
POST /analyze
Content-Type: application/json

{
  "contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"
}
```

**Request Schema:**
```python
class ContractAnalysisRequest(BaseModel):
    contract_address: str = Field(..., min_length=42, max_length=42)
    
    @validator('contract_address')
    def validate_contract_address(cls, v):
        if not re.match(r'^0x[a-fA-F0-9]{40}$', v):
            raise ValueError('Invalid Ethereum address format')
        return v.lower()
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "queued",
  "message": "Analysis has been queued. Use the task_id to check status."
}
```

### Check Analysis Status
```http
GET /status/{task_id}
```

**Response:**
```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "contract_address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
  "verdict": "MALICIOUS",
  "explanation": "Contract contains wallet draining functionality...",
  "error": null,
  "created_at": "2025-09-01T16:30:17.293765",
  "completed_at": "2025-09-01T16:30:45.123456"
}
```

**Status Values:**
- `queued`: Analysis is waiting to start
- `processing`: Analysis is currently running
- `completed`: Analysis finished successfully
- `failed`: Analysis encountered an error

### Get Analysis Results
```http
GET /results/{task_id}
```

**Response (Success):**
```json
{
  "verdict": "MALICIOUS",
  "explanation": "The contract uses delegatecall in several functions without sufficient validation of the called contract's code. An attacker could provide a malicious contract address, resulting in arbitrary code execution within the context of this contract."
}
```

**Response (Still Processing):**
```json
{
  "detail": "Analysis is still processing. Please check back later."
}
```
*HTTP Status: 202 Accepted*

**Response (Failed):**
```json
{
  "detail": "Analysis failed: Contract code not found or could not be decompiled"
}
```
*HTTP Status: 500 Internal Server Error*

### Cleanup Old Results
```http
DELETE /cleanup
```

**Response:**
```json
{
  "message": "Cleaned up 15 old results"
}
```

## 🔄 Analysis Workflow

### 1. Contract Submission
```python
async def analyze_contract_endpoint(request: ContractAnalysisRequest, background_tasks: BackgroundTasks):
    # Validate contract address format
    contract_address = request.contract_address.strip()
    if not contract_address.startswith("0x") or len(contract_address) != 42:
        raise HTTPException(status_code=400, detail="Invalid contract address format")
    
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
```

### 2. Bytecode Retrieval
```python
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
```

### 3. AI Analysis
```python
def analyze_contract(contract_source: str) -> dict:
    """Analyze a Solidity contract with Gemini and return structured verdict."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = SECURITY_PROMPT + "\n\nContract Source:\n" + contract_source
        
        response = model.generate_content(prompt)
        raw_output = response.text.strip()
        
        # Parse JSON response
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
```

## 🧠 AI Security Prompt

The service uses a comprehensive security analysis prompt:

```python
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
 "explanation": "short explanation of why this verdict was chosen"
}
"""
```

## 📊 Analysis Examples

### Example 1: Malicious Contract Detection
**Input:** Wallet drainer contract
**Output:**
```json
{
  "verdict": "MALICIOUS",
  "explanation": "This contract contains wallet draining functionality and hidden ownership backdoors. It can transfer tokens without explicit user approval and has suspicious external calls to unknown addresses."
}
```

### Example 2: Suspicious Contract Detection
**Input:** Contract with reentrancy vulnerability
**Output:**
```json
{
  "verdict": "SUSPICIOUS", 
  "explanation": "Contains external calls that could be exploited under certain conditions. The contract has complex logic that may hide potential vulnerabilities."
}
```

### Example 3: Benign Contract Detection
**Input:** Standard ERC-20 token
**Output:**
```json
{
  "verdict": "BENIGN",
  "explanation": "Standard ERC-20 token contract with no security issues detected. Follows OpenZeppelin patterns and best practices."
}
```

## 🗄️ Data Storage

### In-Memory Storage
The service uses in-memory storage for analysis results:

```python
# Global storage for analysis results
analysis_results: Dict[str, dict] = {}

# Task structure
{
    "task_id": "uuid-string",
    "status": "queued|processing|completed|failed",
    "contract_address": "0x...",
    "verdict": "MALICIOUS|SUSPICIOUS|BENIGN",
    "explanation": "Detailed explanation...",
    "error": "Error message if failed",
    "created_at": datetime,
    "completed_at": datetime
}
```

### Cleanup Management
- Automatic cleanup of results older than 24 hours
- Manual cleanup endpoint for maintenance
- Memory usage optimization

## 🔧 Background Processing

### Task Management
```python
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
```

## 🚀 Deployment

### Development
```bash
source venv/bin/activate
python main.py
```

### Production with Gunicorn
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["python", "main.py"]
```

```bash
docker build -t contract-analyzer .
docker run -p 8001:8001 -e GEMINI_API_KEY=your_key contract-analyzer
```

### Environment Setup
```bash
# Production environment
export GEMINI_API_KEY=your_production_gemini_key
export HOST=0.0.0.0
export PORT=8001
export LOG_LEVEL=INFO
```

## 🔒 Security Considerations

### API Key Management
- Store Gemini API key securely
- Use environment variables, not hardcoded values
- Implement key rotation policies
- Monitor API usage and costs

### Input Validation
- Strict Ethereum address format validation
- Request size limits
- Rate limiting to prevent abuse
- Timeout handling for long-running analyses

### Error Handling
- Graceful handling of external service failures
- Proper error logging without exposing sensitive data
- Fallback mechanisms for service unavailability

## 📈 Performance Optimization

### Caching Strategies
- Cache analysis results to avoid re-analyzing same contracts
- Implement TTL-based cache expiration
- Use Redis for distributed caching in production

### Async Processing
- Background task processing for long-running analyses
- Non-blocking API responses
- Proper task queue management

### Resource Management
- Memory cleanup for old analysis results
- Connection pooling for external services
- Proper timeout handling

## 🔍 Monitoring & Logging

### Health Monitoring
- Service health endpoints
- External service dependency checks
- Performance metrics tracking

### Logging Strategy
```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log analysis events
logger.info(f"Analysis queued for contract {contract_address} with task ID {task_id}")
logger.info(f"Analysis completed for task {task_id}: {verdict}")
logger.error(f"Analysis failed for task {task_id}: {error}")
```

### Metrics Collection
- Analysis completion rates
- Average analysis time
- Error rates by type
- API usage statistics

## 🛠️ Troubleshooting

### Common Issues

**Gemini API Key Issues:**
```bash
# Verify API key is set
echo $GEMINI_API_KEY

# Test API key validity
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

**Contract Code Retrieval Failures:**
```bash
# Test ethervm.io connectivity
curl "https://ethervm.io/decompile/0xdAC17F958D2ee523a2206206994597C13D831ec7"

# Check if contract exists on blockchain
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xdAC17F958D2ee523a2206206994597C13D831ec7","latest"],"id":1}' \
  https://mainnet.infura.io/v3/YOUR_KEY
```

**Memory Issues:**
```bash
# Monitor memory usage
ps aux | grep python

# Clean up old results
curl -X DELETE http://localhost:8001/cleanup
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=DEBUG python main.py
```

## 📚 Dependencies

### Core Dependencies
- **FastAPI**: Web framework for API endpoints
- **Pydantic**: Data validation and serialization
- **Google Generative AI**: Gemini AI integration
- **Requests**: HTTP client for external services
- **BeautifulSoup4**: HTML parsing for bytecode extraction
- **Python-dotenv**: Environment variable management

### Development Dependencies
- **Uvicorn**: ASGI server for development
- **Pytest**: Testing framework
- **Black**: Code formatting
- **Flake8**: Code linting

## 🧪 Testing

### Unit Tests
```bash
# Test analysis functions
pytest tests/test_analysis.py

# Test API endpoints
pytest tests/test_api.py
```

### Integration Tests
```bash
# Test with real Gemini API
pytest tests/test_integration.py --api-key=$GEMINI_API_KEY
```

### Load Testing
```bash
# Test concurrent analysis requests
locust -f tests/load_test.py --host=http://localhost:8001
```

## 📊 API Usage Examples

### Python Client Example
```python
import requests
import time

# Submit analysis
response = requests.post(
    "http://localhost:8001/analyze",
    json={"contract_address": "0xdAC17F958D2ee523a2206206994597C13D831ec7"}
)
task_id = response.json()["task_id"]

# Poll for results
while True:
    status_response = requests.get(f"http://localhost:8001/status/{task_id}")
    status_data = status_response.json()
    
    if status_data["status"] == "completed":
        result_response = requests.get(f"http://localhost:8001/results/{task_id}")
        result = result_response.json()
        print(f"Verdict: {result['verdict']}")
        print(f"Explanation: {result['explanation']}")
        break
    elif status_data["status"] == "failed":
        print(f"Analysis failed: {status_data['error']}")
        break
    
    time.sleep(2)  # Wait 2 seconds before next check
```

### JavaScript Client Example
```javascript
async function analyzeContract(contractAddress) {
    // Submit analysis
    const submitResponse = await fetch('http://localhost:8001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_address: contractAddress })
    });
    
    const { task_id } = await submitResponse.json();
    
    // Poll for results
    while (true) {
        const statusResponse = await fetch(`http://localhost:8001/status/${task_id}`);
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'completed') {
            const resultResponse = await fetch(`http://localhost:8001/results/${task_id}`);
            const result = await resultResponse.json();
            
            console.log(`Verdict: ${result.verdict}`);
            console.log(`Explanation: ${result.explanation}`);
            break;
        } else if (statusData.status === 'failed') {
            console.error(`Analysis failed: ${statusData.error}`);
            break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}
```

