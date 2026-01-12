
import React from 'react';
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

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
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
