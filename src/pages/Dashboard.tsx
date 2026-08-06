import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Bell, 
  ArrowUpRight, 
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Database,
  MinusCircle,
  Sparkles,
  Info
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

interface NotificationItem {
  id: number;
  type: 'warning' | 'info' | 'success' | 'danger';
  text: string;
  time: string;
  isOffline?: boolean;
}

interface WasteItem {
  id: number;
  week: string;
  losses: number;
}

interface CriticalExpiryItem extends InventoryItem {
  daysLeft: number;
}

const Dashboard: React.FC = () => {
  const { 
    effectiveOnline, 
    pendingQueue, 
    isSyncing, 
    syncWithCloud, 
    enqueueOfflineAction, 
    toggleSimulatedOffline 
  } = useOfflineSync();

  const [kpis, setKpis] = useState<KPIState>({
    totalItems: 0,
    lowStockCount: 0,
    totalValue: 0,
    wasteTotal: 0
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [waste, setWaste] = useState<WasteItem[]>([]);
  const [criticalExpiry, setCriticalExpiry] = useState<CriticalExpiryItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ text: string; isOffline?: boolean } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'queue'>('alerts');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Load and recalculate inventory and KPIs
  const loadData = () => {
    // 1. Fetch or initialize inventory
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

    // 2. Fetch or initialize notifications
    const localNotif = localStorage.getItem('@portal-stock-ai:notifications');
    let notifData: NotificationItem[] = [];
    if (localNotif) {
      notifData = JSON.parse(localNotif);
    } else {
      notifData = [
        { id: 1, type: 'warning', text: 'Produção consumiu 20kg de Fermento Seco. Estoque abaixo do mínimo!', time: '10:42' },
        { id: 2, type: 'info', text: 'FEFO: Lote de Manteiga com validade mais próxima foi retirado prioritariamente.', time: '09:15' },
        { id: 3, type: 'success', text: 'Compra rápida recebida: +100kg de Farinha Especial alocados no Corredor A - A1.', time: 'Ontem' }
      ];
      localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(notifData));
    }
    setNotifications(notifData);

    // 3. Fetch or initialize waste
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

    // 4. Calculate critical expiries (expiry within 10 days)
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

    // 5. Calculate KPIs
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

  // Handle Export Action
  const handleExport = () => {
    setIsExporting(true);
    setExportMessage(null);
    setTimeout(() => {
      setIsExporting(false);
      const isOff = !effectiveOnline;
      if (isOff) {
        enqueueOfflineAction('EXPORT_REPORT', 'Geração de relatório consolidado (Fechamento CSV)');
      }
      setExportMessage({
        text: isOff
          ? 'Relatório solicitado Offline! O arquivo foi gerado localmente e a sincronização com a nuvem ocorrerá assim que reconectar.'
          : 'Relatório consolidado exportado com sucesso! Arquivo "FECHAMENTO_ESTOQUE_STOCK_AI.csv" sincronizado na nuvem.',
        isOffline: isOff
      });
    }, 1000);
  };

  // Consume / Use Batch Action (Demonstrating Offline Writes)
  const handleConsumeItem = (item: CriticalExpiryItem, qtyToUse: number) => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (!localInv) return;
    let invData: InventoryItem[] = JSON.parse(localInv);

    const updated = invData.map(i => {
      if (i.id === item.id) {
        const newQty = Math.max(0, i.quantity - qtyToUse);
        return { ...i, quantity: newQty };
      }
      return i;
    });

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updated));

    const isOff = !effectiveOnline;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const actionText = `Consumo prioritário FEFO: ${qtyToUse}kg de ${item.name} (${item.address}).`;

    if (isOff) {
      enqueueOfflineAction('FEFO_CONSUME', actionText, { itemId: item.id, qty: qtyToUse });
    }

    // Add new notification
    const newNotif: NotificationItem = {
      id: Date.now(),
      type: 'info',
      text: isOff ? `[OFFLINE] ${actionText}` : actionText,
      time: timeStr,
      isOffline: isOff
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifs));

    loadData();
  };

  const dashboardState = kpis.lowStockCount === 0 && criticalExpiry.length === 0
    ? { label: 'ESTADO SEGURO', color: 'green', desc: 'Estoque operando com níveis adequados e sem vencimentos próximos.' }
    : kpis.lowStockCount <= 2 && criticalExpiry.length <= 1
      ? { label: 'ATENÇÃO', color: 'yellow', desc: 'Estoque baixo ou lotes com vencimento próximo. Recomendada ação.' }
      : { label: 'CRÍTICO', color: 'red', desc: 'Falta crítica ou vencimento imediato detectados! Setor de compras acionado.' };

  return (
    <div className="dashboard-page">
      {/* Top Offline Warning Banner */}
      {!effectiveOnline && (
        <div className="offline-alert-banner">
          <div className="banner-content">
            <WifiOff className="banner-icon pulse" size={20} />
            <div>
              <strong>Modo Offline Ativo (Operação Local)</strong>
              <p>As alterações feitas agora (baixas, cadastros, relatórios) são salvas com segurança neste dispositivo e serão enviadas para a nuvem automaticamente quando o sinal voltar.</p>
            </div>
          </div>
          <div className="banner-actions">
            <button className="btn-banner-action" onClick={toggleSimulatedOffline}>
              <Wifi size={14} />
              Simular Reconexão
            </button>
          </div>
        </div>
      )}

      {/* Online Sync Pending Banner */}
      {effectiveOnline && pendingQueue.length > 0 && (
        <div className="sync-pending-banner">
          <div className="banner-content">
            <Database className="banner-icon" size={20} />
            <div>
              <strong>{pendingQueue.length} {pendingQueue.length === 1 ? 'operação salva' : 'operações salvas'} localmente</strong>
              <p>Conexão estabelecida! Sincronize com a nuvem para consolidar os relatórios da fábrica.</p>
            </div>
          </div>
          <button className="btn-sync-now" onClick={syncWithCloud} disabled={isSyncing}>
            <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      )}

      {/* Page Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Painel Geral de Estoque</h1>
            <button className="btn-help-toggle" onClick={() => setShowHelp(!showHelp)} title="Explicação simples de cada parte do painel">
              <HelpCircle size={16} />
              <span>{showHelp ? 'Ocultar Ajuda' : 'Como entender este painel?'}</span>
              {showHelp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          <p>Monitoramento contínuo da Fábrica Três Irmãos • São Gonçalo - RJ</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-export" onClick={handleExport} disabled={isExporting}>
            <Download size={16} />
            {isExporting ? 'Gerando Relatório...' : 'Exportar Fechamento'}
          </button>

          <div className={`status-badge-glow ${dashboardState.color}`}>
            <span className="dot"></span>
            <div>
              <strong>{dashboardState.label}</strong>
              <span>{dashboardState.desc}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Accordion / Guia Explicativo do Painel */}
      {showHelp && (
        <div className="card help-guide-card">
          <div className="help-header">
            <Sparkles size={20} color="var(--primary-color)" />
            <h3>Guia Rápido: Entenda cada parte do seu Painel</h3>
          </div>
          <div className="help-grid">
            <div className="help-item">
              <div className="help-icon blue"><Package size={18} /></div>
              <div>
                <strong>Categorias de Insumos</strong>
                <p>Mostra a diversidade de ingredientes cadastrados. Quanto mais organizado, mais fácil identificar o que precisa ser comprado.</p>
              </div>
            </div>
            <div className="help-item">
              <div className="help-icon orange"><AlertTriangle size={18} /></div>
              <div>
                <strong>Alerta de Estoque Baixo</strong>
                <p>Indica produtos que atingiram a quantidade mínima de segurança. Evita que a produção da fábrica pare por falta de matéria-prima.</p>
              </div>
            </div>
            <div className="help-item">
              <div className="help-icon green"><DollarSign size={18} /></div>
              <div>
                <strong>Custo Total em Insumos</strong>
                <p>Valor em Reais (R$) de todas as mercadorias armazenadas. Ajuda no controle financeiro e capital de giro do almoxarifado.</p>
              </div>
            </div>
            <div className="help-item">
              <div className="help-icon red"><TrendingUp size={18} /></div>
              <div>
                <strong>Perdas & Refugos</strong>
                <p>Soma do peso em kg de produtos descartados (vencimento ou quebra). Acompanhar este número ajuda a reduzir o desperdício.</p>
              </div>
            </div>
            <div className="help-item">
              <div className="help-icon red"><Clock size={18} /></div>
              <div>
                <strong>Vencimentos Críticos (FEFO)</strong>
                <p>Lotes que vencem em menos de 10 dias. Use o botão <em>"Dar Baixa"</em> para priorizar o uso imediato desses lotes na produção.</p>
              </div>
            </div>
            <div className="help-item">
              <div className="help-icon blue"><Wifi size={18} /></div>
              <div>
                <strong>Modo Offline & Nuvem</strong>
                <p>Mesmo sem internet no galpão, você pode fazer movimentações! O sistema grava localmente e envia para a nuvem quando houver sinal.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Feedback Toast */}
      {exportMessage && (
        <div className={`export-notification card ${exportMessage.isOffline ? 'offline' : 'success'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {exportMessage.isOffline ? <WifiOff size={20} color="var(--warning-color)" /> : <CheckCircle2 size={20} color="var(--success-color)" />}
            <strong>{exportMessage.text}</strong>
          </div>
          <button className="close-btn" onClick={() => setExportMessage(null)}>Ok</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {/* KPI 1 */}
        <div className="kpi-card card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper blue">
              <Package size={20} />
            </div>
            <span className="badge success">Operacional</span>
          </div>
          <div className="kpi-body">
            <div className="kpi-title-with-info">
              <h3>Categorias</h3>
              <Info 
                size={14} 
                className="info-icon" 
                onClick={() => setActiveTooltip(activeTooltip === 'kpi1' ? null : 'kpi1')}
              />
            </div>
            {activeTooltip === 'kpi1' && (
              <div className="tooltip-popover">Tipos de matérias-primas e insumos cadastrados no almoxarifado.</div>
            )}
            <h2>{kpis.totalItems} <span className="kpi-subtext">categorias</span></h2>
            <p className="kpi-desc">Total de grupos de ingredientes monitorados</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper orange">
              <AlertTriangle size={20} />
            </div>
            <span className={`badge ${kpis.lowStockCount > 0 ? 'danger' : 'success'}`}>
              {kpis.lowStockCount > 0 ? 'Ação Necessária' : 'Saudável'}
            </span>
          </div>
          <div className="kpi-body">
            <div className="kpi-title-with-info">
              <h3>Estoque Baixo</h3>
              <Info 
                size={14} 
                className="info-icon" 
                onClick={() => setActiveTooltip(activeTooltip === 'kpi2' ? null : 'kpi2')}
              />
            </div>
            {activeTooltip === 'kpi2' && (
              <div className="tooltip-popover">Insumos com quantidade atual abaixo da margem mínima estipulada.</div>
            )}
            <h2>{kpis.lowStockCount} <span className="kpi-subtext">com alerta</span></h2>
            <p className="kpi-desc">Itens que precisam de reposição pelo setor de Compras</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper green">
              <DollarSign size={20} />
            </div>
            <span className="badge success">Patrimônio</span>
          </div>
          <div className="kpi-body">
            <div className="kpi-title-with-info">
              <h3>Custo em Insumos</h3>
              <Info 
                size={14} 
                className="info-icon" 
                onClick={() => setActiveTooltip(activeTooltip === 'kpi3' ? null : 'kpi3')}
              />
            </div>
            {activeTooltip === 'kpi3' && (
              <div className="tooltip-popover">Soma do preço de custo multiplicado pela quantidade física armazenada.</div>
            )}
            <h2>R$ {kpis.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <p className="kpi-desc">Valor financeiro investido e guardado no galpão</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper red">
              <TrendingUp size={20} />
            </div>
            <span className="badge warning">Perdas</span>
          </div>
          <div className="kpi-body">
            <div className="kpi-title-with-info">
              <h3>Desperdício Acumulado</h3>
              <Info 
                size={14} 
                className="info-icon" 
                onClick={() => setActiveTooltip(activeTooltip === 'kpi4' ? null : 'kpi4')}
              />
            </div>
            {activeTooltip === 'kpi4' && (
              <div className="tooltip-popover">Peso total descartado por vencimento, umidade ou falha no manuseio.</div>
            )}
            <h2>{kpis.wasteTotal} kg <span className="kpi-subtext">desperdiçados</span></h2>
            <p className="kpi-desc">Histórico de refugos e descartes na pesagem</p>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div className="dashboard-layout-grid">
        <div className="charts-column">
          {/* Critical Expiry Table (FEFO) */}
          <div className="card critical-expiry-card">
            <div className="chart-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-color)' }}>
                  <Clock size={18} />
                  Quadro de Vencimentos Críticos (FEFO - Prioridade)
                </h3>
                <p className="subtitle">Lotes com validade em menos de 10 dias. Retire ou dê baixa para priorizar na receita.</p>
              </div>
              <span className="badge danger">{criticalExpiry.length} {criticalExpiry.length === 1 ? 'Lote Crítico' : 'Lotes Críticos'}</span>
            </div>

            {criticalExpiry.length === 0 ? (
              <div className="empty-alerts">
                <CheckCircle2 size={22} color="var(--success-color)" />
                <span>Nenhum lote crítico com vencimento em menos de 10 dias. Nível de validade seguro!</span>
              </div>
            ) : (
              <div className="expiry-alerts-list">
                <table className="expiry-table">
                  <thead>
                    <tr>
                      <th>Lote</th>
                      <th>Insumo</th>
                      <th>Endereço</th>
                      <th>Validade</th>
                      <th>Urgência</th>
                      <th>Estoque Atual</th>
                      <th>Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalExpiry.map(item => (
                      <tr key={item.id} className="critical-row">
                        <td><strong>#{item.id.toString().padStart(4, '0')}</strong></td>
                        <td>
                          <strong>{item.name}</strong>
                          <span className="category-tag">{item.category}</span>
                        </td>
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
                            title="Registra uso de 5kg deste lote na receita para zerar o risco de vencimento"
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
          </div>

          {/* Waste History Chart */}
          <div className="card chart-card">
            <div className="chart-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Histórico Semanal de Perdas & Refugos (kg)</h3>
                <span className="target-badge">Meta: Máx 20 kg/sem</span>
              </div>
              <p className="subtitle">Evolução do descarte físico em kg por semana. Linha pontilhada representa a meta máxima tolerada.</p>
            </div>
            
            <div className="chart-wrapper">
              <svg viewBox="0 0 400 160" width="100%" height="200">
                <defs>
                  <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--danger-color)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--danger-color)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="380" y2="70" stroke="var(--danger-color)" strokeDasharray="4 4" strokeOpacity="0.6" />
                <text x="385" y="73" fontSize="9" fill="var(--danger-color)" fontWeight="600">Meta (20kg)</text>

                <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" />
                
                {/* Area Gradient */}
                {waste.length > 0 && (
                  <path
                    d={`M 50 120 
                        L 50 ${120 - (waste[0]?.losses / 60) * 100}
                        L 125 ${120 - (waste[1]?.losses / 60) * 100}
                        L 200 ${120 - (waste[2]?.losses / 60) * 100}
                        L 275 ${120 - (waste[3]?.losses / 60) * 100}
                        L 350 ${120 - (waste[4]?.losses / 60) * 100}
                        L 350 120 Z`}
                    fill="url(#wasteGradient)"
                  />
                )}

                {/* Line Path */}
                {waste.length > 0 && (
                  <path
                    d={`M 50 ${120 - (waste[0]?.losses / 60) * 100}
                        L 125 ${120 - (waste[1]?.losses / 60) * 100}
                        L 200 ${120 - (waste[2]?.losses / 60) * 100}
                        L 275 ${120 - (waste[3]?.losses / 60) * 100}
                        L 350 ${120 - (waste[4]?.losses / 60) * 100}`}
                    fill="none"
                    stroke="var(--danger-color)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Data Points */}
                {waste.map((wItem, index) => {
                  const cx = 50 + index * 75;
                  const cy = 120 - (wItem.losses / 60) * 100;
                  const isOverGoal = wItem.losses > 20;

                  return (
                    <g key={wItem.id}>
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={isOverGoal ? "5" : "4"} 
                        fill={isOverGoal ? "var(--danger-color)" : "var(--success-color)"} 
                        stroke="#ffffff" 
                        strokeWidth="2" 
                      />
                      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill={isOverGoal ? "var(--danger-color)" : "var(--text-main)"}>
                        {wItem.losses}kg
                      </text>
                      <text x={cx} y="140" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--text-muted)">
                        {wItem.week}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="notifications-column">
          {/* ABC Classification Card */}
          <div className="card classification-breakdown-card" style={{ marginBottom: '1.5rem' }}>
            <div className="notif-header">
              <Package size={18} color="var(--primary-color)" />
              <h3>Classificação Curva ABC</h3>
            </div>
            <p className="notif-subtitle">Prioridade Financeira e Volume de Insumos</p>
            
            {/* Visual ABC Bar */}
            <div className="abc-visual-bar">
              <div className="abc-segment a" style={{ width: '80%' }} title="Curva A: 80% do valor total">A (80%)</div>
              <div className="abc-segment b" style={{ width: '15%' }} title="Curva B: 15% do valor total">B (15%)</div>
              <div className="abc-segment c" style={{ width: '5%' }} title="Curva C: 5% do valor total">C</div>
            </div>

            <div className="classification-box">
              <div className="class-row">
                <span className="badge danger">Curva A (Alta)</span>
                <span>Farinha & Fermentos</span>
                <strong>80% do Custo</strong>
              </div>
              <div className="class-row">
                <span className="badge warning">Curva B (Média)</span>
                <span>Manteiga & Açúcar</span>
                <strong>15% do Custo</strong>
              </div>
              <div className="class-row">
                <span className="badge success">Curva C (Baixa)</span>
                <span>Sal & Temperos</span>
                <strong>5% do Custo</strong>
              </div>
            </div>
          </div>

          {/* Activity Feed & Pending Offline Queue Tabs */}
          <div className="card notifications-card">
            <div className="tab-buttons-header">
              <button 
                className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setActiveTab('alerts')}
              >
                <Bell size={15} />
                Alertas ({notifications.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
                onClick={() => setActiveTab('queue')}
              >
                <Database size={15} />
                Fila Offline ({pendingQueue.length})
              </button>
            </div>

            {activeTab === 'alerts' && (
              <div className="notifications-list">
                {notifications.map(nItem => (
                  <div key={nItem.id} className={`notification-item ${nItem.type} ${nItem.isOffline ? 'is-offline' : ''}`}>
                    <div className="status-indicator"></div>
                    <div className="notif-content">
                      <p>{nItem.text}</p>
                      <span className="time">
                        {nItem.time} {nItem.isOffline && '• [Salvo no Dispositivo]'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'queue' && (
              <div className="notifications-list">
                {pendingQueue.length === 0 ? (
                  <div className="empty-queue-msg">
                    <CheckCircle2 size={24} color="var(--success-color)" />
                    <p>Nenhuma pendência offline. Todos os dados estão sincronizados com a nuvem!</p>
                  </div>
                ) : (
                  pendingQueue.map(item => (
                    <div key={item.id} className="notification-item warning is-offline">
                      <div className="status-indicator"></div>
                      <div className="notif-content">
                        <p><strong>[{item.type}]</strong> {item.description}</p>
                        <span className="time">{item.timestamp} • Aguardando Sync</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="notif-action">
              <a href="/inventario" className="action-link">
                Ir para Gestão Completa de Inventário
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
