# 🎨 Frontend Service Documentation

Modern React-based frontend for Ethereum transaction tracking with real-time smart contract security analysis visualization.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │     Hooks       │    │   Services      │
│   (UI Layer)    │◄──►│  (State Mgmt)   │◄──►│  (API Layer)    │
│                 │    │                 │    │                 │
│ • TransactionCard    │ • useTransactions    │ • Backend API   │
│ • AnalysisResult     │ • useWebSocket       │ • WebSocket     │
│ • SecurityAlert      │ • useContractAnalysis│ • Real-time     │
│ • Dashboard          │ • useStats           │   Updates       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │              ┌─────────────────┐              │
        │              │     Router      │              │
        └──────────────►│   (Navigation)  │◄─────────────┘
                       │                 │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend service running on port 8000
- Contract analyzer service running on port 8001

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development URLs
- **Development Server**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws

## 🎨 Features

### 🔄 Real-Time Dashboard
- **Live Transaction Stream**: Real-time transaction updates via WebSocket
- **Interactive Statistics**: Live counters and metrics
- **Connection Status**: Backend and WebSocket connectivity indicators
- **Responsive Design**: Works on desktop, tablet, and mobile

### 🔍 Transaction Explorer
- **Transaction List**: Paginated, filterable transaction display
- **Contract Detection**: Visual indicators for contract vs. wallet addresses
- **Risk Assessment**: Color-coded risk levels with badges
- **Detailed View**: Expandable transaction details panel

### 🤖 Security Analysis Interface
- **One-Click Analysis**: Analyze contracts directly from transaction view
- **Progress Tracking**: Real-time analysis progress with step indicators
- **Result Visualization**: Comprehensive analysis results display
- **Security Alerts**: Prominent warnings for malicious contracts

### 🎭 Modern UI/UX
- **Glassmorphism Design**: Modern glass-effect styling
- **Dark Theme**: Eye-friendly dark color scheme
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Adaptive design for all screen sizes

## 📁 Project Structure

```
src/
├── components/                 # React components
│   ├── ui/                    # Base UI components (shadcn/ui)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── AddressDisplay.tsx     # Address formatting component
│   ├── ContractAnalysisResult.tsx  # Analysis results display
│   ├── RiskBadge.tsx         # Risk level indicators
│   ├── SecurityAlert.tsx     # Security alert notifications
│   ├── StatsCard.tsx         # Dashboard statistics
│   ├── TransactionCard.tsx   # Transaction list item
│   └── TransactionDetails.tsx # Transaction detail panel
│
├── hooks/                     # Custom React hooks
│   ├── useContractAnalysis.ts # Contract analysis state management
│   └── useTransactions.ts     # API integration hooks
│
├── lib/                       # Utilities and services
│   ├── api.ts                # Backend API client
│   └── utils.ts              # Utility functions
│
├── types/                     # TypeScript type definitions
│   └── transaction.ts        # Transaction and analysis types
│
├── data/                      # Mock data (fallback)
│   └── mockTransactions.ts   # Mock transaction data
│
├── pages/                     # Page components
│   └── Index.tsx             # Main dashboard page
│
├── styles/                    # Global styles
│   └── globals.css           # Tailwind CSS and custom styles
│
├── main.tsx                   # Application entry point
├── App.tsx                    # Root component
└── vite-env.d.ts             # Vite type definitions
```

## 🎯 Core Components

### TransactionCard Component
**File:** `src/components/TransactionCard.tsx`

**Features:**
- Transaction summary display
- Contract/EOA badge indicators
- Risk level badges with animations
- Visual security warnings for malicious contracts
- Click handler for detailed view

**Props:**
```typescript
interface TransactionCardProps {
  transaction: Transaction;
  isSelected: boolean;
  onClick: () => void;
}
```

**Key Features:**
```typescript
// Visual indicators for malicious contracts
const isMalicious = transaction.riskLevel === 'malicious';
const cardBorderClass = isMalicious 
  ? 'border-red-500 shadow-lg shadow-red-500/20' 
  : 'border-transparent hover:border-white/20';

// Contract vs EOA badges
{transaction.isToContract ? (
  <><FileText className="h-3 w-3" /><span>📄 Contract</span></>
) : (
  <><User className="h-3 w-3" /><span>👤 EOA</span></>
)}
```

### TransactionDetails Component
**File:** `src/components/TransactionDetails.tsx`

