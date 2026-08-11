import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Zap, 
  Award, 
  Navigation, 
  ShoppingCart, 
  CheckCircle2
} from 'lucide-react';

interface SupplierProduct {
  name: string;
  pricePerKg: number;
  minOrderKg: number;
}

interface Supplier {
  id: number;
  name: string;
  region: string;
  city: string;
  neighborhood: string;
  distanceKm: number;
  leadTimeHours: number;
  freightBasePrice: number;
  rating: number;
  phone: string;
  badge?: string;
  coords: { x: number; y: number }; // Relative map coordinates (%)
  products: SupplierProduct[];
}

interface NotificationItem {
  id: number;
  type: 'warning' | 'info' | 'success' | 'danger';
  text: string;
  time: string;
}

const SUPPLIERS_DATA: Supplier[] = [
  {
    id: 1,
    name: 'Distribuidora Guanabara Leste',
    region: 'Jardim Catarina',
    city: 'São Gonçalo',
    neighborhood: 'Jardim Catarina (Setor Norte)',
    distanceKm: 2.1,
    leadTimeHours: 1.5,
    freightBasePrice: 35.0,
    rating: 4.9,
    phone: '(21) 2601-9988',
    badge: 'Mais Próximo',
    coords: { x: 38, y: 36 },
    products: [
      { name: 'Farinha de Trigo Especial', pricePerKg: 4.45, minOrderKg: 50 },
      { name: 'Açúcar Refinado', pricePerKg: 3.25, minOrderKg: 50 },
      { name: 'Sal Refinado', pricePerKg: 1.85, minOrderKg: 25 },
      { name: 'Manteiga sem Sal', pricePerKg: 24.50, minOrderKg: 10 },
      { name: 'Fermento Biológico Seco', pricePerKg: 17.20, minOrderKg: 5 }
    ]
  },
  {
    id: 2,
    name: 'Moinho Niterói & São Gonçalo',
    region: 'Alcântara',
    city: 'São Gonçalo',
    neighborhood: 'Alcântara Centro',
    distanceKm: 4.8,
    leadTimeHours: 3.0,
    freightBasePrice: 45.0,
    rating: 4.8,
    phone: '(21) 2712-4400',
    badge: 'Líder em Farinhas',
    coords: { x: 62, y: 48 },
    products: [
      { name: 'Farinha de Trigo Especial', pricePerKg: 4.10, minOrderKg: 200 },
      { name: 'Açúcar Refinado', pricePerKg: 3.10, minOrderKg: 100 },
      { name: 'Fermento Biológico Seco', pricePerKg: 16.80, minOrderKg: 20 }
    ]
  },
  {
    id: 3,
    name: 'Supremo Insumos Fluminense',
    region: 'Porto da Pedra',
    city: 'São Gonçalo',
    neighborhood: 'Porto da Pedra',
    distanceKm: 7.5,
    leadTimeHours: 4.0,
    freightBasePrice: 60.0,
    rating: 4.7,
    phone: '(21) 3605-1122',
    badge: 'Entrega Rápida BR-101',
    coords: { x: 30, y: 65 },
    products: [
      { name: 'Farinha de Trigo Especial', pricePerKg: 4.25, minOrderKg: 100 },
      { name: 'Manteiga sem Sal', pricePerKg: 23.90, minOrderKg: 20 },
      { name: 'Fermento Biológico Seco', pricePerKg: 16.20, minOrderKg: 10 },
      { name: 'Açúcar Refinado', pricePerKg: 3.30, minOrderKg: 50 }
    ]
  },
  {
    id: 4,
    name: 'Laticínios Guapimirim & Região',
    region: 'Guapimirim / Baixada',
    city: 'Guapimirim',
    neighborhood: 'Centro Logístico',
    distanceKm: 32.0,
    leadTimeHours: 24.0,
    freightBasePrice: 120.0,
    rating: 4.6,
    phone: '(21) 2632-7711',
    badge: 'Melhor Preço Manteiga',
    coords: { x: 78, y: 18 },
    products: [
      { name: 'Manteiga sem Sal', pricePerKg: 22.80, minOrderKg: 50 },
      { name: 'Fermento Biológico Seco', pricePerKg: 15.90, minOrderKg: 30 }
    ]
  },
  {
    id: 5,
    name: 'Atacadão das Farinhas RJ',
    region: 'Caju / Niterói',
    city: 'Rio de Janeiro',
    neighborhood: 'Ponte Rio-Niterói / Caju',
    distanceKm: 28.5,
    leadTimeHours: 48.0,
    freightBasePrice: 150.0,
    rating: 4.5,
    phone: '(21) 2210-9090',
    badge: 'Preço Imbatível em Lote',
    coords: { x: 15, y: 82 },
    products: [
      { name: 'Farinha de Trigo Especial', pricePerKg: 3.85, minOrderKg: 500 },
      { name: 'Açúcar Refinado', pricePerKg: 2.95, minOrderKg: 300 },
      { name: 'Sal Refinado', pricePerKg: 1.60, minOrderKg: 200 }
    ]
  }
];

