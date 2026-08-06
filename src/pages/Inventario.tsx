import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertTriangle, ArrowRight, Play, ClipboardCheck, Plus } from 'lucide-react';

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
  abc?: string;
  rotation?: string;
}

interface NotificationItem {
  id: number;
  type: 'warning' | 'info' | 'success' | 'danger';
  text: string;
  time: string;
}

interface BannerState {
  type: 'success' | 'error';
  text: string;
  details?: string[];
  purchaseAlert?: boolean;
}

const Inventario: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Consumption states
  const [consumeItem, setConsumeItem] = useState('Farinha de Trigo Especial');
  const [consumeQty, setConsumeQty] = useState('');
  
  // Audit states
  const [auditItem, setAuditItem] = useState('Farinha de Trigo Especial');
  const [auditQty, setAuditQty] = useState('');
  
  // Receiving states
  const [newBatch, setNewBatch] = useState({
    name: 'Farinha de Trigo Especial',
    quantity: '',
    address: 'Corredor A - A1',
    price: '4.50',
    expiry: '',
    entryDate: ''
  });

  const [banner, setBanner] = useState<BannerState | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (localInv) setInventory(JSON.parse(localInv));
    
    const localNotif = localStorage.getItem('@portal-stock-ai:notifications');
    if (localNotif) setNotifications(JSON.parse(localNotif));
  };

  const itemMeta: Record<string, { abc: string; rotation: string }> = {
    'Farinha de Trigo Especial': { abc: 'A', rotation: 'Alto' },
    'Açúcar Refinado': { abc: 'B', rotation: 'Médio' },
    'Fermento Biológico Seco': { abc: 'A', rotation: 'Alto' },
    'Manteiga sem Sal': { abc: 'B', rotation: 'Médio' },
    'Sal Refinado': { abc: 'C', rotation: 'Baixo' }
  };

  // Group batches by item name
  const aggregated: Record<string, {
    name: string;
    category: string;
    quantity: number;
    minQty: number;
    address: string;
    price: number;
    abc: string;
    rotation: string;
    batches: InventoryItem[];
  }> = {};

  inventory.forEach(item => {
    if (!aggregated[item.name]) {
      const meta = itemMeta[item.name] || { abc: 'C', rotation: 'Baixo' };
      aggregated[item.name] = {
        name: item.name,
        category: item.category,
        quantity: 0,
        minQty: item.minQty,
        address: item.address,
        price: item.price,
        abc: meta.abc,
        rotation: meta.rotation,
        batches: []
      };
    }
    aggregated[item.name].quantity += item.quantity;
    aggregated[item.name].batches.push(item);
  });

  // Sort batches of each item by expiry (FEFO)
  Object.values(aggregated).forEach(item => {
    item.batches.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
  });

  // Simular Saída da Produção (FEFO)
  const handleConsume = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(consumeQty);
    if (isNaN(qty) || qty <= 0) return;

    const matchedBatches = inventory.filter(item => item.name === consumeItem);
    if (matchedBatches.length === 0) {
      setBanner({ type: 'error', text: 'Insumo não encontrado no estoque.' });
      return;
    }

    const totalAvailable = matchedBatches.reduce((sum, item) => sum + item.quantity, 0);
    if (qty > totalAvailable) {
      setBanner({ 
        type: 'error', 
        text: `Quantidade indisponível. Estoque atual de ${consumeItem} é de apenas ${totalAvailable.toFixed(1)}kg.` 
      });
      return;
    }

    // FEFO: Sort by expiry, then entryDate
    const sortedBatches = [...matchedBatches].sort((a, b) => {
      const diff = new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
      if (diff === 0) return new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
      return diff;
    });

    let remainingToConsume = qty;
    const updatedInventory = [...inventory];
    const detailsLog: string[] = [];

    for (let i = 0; i < sortedBatches.length && remainingToConsume > 0; i++) {
      const batch = sortedBatches[i];
      const indexInInventory = updatedInventory.findIndex(item => item.id === batch.id);

      if (batch.quantity <= remainingToConsume) {
        remainingToConsume -= batch.quantity;
        detailsLog.push(`Lote ${batch.id.toString().slice(-6)} (${batch.quantity}kg, Validade: ${batch.expiry}) esgotado.`);
        updatedInventory.splice(indexInInventory, 1);
      } else {
        updatedInventory[indexInInventory].quantity -= remainingToConsume;
        detailsLog.push(`Lote ${batch.id.toString().slice(-6)} (${remainingToConsume.toFixed(1)}kg, Validade: ${batch.expiry}) consumido.`);
        remainingToConsume = 0;
      }
    }

    const itemMetaGroup = aggregated[consumeItem];
    const newStock = totalAvailable - qty;
    const isBelowMin = newStock < itemMetaGroup.minQty;
    
    let notificationText = '';
    if (isBelowMin) {
      notificationText = `[Compras] ${consumeItem} está em falta crítica (${newStock.toFixed(1)}kg / ${itemMetaGroup.minQty}kg mínimo). Pedido automático sugerido!`;
    } else {
      notificationText = `Produção consumiu ${qty}kg de ${consumeItem}. Saída processada via FEFO.`;
    }

    const newNotification: NotificationItem = {
      id: Date.now(),
      type: isBelowMin ? 'danger' : 'info',
      text: notificationText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotifications = [newNotification, ...notifications];

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifications));
    
    setInventory(updatedInventory);
    setNotifications(updatedNotifications);
    setConsumeQty('');
    
    setBanner({
      type: 'success',
      text: `Sucesso! Consumido ${qty}kg de ${consumeItem}. Lógica FEFO aplicada:`,
      details: detailsLog,
      purchaseAlert: isBelowMin
    });
  };

  // Reconciliação Física (Auditoria)
  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const countedQty = parseFloat(auditQty);
    if (isNaN(countedQty) || countedQty < 0) {
      alert('Insira uma contagem física válida.');
      return;
    }

    const targetGroup = aggregated[auditItem];
    if (!targetGroup) {
      alert('Insumo não encontrado no estoque.');
      return;
    }

    const currentSystemQty = targetGroup.quantity;
    const discrepancy = countedQty - currentSystemQty;

    if (discrepancy === 0) {
      setBanner({
        type: 'success',
        text: `Auditoria concluída para ${auditItem}: Contagem física bate 100% com o sistema (${countedQty}kg). Nenhuma ação necessária.`
      });
      setAuditQty('');
      return;
    }

    const updatedInventory = [...inventory];

    if (discrepancy < 0) {
      // Inventory shortage: consume discrepancy from the closest expiring batch
      let remainingShortage = Math.abs(discrepancy);
      const sortedBatches = updatedInventory
        .filter(item => item.name === auditItem)
        .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());

      for (let i = 0; i < sortedBatches.length && remainingShortage > 0; i++) {
        const batch = sortedBatches[i];
        const idx = updatedInventory.findIndex(item => item.id === batch.id);

        if (batch.quantity <= remainingShortage) {
          remainingShortage -= batch.quantity;
          updatedInventory.splice(idx, 1);
        } else {
          updatedInventory[idx].quantity -= remainingShortage;
          remainingShortage = 0;
        }
      }

      // Log loss in waste history
      const localWaste = localStorage.getItem('@portal-stock-ai:waste');
      if (localWaste) {
        const wasteList = JSON.parse(localWaste);
        if (wasteList.length > 0) {
          wasteList[wasteList.length - 1].losses += Math.abs(discrepancy);
          localStorage.setItem('@portal-stock-ai:waste', JSON.stringify(wasteList));
        }
      }
    } else {
      // Inventory surplus: add discrepancy to the first batch of the item
      const itemBatches = updatedInventory.filter(item => item.name === auditItem);
      if (itemBatches.length > 0) {
        const firstBatchIdx = updatedInventory.findIndex(item => item.id === itemBatches[0].id);
        updatedInventory[firstBatchIdx].quantity += discrepancy;
      }
    }

    const newNotification: NotificationItem = {
      id: Date.now(),
      type: discrepancy < 0 ? 'warning' : 'success',
      text: `[Auditoria] Reconciliação física de ${auditItem}: Ajustado de ${currentSystemQty.toFixed(1)}kg para ${countedQty.toFixed(1)}kg. Discrepância de ${discrepancy.toFixed(1)}kg registrada.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotifications = [newNotification, ...notifications];

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifications));

    setInventory(updatedInventory);
    setNotifications(updatedNotifications);
    setAuditQty('');

    setBanner({
      type: discrepancy < 0 ? 'error' : 'success',
      text: `Auditoria concluída! Ajustado estoque de ${auditItem}:`,
      details: [
        `Contagem do Sistema: ${currentSystemQty.toFixed(1)} kg`,
        `Contagem Física: ${countedQty.toFixed(1)} kg`,
        `Diferença: ${discrepancy > 0 ? '+' : ''}${discrepancy.toFixed(1)} kg (${discrepancy < 0 ? 'Perda/Refugo registrada' : 'Ajuste positivo'})`
      ]
    });
  };

  // Cadastrar Lote Recebimento (CQ)
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newBatch.quantity);
    const price = parseFloat(newBatch.price);
    
    if (isNaN(qty) || qty <= 0 || !newBatch.expiry || !newBatch.entryDate) {
      alert('Preencha todos os campos do lote.');
      return;
    }

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

    const batchItem: InventoryItem = {
      id: Date.now(),
      name: newBatch.name,
      category: categories[newBatch.name] || 'Geral',
      quantity: qty,
      unit: 'kg',
      minQty: minQtys[newBatch.name] || 10,
      address: newBatch.address,
      price: price,
      expiry: newBatch.expiry,
      entryDate: newBatch.entryDate
    };

    const updatedInventory = [...inventory, batchItem];

    const newNotification: NotificationItem = {
      id: Date.now() + 1,
      type: 'success',
      text: `Lote cadastrado: +${qty}kg de ${newBatch.name} alocado no ${newBatch.address}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotifications = [newNotification, ...notifications];

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifications));

    setInventory(updatedInventory);
    setNotifications(updatedNotifications);
    
    // Reset batch form
    setNewBatch({
      name: 'Farinha de Trigo Especial',
      quantity: '',
      address: 'Corredor A - A1',
      price: '4.50',
      expiry: '',
      entryDate: ''
    });

    setBanner({
      type: 'success',
      text: `Novo lote de ${batchItem.name} adicionado com sucesso ao local ${batchItem.address}.`
    });
  };

  const handleSelectItemForNewBatch = (name: string) => {
    const defaultPrices: Record<string, string> = {
      'Farinha de Trigo Especial': '4.50',
      'Açúcar Refinado': '3.50',
      'Fermento Biológico Seco': '18.00',
      'Manteiga sem Sal': '26.50',
      'Sal Refinado': '2.10'
    };

    const defaultAddresses: Record<string, string> = {
      'Farinha de Trigo Especial': 'Corredor A - A1',
      'Açúcar Refinado': 'Corredor A - A2',
      'Fermento Biológico Seco': 'Corredor B - B1',
      'Manteiga sem Sal': 'Corredor B - B2',
      'Sal Refinado': 'Corredor C - C1'
    };

    setNewBatch(prev => ({
      ...prev,
      name,
      price: defaultPrices[name] || '1.00',
      address: defaultAddresses[name] || 'Corredor C - C1'
    }));
  };

  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <div className="inventario-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Gestão de Inventário (FIFO / FEFO)</h1>
            <button 
              className="btn-card-help" 
              onClick={() => setShowHelp(!showHelp)} 
              title="Clique para entender como funciona esta página"
              style={{ background: 'var(--primary-light)', padding: '0.35rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary-color)' }}
            >
              <span>? Como funciona o Inventário</span>
            </button>
          </div>
          <p>Rastreabilidade de validade de insumos, curva ABC, giro e reconciliação física</p>
        </div>
      </header>

      {showHelp && (
        <div className="card card-help-popover-wide" style={{ marginBottom: '1.5rem', background: '#0f172a', color: '#fff' }}>
          <h4>? O QUE É E COMO FUNCIONA O INVENTÁRIO (FEFO / FIFO):</h4>
          <p style={{ marginTop: '0.35rem', fontSize: '0.825rem', lineHeight: '1.4' }}>
            <strong>O QUE É:</strong> O controle de estoque ordenado por data de vencimento e curva de custo de insumos.<br />
            <strong>COMO FUNCIONA:</strong> O sistema aplica o algoritmo FEFO (Primeiro que Vence, Primeiro que Sai) para baixar lotes prestes a vencer, além de permitir auditoria física para conferir se o peso no saco bate com a contagem do sistema.
          </p>
        </div>
      )}

      {banner && (
        <div className={`message-banner card ${banner.type}`}>
          <div className="banner-header">
            {banner.type === 'success' ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <strong>{banner.text}</strong>
          </div>
          {banner.details && (
            <ul className="banner-details">
              {banner.details.map((detail, idx) => (
                <li key={idx}>
                  <ArrowRight size={12} /> {detail}
                </li>
              ))}
            </ul>
          )}
          {banner.purchaseAlert && (
            <div className="purchase-banner-alert">
              <AlertTriangle size={14} />
              <span>O setor de compras foi sinalizado automaticamente para reposição urgente deste insumo!</span>
            </div>
          )}
          <button className="close-banner" onClick={() => setBanner(null)}>Fechar</button>
        </div>
      )}

      <div className="inventario-grid">
        <div className="inventory-section">
          <div className="card">
            <div className="section-title-wrapper">
              <Layers size={18} color="var(--primary-color)" />
              <h3>Insumos Ativos por Validade (FEFO)</h3>
            </div>
            <p className="subtitle">Lotes organizados por vencimento com tags de classificação operacional</p>

            <div className="ingredients-list">
              {Object.values(aggregated).map(item => {
                const isLow = item.quantity < item.minQty;
                return (
                  <div key={item.name} className={`ingredient-card ${isLow ? 'low' : ''}`}>
                    <div className="ing-summary">
                      <div className="ing-info">
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {item.name}
                          <span className={`abc-badge ${item.abc}`}>Curva {item.abc}</span>
                          <span className={`rotation-badge ${item.rotation}`}>Giro {item.rotation}</span>
                        </strong>
                        <span>Categoria: {item.category} | Local: {item.address}</span>
                      </div>
                      <div className="ing-stock">
                        <span className="qty">{item.quantity.toFixed(1)} kg</span>
                        <span className={`status-pill ${isLow ? 'danger' : 'success'}`}>
                          {isLow ? `Falta Crítica (< ${item.minQty}kg)` : 'Estoque Regular'}
                        </span>
                      </div>
                    </div>

                    <div className="batches-table-wrapper">
                      <h5>Lotes Ativos (FEFO prioritário na saída):</h5>
                      <table className="batches-table">
                        <thead>
                          <tr>
                            <th>ID Lote</th>
                            <th>Entrada (FIFO)</th>
                            <th>Validade (FEFO)</th>
                            <th>Quantidade</th>
                            <th>Custo/Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.batches.map((batch, idx) => {
                            const isExpiringSoon = (new Date(batch.expiry).getTime() - new Date().getTime()) < 10 * 24 * 60 * 60 * 1000;
                            return (
                              <tr key={batch.id} className={idx === 0 ? 'priority-row' : ''}>
                                <td>
                                  {batch.id.toString().slice(-6)}
                                  {idx === 0 && <span className="priority-tag">PRÓXIMA SAÍDA</span>}
                                </td>
                                <td>{batch.entryDate}</td>
                                <td className={isExpiringSoon ? 'expired-warning' : ''}>
                                  {batch.expiry}
                                  {isExpiringSoon && <span title="Próximo do vencimento!"><AlertTriangle size={12} style={{ marginLeft: '4px' }} /></span>}
                                </td>
                                <td><strong>{batch.quantity} kg</strong></td>
                                <td>R$ {batch.price.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="simulation-section">
          {/* Consumption Simulator */}
          <div className="card simulator-card">
            <div className="section-title-wrapper">
              <Play size={18} color="var(--primary-color)" />
              <h3>Simulador de Consumo (Produção)</h3>
            </div>
            <p className="subtitle">Lógica FEFO consome automaticamente o lote mais antigo/vencendo primeiro</p>
            
            <form onSubmit={handleConsume} className="sim-form">
              <div className="form-group">
                <label>Selecione o Insumo:</label>
                <select value={consumeItem} onChange={e => setConsumeItem(e.target.value)}>
                  <option value="Farinha de Trigo Especial">Farinha de Trigo Especial</option>
                  <option value="Açúcar Refinado">Açúcar Refinado</option>
                  <option value="Fermento Biológico Seco">Fermento Biológico Seco</option>
                  <option value="Manteiga sem Sal">Manteiga sem Sal</option>
                  <option value="Sal Refinado">Sal Refinado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantidade a Consumir (kg):</label>
                <input 
                  type="number" 
                  step="0.5" 
                  placeholder="Ex: 25.5" 
                  value={consumeQty} 
                  onChange={e => setConsumeQty(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn-simulate-consume">Simular Saída da Produção</button>
            </form>
          </div>

          {/* Audit & Reconciliation */}
          <div className="card audit-card">
            <div className="section-title-wrapper">
              <ClipboardCheck size={18} color="var(--success-color)" />
              <h3>Auditoria & Reconciliação Física</h3>
            </div>
            <p className="subtitle">Realize contagens físicas e registre desvios automaticamente para recalcular perdas</p>
            
            <form onSubmit={handleAudit} className="sim-form">
              <div className="form-group">
                <label>Selecione o Insumo Auditado:</label>
                <select value={auditItem} onChange={e => setAuditItem(e.target.value)}>
                  <option value="Farinha de Trigo Especial">Farinha de Trigo Especial</option>
                  <option value="Açúcar Refinado">Açúcar Refinado</option>
                  <option value="Fermento Biológico Seco">Fermento Biológico Seco</option>
                  <option value="Manteiga sem Sal">Manteiga sem Sal</option>
                  <option value="Sal Refinado">Sal Refinado</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contagem Física Realizada (kg):</label>
                <input 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 432.5" 
                  value={auditQty} 
                  onChange={e => setAuditQty(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn-simulate-audit">Executar Reconciliação e Corrigir</button>
            </form>
          </div>

          {/* Add New Batch Form */}
          <div className="card add-batch-card">
            <div className="section-title-wrapper">
              <Plus size={18} color="var(--primary-color)" />
              <h3>Lançar Lote de Mercadoria (CQ)</h3>
            </div>
            <p className="subtitle">Lançar lote no recebimento para simular FIFO/FEFO</p>

            <form onSubmit={handleAddBatch} className="sim-form">
              <div className="form-group">
                <label>Insumo:</label>
                <select value={newBatch.name} onChange={e => handleSelectItemForNewBatch(e.target.value)}>
                  <option value="Farinha de Trigo Especial">Farinha de Trigo Especial</option>
                  <option value="Açúcar Refinado">Açúcar Refinado</option>
                  <option value="Fermento Biológico Seco">Fermento Biológico Seco</option>
                  <option value="Manteiga sem Sal">Manteiga sem Sal</option>
                  <option value="Sal Refinado">Sal Refinado</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Qtd Recebida (kg):</label>
                  <input 
                    type="number" 
                    placeholder="Qtd em kg" 
                    value={newBatch.quantity} 
                    onChange={e => setNewBatch({ ...newBatch, quantity: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group half">
                  <label>Preço Unitário (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newBatch.price} 
                    onChange={e => setNewBatch({ ...newBatch, price: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Data Entrada (FIFO):</label>
                  <input 
                    type="date" 
                    value={newBatch.entryDate} 
                    onChange={e => setNewBatch({ ...newBatch, entryDate: e.target.value })} 
                    required 
                  />
                </div>
                <div className="form-group half">
                  <label>Data Validade (FEFO):</label>
                  <input 
                    type="date" 
                    value={newBatch.expiry} 
                    onChange={e => setNewBatch({ ...newBatch, expiry: e.target.value })} 
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn-add-batch">Confirmar Lote no Recebimento</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
