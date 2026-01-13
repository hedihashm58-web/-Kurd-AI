
// index.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const ErrorFallback = ({ error }: { error: Error }) => (
  <div style={{ 
    backgroundColor: '#020617', 
    color: 'white', 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    fontFamily: "'Noto Sans Arabic', sans-serif",
    padding: '20px',
    textAlign: 'center'
  }}>
    <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <h1 style={{ color: '#EAB308', marginBottom: '20px' }}>کێشەیەک لە بارکردندا هەیە</h1>
      <p style={{ opacity: 0.7, marginBottom: '30px' }}>ببورە، بەرنامەکە تووشی هەڵەیەکی چاوەڕواننەکراو بوو.</p>
      <div style={{ fontSize: '10px', color: '#ff4444', marginBottom: '30px', maxWidth: '300px', overflowX: 'auto' }}>
        <code>{error.message}</code>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        style={{ 
          padding: '12px 30px', 
          backgroundColor: '#EAB308', 
          color: 'black',
          fontWeight: '900',
          border: 'none', 
          borderRadius: '15px', 
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        دووبارە هەوڵ بدەرەوە
      </button>
    </div>
  </div>
);

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Fixed inheritance and property resolution for ErrorBoundary by using Component directly
// and explicitly declaring the state property to ensure 'state' and 'props' are correctly resolved.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare state property for better type resolution
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Destructuring state and props from 'this' which are now correctly recognized by the TypeScript compiler
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError && error) {
      return <ErrorFallback error={error} />;
    }
    
    return children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
