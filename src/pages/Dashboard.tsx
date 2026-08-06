import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ChevronRight, 
  HelpCircle, 
  ArrowUpRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  MinusCircle
} from 'lucide-react';
import { useOfflineSync } from '../context/OfflineContext';

interface KPIState {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  wasteTotal: number;
}

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQty: number;
  address: string;
  price: number;
  expiry: string;
  entryDate: string;
}

interface CriticalExpiryItem extends InventoryItem {
  daysLeft: number;
}

interface WasteItem {
  id: number;
  week: string;
  losses: number;
}

interface StepPhase {
  id: number;
  name: string;
  status: 'done' | 'active' | 'pending';
  desc: string;
}

const Dashboard: React.FC = () => {
  const { effectiveOnline, pendingQueue, isSyncing, syncWithCloud, enqueueOfflineAction, toggleSimulatedOffline } = useOfflineSync();

  // Clock State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Active Help Popover State (Contextual help per card)
  const [activeHelpSection, setActiveHelpSection] = useState<string | null>(null);

  // Stock AI KPIs & Inventory Data
  const [kpis, setKpis] = useState<KPIState>({
    totalItems: 5,
    lowStockCount: 1,
    totalValue: 5430.00,
    wasteTotal: 94
  });
  const [criticalExpiry, setCriticalExpiry] = useState<CriticalExpiryItem[]>([]);
  const [waste, setWaste] = useState<WasteItem[]>([]);

  // Operational Stepper Phases for Stock AI
  const [phases, setPhases] = useState<StepPhase[]>([
    { id: 1, name: 'RECEBIMENTO DE MATÉRIA-PRIMA', status: 'done', desc: 'Triagem de notas fiscais, pesagem e conferência dos fornecedores.' },
    { id: 2, name: 'ARMAZENAMENTO & ENDEREÇAMENTO', status: 'done', desc: 'Alocação física nos corredores (Corredores A, B e C) e código QR.' },
    { id: 3, name: 'CONTROLE FEFO DE PRODUÇÃO', status: 'active', desc: 'Retirada prioritária de lotes com vencimento próximo para fabricação.' },
    { id: 4, name: 'AUDITORIA DE RECONCILIAÇÃO', status: 'pending', desc: 'Conferência física quinzenal contra perdas e refugos na balança.' },
    { id: 5, name: 'FECHAMENTO MENSAL', status: 'pending', desc: 'Consolidação de custos e relatórios para o setor financeiro.' }
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

  // Load inventory & recalculate FEFO & KPIs
  const loadData = () => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    let invData: InventoryItem[] = [];
    if (localInv) {
      invData = JSON.parse(localInv);
    } else {
      invData = [
        { id: 1, name: 'Farinha de Trigo Especial', category: 'Farinhas', quantity: 450, unit: 'kg', minQty: 150, address: 'Corredor A - A1', price: 4.5, expiry: '2026-08-30', entryDate: '2026-07-01' },
        { id: 2, name: 'Açúcar Refinado', category: 'Adoçantes', quantity: 120, unit: 'kg', minQty: 100, address: 'Corredor A - A2', price: 3.5, expiry: '2026-09-15', entryDate: '2026-07-03' },
        { id: 3, name: 'Fermento Biológico Seco', category: 'Fermentos', quantity: 18, unit: 'kg', minQty: 30, address: 'Corredor B - B1', price: 18, expiry: '2026-08-10', entryDate: '2026-06-25' },
        { id: 4, name: 'Manteiga sem Sal', category: 'Gorduras', quantity: 85, unit: 'kg', minQty: 40, address: 'Corredor B - B2', price: 26.5, expiry: '2026-08-08', entryDate: '2026-06-20' },
        { id: 5, name: 'Sal Refinado', category: 'Condimentos', quantity: 95, unit: 'kg', minQty: 25, address: 'Corredor C - C1', price: 2.1, expiry: '2026-10-30', entryDate: '2026-07-05' }
      ];
      localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(invData));
    }

    const localWaste = localStorage.getItem('@portal-stock-ai:waste');
    let wasteData: WasteItem[] = [];
    if (localWaste) {
      wasteData = JSON.parse(localWaste);
    } else {
      wasteData = [
        { id: 1, week: 'Sem 1', losses: 15 },
        { id: 2, week: 'Sem 2', losses: 24 },
        { id: 3, week: 'Sem 3', losses: 12 },
        { id: 4, week: 'Sem 4', losses: 35 },
        { id: 5, week: 'Sem 5 (Atual)', losses: 8 }
      ];
      localStorage.setItem('@portal-stock-ai:waste', JSON.stringify(wasteData));
    }
    setWaste(wasteData);

    const today = new Date();
    const critExpiry: CriticalExpiryItem[] = invData
      .filter(item => {
        const diffTime = new Date(item.expiry).getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 10;
      })
      .map(item => {
        const diffTime = new Date(item.expiry).getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...item, daysLeft: diffDays };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
    setCriticalExpiry(critExpiry);

    const uniqueItemsCount = [...new Set(invData.map(item => item.name))].length;
    const aggregated = invData.reduce((acc: Record<string, { qty: number; minQty: number }>, item) => {
      if (!acc[item.name]) {
        acc[item.name] = { qty: 0, minQty: item.minQty };
      }
      acc[item.name].qty += item.quantity;
      return acc;
    }, {});
    const lowStock = Object.values(aggregated).filter(item => item.qty < item.minQty).length;
    const totalCost = invData.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const wasteTotal = wasteData.reduce((sum, w) => sum + w.losses, 0);

    setKpis({
      totalItems: uniqueItemsCount,
      lowStockCount: lowStock,
      totalValue: totalCost,
      wasteTotal: wasteTotal
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Action: Consume Batch (FEFO Baixa)
  const handleConsumeItem = (item: CriticalExpiryItem, qtyToUse: number) => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (!localInv) return;
    let invData: InventoryItem[] = JSON.parse(localInv);

    const updated = invData.map(i => {
      if (i.id === item.id) {
        return { ...i, quantity: Math.max(0, i.quantity - qtyToUse) };
      }
      return i;
    });

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updated));

    if (!effectiveOnline) {
      enqueueOfflineAction('FEFO_CONSUME', `Consumo FEFO de ${qtyToUse}kg de ${item.name} (${item.address})`);
    }

    loadData();
  };

  // Action: Advance Step Phase
  const handleAdvancePhase = () => {
    setPhases(prevPhases => {
      const activeIdx = prevPhases.findIndex(p => p.status === 'active');
      if (activeIdx !== -1 && activeIdx < prevPhases.length - 1) {
        const nextPhases = [...prevPhases];
        nextPhases[activeIdx].status = 'done';
        nextPhases[activeIdx + 1].status = 'active';

        if (!effectiveOnline) {
          enqueueOfflineAction('ADVANCE_PHASE', `Avanço de etapa operacional: ${nextPhases[activeIdx + 1].name}`);
        }
        return nextPhases;
      }
      return prevPhases;
    });
  };

  // Toggle Help
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
              <p>As baixas e alterações no estoque continuam salvas no dispositivo. A sincronização com a nuvem ocorrerá automaticamente assim que a conexão retornar.</p>
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
              <strong>{pendingQueue.length} {pendingQueue.length === 1 ? 'operação salva' : 'operações salvas'} localmente</strong>
              <p>Conexão ativa! Clique abaixo para enviar os registros locais para o banco central na nuvem.</p>
            </div>
          </div>
          <button className="btn-sync-now" onClick={syncWithCloud} disabled={isSyncing}>
            <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      )}

      {/* Apple Style Greeting Header */}
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
          <p className="hero-subtitle">Visão geral de inventário, FEFO e performance da equipe de produção</p>
        </div>

        <div className="hero-stage-badge">
          <span className="stage-label">ETAPA ATUAL</span>
          <strong className="stage-name">CONTROLE FEFO DE PRODUÇÃO</strong>
        </div>
      </header>

      {/* 4 Stat KPI Cards Row (Original Stock AI metrics in Reference Apple Style) */}
      <section className="stat-cards-grid" aria-label="Indicadores de Estoque">
        
        {/* KPI 1: Categorias */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper blue">
              <Package size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge success-pill">Operacional</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi1')} 
                title="Ajuda sobre Categorias"
                aria-label="Explicação sobre Categorias"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">CATEGORIAS DE INSUMOS</span>
            <div className="stat-main-number">
              <h2>{kpis.totalItems}</h2>
              <span className="stat-unit">grupos</span>
            </div>
            <p className="stat-subtext">Ingredientes monitorados no almoxarifado</p>
          </div>

          {activeHelpSection === 'kpi1' && (
            <div className="card-help-popover" role="tooltip">
              <strong>O que significa:</strong> Quantidade de tipos de matérias-primas e insumos (Farinhas, Fermentos, Gorduras, Adoçantes e Condimentos) cadastrados no galpão.
            </div>
          )}
        </div>

        {/* KPI 2: Estoque Baixo */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper orange">
              <AlertTriangle size={18} />
            </div>
            <div className="header-right-action">
              <span className={`badge ${kpis.lowStockCount > 0 ? 'warning-pill' : 'success-pill'}`}>
                {kpis.lowStockCount > 0 ? 'Repor' : 'Ok'}
              </span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi2')} 
                title="Ajuda sobre Estoque Baixo"
                aria-label="Explicação sobre Estoque Baixo"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">ESTOQUE BAIXO</span>
            <div className="stat-main-number">
              <h2>{kpis.lowStockCount}</h2>
              <span className="stat-unit">alerta</span>
            </div>
            <p className="stat-subtext">Insumos operando abaixo da margem mínima</p>
          </div>

          {activeHelpSection === 'kpi2' && (
            <div className="card-help-popover" role="tooltip">
              <strong>O que significa:</strong> Produtos cujo volume atual no almoxarifado é inferior ao mínimo de segurança necessário para não parar a fábrica.
            </div>
          )}
        </div>

        {/* KPI 3: Custo em Insumos */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper green">
              <DollarSign size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge success-pill">Patrimônio</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi3')} 
                title="Ajuda sobre Custo em Insumos"
                aria-label="Explicação sobre Custo em Insumos"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">CUSTO EM INSUMOS</span>
            <div className="stat-main-number">
              <h2>R$ {kpis.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>
            <p className="stat-subtext">Valor financeiro total investido estocado</p>
          </div>

          {activeHelpSection === 'kpi3' && (
            <div className="card-help-popover" role="tooltip">
              <strong>O que significa:</strong> Multiplicação do custo de aquisição pela quantidade em quilos guardada no depósito da fábrica.
            </div>
          )}
        </div>

        {/* KPI 4: Perdas & Desperdício */}
        <div className="stat-card card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper purple">
              <TrendingUp size={18} />
            </div>
            <div className="header-right-action">
              <span className="badge warning-pill">Refugos</span>
              <button 
                className="btn-card-help" 
                onClick={() => toggleHelp('kpi4')} 
                title="Ajuda sobre Perdas & Refugos"
                aria-label="Explicação sobre Perdas & Refugos"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
          <div className="stat-card-body">
            <span className="stat-title">PERDAS & DESPERDÍCIO</span>
            <div className="stat-main-number">
              <h2>{kpis.wasteTotal} <span className="stat-unit">kg</span></h2>
            </div>
            <p className="stat-subtext">Total de descarte registrado na pesagem</p>
          </div>

          {activeHelpSection === 'kpi4' && (
            <div className="card-help-popover" role="tooltip">
              <strong>O que significa:</strong> Soma do peso de farinhas e ingrediente descartados por validade ou embalagem avariada.
            </div>
          )}
        </div>

      </section>

      {/* Main Content Layout Grid */}
      <div className="main-content-layout-grid">
        
        {/* Left Column: FEFO Critical Expiries & Operational Timeline */}
        <div className="phases-container-card card">
          
          {/* Critical Expiries FEFO Header */}
          <div className="card-header-with-action">
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)' }}>
                <Clock size={18} />
                Quadro de Vencimentos Críticos (FEFO Prioritário)
              </h3>
              <p className="card-subtitle">Lotes com validade em menos de 10 dias que devem ser consumidos imediatamente</p>
            </div>
            <button 
              className="btn-card-help" 
              onClick={() => toggleHelp('fefo')}
              aria-label="Ajuda sobre Controle FEFO"
            >
              <HelpCircle size={16} />
            </button>
          </div>

          {activeHelpSection === 'fefo' && (
            <div className="card-help-popover-wide">
              <strong>Entenda o FEFO (First Expire, First Out):</strong> Os produtos prestes a vencer são exibidos prioritariamente para uso na receita, evitando perdas financeiras por validade vencida.
            </div>
          )}

          {/* FEFO Items Table */}
          {criticalExpiry.length === 0 ? (
            <div className="empty-alerts">
              <CheckCircle2 size={20} color="var(--success-color)" />
              <span>Nenhum lote crítico com vencimento em menos de 10 dias. Excelente!</span>
            </div>
          ) : (
            <div className="expiry-alerts-list" style={{ marginBottom: '1.75rem' }}>
              <table className="expiry-table">
                <thead>
                  <tr>
                    <th>Lote ID</th>
                    <th>Insumo</th>
                    <th>Endereço</th>
                    <th>Validade</th>
                    <th>Dias Restantes</th>
                    <th>Quantidade</th>
                    <th>Ação Rápida</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalExpiry.map(item => (
                    <tr key={item.id} className="critical-row">
                      <td><strong>#{item.id.toString().padStart(4, '0')}</strong></td>
                      <td>{item.name}</td>
                      <td><span className="address-marker">{item.address}</span></td>
                      <td><strong>{item.expiry}</strong></td>
                      <td>
                        <span className={`days-badge ${item.daysLeft <= 3 ? 'critical' : 'warning'}`}>
                          {item.daysLeft === 0 ? 'Vence Hoje!' : item.daysLeft === 1 ? 'Vence Amanhã' : `${item.daysLeft} dias`}
                        </span>
                      </td>
                      <td><strong>{item.quantity} kg</strong></td>
                      <td>
                        <button 
                          className="btn-use-batch" 
                          onClick={() => handleConsumeItem(item, 5)}
                          title="Dar baixa de 5kg deste lote para a receita da fábrica"
                        >
                          <MinusCircle size={13} />
                          Dar Baixa (5kg)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stepper Timeline for Operational Workflow */}
          <div className="card-header-with-action" style={{ paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
            <div>
              <h3>Fluxo de Controle & Etapas da Fábrica</h3>
              <p className="card-subtitle">Estágios da linha de produção na Fábrica Três Irmãos</p>
            </div>
            <button 
              className="btn-advance-phase" 
              onClick={handleAdvancePhase}
              title="Avançar para a próxima etapa do fluxo fabril"
            >
              Avançar Etapa
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="phases-stepper-list">
            {phases.map((phase) => (
              <div key={phase.id} className={`stepper-item ${phase.status}`}>
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

        {/* Right Column: Charts & Curva ABC */}
        <div className="side-charts-column">
          
          {/* Chart 1: Histórico de Perdas */}
          <div className="card chart-box-card">
            <div className="card-header-with-action">
              <div>
                <h3>Histórico de Perdas (kg)</h3>
                <p className="card-subtitle">Evolução do descarte acumulado em kg por semana</p>
              </div>
              <button className="btn-card-help" onClick={() => toggleHelp('chart1')} aria-label="Ajuda sobre Histórico de Perdas">
                <HelpCircle size={15} />
              </button>
            </div>

            {activeHelpSection === 'chart1' && (
              <div className="card-help-popover">
                <strong>O que significa:</strong> Quantidade em kg descarte por semana. A meta é permanecer abaixo de 20 kg/semana.
              </div>
            )}

            <div className="svg-chart-container">
              <svg viewBox="0 0 300 130" width="100%" height="140">
                <defs>
                  <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--danger-color)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--danger-color)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="20" y1="50" x2="280" y2="50" stroke="var(--danger-color)" strokeDasharray="3 3" strokeOpacity="0.5" />
                
                {waste.length > 0 && (
                  <path
                    d={`M 30 110 
                        L 30 ${110 - (waste[0]?.losses / 50) * 80}
                        L 90 ${110 - (waste[1]?.losses / 50) * 80}
                        L 150 ${110 - (waste[2]?.losses / 50) * 80}
                        L 210 ${110 - (waste[3]?.losses / 50) * 80}
                        L 270 ${110 - (waste[4]?.losses / 50) * 80}
                        L 270 110 Z`}
                    fill="url(#wasteGradient)"
                  />
                )}
                {waste.length > 0 && (
                  <path
                    d={`M 30 ${110 - (waste[0]?.losses / 50) * 80}
                        L 90 ${110 - (waste[1]?.losses / 50) * 80}
                        L 150 ${110 - (waste[2]?.losses / 50) * 80}
                        L 210 ${110 - (waste[3]?.losses / 50) * 80}
                        L 270 ${110 - (waste[4]?.losses / 50) * 80}`}
                    fill="none"
                    stroke="var(--danger-color)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {waste.map((wItem, index) => {
                  const cx = 30 + index * 60;
                  const cy = 110 - (wItem.losses / 50) * 80;
                  return (
                    <g key={wItem.id}>
                      <circle cx={cx} cy={cy} r="4" fill="var(--danger-color)" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--danger-color)">
                        {wItem.losses}kg
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="chart-x-labels">
                <span>Sem 1</span>
                <span>Sem 2</span>
                <span>Sem 3</span>
                <span>Sem 4</span>
                <span>Sem 5</span>
              </div>
            </div>
          </div>

          {/* Classification: Curva ABC */}
          <div className="card chart-box-card">
            <div className="card-header-with-action">
              <div>
                <h3>Classificação Curva ABC</h3>
                <p className="card-subtitle">Distribuição por valor de custo e giro</p>
              </div>
              <button className="btn-card-help" onClick={() => toggleHelp('abc')} aria-label="Ajuda sobre Curva ABC">
                <HelpCircle size={15} />
              </button>
            </div>

            {activeHelpSection === 'abc' && (
              <div className="card-help-popover">
                <strong>Curva A:</strong> Insumos de altíssimo valor (Farinhas e Fermentos) que demandam atenção rigorosa.
              </div>
            )}

            <div className="abc-visual-bar">
              <div className="abc-segment a" style={{ width: '80%' }}>Curva A (80%)</div>
              <div className="abc-segment b" style={{ width: '15%' }}>B (15%)</div>
              <div className="abc-segment c" style={{ width: '5%' }}>C</div>
            </div>

            <div className="classification-box">
              <div className="class-row">
                <span className="badge danger">Curva A</span>
                <span>Farinha & Fermentos (80% custo)</span>
              </div>
              <div className="class-row">
                <span className="badge warning">Curva B</span>
                <span>Manteiga & Açúcar (15% custo)</span>
              </div>
              <div className="class-row">
                <span className="badge success">Curva C</span>
                <span>Sal & Temperos (5% custo)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Summary Report Footer */}
      <footer className="summary-report-footer card">
        <div className="footer-report-header">
          <div>
            <h3>
              <TrendingUp size={18} color="var(--primary-color)" />
              Relatório Rápido: Fábrica Três Irmãos
            </h3>
            <p>Diagnóstico de inventário e custos mensais de fornecedores em São Gonçalo</p>
          </div>
          <a href="/inventario" className="action-link-footer">
            Ver Detalhes do Inventário
            <ArrowUpRight size={14} />
          </a>
        </div>

        <div className="report-metrics-grid">
          <div className="report-metric-item">
            <span className="metric-label">DIVERGÊNCIA DE CONTAGEM</span>
            <strong className="metric-val text-green">0.4% <span className="sub-status">(Dentro da tolerância)</span></strong>
          </div>
          <div className="report-metric-item">
            <span className="metric-label">CUSTO DE INSUMOS / MÊS</span>
            <strong className="metric-val">R$ 5.430,00</strong>
          </div>
          <div className="report-metric-item">
            <span className="metric-label">ECONOMIA COM DESPERDÍCIO</span>
            <strong className="metric-val text-orange">R$ 1.280,00 <span className="sub-status">(Com controle FEFO)</span></strong>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;
