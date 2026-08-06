import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
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
import { Wifi, WifiOff, RefreshCw, Database, Eye, ChevronRight, Menu } from 'lucide-react';

// Breadcrumb & Accessibility Component
const TopNavigationHeader: React.FC<{ onToggleHighContrast: () => void; isHighContrast: boolean }> = ({ onToggleHighContrast, isHighContrast }) => {
  const { 
    effectiveOnline, 
    isSimulatedOffline, 
    pendingQueue, 
    isSyncing, 
    syncWithCloud, 
    toggleSimulatedOffline 
  } = useOfflineSync();
  const location = useLocation();

  const getBreadcrumbInfo = (path: string) => {
    switch (path) {
      case '/': return { category: 'Visão Geral', page: 'Painel Geral' };
      case '/deposito': return { category: 'Visão Geral', page: 'Depósito & Layout' };
      case '/inventario': return { category: 'Gestão & Operações', page: 'Inventário (FIFO/FEFO)' };
      case '/compras': return { category: 'Gestão & Operações', page: 'Central de Compras' };
      case '/gestor': return { category: 'Gestão & Operações', page: 'Área do Gestor' };
      case '/ishikawa': return { category: 'Qualidade & Ferramentas', page: 'Diagrama Ishikawa' };
      case '/5w2h': return { category: 'Qualidade & Ferramentas', page: 'Plano 5W2H' };
      case '/wms': return { category: 'Qualidade & Ferramentas', page: 'WMS Inteligente' };
      default: return { category: 'Visão Geral', page: 'Painel Geral' };
    }
  };

  const breadcrumb = getBreadcrumbInfo(location.pathname);

  return (
    <header className="app-top-navbar" role="banner">
      {/* Left side: Menu toggle & Breadcrumbs */}
      <div className="top-navbar-left">
        <button className="btn-menu-mobile" aria-label="Abrir Menu Lateral">
          <Menu size={18} />
          <span>Menu</span>
        </button>
        
        <div className="brand-logo-mini">
          <img src="/logo.png" alt="StockAI Logo" height="24" style={{ borderRadius: '4px' }} />
          <strong>Stock AI</strong>
        </div>

        <nav className="breadcrumbs-nav" aria-label="Caminho da Página (Breadcrumbs)">
          <span>{breadcrumb.category}</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="current-page">{breadcrumb.page}</span>
        </nav>
      </div>

      {/* Right side: Accessibility Controls & System Status */}
      <div className="top-navbar-right">
        {/* Accessibility Toolbar */}
        <div className="accessibility-toolbar" role="region" aria-label="Controles de Acessibilidade">
          <button 
            className={`btn-access-toggle ${isHighContrast ? 'active' : ''}`}
            onClick={onToggleHighContrast}
            title="Alternar Modo Alto Contraste para melhor legibilidade"
            aria-label="Alto Contraste"
          >
            <Eye size={14} />
            <span>Contraste</span>
          </button>
        </div>

        {/* Network & Offline Status */}
        <button 
          className={`network-status-pill ${effectiveOnline ? 'online' : 'offline'}`}
          onClick={toggleSimulatedOffline}
          title="Clique para alternar simulação Online / Offline"
          aria-label={effectiveOnline ? "Status: Sistema Ativo" : "Status: Offline (Simulado)"}
        >
          <span className="status-dot"></span>
          {effectiveOnline ? (
            <>
              <Wifi size={13} />
              <span>Sistema Ativo</span>
            </>
          ) : (
            <>
              <WifiOff size={13} />
              <span>{isSimulatedOffline ? 'Offline (Simulado)' : 'Sem Conexão'}</span>
            </>
          )}
        </button>

        {pendingQueue.length > 0 && (
          <button 
            className="pending-queue-badge"
            onClick={syncWithCloud}
            disabled={isSyncing}
            title="Enviar alterações salvas no dispositivo para a nuvem"
            aria-label={`${pendingQueue.length} alterações pendentes para sincronizar`}
          >
            <Database size={13} />
            <span>{pendingQueue.length} {pendingQueue.length === 1 ? 'pendência' : 'pendências'}</span>
            <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
          </button>
        )}
      </div>
    </header>
  );
};

// Layout Wrapper Component
const AppLayout: React.FC = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  return (
    <div className={`app-container ${isHighContrast ? 'contrast-mode' : ''}`}>
      <TopNavigationHeader 
        onToggleHighContrast={toggleHighContrast} 
        isHighContrast={isHighContrast} 
      />

      <div className="app-body">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        <main className="main-content" role="main" id="main-content">
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