**Features:**
- Detailed transaction information
- Contract security status section
- Analysis trigger button
- Progress tracking during analysis
- Results display integration

**Key Sections:**
- Transaction metadata
- Address information with labels
- Gas fee calculations
- Contract security status
- Analysis controls and results

### ContractAnalysisResult Component
**File:** `src/components/ContractAnalysisResult.tsx`

**Features:**
- Large verdict badges (BENIGN/SUSPICIOUS/MALICIOUS)
- Detailed explanations
- Security score visualization
- Attack vector listings
- Technical details expansion
- Warning banners for malicious contracts

**Verdict Display:**
```typescript
const verdictConfig = {
  BENIGN: {
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: '✅',
    title: 'BENIGN - Contract appears safe'
  },
  SUSPICIOUS: {
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    icon: '⚠️',
    title: 'SUSPICIOUS - Potential security risks detected'
  },
  MALICIOUS: {
    color: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    icon: '🚨',
    title: 'MALICIOUS - WARNING: Dangerous contract detected!'
  }
};
```

### SecurityAlert Component
**File:** `src/components/SecurityAlert.tsx`

**Features:**
- Fixed-position toast notifications
- Auto-dismiss after 10 seconds
- Click-to-view transaction
- Prominent styling for malicious contract alerts
- Animation effects

### RiskBadge Component
**File:** `src/components/RiskBadge.tsx`

**Features:**
- Color-coded risk levels
- Animated states (analyzing, malicious pulsing)
- Icon integration
- Consistent styling across the app

**Risk Levels:**
```typescript
const riskConfigs = {
  'not-analyzed': { text: 'Not Analyzed', color: 'gray', icon: Clock },
  'analyzing': { text: 'Analyzing...', color: 'yellow', icon: Loader2, animated: true },
  'safe': { text: '✅ Safe', color: 'green', icon: Shield },
  'suspicious': { text: '⚠️ Suspicious', color: 'orange', icon: AlertTriangle },
  'malicious': { text: '🚨 MALICIOUS', color: 'red', icon: Skull, animated: 'pulse' }
};
```

## 🔗 Custom Hooks

### useTransactions Hook
**File:** `src/hooks/useTransactions.ts`

**Features:**
- Real-time transaction fetching from backend API
- Pagination and filtering support
- WebSocket integration for live updates
- Connection status monitoring
- Error handling and retry logic

**Usage:**
```typescript
const { data, isLoading, error, refetch } = useTransactions({
  page: 1,
  pageSize: 20,
  minValue: 100,
  maxValue: 10000
});
```

### useContractAnalysis Hook
**File:** `src/hooks/useContractAnalysis.ts`

**Features:**
- Contract analysis state management
- Progress tracking with step indicators
- Result caching and error handling
- WebSocket integration for real-time updates

**Usage:**
```typescript
const { analysis, isAnalyzing, progress, analyze, error } = useContractAnalysis(contractAddress);

// Trigger analysis
await analyze();
```

**Analysis States:**
```typescript
interface ContractAnalysis {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  verdict?: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN';
  explanation?: string;
  security_score?: number;
  attack_vectors?: string[];
  technical_details?: {
    functions_analyzed: number;
    vulnerabilities_found: number;
    risk_factors: string[];
  };
}
```

### useWebSocket Hook
**Features:**
- WebSocket connection management
- Auto-reconnection on disconnect
- Message type handling
- Connection status tracking

**Message Types:**
```typescript
interface WebSocketMessage {
  type: 'new_transaction' | 'analysis_complete' | 'analysis_started' | 'alert' | 'stats_update';
  data: any;
  timestamp: string;
}
```

## 🎨 Styling & Design

### Design System
- **Framework**: Tailwind CSS with custom configuration
- **Components**: shadcn/ui (Radix UI primitives)
- **Theme**: Dark theme with glassmorphism effects
- **Typography**: Inter font family
- **Colors**: Custom color palette with semantic meanings

### Glassmorphism Effects
```css
.glass-card {
  @apply bg-white/5 backdrop-blur-xl border border-white/10;
  @apply shadow-lg shadow-black/20;
}

.glass-card:hover {
  @apply bg-white/10 border-white/20;
}
```

### Animation System
- **Library**: Framer Motion
- **Transitions**: Smooth page and component transitions
- **Hover Effects**: Interactive element animations
- **Loading States**: Skeleton loaders and spinners

