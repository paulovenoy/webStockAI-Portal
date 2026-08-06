import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  TrendingUp, 
  CheckSquare, 
  FileText, 
  Users, 
  UserCheck, 
  Bot, 
  Sparkles,
  LogOut,
  MapPin,
  ChevronLeft
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigationGroups = [
    {
      title: 'VISÃO GERAL',
      items: [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Central de Entregas', path: '/deposito', icon: <Truck size={18} /> }
      ]
    },
    {
      title: 'GESTÃO & OPERAÇÕES',
      items: [
        { name: 'A Demanda', path: '/inventario', icon: <TrendingUp size={18} /> },
        { name: 'Tarefas (FEFO/FIFO)', path: '/compras', icon: <CheckSquare size={18} /> },
        { name: 'Anotações & 5W2H', path: '/5w2h', icon: <FileText size={18} /> }
      ]
    },
    {
      title: 'RELACIONAMENTO',
      items: [
        { name: 'Clientes & Fornecedores', path: '/gestor', icon: <Users size={18} /> },
        { name: 'Membros da Equipe', path: '/ishikawa', icon: <UserCheck size={18} /> }
      ]
    },
    {
      title: 'FERRAMENTAS',
      items: [
        { name: 'Oliver AI', path: '/wms', icon: <Bot size={18} />, badge: 'AI' },
        { name: 'Recursos AI Unit', path: '/wms', icon: <Sparkles size={18} /> }
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

      {/* Navigation Links Grouped */}
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
