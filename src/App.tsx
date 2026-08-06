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
import { AccessibilityHub } from './components/AccessibilityHub';
import { Wifi, WifiOff, RefreshCw, Database, Eye, ChevronRight, Menu, Volume2, VolumeX, ZoomIn, ZoomOut } from 'lucide-react';

// Breadcrumb & Accessibility Component
const TopNavigationHeader: React.FC<{ 
  onToggleHighContrast: () => void; 
  isHighContrast: boolean;
  onToggleMobileSidebar: () => void;
  onChangeFontScale: (delta: number) => void;
}> = ({ onToggleHighContrast, isHighContrast, onToggleMobileSidebar, onChangeFontScale }) => {
  const { 
    effectiveOnline, 
    isSimulatedOffline, 
    pendingQueue, 
    isSyncing, 
    syncWithCloud, 
    toggleSimulatedOffline 
  } = useOfflineSync();
  const location = useLocation();

  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Audio Reader (Speech Synthesis for Accessibility)
  const toggleSpeechReader = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const textToRead = "Você está no aplicativo Stock AI, Portal da Empresa Fábrica Três Irmãos em São Gonçalo. Esta ferramenta permite controlar o estoque de insumos, validade de farinhas e fermentos pelo método FEFO e opera mesmo sem conexão de internet.";
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      alert("Seu navegador não suporta a leitura por voz de acessibilidade.");
    }
  };

  return (
    <header className="app-top-navbar" role="banner">
      {/* Left side: Menu toggle & Breadcrumbs */}
      <div className="top-navbar-left">
        <button 
          className="btn-menu-mobile" 
          onClick={onToggleMobileSidebar}
          aria-label="Abrir Menu Lateral"
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
        
        <div className="brand-logo-mini">
          <img src="/logo.png" alt="StockAI Logo" height="24" style={{ borderRadius: '4px' }} />
          <strong>Stock AI</strong>
        </div>

        <nav className="breadcrumbs-nav" aria-label="Caminho da Página (Breadcrumbs)">
          <span className="breadcrumb-category">{breadcrumb.category}</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="current-page">{breadcrumb.page}</span>
        </nav>
      </div>

      {/* Right side: Accessibility Controls & System Status */}
      <div className="top-navbar-right">
        {/* Accessibility Toolbar */}
        <div className="accessibility-toolbar" role="region" aria-label="Painel de Acessibilidade">
          
          {/* Audio Reader */}
          <button 
            className={`btn-access-toggle ${isSpeaking ? 'active' : ''}`}
            onClick={toggleSpeechReader}
            title="Ouvir resumo em áudio sobre esta página (Leitor por Voz)"
            aria-label="Ouvir Resumo por Voz"
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span className="access-label">{isSpeaking ? 'Parar Voz' : 'Ouvir Áudio'}</span>
          </button>

          {/* Font Resizing */}
          <button 
            className="btn-access-toggle"
            onClick={() => onChangeFontScale(0.1)}
            title="Aumentar tamanho do texto"
            aria-label="Aumentar Fonte"
          >
            <ZoomIn size={14} />
            <span className="access-label">A+</span>
          </button>

          <button 
            className="btn-access-toggle"
            onClick={() => onChangeFontScale(-0.1)}
            title="Diminuir tamanho do texto"
            aria-label="Diminuir Fonte"
          >
            <ZoomOut size={14} />
            <span className="access-label">A-</span>
          </button>

          {/* High Contrast */}
          <button 
            className={`btn-access-toggle ${isHighContrast ? 'active' : ''}`}
            onClick={onToggleHighContrast}
            title="Alternar Modo Alto Contraste para melhor visibilidade"
            aria-label="Alto Contraste"
          >
            <Eye size={14} />
            <span className="access-label">Alto Contraste</span>
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
              <span className="status-text">Sistema Ativo</span>
            </>
          ) : (
            <>
              <WifiOff size={13} />
              <span className="status-text">{isSimulatedOffline ? 'Offline' : 'Sem Sinal'}</span>
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
            <span>{pendingQueue.length}</span>
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);

  const toggleHighContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const changeFontScale = (delta: number) => {
    setFontScale(prev => Math.min(1.3, Math.max(0.9, prev + delta)));
  };

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
  }, [fontScale]);

  return (
    <div className={`app-container ${isHighContrast ? 'contrast-mode' : ''}`}>
      <TopNavigationHeader 
        onToggleHighContrast={toggleHighContrast} 
        isHighContrast={isHighContrast}
        onToggleMobileSidebar={toggleMobileSidebar}
        onChangeFontScale={changeFontScale}
      />

      {/* Backdrop overlay for mobile menu */}
      <div 
        className={`sidebar-backdrop ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <div className="app-body">
        <div className="sidebar-wrapper">
          <Sidebar 
            isOpen={isMobileSidebarOpen} 
            onClose={closeMobileSidebar} 
          />
        </div>
        <main className="main-content" role="main" id="main-content">
          <Outlet />
        </main>
      </div>

      <Chatbot />
      <AccessibilityHub />
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
