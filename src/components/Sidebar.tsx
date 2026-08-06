import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ShoppingCart, 
  Settings, 
  GitBranch, 
  ClipboardList, 
  Layers,
  LogOut,
  MapPin,
  ChevronLeft
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigationGroups = [
    {
      title: 'VISÃO GERAL',
      items: [
        { name: 'Painel Geral', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Depósito & Layout', path: '/deposito', icon: <Map size={18} /> }
      ]
    },
    {
      title: 'GESTÃO & OPERAÇÕES',
      items: [
        { name: 'Inventário (FIFO/FEFO)', path: '/inventario', icon: <Package size={18} /> },
        { name: 'Central de Compras', path: '/compras', icon: <ShoppingCart size={18} /> },
        { name: 'Área do Gestor', path: '/gestor', icon: <Settings size={18} /> }
      ]
    },
    {
      title: 'QUALIDADE & FERRAMENTAS',
      items: [
        { name: 'Diagrama Ishikawa', path: '/ishikawa', icon: <GitBranch size={18} /> },
        { name: 'Plano 5W2H', path: '/5w2h', icon: <ClipboardList size={18} /> },
        { name: 'WMS Inteligente', path: '/wms', icon: <Layers size={18} />, badge: 'AI' }
      ]
    }
  ];

  return (
    <aside className="sidebar reference-style-sidebar" role="navigation" aria-label="Navegação Principal">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="logo-brand">
          <img 
            src="/logo.png" 
            alt="StockAI Icon" 
            className="brand-logo-img" 
          />
          <div>
            <h2>Stock AI</h2>
            <span>GESTÃO INTELIGENTE</span>
          </div>
        </div>
        <button className="btn-collapse-sidebar" aria-label="Recolher Menu">
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation Links Grouped with original Stock AI names */}
      <div className="sidebar-scroll-area">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="nav-group">
            <h4 className="nav-group-title">{group.title}</h4>
            <nav className="nav-list">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.name}</span>
                  {item.badge && <span className="nav-ai-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer User Profile Card */}
      <div className="sidebar-footer-profile">
        <div className="user-profile-card">
          <div className="user-avatar">
            <span>P</span>
          </div>
          <div className="user-details">
            <strong>Paulo Gestor</strong>
            <span className="user-email">paulovimeny@gmail.com</span>
          </div>
        </div>
        <div className="profile-actions">
          <div className="location-mini-pill" title="Fábrica Três Irmãos • São Gonçalo">
            <MapPin size={12} />
            <span>São Gonçalo, RJ</span>
          </div>
          <button className="btn-logout" title="Encerrar Sessão">
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
