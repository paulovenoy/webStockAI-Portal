import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Cause {
  id: number;
  text: string;
}

interface IshikawaDiagram {
  id: string;
  problem: string;
  metodo: Cause[];
  maquina: Cause[];
  medida: Cause[];
  meioAmbiente: Cause[];
  maoDeObra: Cause[];
  material: Cause[];
}

const Ishikawa: React.FC = () => {
  const navigate = useNavigate();
  const [diagrams, setDiagrams] = useState<IshikawaDiagram[]>([]);
  const [selectedDiagramId, setSelectedDiagramId] = useState<string>('default-1');
  const [newCauseText, setNewCauseText] = useState('');
  const [newCauseCategory, setNewCauseCategory] = useState<'metodo' | 'maquina' | 'medida' | 'meioAmbiente' | 'maoDeObra' | 'material'>('metodo');
  const [customProblemText, setCustomProblemText] = useState('');

  const defaultDiagrams: IshikawaDiagram[] = [
    {
      id: 'default-1',
      problem: 'Desperdício de Farinha no Corredor A1',
      metodo: [
        { id: 1, text: 'Rasgar sacos no transporte manual' },
        { id: 2, text: 'Uso de ferramentas inadequadas para abertura' }
      ],
      maquina: [
        { id: 3, text: 'Empilhadeira com garfo danificado' },
        { id: 4, text: 'Prateleiras de metal com arestas cortantes' }
      ],
      medida: [
        { id: 5, text: 'Balança de pesagem descalibrada' },
        { id: 6, text: 'Falta de auditoria de balança semanal' }
      ],
      meioAmbiente: [
        { id: 7, text: 'Alta umidade no ar do Corredor A1' },
        { id: 8, text: 'Infiltração de água no teto do depósito' }
      ],
      maoDeObra: [
        { id: 9, text: 'Operadores sem treinamento FEFO' },
        { id: 10, text: 'Falta de cuidado na paletização' }
      ],
      material: [
        { id: 11, text: 'Embalagem de papel muito fina do fornecedor' },
        { id: 12, text: 'Sacos úmidos vindos do caminhão' }
      ]
    },
    {
      id: 'default-2',
      problem: 'Vencimento de Lotes de Manteiga no Rack B2',
      metodo: [
        { id: 13, text: 'Falta de conferência da planilha de validade' },
        { id: 14, text: 'Não aplicação da regra FEFO no picking' }
      ],
      maquina: [
        { id: 15, text: 'Painel da câmara fria desregulado' }
      ],
      medida: [
        { id: 16, text: 'Ausência de alertas automáticos antes de 5 dias' }
      ],
      meioAmbiente: [
        { id: 17, text: 'Flutuação de temperatura na câmara fria B2' }
      ],
      maoDeObra: [
        { id: 18, text: 'Operadores priorizando lotes mais fáceis de alcançar' }
      ],
      material: [
        { id: 19, text: 'Lotes entregues pelo fornecedor com prazo curto' }
      ]
    }
  ];

  useEffect(() => {
    const localData = localStorage.getItem('@portal-stock-ai:ishikawa');
    if (localData) {
      setDiagrams(JSON.parse(localData));
    } else {
      localStorage.setItem('@portal-stock-ai:ishikawa', JSON.stringify(defaultDiagrams));
      setDiagrams(defaultDiagrams);
    }
  }, []);

  const activeDiagram = diagrams.find(d => d.id === selectedDiagramId) || defaultDiagrams[0];

  const handleAddCause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCauseText.trim()) return;

    const newCause: Cause = {
      id: Date.now(),
      text: newCauseText.trim()
    };

    const updated = diagrams.map(d => {
      if (d.id === selectedDiagramId) {
        return {
          ...d,
          [newCauseCategory]: [...d[newCauseCategory], newCause]
        };
      }
      return d;
    });

    localStorage.setItem('@portal-stock-ai:ishikawa', JSON.stringify(updated));
    setDiagrams(updated);
    setNewCauseText('');
  };

  const handleRemoveCause = (category: string, causeId: number) => {
    const updated = diagrams.map(d => {
      if (d.id === selectedDiagramId) {
        const cat = category as keyof IshikawaDiagram;
        return {
          ...d,
          [cat]: (d[cat] as Cause[]).filter(c => c.id !== causeId)
        };
      }
      return d;
    });

    localStorage.setItem('@portal-stock-ai:ishikawa', JSON.stringify(updated));
    setDiagrams(updated);
  };

  const handleCreateDiagram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProblemText.trim()) return;

    const newDiag: IshikawaDiagram = {
      id: `diag-${Date.now()}`,
      problem: customProblemText.trim(),
      metodo: [],
      maquina: [],
      medida: [],
      meioAmbiente: [],
      maoDeObra: [],
      material: []
    };

    const updated = [newDiag, ...diagrams];
    localStorage.setItem('@portal-stock-ai:ishikawa', JSON.stringify(updated));
    setDiagrams(updated);
    setSelectedDiagramId(newDiag.id);
    setCustomProblemText('');
  };

  const linkTo5W2H = (causeText: string) => {
    // We will save a pre-populated action plan state in localStorage so the 5W2H page can load it!
    localStorage.setItem('@portal-stock-ai:pending-action-cause', JSON.stringify({
      what: `Mitigar causa: ${causeText}`,
      why: `Identificado como causa raiz para o problema: "${activeDiagram.problem}"`,
      where: 'Depósito Jardim Catarina',
      who: 'Equipe de Logística'
    }));
    navigate('/5w2h');
  };

  return (
    <div className="ishikawa-page">
      <header className="page-header">
        <div>
          <h1>Diagrama de Ishikawa (Espinha de Peixe)</h1>
          <p>Mapeamento de causas raiz para perdas, avarias e desvios operacionais de estoque</p>
        </div>
      </header>

      <div className="ishikawa-container">
        {/* Top controls: Select diagram & Create diagram */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label>Selecione o Diagrama Operacional:</label>
            <select value={selectedDiagramId} onChange={e => setSelectedDiagramId(e.target.value)}>
              {diagrams.map(d => (
                <option key={d.id} value={d.id}>{d.problem}</option>
              ))}
            </select>
          </div>
          
          <form onSubmit={handleCreateDiagram} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Criar Novo Estudo de Causa Raiz (Problema):</label>
              <input 
                type="text" 
                placeholder="Ex: Atraso na Doca de Recebimento D1" 
                value={customProblemText}
                onChange={e => setCustomProblemText(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-add-batch" style={{ width: 'auto', padding: '0.75rem 1.25rem' }}>Criar</button>
          </form>
        </div>

        {/* Visual Fishbone SVG Diagram */}
        <div className="fishbone-svg-wrapper card">
          <svg viewBox="0 0 800 360" className="fishbone-svg">
            {/* Central spine line */}
            <line x1="50" y1="180" x2="650" y2="180" stroke="#475569" strokeWidth="4" />
            <polygon points="650,172 650,188 670,180" fill="#475569" />

            {/* Fish Head Box */}
            <rect x="670" y="145" width="110" height="70" rx="8" className="fish-problem-box" />
            
            {/* Wrap text in problem box */}
            <switch>
              <foreignObject x="675" y="150" width="100" height="60">
                <div style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  color: '#991b1b',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  wordBreak: 'break-word',
                  textTransform: 'uppercase'
                }}>
                  {activeDiagram.problem}
                </div>
              </foreignObject>
            </switch>

            {/* Diagonal Bones - Upper */}
            {/* Método */}
            <line x1="160" y1="180" x2="250" y2="50" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="260" y="45" className="fish-bone-label">Método</text>
            {activeDiagram.metodo.slice(0, 3).map((c, i) => (
              <g key={c.id}>
                <line x1={190 + i * 20} y1={180 - i * 30 - 30} x2={190 + i * 20 + 20} y2={180 - i * 30 - 30} stroke="#94a3b8" strokeWidth="1" />
                <text x={190 + i * 20 + 25} y={180 - i * 30 - 27} className="fish-cause-text">
                  {c.text.length > 25 ? c.text.slice(0, 22) + '...' : c.text}
                </text>
              </g>
            ))}

            {/* Máquina */}
            <line x1="320" y1="180" x2="410" y2="50" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="420" y="45" className="fish-bone-label">Máquina</text>
            {activeDiagram.maquina.slice(0, 3).map((c, i) => (
              <g key={c.id}>
                <line x1={350 + i * 20} y1={180 - i * 30 - 30} x2={350 + i * 20 + 20} y2={180 - i * 30 - 30} stroke="#94a3b8" strokeWidth="1" />
                <text x={350 + i * 20 + 25} y={180 - i * 30 - 27} className="fish-cause-text">
                  {c.text.length > 25 ? c.text.slice(0, 22) + '...' : c.text}
                </text>
              </g>
            ))}

            {/* Medida */}
            <line x1="480" y1="180" x2="570" y2="50" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="580" y="45" className="fish-bone-label">Medida</text>
            {activeDiagram.medida.slice(0, 3).map((c, i) => (
              <g key={c.id}>
                <line x1={510 + i * 20} y1={180 - i * 30 - 30} x2={510 + i * 20 + 20} y2={180 - i * 30 - 30} stroke="#94a3b8" strokeWidth="1" />
                <text x={510 + i * 20 + 25} y={180 - i * 30 - 27} className="fish-cause-text">
                  {c.text.length > 25 ? c.text.slice(0, 22) + '...' : c.text}
                </text>
              </g>
            ))}

            {/* Diagonal Bones - Lower */}
            {/* Meio Ambiente */}
            <line x1="160" y1="180" x2="250" y2="310" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="260" y="318" className="fish-bone-label">Meio Ambiente</text>
            {activeDiagram.meioAmbiente.slice(0, 3).map((c, i) => (
              <g key={c.id}>
                <line x1={190 + i * 20} y1={180 + i * 30 + 30} x2={190 + i * 20 + 20} y2={180 + i * 30 + 30} stroke="#94a3b8" strokeWidth="1" />
                <text x={190 + i * 20 + 25} y={180 + i * 30 + 33} className="fish-cause-text">
                  {c.text.length > 25 ? c.text.slice(0, 22) + '...' : c.text}
                </text>
              </g>
            ))}

            {/* Mão de Obra */}
            <line x1="320" y1="180" x2="410" y2="310" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="420" y="318" className="fish-bone-label">Mão de Obra</text>
            {activeDiagram.maoDeObra.slice(0, 3).map((c, i) => (
              <g key={c.id}>
                <line x1={350 + i * 20} y1={180 + i * 30 + 30} x2={350 + i * 20 + 20} y2={180 + i * 30 + 30} stroke="#94a3b8" strokeWidth="1" />
                <text x={350 + i * 20 + 25} y={180 + i * 30 + 33} className="fish-cause-text">
                  {c.text.length > 25 ? c.text.slice(0, 22) + '...' : c.text}
                </text>
              </g>
            ))}

            {/* Material */}
            <line x1="480" y1="180" x2="570" y2="310" stroke="#cbd5e1" strokeWidth="2.5" />
            <text x="580" y="318" className="fish-bone-label">Material</text>
            {activeDiagram.material.slice(0, 3).map((c, i) => (
              <g key={c.id}>
                <line x1={510 + i * 20} y1={180 + i * 30 + 30} x2={510 + i * 20 + 20} y2={180 + i * 30 + 30} stroke="#94a3b8" strokeWidth="1" />
                <text x={510 + i * 20 + 25} y={180 + i * 30 + 33} className="fish-cause-text">
                  {c.text.length > 25 ? c.text.slice(0, 22) + '...' : c.text}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Cause Manager list & Add Cause Form */}
        <div className="ishikawa-split-layout">
          {/* Cause Manager */}
          <div className="card">
            <div className="title-section-wrapper">
              <GitBranch size={18} color="var(--primary-color)" />
              <h3>Causas Registradas por Categoria</h3>
            </div>
            <p className="subtitle" style={{ marginBottom: '1.25rem' }}>Audite as causas listadas e lance-as diretamente em planos de ação de mitigação</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(['metodo', 'maquina', 'medida', 'meioAmbiente', 'maoDeObra', 'material'] as const).map(cat => {
                const labelMap = {
                  metodo: 'Método',
                  maquina: 'Máquina',
                  medida: 'Medida',
                  meioAmbiente: 'Meio Ambiente',
                  maoDeObra: 'Mão de Obra',
                  material: 'Material'
                };
                const causes = activeDiagram[cat] as Cause[];

                return (
                  <div key={cat}>
                    <h5 style={{ fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      {labelMap[cat]} ({causes.length})
                    </h5>
                    {causes.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
                        Nenhuma causa mapeada nesta categoria.
                      </p>
                    ) : (
                      causes.map(c => (
                        <div key={c.id} className="cause-card-item">
                          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{c.text}</span>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <button 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.2rem', 
                                fontSize: '0.75rem', 
                                color: 'var(--primary-color)',
                                fontWeight: '700'
                              }}
                              onClick={() => linkTo5W2H(c.text)}
                              title="Criar Plano de Ação 5W2H"
                            >
                              Mitigar <ArrowRight size={12} />
                            </button>
                            <button 
                              onClick={() => handleRemoveCause(cat, c.id)}
                              className="btn-remove-cause"
                              title="Remover Causa"
                              style={{ display: 'inline-flex' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Cause Form */}
          <div className="card">
            <div className="title-section-wrapper">
              <Plus size={18} color="var(--primary-color)" />
              <h3>Cadastrar Causa</h3>
            </div>
            <p className="subtitle">Mapeie uma nova causa provável associada ao problema</p>

            <form onSubmit={handleAddCause} className="sim-form">
              <div className="form-group">
                <label>Categoria (6 Ms):</label>
                <select 
                  value={newCauseCategory} 
                  onChange={e => setNewCauseCategory(e.target.value as any)}
                >
                  <option value="metodo">Método (Procedimentos)</option>
                  <option value="maquina">Máquina (Equipamentos/Prateleiras)</option>
                  <option value="medida">Medida (Auditoria/Balanças)</option>
                  <option value="meioAmbiente">Meio Ambiente (Temperatura/Umidade)</option>
                  <option value="maoDeObra">Mão de Obra (Operadores/Treinamento)</option>
                  <option value="material">Material (Insumos/Embalagens)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descrição da Causa:</label>
                <textarea 
                  placeholder="Ex: Sacos escorregando por falta de filme stretch nos paletes" 
                  value={newCauseText}
                  onChange={e => setNewCauseText(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="btn-add-batch">Confirmar Causa na Espinha de Peixe</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ishikawa;
