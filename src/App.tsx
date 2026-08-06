import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import Dashboard from './pages/Dashboard';
import Deposito from './pages/Deposito';
import Inventario from './pages/Inventario';
import Compras from './pages/Compras';
import Gestor from './pages/Gestor';
import Ishikawa from './pages/Ishikawa';
import Plano5W2H from './pages/Plano5W2H';
import WMSInteligente from './pages/WMSInteligente';
import { OfflineProvider, useOfflineSync } from './context/OfflineContext';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';

// Header Status Component
const HeaderNetworkStatus: React.FC = () => {
  const { 
    effectiveOnline, 
    isSimulatedOffline, 
    pendingQueue, 
    isSyncing, 
    syncWithCloud, 
    toggleSimulatedOffline 
  } = useOfflineSync();

  return (
    <div className="network-status-bar">
      <div className="network-pill-group">
        <button 
          className={`network-status-pill ${effectiveOnline ? 'online' : 'offline'}`}
          onClick={toggleSimulatedOffline}
          title="Clique para alternar entre simulação Online / Offline"
        >
          <span className="status-dot"></span>
          {effectiveOnline ? (
            <>
              <Wifi size={14} />
              <span>Online • Nuvem Ativa</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>{isSimulatedOffline ? 'Offline (Simulado)' : 'Sem Conexão'}</span>
            </>
          )}
        </button>

        {pendingQueue.length > 0 && (
          <button 
            className="pending-queue-badge"
            onClick={syncWithCloud}
            disabled={isSyncing}
            title="Clique para enviar os dados salvos localmente para a nuvem"
          >
            <Database size={13} />
            <span>{pendingQueue.length} {pendingQueue.length === 1 ? 'pendência local' : 'pendências locais'}</span>
            <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
          </button>
        )}
      </div>
    </div>
  );
};

// Layout Wrapper Component
const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img 
              src="/logo.png" 
              alt="StockAI Icon" 
              style={{ height: '34px', width: 'auto', borderRadius: '6px', objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
              StockAI - Portal da Empresa
            </span>
          </div>
        </div>
        <div className="header-right">
          <HeaderNetworkStatus />
          <span className="header-badge">Fábrica Três Irmãos</span>
        </div>
      </header>

      <div className="app-body">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <OfflineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="deposito" element={<Deposito />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="compras" element={<Compras />} />
            <Route path="gestor" element={<Gestor />} />
            <Route path="ishikawa" element={<Ishikawa />} />
            <Route path="5w2h" element={<Plano5W2H />} />
            <Route path="wms" element={<WMSInteligente />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OfflineProvider>
  );
};

export default App;

