import React, { useState, useEffect } from 'react';
import { Layers, MapPin, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

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

interface SectorDetail {
  sector: string;
  desc: string;
  items: InventoryItem[];
}

const Deposito: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('Corredor A - A1');

  useEffect(() => {
    const localInv = localStorage.getItem('@portal-stock-ai:inventory');
    if (localInv) {
      setInventory(JSON.parse(localInv));
    }
  }, []);

  const sectors: Record<string, Omit<SectorDetail, 'items'>> = {
    'Corredor A - A1': {
      sector: 'Setor A - Farinhas',
      desc: 'Depósito principal de sacos de farinha. Temperatura controlada para umidade.'
    },
    'Corredor A - A2': {
      sector: 'Setor A - Açúcares',
      desc: 'Estoque de açúcares refinados e cristalizados. Protegido contra umidade.'
    },
    'Corredor B - B1': {
      sector: 'Setor B - Fermentos',
      desc: 'Prateleiras dedicadas a insumos químicos e fermento seco biológico.'
    },
    'Corredor B - B2': {
      sector: 'Setor B - Gorduras',
      desc: 'Câmara fria e prateleiras para laticínios, margarinas e manteigas.'
    },
    'Corredor C - C1': {
      sector: 'Setor C - Condimentos',
      desc: 'Prateleiras gerais de condimentos, sal e aromatizantes.'
    }
  };

  // Group items by address
  const sectorData: Record<string, SectorDetail> = {};
  Object.keys(sectors).forEach(addr => {
    sectorData[addr] = {
      ...sectors[addr],
      items: []
    };
  });

  inventory.forEach(item => {
    if (sectorData[item.address]) {
      sectorData[item.address].items.push(item);
    }
  });

  const activeSector = sectorData[selectedAddress] || { sector: '', desc: '', items: [] };

  return (
    <div className="deposito-page">
      <header className="page-header">
        <div>
          <h1>Layout do Depósito & Endereçamento</h1>
          <p>Mapeamento visual e planta baixa técnica do armazém - Jardim Catarina (SG)</p>
        </div>
      </header>

      <div className="deposito-layout-container">
        <div className="map-card card">
          <div className="card-header-with-icon">
            <Layers size={18} color="var(--primary-color)" />
            <h3>Planta Baixa Técnica do Depósito (Fidelidade Real)</h3>
          </div>
          <p className="subtitle">Selecione uma prateleira ou corredor na planta técnica para verificar o estoque alocado</p>
          
          <div className="svg-map-wrapper">
            <svg viewBox="0 0 600 360" width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="600" height="360" fill="url(#grid)" />
              <rect x="15" y="15" width="570" height="330" rx="8" fill="none" stroke="#94a3b8" strokeWidth="4" />
              <rect x="15" y="15" width="570" height="330" rx="8" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              
              <g transform="translate(550, 310)">
                <circle cx="0" cy="0" r="15" fill="white" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M 0 -12 L 3 0 L -3 0 Z" fill="var(--primary-color)" />
                <path d="M 0 12 L 3 0 L -3 0 Z" fill="#64748b" />
                <text x="0" y="-15" textAnchor="middle" fontSize="8" fontWeight="800" fill="#64748b">N</text>
              </g>
              
              <rect x="15" y="130" width="8" height="60" fill="#10b981" />
              <text x="30" y="165" fontSize="8" fontWeight="800" fill="#047857" transform="rotate(-90 30 165)">DOCA RECEBIMENTO (D1)</text>
              
              <rect x="577" y="130" width="8" height="60" fill="#3b82f6" />
              <text x="560" y="165" fontSize="8" fontWeight="800" fill="#1d4ed8" transform="rotate(90 560 165)">DOCA EXPEDIÇÃO (D2)</text>
              
              {/* Rack A1 */}
              <g className={`map-interactive-block ${selectedAddress === 'Corredor A - A1' ? 'active' : ''}`} onClick={() => setSelectedAddress('Corredor A - A1')}>
                <rect x="100" y="50" width="130" height="40" rx="4" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
                <line x1="132" y1="50" x2="132" y2="90" stroke="#bfdbfe" strokeWidth="1.5" />
                <line x1="164" y1="50" x2="164" y2="90" stroke="#bfdbfe" strokeWidth="1.5" />
                <line x1="196" y1="50" x2="196" y2="90" stroke="#bfdbfe" strokeWidth="1.5" />
                <circle cx="116" cy="70" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="148" cy="70" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="180" cy="70" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="212" cy="70" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <text x="165" y="74" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1e3a8a">RACK A1 (FARINHA)</text>
              </g>
              
              {/* Rack A2 */}
              <g className={`map-interactive-block ${selectedAddress === 'Corredor A - A2' ? 'active' : ''}`} onClick={() => setSelectedAddress('Corredor A - A2')}>
                <rect x="100" y="110" width="130" height="40" rx="4" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
                <line x1="132" y1="110" x2="132" y2="150" stroke="#bfdbfe" strokeWidth="1.5" />
                <line x1="164" y1="110" x2="164" y2="150" stroke="#bfdbfe" strokeWidth="1.5" />
                <line x1="196" y1="110" x2="196" y2="150" stroke="#bfdbfe" strokeWidth="1.5" />
                <circle cx="116" cy="130" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="148" cy="130" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="180" cy="130" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <circle cx="212" cy="130" r="8" fill="#3b82f6" fillOpacity="0.2" />
                <text x="165" y="134" textAnchor="middle" fontSize="9" fontWeight="800" fill="#1e3a8a">RACK A2 (AÇÚCAR)</text>
              </g>
              
              {/* Rack B1 */}
              <g className={`map-interactive-block ${selectedAddress === 'Corredor B - B1' ? 'active' : ''}`} onClick={() => setSelectedAddress('Corredor B - B1')}>
                <rect x="100" y="210" width="130" height="40" rx="4" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" />
                <line x1="132" y1="210" x2="132" y2="250" stroke="#ffedd5" strokeWidth="1.5" />
                <line x1="164" y1="210" x2="164" y2="250" stroke="#ffedd5" strokeWidth="1.5" />
                <line x1="196" y1="210" x2="196" y2="250" stroke="#ffedd5" strokeWidth="1.5" />
                <circle cx="116" cy="230" r="8" fill="#f97316" fillOpacity="0.2" />
                <circle cx="148" cy="230" r="8" fill="#f97316" fillOpacity="0.2" />
                <circle cx="180" cy="230" r="8" fill="#f97316" fillOpacity="0.2" />
                <circle cx="212" cy="230" r="8" fill="#f97316" fillOpacity="0.2" />
                <text x="165" y="234" textAnchor="middle" fontSize="9" fontWeight="800" fill="#7c2d12">RACK B1 (FERMENTO)</text>
              </g>
              
              {/* Rack B2 */}
              <g className={`map-interactive-block ${selectedAddress === 'Corredor B - B2' ? 'active' : ''}`} onClick={() => setSelectedAddress('Corredor B - B2')}>
                <rect x="100" y="270" width="130" height="40" rx="4" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" />
                <line x1="132" y1="270" x2="132" y2="310" stroke="#ffedd5" strokeWidth="1.5" />
                <line x1="164" y1="270" x2="164" y2="310" stroke="#ffedd5" strokeWidth="1.5" />
                <line x1="196" y1="270" x2="196" y2="310" stroke="#ffedd5" strokeWidth="1.5" />
                <circle cx="116" cy="290" r="8" fill="#f97316" fillOpacity="0.2" />
                <circle cx="148" cy="290" r="8" fill="#f97316" fillOpacity="0.2" />
                <circle cx="180" cy="290" r="8" fill="#f97316" fillOpacity="0.2" />
                <circle cx="212" cy="290" r="8" fill="#f97316" fillOpacity="0.2" />
                <text x="165" y="294" textAnchor="middle" fontSize="9" fontWeight="800" fill="#7c2d12">RACK B2 (MANTEIGA)</text>
              </g>
              
              {/* Rack C1 */}
              <g className={`map-interactive-block ${selectedAddress === 'Corredor C - C1' ? 'active' : ''}`} onClick={() => setSelectedAddress('Corredor C - C1')}>
                <rect x="290" y="110" width="100" height="140" rx="4" fill="#faf5ff" stroke="#a855f7" strokeWidth="1.5" />
                <line x1="290" y1="145" x2="390" y2="145" stroke="#f3e8ff" strokeWidth="1.5" />
                <line x1="290" y1="180" x2="390" y2="180" stroke="#f3e8ff" strokeWidth="1.5" />
                <line x1="290" y1="215" x2="390" y2="215" stroke="#f3e8ff" strokeWidth="1.5" />
                <circle cx="340" cy="128" r="8" fill="#a855f7" fillOpacity="0.2" />
                <circle cx="340" cy="163" r="8" fill="#a855f7" fillOpacity="0.2" />
                <circle cx="340" cy="198" r="8" fill="#a855f7" fillOpacity="0.2" />
                <circle cx="340" cy="233" r="8" fill="#a855f7" fillOpacity="0.2" />
                <text x="340" y="184" textAnchor="middle" fontSize="9" fontWeight="800" fill="#581c87" transform="rotate(-90 340 184)">RACK C1 (CONDIMENTOS)</text>
              </g>
              
              {/* CQ Lab and Administration */}
              <g className="map-office-block">
                <rect x="420" y="50" width="140" height="220" rx="4" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="420" y1="130" x2="560" y2="130" stroke="#dcfce7" strokeDasharray="3 3" />
                <text x="490" y="90" textAnchor="middle" fontSize="10" fontWeight="800" fill="#14532d">LABORATÓRIO CQ</text>
                <text x="490" y="105" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">Inspeção Sanitária</text>
                <text x="490" y="185" textAnchor="middle" fontSize="10" fontWeight="800" fill="#14532d">ADMINISTRAÇÃO</text>
                <text x="490" y="200" textAnchor="middle" fontSize="8" fontWeight="600" fill="#166534">Portal Stock AI</text>
              </g>
              
              {/* Corridors */}
              <g className="transit-corridors" opacity="0.3" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" fill="none">
                <path d="M 60 70 L 60 290 L 95 290" />
                <path d="M 235 70 L 270 70 L 270 290 L 235 290" />
                <path d="M 400 180 L 415 180" />
              </g>
              
              <line x1="300" y1="342" x2="320" y2="342" stroke="#ef4444" strokeWidth="3" />
              <text x="310" y="335" textAnchor="middle" fontSize="6" fontWeight="800" fill="#b91c1c">SAÍDA DE EMERGÊNCIA</text>
            </svg>
          </div>

          <div className="map-legend">
            <span className="legend-item">
              <span className="box a"></span> Setor A (Farinhas/Açúcares)
            </span>
            <span className="legend-item">
              <span className="box b"></span> Setor B (Fermentos/Gorduras)
            </span>
            <span className="legend-item">
              <span className="box c"></span> Setor C (Condimentos)
            </span>
            <span className="legend-item">
              <span className="box cq"></span> Qualidade & Escritório
            </span>
          </div>
        </div>

        <div className="details-card card">
          <div className="details-header">
            <MapPin size={22} color="var(--primary-color)" />
            <div>
              <h3>Endereço Selecionado</h3>
              <h2>{selectedAddress}</h2>
            </div>
          </div>

          <div className="sector-info">
            <span className="badge warning">{activeSector.sector}</span>
            <p>{activeSector.desc}</p>
          </div>

          <div className="address-items-section">
            <h4>Insumos Armazenados Neste Local</h4>
            {activeSector.items.length === 0 ? (
              <div className="empty-address-msg">
                <Info size={16} />
                <span>Nenhum ingrediente alocado neste endereço no momento.</span>
              </div>
            ) : (
              <div className="address-items-list">
                {activeSector.items.map(item => {
                  const isLow = item.quantity < item.minQty;
                  return (
                    <div key={item.id} className={`address-item-row ${isLow ? 'low-stock' : ''}`}>
                      <div className="item-icon-circle">
                        <Layers size={16} />
                      </div>
                      <div className="item-main-details">
                        <strong>{item.name}</strong>
                        <span>Categoria: {item.category}</span>
                      </div>
                      <div className="item-quantities">
                        <span className="qty">{item.quantity.toFixed(1)} {item.unit}</span>
                        {isLow ? (
                          <span className="alert-text">
                            <AlertTriangle size={12} />
                            Estoque Baixo
                          </span>
                        ) : (
                          <span className="ok-text">
                            <CheckCircle2 size={12} />
                            Normal
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="address-quick-action">
            <a href="/inventario" className="details-btn">
              Acessar Inventário para Lançamento
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposito;
