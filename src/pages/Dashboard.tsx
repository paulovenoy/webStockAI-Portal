import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  ChevronRight, 
  HelpCircle, 
  TrendingUp, 
  ArrowUpRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Database
} from 'lucide-react';
import { useOfflineSync } from '../context/OfflineContext';

interface Phase {
  id: number;
  name: string;
  status: 'done' | 'active' | 'pending';
  desc: string;
}

const Dashboard: React.FC = () => {
  const { effectiveOnline, pendingQueue, isSyncing, syncWithCloud, enqueueOfflineAction, toggleSimulatedOffline } = useOfflineSync();

  // Clock State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Active Help Panel States (Contextual Help Modals for each section)
  const [activeHelpSection, setActiveHelpSection] = useState<string | null>(null);

  // Phases of Project Implementation (matching reference image)
  const [phases, setPhases] = useState<Phase[]>([
    { id: 1, name: 'PLANEJAMENTO', status: 'done', desc: 'Mapeamento de processos e infraestrutura da fábrica concluídos.' },
    { id: 2, name: 'REQUISITOS', status: 'done', desc: 'Levantamento das demandas de insumos, FIFO/FEFO e fornecedores.' },
    { id: 3, name: 'DESENVOLVIMENTO', status: 'active', desc: 'Implantação dos módulos digitais de WMS e controle offline no galpão.' },
    { id: 4, name: 'HOMOLOGAÇÃO', status: 'pending', desc: 'Testes de estresse com a equipe da Fábrica Três Irmãos.' },
    { id: 5, name: 'IMPLANTAÇÃO', status: 'pending', desc: 'Go-live definitivo do sistema de gestão fabril.' }
  ]);

  // Live Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time of Day Greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia, Gestor 👋🏻';
    if (hour < 18) return 'Boa tarde, Gestor 👋🏻';
    return 'Boa noite, Gestor 👋🏻';
  };

  // Formatted Date & Time String (Apple Style)
  const formattedTimeStr = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDateStr = currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Advance Phase Action
  const handleAdvancePhase = () => {
    setPhases(prevPhases => {
      const activeIdx = prevPhases.findIndex(p => p.status === 'active');
      if (activeIdx !== -1 && activeIdx < prevPhases.length - 1) {
        const nextPhases = [...prevPhases];
        nextPhases[activeIdx].status = 'done';
        nextPhases[activeIdx + 1].status = 'active';

        if (!effectiveOnline) {
          enqueueOfflineAction('ADVANCE_PHASE', `Avançou fase de implantação para: ${nextPhases[activeIdx + 1].name}`);
        }
        return nextPhases;
      }
      return prevPhases;
    });
  };

  // Toggle Contextual Help Panel
  const toggleHelp = (section: string) => {
    setActiveHelpSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="dashboard-page reference-redesign-page" role="region" aria-label="Painel Geral Stock AI">
      
      {/* Offline Alert Banner */}
      {!effectiveOnline && (
        <div className="offline-alert-banner" role="alert">
          <div className="banner-content">
            <WifiOff className="banner-icon pulse" size={20} />
            <div>
              <strong>Modo Offline Ativo (Operação Local em São Gonçalo)</strong>
              <p>Todas as alterações e baixas no estoque estão sendo salvas com segurança no dispositivo. A sincronização com a nuvem ocorrerá automaticamente quando reconectar.</p>
            </div>
          </div>
          <button className="btn-banner-action" onClick={toggleSimulatedOffline}>
            <Wifi size={14} />
            Reconectar Agora
          </button>
        </div>
      )}

      {/* Sync Pending Banner */}
      {effectiveOnline && pendingQueue.length > 0 && (
        <div className="sync-pending-banner" role="status">
          <div className="banner-content">
            <Database className="banner-icon" size={20} />
            <div>
              <strong>{pendingQueue.length} {pendingQueue.length === 1 ? 'alteração offline salva' : 'alterações offline salvas'}</strong>
              <p>Conexão ativa! Clique no botão abaixo para enviar os registros locais para o servidor central.</p>
            </div>
          </div>
          <button className="btn-sync-now" onClick={syncWithCloud} disabled={isSyncing}>
            <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      )}

      {/* Hero Welcome Header (Apple Style) */}
      <header className="hero-apple-header">
        <div className="hero-main-title">
          <div className="hero-badge-group">
            <span className="location-pill">
              <MapPin size={13} />
              Fábrica Três Irmãos • São Gonçalo, RJ
            </span>
            <span className="live-clock-pill">
              <Clock size={13} />
              {formattedTimeStr} • {formattedDateStr}
            </span>
          </div>

          <h1 className="apple-greeting">{getGreeting()}</h1>
          <p className="hero-subtitle">Visão geral de implantação e indicadores de performance da equipe fabril</p>
        </div>

        <div className="hero-stage-badge">
          <span className="stage-label">ETAPA ATUAL</span>
          <strong className="stage-name">DESENVOLVIMENTO</strong>
        </div>
      </header>

      {/* Stat KPI Cards Row (Matching Reference Image) */}
      <section className="stat-cards-grid" aria-label="Indicadores de Desempenho">
        
        {/* Card 1: Progresso de Tarefas */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper blue">
              <CheckCircle2 size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge success-pill">+95%</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi1')} 
                title="Explicação deste indicador"
                aria-label="Explicação sobre Progresso de Tarefas"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">PROGRESSO DE TAREFAS</span>
            <div className="stat-main-number">
              <h2>1<span className="sub-slash">/7</span></h2>
              <span className="stat-unit">concluídas</span>
            </div>
            <div className="stat-progress-bar">
              <div className="progress-fill" style={{ width: '95%' }}></div>
            </div>
          </div>

          {activeHelpSection === 'kpi1' && (
            <div className="card-help-popover" role="tooltip">
              <strong>Como entender:</strong> Indica o volume de tarefas operacionais concluídas na semana em relação à meta da fábrica.
            </div>
          )}
        </div>

        {/* Card 2: Colaboradores */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper orange">
              <Users size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge info-pill">Equipe</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi2')} 
                title="Explicação deste indicador"
                aria-label="Explicação sobre Colaboradores"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">COLABORADORES</span>
            <div className="stat-main-number">
              <h2>5</h2>
              <span className="stat-unit">ativos</span>
            </div>
            <p className="stat-subtext">Membros alocados no projeto fabril</p>
          </div>

          {activeHelpSection === 'kpi2' && (
            <div className="card-help-popover" role="tooltip">
              <strong>Como entender:</strong> Total de funcionários com acesso ativo ao almoxarifado e registro de movimentações.
            </div>
          )}
        </div>

        {/* Card 3: Comunicação */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper green">
              <MessageSquare size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge success-pill">Ativo</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi3')} 
                title="Explicação deste indicador"
                aria-label="Explicação sobre Comunicação"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">COMUNICAÇÃO</span>
            <div className="stat-main-number">
              <h2>87</h2>
              <span className="stat-unit">mensagens</span>
            </div>
            <p className="stat-subtext">Interações registradas no chat da fábrica</p>
          </div>

          {activeHelpSection === 'kpi3' && (
            <div className="card-help-popover" role="tooltip">
              <strong>Como entender:</strong> Registro automático de trocas de avisos entre a linha de produção e a central de compras.
            </div>
          )}
        </div>

        {/* Card 4: Status de Implantação */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper purple">
              <ShieldCheck size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge warning-pill">Fase 3</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi4')} 
                title="Explicação deste indicador"
                aria-label="Explicação sobre Status de Implantação"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">STATUS DE IMPLANTAÇÃO</span>
            <div className="stat-main-number">
              <h2>50%</h2>
              <span className="stat-unit">concluído</span>
            </div>
            <div className="stat-progress-bar">
              <div className="progress-fill orange" style={{ width: '50%' }}></div>
            </div>
          </div>

          {activeHelpSection === 'kpi4' && (
            <div className="card-help-popover" role="tooltip">
              <strong>Como entender:</strong> Percentual de avanço do projeto na Fábrica Três Irmãos rumo ao controle digital completo.
            </div>
          )}
        </div>

      </section>

      {/* Main Section Layout: Fases da Implantação (Esquerda) + Evolução/Distribuição (Direita) */}
      <div className="main-content-layout-grid">
        
        {/* Left Column: Fases da Implantação */}
        <div className="phases-container-card card">
          <div className="card-header-with-action">
            <div>
              <h3>Fases da Implantação</h3>
              <p className="card-subtitle">Selecione a etapa ativa para atualizar a visão geral do projeto</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                className="btn-advance-phase" 
                onClick={handleAdvancePhase}
                title="Avançar manualmente para a próxima etapa da fábrica"
              >
                Avançar Manuais
                <ChevronRight size={14} />
              </button>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('phases')}
                aria-label="Explicação sobre Fases da Implantação"
              >
                <HelpCircle size={16} />
              </button>
            </div>
          </div>

          {activeHelpSection === 'phases' && (
            <div className="card-help-popover-wide">
              <strong>Entenda as Fases:</strong> O projeto avança por 5 etapas estratégicas (Planejamento → Requisitos → Desenvolvimento → Homologação → Implantação Final). O indicador laranja marca a fase ativa da fábrica.
            </div>
          )}

          {/* Stepper Vertical Timeline (Reference Style) */}
          <div className="phases-stepper-list">
            {phases.map((phase) => (
              <div 
                key={phase.id} 
                className={`stepper-item ${phase.status}`}
              >
                <div className="stepper-badge-number">
                  {phase.status === 'done' ? '✓' : phase.id}
                </div>
                <div className="stepper-content">
                  <div className="stepper-title-row">
                    <h4>{phase.id}. {phase.name}</h4>
                    <span className={`status-tag ${phase.status}`}>
                      {phase.status === 'done' ? 'CONCLUÍDO' : phase.status === 'active' ? 'EM ANDAMENTO' : 'PENDENTE'}
                    </span>
                  </div>
                  <p>{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Charts & Metrics */}
        <div className="side-charts-column">
          
          {/* Chart 1: Evolução do Projeto */}
          <div className="card chart-box-card">
            <div className="card-header-with-action">
              <div>
                <h3>Evolução do Projeto</h3>
                <p className="card-subtitle">Progresso em relação às fases da implantação</p>
              </div>
              <button className="btn-card-help" onClick={() => toggleHelp('chart1')} aria-label="Ajuda sobre Evolução do Projeto">
                <HelpCircle size={15} />
              </button>
            </div>

            {activeHelpSection === 'chart1' && (
              <div className="card-help-popover">
                <strong>Curva de Trajetória:</strong> Linha ascendente de desempenho no cumprimento das metas fabris.
              </div>
            )}

            <div className="svg-chart-container">
              <svg viewBox="0 0 300 120" width="100%" height="130">
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d="M 20 100 Q 150 70 280 20 L 280 100 Z" fill="url(#curveGradient)" />
                <path d="M 20 100 Q 150 70 280 20" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                <circle cx="280" cy="20" r="5" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
              </svg>
              <div className="chart-x-labels">
                <span>JAN</span>
                <span>FEV</span>
                <span>MAR</span>
                <span>ABR</span>
                <span>MAI</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Distribuição de Tarefas */}
          <div className="card chart-box-card">
            <div className="card-header-with-action">
              <div>
                <h3>Distribuição de Tarefas</h3>
                <p className="card-subtitle">Progresso das tarefas registradas na fábrica</p>
              </div>
              <button className="btn-card-help" onClick={() => toggleHelp('chart2')} aria-label="Ajuda sobre Distribuição de Tarefas">
                <HelpCircle size={15} />
              </button>
            </div>

            {activeHelpSection === 'chart2' && (
              <div className="card-help-popover">
                <strong>Distribuição por Tipo:</strong> Concluídas (azul), Pendentes (laranja) e Avarias (verde).
              </div>
            )}

            <div className="bar-chart-container">
              <div className="bar-column">
                <div className="bar fill-blue" style={{ height: '70%' }}></div>
                <span>Concluídas</span>
              </div>
              <div className="bar-column">
                <div className="bar fill-orange" style={{ height: '65%' }}></div>
                <span>Pendentes</span>
              </div>
              <div className="bar-column">
                <div className="bar fill-green" style={{ height: '25%' }}></div>
                <span>Auditadas</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Summary Section (Reference Footer Report) */}
      <footer className="summary-report-footer card">
        <div className="footer-report-header">
          <div>
            <h3>
              <TrendingUp size={18} color="var(--primary-color)" />
              Relatório Rápido: Fábrica Três Irmãos
            </h3>
            <p>Diagnóstico de inventário e custos mensais de fornecedores</p>
          </div>
          <a href="/inventario" className="action-link-footer">
            Ver Detalhes do Cliente
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="report-metrics-grid">
          <div className="report-metric-item">
            <span className="metric-label">DIVERGÊNCIA DE CONTAGEM</span>
            <strong className="metric-val text-green">0.4% <span className="sub-status">(Dentro do limite)</span></strong>
          </div>
          <div className="report-metric-item">
            <span className="metric-label">CUSTO DE INSUMOS / MÊS</span>
            <strong className="metric-val">R$ 5.430,00</strong>
          </div>
          <div className="report-metric-item">
            <span className="metric-label">ECONOMIA COM DESPERDÍCIO</span>
            <strong className="metric-val text-orange">R$ 1.280,00 <span className="sub-status">(Com FEFO ativo)</span></strong>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
