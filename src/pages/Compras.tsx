import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, TrendingDown, Zap, Truck, Users } from 'lucide-react';

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

interface SupplierProduct {
  name: string;
  price: number;
  deliveryDays: number;
}

interface Supplier {
  id: number;
  name: string;
  phone: string;
  products: SupplierProduct[];
}

interface RecommendationResult {
  supplierName: string;
  phone: string;
  price: number;
  deliveryDays: number;
  totalPrice: number;
  surcharge: number;
  finalPrice: number;
  product: string;
  quantity: number;
  address: string;
}

const Compras: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('Farinha de Trigo Especial');
  const [orderQty, setOrderQty] = useState('');
  const [purchaseCriteria, setPurchaseCriteria] = useState<'economy' | 'urgency'>('economy');
  const [issuedOrder, setIssuedOrder] = useState<RecommendationResult | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (localInv) setInventory(JSON.parse(localInv));
    
    const localNotif = localStorage.getItem('@portal-stock-ai:notifications');
    if (localNotif) setNotifications(JSON.parse(localNotif));
  };

  const suppliers: Supplier[] = [
    {
      id: 1,
      name: 'Moinho Fluminense',
      phone: '(21) 2233-4455',
      products: [
        { name: 'Farinha de Trigo Especial', price: 4.2, deliveryDays: 5 },
        { name: 'Açúcar Refinado', price: 3.1, deliveryDays: 4 },
        { name: 'Sal Refinado', price: 1.9, deliveryDays: 3 }
      ]
    },
    {
      id: 2,
      name: 'Supremo Ingredientes',
      phone: '(21) 3344-5566',
      products: [
        { name: 'Farinha de Trigo Especial', price: 4.8, deliveryDays: 1 },
        { name: 'Fermento Biológico Seco', price: 16.5, deliveryDays: 2 },
        { name: 'Açúcar Refinado', price: 3.6, deliveryDays: 2 }
      ]
    },
    {
      id: 3,
      name: 'Distribuidora Rio Frios',
      phone: '(21) 2567-8900',
      products: [
        { name: 'Manteiga sem Sal', price: 25.0, deliveryDays: 3 },
        { name: 'Fermento Biológico Seco', price: 19.0, deliveryDays: 1 }
      ]
    }
  ];

  const qtyParsed = parseFloat(orderQty) || 0;

  // Calculate recommendation
  const recommendation = (() => {
    if (qtyParsed <= 0) return null;
    const candidates: Array<{
      supplierName: string;
      phone: string;
      price: number;
      deliveryDays: number;
      totalPrice: number;
    }> = [];

    suppliers.forEach(sup => {
      const prod = sup.products.find(p => p.name === selectedProduct);
      if (prod) {
        candidates.push({
          supplierName: sup.name,
          phone: sup.phone,
          price: prod.price,
          deliveryDays: prod.deliveryDays,
          totalPrice: prod.price * qtyParsed
        });
      }
    });

    if (candidates.length === 0) return null;

    // Sort based on criteria
    if (purchaseCriteria === 'economy') {
      candidates.sort((a, b) => a.totalPrice - b.totalPrice);
    } else {
      candidates.sort((a, b) => a.deliveryDays - b.deliveryDays);
    }

    const best = candidates[0];
    let surcharge = 0;
    // Mode urgency: 15% surcharge for next-day or 1-day delivery
    if (purchaseCriteria === 'urgency' && best.deliveryDays <= 1) {
      surcharge = best.totalPrice * 0.15;
    }

    const defaultAddresses: Record<string, string> = {
      'Farinha de Trigo Especial': 'Corredor A - A1',
      'Açúcar Refinado': 'Corredor A - A2',
      'Fermento Biológico Seco': 'Corredor B - B1',
      'Manteiga sem Sal': 'Corredor B - B2',
      'Sal Refinado': 'Corredor C - C1'
    };

    return {
      ...best,
      surcharge,
      finalPrice: best.totalPrice + surcharge,
      product: selectedProduct,
      quantity: qtyParsed,
      address: defaultAddresses[selectedProduct] || 'Corredor C - C1'
    };
  })();

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recommendation) return;

    const qty = parseFloat(orderQty);
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
    const entryDateStr = today.toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setFullYear(today.getFullYear() + 1);
    const expiryDateStr = expiryDate.toISOString().split('T')[0];

    const newInventoryItem: InventoryItem = {
      id: Date.now(),
      name: selectedProduct,
      category: categories[selectedProduct] || 'Geral',
      quantity: qty,
      unit: 'kg',
      minQty: minQtys[selectedProduct] || 10,
      address: defaultAddresses[selectedProduct] || 'Corredor C - C1',
      price: recommendation.price,
      expiry: expiryDateStr,
      entryDate: entryDateStr
    };

    const updatedInventory = [...inventory, newInventoryItem];
    const modeLabel = purchaseCriteria === 'urgency' ? 'Urgente (24h)' : 'Econômica';

    const newNotification: NotificationItem = {
      id: Date.now(),
      type: 'success',
      text: `[Finanças] Compra efetuada: +${qty}kg de ${selectedProduct} (${recommendation.supplierName} - Modo: ${modeLabel}). Lote adicionado no depósito.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedNotifications = [newNotification, ...notifications];

    localStorage.setItem('@portal-stock-ai:inventory', JSON.stringify(updatedInventory));
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify(updatedNotifications));

    setInventory(updatedInventory);
    setNotifications(updatedNotifications);
    setOrderQty('');
    
    setIssuedOrder({
      ...recommendation
    });
  };

  return (
    <div className="compras-page">
      <header className="page-header">
        <div>
          <h1>Central de Compras & Integração Financeira</h1>
          <p>Cotação inteligente, ordens de compra automatizadas e análise de prazo de entrega</p>
        </div>
      </header>

      {issuedOrder && (
        <div className="order-success-card card success">
          <div className="order-header">
            <CheckCircle2 size={24} color="var(--success-color)" />
            <div>
              <h3>Ordem de Compra Emitida & Paga!</h3>
              <p>O financeiro processou a compra e o lote foi liberado para recebimento.</p>
            </div>
          </div>
          <div className="order-details-grid">
            <div className="order-detail">
              <span>FORNECEDOR:</span>
              <strong>{issuedOrder.supplierName}</strong>
            </div>
            <div className="order-detail">
              <span>PRODUTO:</span>
              <strong>{issuedOrder.product}</strong>
            </div>
            <div className="order-detail">
              <span>QUANTIDADE:</span>
              <strong>{issuedOrder.quantity} kg</strong>
            </div>
            <div className="order-detail">
              <span>VALOR PAGO:</span>
              <strong>R$ {issuedOrder.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div className="order-detail">
              <span>PRAZO DE ENTREGA:</span>
              <strong>{issuedOrder.deliveryDays === 1 ? 'Imediato (24 horas)' : `${issuedOrder.deliveryDays} dias úteis`}</strong>
            </div>
            <div className="order-detail">
              <span>ENDEREÇAMENTO (AUTO):</span>
              <strong>{issuedOrder.address}</strong>
            </div>
          </div>
          <button className="btn-close-order" onClick={() => setIssuedOrder(null)}>
            Entendido e Fechar
          </button>
        </div>
      )}

      <div className="compras-grid">
        <div className="calculator-section">
          <div className="card">
            <div className="card-title-wrapper">
              <ShoppingCart size={18} color="var(--primary-color)" />
              <h3>Simulador de Cotação e Compra Automática</h3>
            </div>
            <p className="subtitle">Escolha o insumo e defina o critério de custo/prazo para processar a ordem de compra</p>

            <form onSubmit={handlePurchaseSubmit} className="purchasing-form">
              <div className="form-group">
                <label>Insumo a Adquirir:</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                  <option value="Farinha de Trigo Especial">Farinha de Trigo Especial</option>
                  <option value="Açúcar Refinado">Açúcar Refinado</option>
                  <option value="Fermento Biológico Seco">Fermento Biológico Seco</option>
                  <option value="Manteiga sem Sal">Manteiga sem Sal</option>
                  <option value="Sal Refinado">Sal Refinado</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade do Pedido (kg):</label>
                <input 
                  type="number" 
                  placeholder="Digite a quantidade em kg" 
                  value={orderQty} 
                  onChange={e => setOrderQty(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Critério de Compra:</label>
                <div className="criteria-selector">
                  <div 
                    className={`criteria-option ${purchaseCriteria === 'economy' ? 'active' : ''}`}
                    onClick={() => setPurchaseCriteria('economy')}
                  >
                    <TrendingDown size={20} />
                    <div className="option-info">
                      <strong>Econômica (Custo Mínimo)</strong>
                      <span>Prioriza o fornecedor mais barato. Prazo padrão.</span>
                    </div>
                  </div>

                  <div 
                    className={`criteria-option ${purchaseCriteria === 'urgency' ? 'active' : ''}`}
                    onClick={() => setPurchaseCriteria('urgency')}
                  >
                    <Zap size={20} />
                    <div className="option-info">
                      <strong>Urgência (Entrega Rápida)</strong>
                      <span>Prioriza o menor prazo. Pode haver taxa de urgência (+15%).</span>
                    </div>
                  </div>
                </div>
              </div>

              {recommendation && (
                <div className="recommendation-results">
                  <h4>Recomendação Inteligente Stock AI:</h4>
                  <div className="results-box">
                    <div className="result-row">
                      <span>Fornecedor Recomendado:</span>
                      <strong>{recommendation.supplierName} ({recommendation.phone})</strong>
                    </div>
                    <div className="result-row">
                      <span>Prazo de Entrega:</span>
                      <strong className={recommendation.deliveryDays <= 1 ? 'highlight-green' : ''}>
                        <Truck size={14} style={{ marginRight: '4px' }} />
                        {recommendation.deliveryDays === 1 ? 'Urgente (24 horas)' : `${recommendation.deliveryDays} dias`}
                      </strong>
                    </div>
                    <div className="result-row">
                      <span>Preço do Insumo:</span>
                      <strong>R$ {recommendation.price.toFixed(2)}/kg</strong>
                    </div>
                    {recommendation.surcharge > 0 && (
                      <div className="result-row surcharge">
                        <span>Taxa de Entrega Rápida (15%):</span>
                        <strong>+ R$ {recommendation.surcharge.toFixed(2)}</strong>
                      </div>
                    )}
                    <div className="divider"></div>
                    <div className="result-row total">
                      <span>Custo Total do Pedido:</span>
                      <strong>R$ {recommendation.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-submit-purchase" disabled={!recommendation}>
                Autorizar Ordem e Lançar no Financeiro
              </button>
            </form>
          </div>
        </div>

        <div className="suppliers-section">
          <div className="card">
            <div className="card-title-wrapper">
              <Users size={18} color="var(--primary-color)" />
              <h3>Fornecedores Homologados</h3>
            </div>
            <p className="subtitle">Tabela de preços e prazos de entrega cadastrados no sistema</p>

            <div className="suppliers-list">
              {suppliers.map(sup => (
                <div key={sup.id} className="supplier-card-item">
                  <div className="sup-header">
                    <h4>{sup.name}</h4>
                    <span>{sup.phone}</span>
                  </div>
                  <div className="products-table-wrapper">
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Ingrediente</th>
                          <th>Custo/kg</th>
                          <th>Prazo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sup.products.map(prod => (
                          <tr key={prod.name}>
                            <td>{prod.name}</td>
                            <td><strong>R$ {prod.price.toFixed(2)}</strong></td>
                            <td>
                              <span className={`delivery-tag ${prod.deliveryDays <= 1 ? 'fast' : ''}`}>
                                {prod.deliveryDays} {prod.deliveryDays === 1 ? 'dia' : 'dias'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compras;