**Example Animation:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
```

### Responsive Design
- **Breakpoints**: Mobile-first responsive design
- **Grid System**: CSS Grid and Flexbox layouts
- **Typography**: Responsive font sizes
- **Spacing**: Consistent spacing scale

## 🔌 API Integration

### Backend API Client
**File:** `src/lib/api.ts`

**Features:**
- RESTful API client for backend communication
- Contract analysis workflow management
- Error handling and retry logic
- TypeScript integration

**Key Functions:**
```typescript
// Check if address is a contract
export async function checkIsContract(address: string): Promise<boolean>

// Submit contract for analysis
export async function analyzeContract(address: string): Promise<{ task_id: string }>

// Check analysis status
export async function getAnalysisStatus(taskId: string): Promise<AnalysisStatus>

// Poll for analysis results
export async function pollAnalysisResult(
  taskId: string, 
  onUpdate?: (status: string) => void
): Promise<AnalysisResult>
```

### WebSocket Integration
- Real-time transaction updates
- Analysis completion notifications
- Security alerts for malicious contracts
- Connection status monitoring

**WebSocket Events:**
```typescript
// New transaction received
{ type: 'new_transaction', data: { transaction: TransactionData } }

// Analysis completed
{ type: 'analysis_complete', data: { task_id, verdict, explanation } }

// Security alert
{ type: 'alert', data: { severity: 'high', contract_address, verdict } }
```

## 📊 State Management

### Local State (React Hooks)
- Component-level state with `useState`
- Side effects with `useEffect`
- Memoization with `useMemo` and `useCallback`
- Custom hooks for complex state logic

### Global State Patterns
- Context API for theme and settings
- Custom hooks for shared state
- WebSocket state synchronization
- Cache management for API responses

### Data Flow
```
User Interaction → Component State → Custom Hook → API Call → Backend
                                                      ↓
WebSocket Updates ← State Update ← Response Processing ← API Response
```

## 🔒 Security Features

### Input Validation
- Ethereum address format validation
- XSS prevention with proper escaping
- CSRF protection with proper headers
- Content Security Policy compliance

### Error Handling
- Graceful error boundaries
- User-friendly error messages
- Retry mechanisms for failed requests
- Fallback UI for network issues

### Security Indicators
- Visual warnings for malicious contracts
- Risk level color coding
- Security score visualization
- Attack vector highlighting

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```
- Hot module replacement
- Source maps for debugging
- Development-optimized bundles
- Real-time error overlay

### Production Build
```bash
npm run build
```
- Optimized bundle size
- Tree shaking for unused code
- Asset optimization
- Production-ready output

### Build Configuration
**File:** `vite.config.ts`
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-alert-dialog', '@radix-ui/react-badge']
        }
      }
    }
  }
});
```

### Deployment Options

**Static Hosting (Netlify, Vercel):**
```bash
npm run build
# Deploy dist/ folder
```

**Docker Deployment:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Server Configuration:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 🧪 Testing

### Unit Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionCard } from './TransactionCard';

test('displays transaction information correctly', () => {
  const mockTransaction = {
    id: '1',
    hash: '0x123...',
    from: '0xabc...',
    to: '0xdef...',
    amount: 1000,
    riskLevel: 'safe'
  };

  render(<TransactionCard transaction={mockTransaction} />);
  
  expect(screen.getByText('1000 USDT')).toBeInTheDocument();
  expect(screen.getByText('✅ Safe')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useContractAnalysis } from './useContractAnalysis';

test('contract analysis workflow', async () => {
  const { result } = renderHook(() => 
    useContractAnalysis('0x123...')
  );

  // Trigger analysis
  await result.current.analyze();

  // Wait for completion
  await waitFor(() => {
    expect(result.current.analysis?.status).toBe('completed');
  });

  expect(result.current.analysis?.verdict).toBeDefined();
});
```

### E2E Testing (Cypress)
```typescript
describe('Contract Analysis Flow', () => {
  it('analyzes a contract successfully', () => {
    cy.visit('/');
    cy.get('[data-testid="transaction-card"]').first().click();
    cy.get('[data-testid="analyze-button"]').click();
    cy.get('[data-testid="analysis-result"]').should('be.visible');
    cy.get('[data-testid="verdict-badge"]').should('contain', 'BENIGN');
  });
});
```

## 📈 Performance Optimization

