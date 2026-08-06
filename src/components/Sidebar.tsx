import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ShoppingCart, 
  Settings, 
  MapPin,
  GitBranch,
  ClipboardList,
  Layers
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const menuItems = [
    { name: 'Painel Geral', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Depósito & Layout', path: '/deposito', icon: <Map size={20} /> },
    { name: 'Inventário (FIFO/FEFO)', path: '/inventario', icon: <Package size={20} /> },
    { name: 'Central de Compras', path: '/compras', icon: <ShoppingCart size={20} /> },
    { name: 'Área do Gestor', path: '/gestor', icon: <Settings size={20} /> },
    { name: 'Diagrama Ishikawa', path: '/ishikawa', icon: <GitBranch size={20} /> },
    { name: 'Plano 5W2H', path: '/5w2h', icon: <ClipboardList size={20} /> },
    { name: 'WMS Inteligente', path: '/wms', icon: <Layers size={20} /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="/logo.png" 
            alt="StockAI Icon" 
            style={{ height: '40px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }} 
          />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>StockAI</h2>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Portal da Empresa</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="location-card">
          <div className="location-icon">
            <MapPin size={18} />
          </div>
          <div className="location-info">
            <strong>Fábrica Três Irmãos</strong>
            <span>Jardim Catarina, SG</span>
          </div>
        </div>
        <div className="status-indicator-bar">
          <span className="pulse-green"></span>
          <span>Monitoramento Ativo</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
