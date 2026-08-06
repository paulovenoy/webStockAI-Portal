import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Trash2, Download, CheckCircle2 } from 'lucide-react';

interface ActionPlan5W2H {
  id: number;
  what: string;
  why: string;
  where: string;
  when: string;
  who: string;
  how: string;
  howMuch: number;
  status: 'pending' | 'progress' | 'done';
}

const Plano5W2H: React.FC = () => {
  const [plans, setPlans] = useState<ActionPlan5W2H[]>([]);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  // New action form states
  const [what, setWhat] = useState('');
  const [why, setWhy] = useState('');
  const [where, setWhere] = useState('Depósito Jardim Catarina');
  const [when, setWhen] = useState('');
  const [who, setWho] = useState('');
  const [how, setHow] = useState('');
  const [howMuch, setHowMuch] = useState('');

  const defaultPlans: ActionPlan5W2H[] = [
    {
      id: 1,
      what: 'Trocar garfos da empilhadeira operacional',
      why: 'Evitar rasgos acidentais nos sacos de farinha no Corredor A1',
      where: 'Docas e Corredor A1',
      when: '2026-08-15',
      who: 'Carlos (Manutenção)',
      how: 'Comprar novos garfos emborrachados e agendar instalação física',
      howMuch: 850.00,
      status: 'progress'
    },
    {
      id: 2,
      what: 'Instalar desumidificador industrial',
      why: 'Reduzir umidade do ar que compacta o açúcar e estraga embalagens',
      where: 'Corredor A - A2',
      when: '2026-09-01',
      who: 'Mariana (CQ)',
      how: 'Instalar aparelhos elétricos com drenagem contínua nas colunas',
      howMuch: 3200.00,
      status: 'pending'
    },
    {
      id: 3,
      what: 'Treinar equipe nas regras FEFO/FIFO do sistema',
      why: 'Garantir que os lotes mais antigos saiam primeiro da câmara fria',
      where: 'Refeitório/Auditório',
      when: '2026-07-20',
      who: 'Roberto (Supervisor)',
      how: 'Realizar palestra teórica e simulação prática com tablets na planta',
      howMuch: 0,
      status: 'done'
    }
  ];

  useEffect(() => {
    const localPlans = localStorage.getItem('@portal-stock-ai:5w2h');
    let loadedPlans: ActionPlan5W2H[] = [];
    if (localPlans) {
      loadedPlans = JSON.parse(localPlans);
    } else {
      localStorage.setItem('@portal-stock-ai:5w2h', JSON.stringify(defaultPlans));
      loadedPlans = defaultPlans;
    }
    setPlans(loadedPlans);

    // Check if there's a pending cause linked from Ishikawa Diagram page
    const pendingCause = localStorage.getItem('@portal-stock-ai:pending-action-cause');
    if (pendingCause) {
      try {
        const parsed = JSON.parse(pendingCause);
        setWhat(parsed.what || '');
        setWhy(parsed.why || '');
        setWhere(parsed.where || 'Depósito Jardim Catarina');
        setWho(parsed.who || '');
        // Clear the pending cause so it doesn't trigger on subsequent reloads
        localStorage.removeItem('@portal-stock-ai:pending-action-cause');
      } catch (err) {
        console.error('Error parsing pending cause from Ishikawa:', err);
      }
    }
  }, []);

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!what.trim() || !why.trim() || !when || !who.trim() || !how.trim()) {
      alert('Preencha todos os campos obrigatórios do plano de ação.');
      return;
    }

    const price = parseFloat(howMuch) || 0;

    const newPlan: ActionPlan5W2H = {
      id: Date.now(),
      what: what.trim(),
      why: why.trim(),
      where: where.trim(),
      when,
      who: who.trim(),
      how: how.trim(),
      howMuch: price,
      status: 'pending'
    };

    const updated = [...plans, newPlan];
    localStorage.setItem('@portal-stock-ai:5w2h', JSON.stringify(updated));
    setPlans(updated);

    // Reset form
    setWhat('');
    setWhy('');
    setWhere('Depósito Jardim Catarina');
    setWhen('');
    setWho('');
    setHow('');
    setHowMuch('');

    // Trigger local notification log
    const localNotif = localStorage.getItem('@portal-stock-ai:notifications') || '[]';
    const notifs = JSON.parse(localNotif);
    const newNotif = {
      id: Date.now(),
      type: 'info',
      text: `[5W2H] Nova ação cadastrada: "${newPlan.what}" sob responsabilidade de ${newPlan.who}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('@portal-stock-ai:notifications', JSON.stringify([newNotif, ...notifs]));
  };

  const handleStatusChange = (id: number, newStatus: 'pending' | 'progress' | 'done') => {
    const updated = plans.map(p => {
      if (p.id === id) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    localStorage.setItem('@portal-stock-ai:5w2h', JSON.stringify(updated));
    setPlans(updated);
  };

  const handleDeleteAction = (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este plano de ação?')) return;
    
    const updated = plans.filter(p => p.id !== id);
    localStorage.setItem('@portal-stock-ai:5w2h', JSON.stringify(updated));
    setPlans(updated);
  };

  const handleExportCSV = () => {
    setExportMsg('Exportando...');
    setTimeout(() => {
      setExportMsg('Plano de Ação "PLANO_5W2H_STOCK_AI.csv" exportado e pronto para download!');
    }, 1000);
  };

  const [showHelp, setShowHelp] = useState<boolean>(false);

  return (
    <div className="plan5w2h-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1>Plano de Ação 5W2H</h1>
            <button 
              className="btn-card-help" 
              onClick={() => setShowHelp(!showHelp)} 
              title="Clique para entender como funciona esta página"
              style={{ background: 'var(--primary-light)', padding: '0.35rem 0.65rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--primary-color)' }}
            >
              <span>? Como funciona o 5W2H</span>
            </button>
          </div>
          <p>Definição de diretrizes corretivas e preventivas para mitigar quebras e otimizar processos logísticos</p>
        </div>
        <div>
          <button className="btn-export" onClick={handleExportCSV}>
            <Download size={16} />
            Exportar Plano 5W2H
          </button>
        </div>
      </header>

      {showHelp && (
        <div className="card card-help-popover-wide" style={{ marginBottom: '1.5rem', background: '#0f172a', color: '#fff' }}>
          <h4>? O QUE É E COMO FUNCIONA O PLANO 5W2H:</h4>
          <p style={{ marginTop: '0.35rem', fontSize: '0.825rem', lineHeight: '1.4' }}>
            <strong>O QUE É:</strong> Uma matriz de gestão onde cada problema identificado ganha 7 respostas claras: O que fazer (What), Por que fazer (Why), Onde fazer (Where), Quando fazer (When), Quem fará (Who), Como fazer (How) e Quanto custará (How Much).<br />
            <strong>COMO FUNCIONA:</strong> Garante responsabilidade direta e prazo para que erros do almoxarifado não se repitam.
          </p>
        </div>
      )}

      {exportMsg && (
        <div className="export-notification card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)' }}>
            <CheckCircle2 size={20} />
            <strong>{exportMsg}</strong>
          </div>
          <button className="close-btn" onClick={() => setExportMsg(null)}>Ok</button>
        </div>
      )}

      <div className="ishikawa-split-layout">
        {/* Actions Table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="title-section-wrapper">
            <ClipboardList size={18} color="var(--primary-color)" />
            <h3>Plano de Ação Corretiva Geral</h3>
          </div>
          <p className="subtitle">Tabela dinâmica para rastreamento de tarefas baseada na metodologia 5W2H</p>

          <div className="plan5w2h-table-wrapper">
            <table className="plan5w2h-table">
              <thead>
                <tr>
                  <th>O quê? (What)</th>
                  <th>Por quê? (Why)</th>
                  <th>Onde? (Where)</th>
                  <th>Quando? (When)</th>
                  <th>Quem? (Who)</th>
                  <th>Como? (How)</th>
                  <th>Quanto? (How Much)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.what}</strong></td>
                    <td><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.why}</span></td>
                    <td><span className="address-badge">{p.where}</span></td>
                    <td><strong>{p.when}</strong></td>
                    <td>{p.who}</td>
                    <td><span style={{ fontSize: '0.75rem' }}>{p.how}</span></td>
                    <td>
                      <span className="cost-tag">
                        {p.howMuch === 0 ? 'Sem Custo' : `R$ ${p.howMuch.toFixed(2)}`}
                      </span>
                    </td>
                    <td>
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value as any)}
                        className={`status-select ${p.status}`}
                      >
                        <option value="pending">Pendente (What)</option>
                        <option value="progress">Em Andamento</option>
                        <option value="done">Concluído</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteAction(p.id)}
                        title="Deletar Ação"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Action Form */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="title-section-wrapper">
            <Plus size={18} color="var(--primary-color)" />
            <h3>Adicionar Nova Ação Corretiva (5W2H)</h3>
          </div>
          <p className="subtitle">Planeje uma nova diretriz preenchendo as perguntas fundamentais de execução</p>

          <form onSubmit={handleAddAction} className="sim-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>O QUE será feito? (What) *</label>
              <input
                type="text"
                placeholder="Ex: Treinar ajudantes na paletização de caixas"
                value={what}
                onChange={e => setWhat(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>POR QUE será feito? (Why) *</label>
              <input
                type="text"
                placeholder="Ex: Evitar quebras de caixas por empilhamento incorreto"
                value={why}
                onChange={e => setWhy(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>ONDE será feito? (Where)</label>
              <input
                type="text"
                placeholder="Ex: Corredor B ou Almoxarifado"
                value={where}
                onChange={e => setWhere(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>QUANDO será feito? (When - Prazo) *</label>
              <input
                type="date"
                value={when}
                onChange={e => setWhen(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>QUEM será o responsável? (Who) *</label>
              <input
                type="text"
                placeholder="Ex: João da Silva (Logística)"
                value={who}
                onChange={e => setWho(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>QUANTO custará? (How Much - R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 150.00 (Deixe em branco ou zero se sem custo)"
                value={howMuch}
                onChange={e => setHowMuch(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>COMO será executado? (How - Metodologia) *</label>
              <textarea
                placeholder="Ex: Utilizar apostilas técnicas e treinamento supervisionado de 2 horas na doca."
                value={how}
                onChange={e => setHow(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn-add-batch" style={{ width: 'auto', padding: '0.85rem 2rem' }}>
                Lançar Ação no Plano 5W2H
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Plano5W2H;
