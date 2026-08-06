import React, { useState, useEffect } from 'react';
import { Layers, Barcode, Navigation, ClipboardCheck, Info, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

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
}

const WMSInteligente: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'racks' | 'scanner' | 'picking' | 'audits'>('racks');
  
  // Scanner simulation states
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Audit cycle states
  const [selectedAuditAddr, setSelectedAuditAddr] = useState('Corredor A - A1');
  const [countedQty, setCountedQty] = useState('');
  const [auditLog, setAuditLog] = useState<Array<{ id: number; date: string; address: string; system: number; physical: number; accuracy: number }>>([]);

  useEffect(() => {
    fetchData();
    const loadedAudits = localStorage.getItem('@portal-stock-ai:wms-audits');
    if (loadedAudits) {
      setAuditLog(JSON.parse(loadedAudits));
    } else {
      const defaultAudits = [
        { id: 1, date: '2026-07-25', address: 'Corredor A - A1', system: 450, physical: 450, accuracy: 100 },
        { id: 2, date: '2026-07-26', address: 'Corredor B - B1', system: 38, physical: 18, accuracy: 47.3 }
      ];
      localStorage.setItem('@portal-stock-ai:wms-audits', JSON.stringify(defaultAudits));
      setAuditLog(defaultAudits);
    }
  }, []);

  const fetchData = () => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (localInv) setInventory(JSON.parse(localInv));

    const localNotif = localStorage.getItem('@portal-stock-ai:notifications');
    if (localNotif) setNotifications(JSON.parse(localNotif));
  };

  // 1. Racking Map Generation (vertical layout levels 1, 2, 3)
  const renderRacksForCorridor = (corridor: string) => {
    const corridorItems = inventory.filter(item => item.address === corridor);
    // Sort by entryDate or ID
    const sorted = [...corridorItems].sort((a, b) => b.id - a.id);

    // Levels representation:
    // Level 3: Top rack shelf
    // Level 2: Middle rack shelf
    // Level 1: Bottom rack shelf (ground level)
    const levels = [
      { num: 3, label: 'Nível 3 (Superior)' },
      { num: 2, label: 'Nível 2 (Intermediário)' },
      { num: 1, label: 'Nível 1 (Térreo)' }
    ];

    return (
      <div className="rack-column" key={corridor}>
        <div className="rack-title">{corridor.replace('Corredor ', 'RACK ')}</div>
        {levels.map((lvl, index) => {
          const item = sorted[index]; // Allocate items sequentially for visualization
          return (
            <div className="rack-level" key={lvl.num}>
              <span className="level-badge">{lvl.label}</span>
              {item ? (
                <div className="pallet-box">
                  <div style={{ fontSize: '9px', fontWeight: '800' }}>PALETE #{item.id.toString().slice(-4)}</div>
                  <div style={{ fontSize: '8px', opacity: 0.9, marginTop: '2px' }}>{item.name}</div>
                  <div style={{ fontSize: '9px', fontWeight: '700', marginTop: '2px' }}>{item.quantity.toFixed(0)}kg</div>
                </div>
              ) : (
                <span className="pallet-empty">Vago</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 2. Barcode scanner logic
  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;

    // Simulated codes parsing:
    // E.g.: [IN-FARINHA-200] -> Receive 200kg of Farinha
    // E.g.: [OUT-MANTEIGA-30] -> Dispatch/Consume 30kg of Manteiga
    // E.g.: [IN-SUCO-50] -> Non existing item
    const code = scannedCode.trim().toUpperCase();
    const regex = /^\[(IN|OUT)-([A-Z0-9_]+)-([0-9.]+)\]$/;
    const match = code.match(regex);

    if (!match) {
      setScanResult({
        type: 'error',
        text: 'Código de barras inválido! Utilize o formato [OPERAÇÃO-INSUMO-QUANTIDADE] (ex: [IN-FARINHA-150] ou [OUT-MANTEIGA-20])'
      });
      return;
    }

    const [, operation, itemSlug, qtyStr] = match;
    const qty = parseFloat(qtyStr);

    const nameMap: Record<string, string> = {
      FARINHA: 'Farinha de Trigo Especial',
      ACUCAR: 'Açúcar Refinado',
      FERMENTO: 'Fermento Biológico Seco',
      MANTEIGA: 'Manteiga sem Sal',
      SAL: 'Sal Refinado'
    };

    const productName = nameMap[itemSlug];
    if (!productName) {
      setScanResult({
        type: 'error',
        text: `Insumo correspondente à slug "${itemSlug}" não homologado!`
      });
      return;
    }

    const existingBatches = inventory.filter(item => item.name === productName);
    const updatedInventory = [...inventory];

    if (operation === 'IN') {
      // Receiving/Put-away
      const defaultAddresses: Record<string, string> = {
        'Farinha de Trigo Especial': 'Corredor A - A1',
        'Açúcar Refinado': 'Corredor A - A2',
        'Fermento Biológico Seco': 'Corredor B - B1',
        'Manteiga sem Sal': 'Corredor B - B2',
        'Sal Refinado': 'Corredor C - C1'
      };

      const categories: Record<string, string> = {
        'Farinha de Trigo Especial': 'Farinhas',
        'Açúcar Refinado': 'Adoçantes',
        'Fermento Biológico Seco': 'Fermentos',
        'Manteiga sem Sal': 'Gorduras',
        'Sal Refinado': 'Condimentos'
      };

      const minQtys: Record<string, number> = {
        'Farinha de Trigo Especial': 150,
        'Açúcar Refinado': 100,
        'Fermento Biológico Seco': 30,
        'Manteiga sem Sal': 40,
        'Sal Refinado': 25
      };

      const today = new Date();
      const expiry = new Date();
      expiry.setFullYear(today.getFullYear() + 1);

      const newBatchItem: InventoryItem = {
        id: Date.now(),
        name: productName,
        category: categories[productName] || 'Geral',
        quantity: qty,
        unit: 'kg',
        minQty: minQtys[productName] || 10,
        address: defaultAddresses[productName] || 'Corredor C - C1',
        price: existingBatches[0]?.price || 5.0,
        expiry: expiry.toISOString().split('T')[0],
        entryDate: today.toISOString().split('T')[0]
      };

      updatedInventory.push(newBatchItem);

      const newNotification: NotificationItem = {
        id: Date.now(),
        type: 'success',
        text: `[WMS Scanner] Recebimento automático via scanner: +${qty}kg de ${productName} no endereço ${newBatchItem.address}.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
      localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify([newNotification, ...notifications]));

      setInventory(updatedInventory);
      setNotifications([newNotification, ...notifications]);
      setScannedCode('');
      setScanResult({
        type: 'success',
        text: `Sucesso! Recebido lote paletizado com +${qty}kg de ${productName} alocado no ${newBatchItem.address}.`
      });
    } else {
      // Expedição/Picking (Outbound)
      const totalAvailable = existingBatches.reduce((sum, item) => sum + item.quantity, 0);
      if (qty > totalAvailable) {
        setScanResult({
          type: 'error',
          text: `Erro de expedição! Quantidade solicitada de ${qty}kg excede o estoque total de ${totalAvailable.toFixed(1)}kg.`
        });
        return;
      }

      // Sort by FEFO for FIFO depletion
      const sorted = [...existingBatches].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
      let remaining = qty;
      for (let i = 0; i < sorted.length && remaining > 0; i++) {
        const bItem = sorted[i];
        const idx = updatedInventory.findIndex(it => it.id === bItem.id);
        if (bItem.quantity <= remaining) {
          remaining -= bItem.quantity;
          updatedInventory.splice(idx, 1);
        } else {
          updatedInventory[idx].quantity -= remaining;
          remaining = 0;
        }
      }

      const totalNewAvailable = totalAvailable - qty;
      const isBelow = totalNewAvailable < (existingBatches[0]?.minQty || 0);

      const newNotification: NotificationItem = {
        id: Date.now(),
        type: isBelow ? 'danger' : 'info',
        text: `[WMS Scanner] Expedição por scanner: -${qty}kg de ${productName}. ${isBelow ? 'Estoque crítico!' : ''}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
      localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify([newNotification, ...notifications]));

      setInventory(updatedInventory);
      setNotifications([newNotification, ...notifications]);
      setScannedCode('');
      setScanResult({
        type: 'success',
        text: `Sucesso! Expedido lote de -${qty}kg de ${productName} retirado prioritariamente via FEFO.`
      });
    }
  };

  const loadMockBarcode = (code: string) => {
    setScannedCode(code);
  };

  // 3. Picking route optimization calculations (find expiring lot first and draw path)
  const getPickingRouteInfo = () => {
    if (inventory.length === 0) return null;
    const sorted = [...inventory].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

    // Find the next two expiring lots
    const nextTwo = sorted.slice(0, 2);

    // Route coordinates on map:
    // D1 Doca Recebimento: x=15, y=160
    // D2 Doca Expedição: x=577, y=160
    // Racks:
    // A1 Farinha: x=165, y=70
    // A2 Açúcar: x=165, y=130
    // B1 Fermento: x=165, y=230
    // B2 Manteiga: x=165, y=290
    // C1 Condimentos: x=340, y=180

    const coordinates: Record<string, { x: number; y: number }> = {
      'Corredor A - A1': { x: 165, y: 70 },
      'Corredor A - A2': { x: 165, y: 130 },
      'Corredor B - B1': { x: 165, y: 230 },
      'Corredor B - B2': { x: 165, y: 290 },
      'Corredor C - C1': { x: 340, y: 180 }
    };

    const firstCoord = coordinates[nextTwo[0]?.address] || { x: 165, y: 70 };
    const secondCoord = nextTwo[1] ? (coordinates[nextTwo[1].address] || { x: 165, y: 130 }) : firstCoord;

    return {
      lots: nextTwo,
      firstCoord,
      secondCoord
    };
  };

  const routeInfo = getPickingRouteInfo();

  // 4. Cycle Counting program
  const handleCycleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(countedQty);
    if (isNaN(qty) || qty < 0) {
      alert('Preencha a contagem física com um valor válido.');
      return;
    }

    const corridorItems = inventory.filter(item => item.address === selectedAuditAddr);
    const systemStockTotal = corridorItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Accuracy calculation: 100% if exact, otherwise penalty ratio
    let accuracy = 100;
    if (systemStockTotal > 0) {
      const difference = Math.abs(qty - systemStockTotal);
      accuracy = Math.max(0, (1 - difference / systemStockTotal) * 100);
    } else if (qty > 0) {
      accuracy = 0; // system says 0, physical has stock -> 0% accuracy
    }

    const newAudit = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      address: selectedAuditAddr,
      system: systemStockTotal,
      physical: qty,
      accuracy: parseFloat(accuracy.toFixed(1))
    };

    const updatedLog = [newAudit, ...auditLog];
    localStorage.setItem('@portal-stock-ai:wms-audits', JSON.stringify(updatedLog));
    setAuditLog(updatedLog);
    setCountedQty('');

    // Update physical inventory batch if discrepancy (decrease or increase the first lot in this location)
    if (systemStockTotal !== qty) {
      const updatedInventory = [...inventory];
      const discrepancy = qty - systemStockTotal;
      
      if (discrepancy < 0) {
        // shortage
        let remaining = Math.abs(discrepancy);
        const locationLots = updatedInventory
          .filter(it => it.address === selectedAuditAddr)
          .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

        for (let i = 0; i < locationLots.length && remaining > 0; i++) {
          const lot = locationLots[i];
          const idx = updatedInventory.findIndex(it => it.id === lot.id);
          if (lot.quantity <= remaining) {
            remaining -= lot.quantity;
            updatedInventory.splice(idx, 1);
          } else {
            updatedInventory[idx].quantity -= remaining;
            remaining = 0;
          }
        }
      } else {
        // surplus
        const locationLots = updatedInventory.filter(it => it.address === selectedAuditAddr);
        if (locationLots.length > 0) {
          const idx = updatedInventory.findIndex(it => it.id === locationLots[0].id);
          updatedInventory[idx].quantity += discrepancy;
        }
      }

      const newNotif: NotificationItem = {
        id: Date.now() + 1,
        type: 'warning',
        text: `[WMS Auditoria] Reconciliação cíclica no ${selectedAuditAddr}: Ajuste de discrepância física de ${discrepancy.toFixed(1)}kg. Acurácia: ${accuracy.toFixed(1)}%.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
      localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify([newNotif, ...notifications]));
      
      setInventory(updatedInventory);
      setNotifications([newNotif, ...notifications]);
    }
  };

  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <div className="wms-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Gestão Inteligente WMS (Warehouse Management)</h1>
            <button 
              className="btn-card-help" 
              onClick={() => setShowHelp(!showHelp)} 
              title="Clique para entender como funciona esta página"
              style={{ background: 'var(--primary-light)', padding: '0.35rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary-color)' }}
            >
              <HelpCircle size={15} />
              <span>? Como funciona o WMS Inteligente</span>
            </button>
          </div>
          <p>Controle de racks verticais, expedição/recebimento óptico, otimizador de rotas de picking e auditorias de acurácia</p>
        </div>
      </header>

      {showHelp && (
        <div className="card card-help-popover-wide" style={{ marginBottom: '1.5rem', background: '#0f172a', color: '#fff' }}>
          <h4>? O QUE É E COMO FUNCIONA O WMS INTELIGENTE:</h4>
          <p style={{ marginTop: '0.35rem', fontSize: '0.825rem', lineHeight: '1.4' }}>
            <strong>O QUE É:</strong> O sistema de gerenciamento de armazém em alta definição (WMS), integrado à inteligência artificial Oliver AI.<br />
            <strong>COMO FUNCIONA:</strong> Rastreia posições nos racks verticais (A1 a C1), calcula a Rota Ótima de Coleta FEFO para os conferentes e permite leitura de código de barras por leitor óptico.
          </p>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: 'none' }}>
        <button 
          className={`btn-export ${activeTab === 'racks' ? '' : 'btn-disabled'}`}
          style={{ backgroundColor: activeTab === 'racks' ? 'var(--primary-color)' : '#e2e8f0', color: activeTab === 'racks' ? '#fff' : 'var(--text-main)' }}
          onClick={() => setActiveTab('racks')}
        >
          <Layers size={16} /> Racks Verticais (3D Plan)
        </button>
        <button 
          className={`btn-export ${activeTab === 'scanner' ? '' : 'btn-disabled'}`}
          style={{ backgroundColor: activeTab === 'scanner' ? 'var(--primary-color)' : '#e2e8f0', color: activeTab === 'scanner' ? '#fff' : 'var(--text-main)' }}
          onClick={() => { setActiveTab('scanner'); setScanResult(null); }}
        >
          <Barcode size={16} /> Simulador de Leitor Óptico
        </button>
        <button 
          className={`btn-export ${activeTab === 'picking' ? '' : 'btn-disabled'}`}
          style={{ backgroundColor: activeTab === 'picking' ? 'var(--primary-color)' : '#e2e8f0', color: activeTab === 'picking' ? '#fff' : 'var(--text-main)' }}
          onClick={() => setActiveTab('picking')}
        >
          <Navigation size={16} /> Rota Ótima FEFO
        </button>
        <button 
          className={`btn-export ${activeTab === 'audits' ? '' : 'btn-disabled'}`}
          style={{ backgroundColor: activeTab === 'audits' ? 'var(--primary-color)' : '#e2e8f0', color: activeTab === 'audits' ? '#fff' : 'var(--text-main)' }}
          onClick={() => setActiveTab('audits')}
        >
          <ClipboardCheck size={16} /> Auditoria de Acurácia (Rotativo)
        </button>
      </div>

      <div className="wms-layout-grid">
        <div className="wms-main-panel card" style={{ gridColumn: 'span 2' }}>
          
          {/* TAB 1: RACKS VERTICAIS */}
          {activeTab === 'racks' && (
            <div>
              <div className="title-section-wrapper">
                <Layers size={18} color="var(--primary-color)" />
                <h3>Organização Vertical de Paletes (Rack Plan)</h3>
              </div>
              <p className="subtitle">Mapeamento em altura de cada Corredor do armazém de Jardim Catarina, maximizando espaço aéreo</p>
              
              <div className="vertical-racks-wrapper">
                {renderRacksForCorridor('Corredor A - A1')}
                {renderRacksForCorridor('Corredor A - A2')}
                {renderRacksForCorridor('Corredor B - B1')}
                {renderRacksForCorridor('Corredor B - B2')}
                {renderRacksForCorridor('Corredor C - C1')}
              </div>
            </div>
          )}

          {/* TAB 2: BARCODE SCANNER SIMULATION */}
          {activeTab === 'scanner' && (
            <div className="scanner-card-body">
              <div className="title-section-wrapper">
                <Barcode size={18} color="var(--primary-color)" />
                <h3>Simulador de Recebimento / Expedição por Leitura Óptica</h3>
              </div>
              <p className="subtitle">Colete etiquetas e execute a conferência imediata de paletes simulando o feixe laser de coletores WMS</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div className="scanner-viewport">
                  <div className="laser-line"></div>
                  <div className="scan-target-box">
                    <div className="mock-barcode">
                      <div style={{ width: '4px' }}></div>
                      <div style={{ width: '8px' }}></div>
                      <div style={{ width: '2px' }}></div>
                      <div style={{ width: '6px' }}></div>
                      <div style={{ width: '1px' }}></div>
                      <div style={{ width: '4px' }}></div>
                      <div style={{ width: '10px' }}></div>
                      <div style={{ width: '3px' }}></div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <form onSubmit={handleBarcodeScan} className="sim-form" style={{ marginTop: 0 }}>
                    <div className="form-group">
                      <label>Código Escaneado (Mock Reader):</label>
                      <input 
                        type="text" 
                        placeholder="Cole o código do lote ou digite" 
                        value={scannedCode}
                        onChange={e => setScannedCode(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-simulate-consume">
                      Disparar Leitura Óptica (Laser)
                    </button>
                  </form>

                  <div className="scanner-quick-templates">
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Mocks Rápidos de Etiquetas de Palete:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      <button 
                        className="badge success" 
                        onClick={() => loadMockBarcode('[IN-FARINHA-200]')}
                        style={{ cursor: 'pointer', border: '1px solid #86efac' }}
                      >
                        [IN] Farinha 200kg
                      </button>
                      <button 
                        className="badge success" 
                        onClick={() => loadMockBarcode('[IN-MANTEIGA-80]')}
                        style={{ cursor: 'pointer', border: '1px solid #86efac' }}
                      >
                        [IN] Manteiga 80kg
                      </button>
                      <button 
                        className="badge danger" 
                        onClick={() => loadMockBarcode('[OUT-FERMENTO-15]')}
                        style={{ cursor: 'pointer', border: '1px solid #fca5a5' }}
                      >
                        [OUT] Fermento 15kg
                      </button>
                      <button 
                        className="badge danger" 
                        onClick={() => loadMockBarcode('[OUT-ACUCAR-50]')}
                        style={{ cursor: 'pointer', border: '1px solid #fca5a5' }}
                      >
                        [OUT] Açúcar 50kg
                      </button>
                    </div>
                  </div>

                  {scanResult && (
                    <div className={`message-banner card ${scanResult.type === 'success' ? 'success' : 'error'}`} style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                      <div className="banner-header">
                        {scanResult.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                        <strong>{scanResult.text}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROUTE OPTIMIZATION */}
          {activeTab === 'picking' && (
            <div>
              <div className="title-section-wrapper">
                <Navigation size={18} color="var(--primary-color)" />
                <h3>Otimizador Inteligente de Rota de Coleta (FEFO Picking)</h3>
              </div>
              <p className="subtitle">Lógica de caminhada ótima: o sistema calcula o menor trajeto aéreo pelas prateleiras baseado nos vencimentos iminentes</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div className="svg-map-wrapper">
                  <svg viewBox="0 0 600 360" width="100%" height="100%">
                    <rect width="600" height="360" fill="#f8fafc" />
                    
                    {/* Doca Recebimento D1 */}
                    <rect x="15" y="130" width="10" height="60" fill="#10b981" />
                    <text x="30" y="165" fontSize="8" fontWeight="800" fill="#047857" transform="rotate(-90 30 165)">D1</text>
                    
                    {/* Doca Expedição D2 */}
                    <rect x="575" y="130" width="10" height="60" fill="#3b82f6" />
                    <text x="560" y="165" fontSize="8" fontWeight="800" fill="#1d4ed8" transform="rotate(90 560 165)">D2</text>

                    {/* Racks */}
                    <rect x="120" y="50" width="90" height="30" rx="3" fill="#cbd5e1" />
                    <text x="165" y="68" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">A1 (FARINHA)</text>
                    
                    <rect x="120" y="110" width="90" height="30" rx="3" fill="#cbd5e1" />
                    <text x="165" y="128" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">A2 (AÇÚCAR)</text>

                    <rect x="120" y="210" width="90" height="30" rx="3" fill="#cbd5e1" />
                    <text x="165" y="228" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">B1 (FERMENTO)</text>

                    <rect x="120" y="270" width="90" height="30" rx="3" fill="#cbd5e1" />
                    <text x="165" y="288" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">B2 (MANTEIGA)</text>

                    <rect x="290" y="120" width="80" height="110" rx="3" fill="#cbd5e1" />
                    <text x="330" y="180" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569" transform="rotate(-90 330 180)">C1 (CONDIMENTOS)</text>

                    {/* Draw Optimized Route Path if routeInfo exists */}
                    {routeInfo && (
                      <g>
                        {/* Route Line starting at D1 Doca -> First Rack -> Second Rack -> D2 Doca */}
                        <path 
                          d={`M 15 160 
                              L 70 160 
                              L 70 ${routeInfo.firstCoord.y} 
                              L ${routeInfo.firstCoord.x} ${routeInfo.firstCoord.y}
                              L ${routeInfo.secondCoord.x} ${routeInfo.secondCoord.y} 
                              L 260 ${routeInfo.secondCoord.y}
                              L 260 160 
                              L 575 160`} 
                          fill="none" 
                          className="route-optimized-path"
                        />
                        {/* Step markers */}
                        <circle cx="15" cy="160" r="10" className="route-step-marker" />
                        <text x="15" y="163" textAnchor="middle" className="route-step-text">D1</text>

                        <circle cx={routeInfo.firstCoord.x} cy={routeInfo.firstCoord.y} r="10" className="route-step-marker" />
                        <text x={routeInfo.firstCoord.x} y={routeInfo.firstCoord.y + 3} textAnchor="middle" className="route-step-text">1</text>

                        {routeInfo.lots[1] && (
                          <>
                            <circle cx={routeInfo.secondCoord.x} cy={routeInfo.secondCoord.y} r="10" className="route-step-marker" />
                            <text x={routeInfo.secondCoord.x} y={routeInfo.secondCoord.y + 3} textAnchor="middle" className="route-step-text">2</text>
                          </>
                        )}

                        <circle cx="575" cy="160" r="10" className="route-step-marker" />
                        <text x="575" y="163" textAnchor="middle" className="route-step-text">D2</text>
                      </g>
                    )}
                  </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Instruções de Picking Sequencial (FEFO):</h4>
                  {routeInfo && routeInfo.lots.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="cause-card-item" style={{ borderLeftColor: '#10b981', margin: 0 }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>Passo 1: Coleta Prioritária</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Vá ao <strong>{routeInfo.lots[0].address}</strong> e retire o lote <strong>#{routeInfo.lots[0].id.toString().slice(-6)}</strong> de {routeInfo.lots[0].name}.
                            <br />Qtd: {routeInfo.lots[0].quantity}kg | Validade: {routeInfo.lots[0].expiry}
                          </p>
                        </div>
                      </div>

                      {routeInfo.lots[1] && (
                        <div className="cause-card-item" style={{ borderLeftColor: '#10b981', margin: 0 }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>Passo 2: Próxima Validade</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Vá ao <strong>{routeInfo.lots[1].address}</strong> e colete o lote <strong>#{routeInfo.lots[1].id.toString().slice(-6)}</strong> de {routeInfo.lots[1].name}.
                              <br />Qtd: {routeInfo.lots[1].quantity}kg | Validade: {routeInfo.lots[1].expiry}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="cause-card-item" style={{ borderLeftColor: '#3b82f6', margin: 0 }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>Passo Final: Entrega na Expedição</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Encaminhe todos os insumos coletados para a <strong>Doca de Expedição D2</strong> e registre a saída no scanner.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-address-msg">
                      <Info size={16} />
                      <span>Sem dados de rota disponíveis. Certifique-se de que há lotes cadastrados.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDITORIA ROTATIVA */}
          {activeTab === 'audits' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="audit-form-section">
                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>Registrar Auditoria Cíclica</h4>
                <p className="subtitle">Selecione o endereço físico para conferência às cegas e digite a quantidade real contada</p>
                
                <form onSubmit={handleCycleAuditSubmit} className="sim-form" style={{ marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label>Endereço Alvo:</label>
                    <select 
                      value={selectedAuditAddr} 
                      onChange={e => setSelectedAuditAddr(e.target.value)}
                    >
                      <option value="Corredor A - A1">Setor A - Corredor A1 (Farinhas)</option>
                      <option value="Corredor A - A2">Setor A - Corredor A2 (Açúcares)</option>
                      <option value="Corredor B - B1">Setor B - Corredor B1 (Fermentos)</option>
                      <option value="Corredor B - B2">Setor B - Corredor B2 (Gorduras)</option>
                      <option value="Corredor C - C1">Setor C - Corredor C1 (Condimentos)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantidade Contada Física (kg):</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      placeholder="Qtd real em kg" 
                      value={countedQty}
                      onChange={e => setCountedQty(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-simulate-audit">
                    Lançar Acurácia & Conciliar Racks
                  </button>
                </form>
              </div>

              <div className="audit-history-section">
                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: '800', marginBottom: '0.25rem' }}>Histórico de Auditoria & Acurácia</h4>
                <p className="subtitle">Evolução do índice U.I.A (Unidades e Acurácia de Inventário)</p>

                <div className="table-responsive" style={{ maxHeight: '240px', overflowY: 'auto', marginTop: '0.5rem' }}>
                  <table className="management-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Local</th>
                        <th>Sist.</th>
                        <th>Fís.</th>
                        <th>Acurácia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLog.map(audit => (
                        <tr key={audit.id}>
                          <td>{audit.date}</td>
                          <td><span className="address-badge">{audit.address}</span></td>
                          <td><strong>{audit.system.toFixed(0)}kg</strong></td>
                          <td><strong>{audit.physical.toFixed(0)}kg</strong></td>
                          <td>
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: audit.accuracy >= 90 ? '#dcfce7' : audit.accuracy >= 70 ? '#fef3c7' : '#fee2e2',
                                color: audit.accuracy >= 90 ? '#15803d' : audit.accuracy >= 70 ? '#b45309' : '#b91c1c'
                              }}
                            >
                              {audit.accuracy}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WMSInteligente;
