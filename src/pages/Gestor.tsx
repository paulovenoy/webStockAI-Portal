import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertTriangle, Trash2, Plus } from 'lucide-react';

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
  abc: string;
  rotation: string;
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
}

const Gestor: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [banner, setBanner] = useState<BannerState | null>(null);

  // New ingredient form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Farinhas');
  const [initialQty, setInitialQty] = useState('');
  const [minQty, setMinQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [address, setAddress] = useState('Corredor A - A1');
  const [abc, setAbc] = useState('A');
  const [rotation, setRotation] = useState('Alto');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (localInv) setInventory(JSON.parse(localInv));
    
    const localNotif = localStorage.getItem('@portal-stock-ai:notifications');
    if (localNotif) setNotifications(JSON.parse(localNotif));
  };

  // Aggregate inventory by product name
  const aggregated: Record<string, {
    name: string;
    category: string;
    quantity: number;
    minQty: number;
    address: string;
    price: number;
    abc: string;
    rotation: string;
  }> = {};

  inventory.forEach(item => {
    if (!aggregated[item.name]) {
      aggregated[item.name] = {
        name: item.name,
        category: item.category,
        quantity: 0,
        minQty: item.minQty,
        address: item.address,
        price: item.price,
        abc: item.abc || 'C',
        rotation: item.rotation || 'Baixo'
      };
    }
    aggregated[item.name].quantity += item.quantity;
  });

  const handleRegisterProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(initialQty);
    const min = parseFloat(minQty);
    const price = parseFloat(unitPrice);

    if (!name.trim() || isNaN(qty) || qty <= 0 || isNaN(min) || min <= 0 || isNaN(price) || price <= 0) {
      alert('Preencha todos os campos numéricos com valores maiores que zero.');
      return;
    }

    if (aggregated[name.trim()]) {
      alert('Este insumo já está cadastrado. Para adicionar mais unidades, use a aba "Recebimento (CQ)" em Inventário.');
      return;
    }

    const today = new Date();
    const entryDateStr = today.toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(today.getFullYear() + 1);
    const expiryDateStr = expiry.toISOString().split('T')[0];

    const newItem: InventoryItem = {
      id: Date.now(),
      name: name.trim(),
      category,
      quantity: qty,
      unit: 'kg',
      minQty: min,
      address,
      price,
      expiry: expiryDateStr,
      entryDate: entryDateStr,
      abc,
      rotation
    };

    const updatedInventory = [...inventory, newItem];
    
    const newNotification: NotificationItem = {
      id: Date.now() + 1,
      type: 'success',
      text: `[Gestor] Novo insumo cadastrado: ${name.trim()} (${qty}kg alocados no ${address}).`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotifications = [newNotification, ...notifications];

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifications));

    setInventory(updatedInventory);
    setNotifications(updatedNotifications);
    
    // Clear form
    setName('');
    setInitialQty('');
    setMinQty('');
    setUnitPrice('');

    setBanner({
      type: 'success',
      text: `Insumo "${newItem.name}" cadastrado com sucesso e alocado no endereço ${newItem.address}!`
    });
  };

  const handleDeleteProduct = (productName: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o insumo "${productName}"? Isso removerá todos os lotes do depósito.`)) {
      return;
    }

    const updatedInventory = inventory.filter(item => item.name !== productName);

    const newNotification: NotificationItem = {
      id: Date.now(),
      type: 'warning',
      text: `[Gestor] Insumo "${productName}" foi removido do sistema pelo administrador.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotifications = [newNotification, ...notifications];

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifications));

    setInventory(updatedInventory);
    setNotifications(updatedNotifications);

    setBanner({
      type: 'error',
      text: `Insumo "${productName}" e todos os seus lotes correspondentes foram deletados do depósito.`
    });
  };

  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <div className="gestor-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Área & Painel de Controle do Gestor</h1>
            <button 
              className="btn-card-help" 
              onClick={() => setShowHelp(!showHelp)} 
              title="Clique para entender como funciona esta página"
              style={{ background: 'var(--primary-light)', padding: '0.35rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary-color)' }}
            >
              <span>? Como funciona a Área do Gestor</span>
            </button>
          </div>
          <p>Gerenciamento de categorias de insumos, parametrização mínima e auditoria do sistema</p>
        </div>
      </header>

      {showHelp && (
        <div className="card card-help-popover-wide" style={{ marginBottom: '1.5rem', background: '#0f172a', color: '#fff' }}>
          <h4>? O QUE É E COMO FUNCIONA A ÁREA DO GESTOR:</h4>
          <p style={{ marginTop: '0.35rem', fontSize: '0.825rem', lineHeight: '1.4' }}>
            <strong>O QUE É:</strong> A central de administração de permissões e cadastro de matérias-primas da fábrica.<br />
            <strong>COMO FUNCIONA:</strong> Permite ao gestor cadastrar novos insumos, alterar margens de segurança em quilos, excluir itens descontinuados e ajustar a classificação ABC.
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
          <button className="close-banner" onClick={() => setBanner(null)}>Fechar</button>
        </div>
      )}

      <div className="gestor-grid">
        <div className="ingredients-management">
          <div className="card">
            <div className="title-section-wrapper">
              <Settings size={18} color="var(--primary-color)" />
              <h3>Cadastro Geral de Insumos</h3>
            </div>
            <p className="subtitle">Lista consolidada de itens autorizados no depósito de Jardim Catarina</p>

            <div className="table-responsive">
              <table className="management-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Categoria</th>
                    <th>Estoque Total</th>
                    <th>Mínimo</th>
                    <th>Preço/kg</th>
                    <th>Endereço</th>
                    <th>Curva ABC</th>
                    <th>Giro</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(aggregated).map(item => {
                    const isLow = item.quantity < item.minQty;
                    return (
                      <tr key={item.name} className={isLow ? 'low-warning' : ''}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.category}</td>
                        <td><strong>{item.quantity.toFixed(1)} kg</strong></td>
                        <td>{item.minQty} kg</td>
                        <td>R$ {item.price.toFixed(2)}</td>
                        <td><span className="address-badge">{item.address}</span></td>
                        <td>
                          <span className={`abc-badge ${item.abc}`}>Curva {item.abc}</span>
                        </td>
                        <td>
                          <span className={`rotation-badge ${item.rotation}`}>Giro {item.rotation}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteProduct(item.name)}
                            title="Remover insumo"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="add-ingredient-section">
          <div className="card">
            <div className="title-section-wrapper">
              <Plus size={18} color="var(--primary-color)" />
              <h3>Cadastrar Novo Insumo</h3>
            </div>
            <p className="subtitle">Insira um novo insumo e crie seu primeiro lote no depósito</p>

            <form onSubmit={handleRegisterProduct} className="add-form">
              <div className="form-group">
                <label>Nome do Insumo:</label>
                <input 
                  type="text" 
                  placeholder="Ex: Leite Condensado 395g" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Categoria:</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="Farinhas">Farinhas</option>
                    <option value="Adoçantes">Adoçantes</option>
                    <option value="Fermentos">Fermentos</option>
                    <option value="Gorduras">Gorduras</option>
                    <option value="Condimentos">Condimentos</option>
                    <option value="Geral">Outros</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label>Preço Unitário (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Custo/kg" 
                    value={unitPrice} 
                    onChange={e => setUnitPrice(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Estoque Inicial (kg):</label>
                  <input 
                    type="number" 
                    placeholder="Qtd inicial" 
                    value={initialQty} 
                    onChange={e => setInitialQty(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group half">
                  <label>Estoque Mínimo (kg):</label>
                  <input 
                    type="number" 
                    placeholder="Margem de alerta" 
                    value={minQty} 
                    onChange={e => setMinQty(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Endereço Físico (Layout):</label>
                <select value={address} onChange={e => setAddress(e.target.value)}>
                  <option value="Corredor A - A1">Setor A - Corredor A1 (Farinhas)</option>
                  <option value="Corredor A - A2">Setor A - Corredor A2 (Açúcares)</option>
                  <option value="Corredor B - B1">Setor B - Corredor B1 (Fermentos)</option>
                  <option value="Corredor B - B2">Setor B - Corredor B2 (Gorduras)</option>
                  <option value="Corredor C - C1">Setor C - Corredor C1 (Condimentos)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Curva ABC:</label>
                  <select value={abc} onChange={e => setAbc(e.target.value)}>
                    <option value="A">Curva A (Alto Valor)</option>
                    <option value="B">Curva B (Médio Valor)</option>
                    <option value="C">Curva C (Baixo Valor)</option>
                  </select>
                </div>

                <div className="form-group half">
                  <label>Giro de Estoque:</label>
                  <select value={rotation} onChange={e => setRotation(e.target.value)}>
                    <option value="Alto">Alto Giro</option>
                    <option value="Médio">Médio Giro</option>
                    <option value="Baixo">Baixo Giro</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-submit-add">Confirmar Cadastro de Insumo</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gestor;