const AVAILABLE_PRODUCTS = [
  'Farinha de Trigo Especial',
  'Açúcar Refinado',
  'Manteiga sem Sal',
  'Fermento Biológico Seco',
  'Sal Refinado'
];

// Central Factory location relative coords
const FACTORY_COORDS = { x: 48, y: 40 };

const RotasFornecedores: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('Farinha de Trigo Especial');
  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [priorityFilter, setPriorityFilter] = useState<'speed' | 'cost' | 'ai'>('ai');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Filter suppliers that sell the selected product
  const availableSuppliers = SUPPLIERS_DATA.filter(s => 
    s.products.some(p => p.name === selectedProduct)
  );

  // Calculate costs and speeds for each supplier for the selected product and quantity
  const calculatedSuppliers = availableSuppliers.map(supplier => {
    const prod = supplier.products.find(p => p.name === selectedProduct)!;
    const itemCost = prod.pricePerKg * orderQuantity;
    const freight = supplier.freightBasePrice + (supplier.distanceKm * 0.8);
    const totalCost = itemCost + freight;
    const costPerKgEffective = totalCost / orderQuantity;

    return {
      ...supplier,
      productDetail: prod,
      itemCost,
      freight,
      totalCost,
      costPerKgEffective
    };
  });

  // Sort suppliers based on priority
  const sortedSuppliers = [...calculatedSuppliers].sort((a, b) => {
    if (priorityFilter === 'speed') {
      return a.leadTimeHours - b.leadTimeHours;
    } else if (priorityFilter === 'cost') {
      return a.totalCost - b.totalCost;
    } else {
      // AI score algorithm combining 60% cost and 40% speed
      const minCost = Math.min(...calculatedSuppliers.map(s => s.totalCost));
      const minSpeed = Math.min(...calculatedSuppliers.map(s => s.leadTimeHours));
      
      const scoreA = (minCost / a.totalCost) * 0.6 + (minSpeed / a.leadTimeHours) * 0.4;
      const scoreB = (minCost / b.totalCost) * 0.6 + (minSpeed / b.leadTimeHours) * 0.4;
      return scoreB - scoreA;
    }
  });

  const bestSupplier = sortedSuppliers[0];
  const activeSupplier = calculatedSuppliers.find(s => s.id === selectedSupplierId) || bestSupplier;

  useEffect(() => {
    if (bestSupplier) {
      setSelectedSupplierId(bestSupplier.id);
    }
  }, [selectedProduct, priorityFilter]);

  const handleCreateOrder = (supplier: typeof activeSupplier) => {
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      const msg = `Pedido de ${orderQuantity}kg de ${selectedProduct} enviado com sucesso para ${supplier.name}! Previsão de entrega: ${supplier.leadTimeHours}h.`;
      setOrderSuccessMsg(msg);

      // Save notification to localStorage
      const localNotif = localStorage.getItem('@portal-stock-ai:notifications');
      const notifications: NotificationItem[] = localNotif ? JSON.parse(localNotif) : [];
      const newNotif: NotificationItem = {
        id: Date.now(),
        type: 'success',
        text: `[Logística & Fornecedores] ${msg}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify([newNotif, ...notifications]));

      setTimeout(() => setOrderSuccessMsg(null), 7000);
    }, 800);
  };

  return (
    <div className="rotas-fornecedores-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header Banner */}
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', padding: '0.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center' }}>
              <Truck size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Rotas Logísticas & Fornecedores</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Inteligência geográfica e comparador de fornecedores regionais • Jardim Catarina, São Gonçalo - RJ
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge-location-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.5rem 0.85rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.8rem', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
            <MapPin size={14} />
            <span>Fábrica Três Irmãos • Jardim Catarina - SG</span>
          </div>
        </div>
      </header>

      {/* Alert banner if order issued */}
      {orderSuccessMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-sm)' }}>
          <CheckCircle2 size={20} color="#10b981" />
          <strong style={{ fontSize: '0.9rem' }}>{orderSuccessMsg}</strong>
        </div>
      )}

      {/* Control Panel: Product Selection & Filters */}
      <div className="card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
          
          {/* Select Product */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Insumo Desejado:
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              {AVAILABLE_PRODUCTS.map(prod => (
                <option key={prod} value={prod}>{prod}</option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quantidade Necessária (kg):
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Math.max(1, parseFloat(e.target.value) || 0))}
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-color)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}
            />
          </div>

          {/* Filter Priority */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Prioridade da Rota Logística:
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-color)', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setPriorityFilter('ai')}
                style={{ flex: 1, padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 700, background: priorityFilter === 'ai' ? 'var(--primary-color)' : 'transparent', color: priorityFilter === 'ai' ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                🤖 Recomendado IA
              </button>
              <button
                onClick={() => setPriorityFilter('speed')}
                style={{ flex: 1, padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 700, background: priorityFilter === 'speed' ? '#2563eb' : 'transparent', color: priorityFilter === 'speed' ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                ⚡ Mais Rápido
              </button>
              <button
                onClick={() => setPriorityFilter('cost')}
                style={{ flex: 1, padding: '0.5rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.775rem', fontWeight: 700, background: priorityFilter === 'cost' ? '#10b981' : 'transparent', color: priorityFilter === 'cost' ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}
              >
                💰 Mais Barato
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: AI Recommendation + Interactive Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: AI Recommendation Card */}
        {bestSupplier && (
          <div className="card" style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', color: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ background: priorityFilter === 'speed' ? '#2563eb' : priorityFilter === 'cost' ? '#10b981' : 'linear-gradient(135deg, #ea580c, #d97706)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.35rem 0.75rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  {priorityFilter === 'speed' && <Zap size={13} />}
                  {priorityFilter === 'cost' && <DollarSign size={13} />}
                  {priorityFilter === 'ai' && <Award size={13} />}
                  {priorityFilter === 'speed' ? 'MELHOR OPÇÃO EM TEMPO DE ENTREGA' : priorityFilter === 'cost' ? 'MELHOR OPÇÃO EM CUSTO BENEFÍCIO' : 'RECOMENDAÇÃO INTELIGENTE DE LOGÍSTICA'}
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>São Gonçalo - RJ</span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>{bestSupplier.name}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                📍 {bestSupplier.neighborhood} ({bestSupplier.distanceKm} km de Jardim Catarina)
              </p>

              {/* Key Metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
                
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Tempo de Entrega</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={16} />
                    <span>{bestSupplier.leadTimeHours < 24 ? `${bestSupplier.leadTimeHours}h` : `${bestSupplier.leadTimeHours / 24} dia(s)`}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Trânsito BR-101 livre</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Custo Total Estimado</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>R$ {bestSupplier.totalCost.toFixed(2)}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Insumo + Frete incluso</span>
                </div>

              </div>

              {/* Breakdown detail */}
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Preço do Insumo ({orderQuantity}kg):</span>
                  <span style={{ fontWeight: 700 }}>R$ {bestSupplier.itemCost.toFixed(2)} (R$ {bestSupplier.productDetail.pricePerKg.toFixed(2)}/kg)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Frete de Jardim Catarina:</span>
                  <span style={{ fontWeight: 700 }}>R$ {bestSupplier.freight.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>Custo Efetivo Final por kg:</span>
                  <span style={{ color: '#fb923c', fontWeight: 800 }}>R$ {bestSupplier.costPerKgEffective.toFixed(2)} / kg</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCreateOrder(bestSupplier)}
              disabled={isOrdering}
              style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)', transition: 'all 0.2s' }}
            >
              <ShoppingCart size={18} />
              <span>{isOrdering ? 'Enviando Pedido...' : `Emitir Pedido de ${orderQuantity}kg`}</span>
            </button>
          </div>
        )}

        {/* Right Column: Interactive Regional Logistics Map (Jardim Catarina - SG) */}
        <div className="card" style={{ background: '#090d16', color: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={18} color="#ea580c" />
                <span>Mapa de Rotas Logísticas (São Gonçalo - RJ)</span>
              </h3>
              <p style={{ fontSize: '0.775rem', color: '#94a3b8' }}>Visualização de rotas com base na Fábrica Três Irmãos em Jardim Catarina</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ea580c' }}></span> Fábrica
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', marginLeft: '0.5rem' }}></span> Fornecedor Selecionado
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div style={{ width: '100%', height: '360px', background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.1)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Map Grid / Highways overlay simulation */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                </pattern>
                {/* Glow filter for route line */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Highway BR-101 simulation line */}
              <path d="M 10 320 Q 200 240 400 150 T 700 30" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="6" strokeDasharray="8 4" />
              <text x="180" y="240" fill="rgba(255, 255, 255, 0.2)" fontSize="10" fontWeight="700">RODOVIA BR-101 (NITERÓI - MANILHA)</text>
              <text x="360" y="110" fill="rgba(255, 255, 255, 0.2)" fontSize="10" fontWeight="700">RJ-104 (ALCÂNTARA)</text>

              {/* Draw animated route line from active supplier to Factory */}
              {activeSupplier && (
                <>
                  <line
                    x1={`${activeSupplier.coords.x}%`}
                    y1={`${activeSupplier.coords.y}%`}
                    x2={`${FACTORY_COORDS.x}%`}
                    y2={`${FACTORY_COORDS.y}%`}
                    stroke="#ea580c"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    filter="url(#glow)"
                  >
                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
                  </line>

                  {/* Distance pill on line middle */}
                  <g transform={`translate(${((activeSupplier.coords.x + FACTORY_COORDS.x) / 2) * 4}, ${((activeSupplier.coords.y + FACTORY_COORDS.y) / 2) * 3.6})`}>
                    <rect x="-35" y="-12" width="70" height="20" rx="10" fill="#0f172a" stroke="#ea580c" strokeWidth="1" />
                    <text x="0" y="2" fill="#fff" fontSize="9" fontWeight="800" textAnchor="middle">{activeSupplier.distanceKm} km</text>
                  </g>
                </>
              )}

            </svg>

            {/* Central Factory Pin (Jardim Catarina) */}
            <div
              style={{
                position: 'absolute',
                left: `${FACTORY_COORDS.x}%`,
                top: `${FACTORY_COORDS.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                cursor: 'pointer'
              }}
              title="Fábrica Três Irmãos • Jardim Catarina, São Gonçalo - RJ"
            >
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(234, 88, 12, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ea580c', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <MapPin size={12} />
                  </div>
                </div>
                <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px', marginTop: '2px', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  FÁBRICA TRÊS IRMÃOS (Jardim Catarina)
                </span>
              </div>
            </div>

            {/* Render Pins for each Supplier */}
            {calculatedSuppliers.map(sup => {
              const isSelected = sup.id === activeSupplier?.id;
              const isBest = sup.id === bestSupplier?.id;

              return (
                <div
                  key={sup.id}
                  onClick={() => setSelectedSupplierId(sup.id)}
                  style={{
                    position: 'absolute',
                    left: `${sup.coords.x}%`,
                    top: `${sup.coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: isSelected ? 9 : 5,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  title={`${sup.name} (${sup.distanceKm}km)`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: isSelected ? '34px' : '26px',
                      height: isSelected ? '34px' : '26px',
                      borderRadius: '50%',
                      background: isSelected ? '#38bdf8' : isBest ? '#10b981' : '#334155',
                      border: isSelected ? '3px solid #fff' : '2px solid #64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.6)' : 'none',
                      transition: 'all 0.2s'
                    }}>
                      <Truck size={isSelected ? 16 : 12} />
                    </div>

                    <span style={{
                      background: isSelected ? '#0284c7' : '#1e293b',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.35rem',
                      borderRadius: '4px',
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      opacity: isSelected ? 1 : 0.85
                    }}>
                      {sup.name.split(' ')[0]} ({sup.distanceKm}km)
                    </span>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Active Supplier info footer inside Map card */}
          {activeSupplier && (
            <div style={{ marginTop: '1rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Fornecedor no Mapa: {activeSupplier.name}</strong>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  📍 {activeSupplier.city} - {activeSupplier.neighborhood} • Telefone: {activeSupplier.phone}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                  Lead Time: {activeSupplier.leadTimeHours}h | Distância: {activeSupplier.distanceKm}km
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Comparison Table Section */}
      <div className="card" style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-xl)', padding: '1.75rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Comparativo de Fornecedores Homologados
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Cotação para {orderQuantity}kg de <strong>{selectedProduct}</strong> com frete para Jardim Catarina
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            Total de {sortedSuppliers.length} fornecedores encontrados
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Fornecedor</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Localização (SG/RJ)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Preço Insumo (/kg)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Frete Estimado</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Tempo de Entrega</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Custo Total ({orderQuantity}kg)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'center' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {sortedSuppliers.map((supplier) => {
                const isBest = supplier.id === bestSupplier?.id;
                const isSelected = supplier.id === activeSupplier?.id;

                return (
                  <tr 
                    key={supplier.id}
                    onClick={() => setSelectedSupplierId(supplier.id)}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{supplier.name}</span>
                        {isBest && (
                          <span style={{ background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                            MELHOR ESCOLHA
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⭐ {supplier.rating} | {supplier.badge || 'Homologado'}</span>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      <strong>{supplier.neighborhood}</strong>
                      <div style={{ fontSize: '0.75rem' }}>{supplier.distanceKm} km de distância</div>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      R$ {supplier.productDetail.pricePerKg.toFixed(2)}
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      R$ {supplier.freight.toFixed(2)}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: supplier.leadTimeHours <= 3 ? '#16a34a' : supplier.leadTimeHours <= 12 ? '#d97706' : '#dc2626',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Clock size={13} />
                        {supplier.leadTimeHours < 24 ? `${supplier.leadTimeHours} hora(s)` : `${supplier.leadTimeHours / 24} dia(s)`}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-color)' }}>
                      R$ {supplier.totalCost.toFixed(2)}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        (R$ {supplier.costPerKgEffective.toFixed(2)}/kg final)
                      </div>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateOrder(supplier);
                        }}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: isBest ? 'var(--primary-color)' : 'var(--bg-color)',
                          color: isBest ? '#fff' : 'var(--text-main)',
                          border: isBest ? 'none' : '1px solid var(--border-color)',
                          fontWeight: 700,
                          fontSize: '0.775rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <ShoppingCart size={13} />
                        <span>Pedir</span>
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
  );
};

export default RotasFornecedores;