### Bundle Optimization
- Code splitting with dynamic imports
- Tree shaking for unused code
- Asset optimization (images, fonts)
- Gzip compression

### Runtime Performance
- React.memo for expensive components
- useMemo and useCallback for expensive calculations
- Virtual scrolling for large lists
- Debounced search and filtering

### Caching Strategies
- Browser caching for static assets
- API response caching
- Service worker for offline functionality
- Local storage for user preferences

### Performance Monitoring
```typescript
// Performance measurement
const startTime = performance.now();
// ... expensive operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);

// React Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Component render time:', actualDuration);
}

<Profiler id="TransactionList" onRender={onRenderCallback}>
  <TransactionList />
</Profiler>
```

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks for quality gates

### Development Experience
- **Vite**: Fast build tool and dev server
- **React DevTools**: Component debugging
- **Redux DevTools**: State debugging (if using Redux)
- **Hot Module Replacement**: Fast development iteration

### Configuration Files

**ESLint Configuration (`.eslintrc.js`):**
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};
```

**Prettier Configuration (`.prettierrc`):**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🛠️ Troubleshooting

### Common Issues

**WebSocket Connection Failures:**
```typescript
// Check WebSocket connection
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onopen = () => console.log('Connected');
ws.onerror = (error) => console.error('WebSocket error:', error);
```

**API Connection Issues:**
```typescript
// Test API connectivity
fetch('http://localhost:8000/health')
  .then(response => response.json())
  .then(data => console.log('Backend status:', data))
  .catch(error => console.error('Backend connection failed:', error));
```

**Build Issues:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Vite debug mode
VITE_DEBUG=true npm run dev
```

### Performance Issues
```typescript
// React DevTools Profiler
// 1. Install React DevTools browser extension
// 2. Open DevTools → Profiler tab
// 3. Record component renders
// 4. Analyze performance bottlenecks

// Bundle analyzer
npm install --save-dev rollup-plugin-visualizer
# Add to vite.config.ts and run build
```

## 📚 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.0.2",
  "vite": "^4.4.5"
}
```

### UI & Styling
```json
{
  "@radix-ui/react-alert-dialog": "^1.0.4",
  "@radix-ui/react-badge": "^1.0.3",
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.279.0"
}
```

### Utilities
```json
{
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0",
  "react-hot-toast": "^2.4.1"
}
```

### Development Dependencies
```json
{
  "@types/react": "^18.2.15",
  "@types/react-dom": "^18.2.7",
  "@typescript-eslint/eslint-plugin": "^6.0.0",
  "@vitejs/plugin-react": "^4.0.3",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0"
}
```

## 🎯 Usage Examples

### Basic Transaction Display
```typescript
import { TransactionCard } from '@/components/TransactionCard';

function TransactionList({ transactions }) {
  const [selectedTx, setSelectedTx] = useState(null);

  return (
    <div className="space-y-4">
      {transactions.map(tx => (
        <TransactionCard
          key={tx.id}
          transaction={tx}
          isSelected={selectedTx?.id === tx.id}
          onClick={() => setSelectedTx(tx)}
        />
      ))}
    </div>
  );
}
```

### Contract Analysis Integration
```typescript
import { useContractAnalysis } from '@/hooks/useContractAnalysis';

function ContractAnalysisPanel({ contractAddress }) {
  const { analysis, isAnalyzing, progress, analyze, error } = useContractAnalysis(contractAddress);

  return (
    <div className="p-6">
      <button 
        onClick={analyze}
        disabled={isAnalyzing}
        className="btn-primary"
      >
        {isAnalyzing ? progress : 'Analyze Contract Security'}
      </button>

      {analysis && (
        <ContractAnalysisResult analysis={analysis} />
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}
```

### Real-time Updates
```typescript
import { useWebSocket } from '@/hooks/useTransactions';

function Dashboard() {
  const { isConnected, lastMessage } = useWebSocket();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (lastMessage?.type === 'analysis_complete' && 
        lastMessage.data.verdict === 'MALICIOUS') {
      setAlerts(prev => [...prev, {
        id: Date.now(),
        contract: lastMessage.data.contract_address,
        message: 'Malicious contract detected!'
      }]);
    }
  }, [lastMessage]);

  return (
    <div>
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Live' : '🔴 Offline'}
      </div>
      
      <SecurityAlertManager alerts={alerts} />
    </div>
  );
}
```

