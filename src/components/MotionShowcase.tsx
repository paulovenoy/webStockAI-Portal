import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  WifiOff, 
  DollarSign, 
  Eye, 
  CheckCircle2,
  Package,
  RotateCcw
} from 'lucide-react';

interface MotionShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  voiceText: string;
  icon: React.ReactNode;
  themeColor: string;
  renderVisual: () => React.ReactNode;
}

const MotionShowcase: React.FC<MotionShowcaseProps> = ({ isOpen, onClose }) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [progress, setProgress] = useState(0);

  const scenes: Scene[] = [
    {
      id: 1,
      title: "1. Apresentando o Stock AI",
      subtitle: "Gestão Inteligente de Estoque para a Fábrica Três Irmãos em São Gonçalo",
      voiceText: "Bem-vindo ao Stock AI, a plataforma inteligente desenvolvida para a Fábrica Três Irmãos em São Gonçalo.",
      icon: <Sparkles size={24} />,
      themeColor: "#ea580c",
      renderVisual: () => (
        <div className="motion-visual-scene scene-intro">
          <div className="pulsing-logo-glow">
            <img src="/logo.png" alt="StockAI" height="64" />
          </div>
          <h3 className="motion-visual-title">Stock AI — Portal da Empresa</h3>
          <span className="motion-visual-tag">Fábrica Três Irmãos • São Gonçalo, RJ</span>
          <div className="motion-badges-flow">
            <span className="badge-flow-item">✓ Controle de Validades</span>
            <span className="badge-flow-item">✓ 100% Offline First</span>
            <span className="badge-flow-item">✓ Acessibilidade com Voz</span>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "2. Regra FEFO: Zere as Perdas",
      subtitle: "First Expire, First Out — O produto que vence primeiro vai para a receita primeiro",
      voiceText: "O controle FEFO ordena os lotes pela data de vencimento. O produto que vence primeiro é consumido primeiro, eliminando o desperdício de farinhas e fermentos.",
      icon: <Clock size={24} />,
      themeColor: "#ef4444",
      renderVisual: () => (
        <div className="motion-visual-scene scene-fefo">
          <div className="fefo-cards-animation">
            <div className="animated-batch-card urgent">
              <div className="batch-head">
                <span className="batch-id">#0003 Fermento Seco</span>
                <span className="batch-days critical">Vence em 2 dias!</span>
              </div>
              <div className="batch-action-sim">
                <span>Prioridade Total na Batedeira</span>
                <span className="sim-btn-check">✓ Dar Baixa (5kg)</span>
              </div>
            </div>
            <div className="animated-batch-card safe">
              <div className="batch-head">
                <span className="batch-id">#0001 Farinha Especial</span>
                <span className="batch-days safe">Vence em 24 dias</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "3. Operação Offline First & Sync",
      subtitle: "Trabalhe no galpão sem sinal e sincronize tudo na nuvem ao reconectar",
      voiceText: "No galpão sem sinal de internet, as movimentações continuam salvas no dispositivo e sobem para a nuvem ao clicar em Sincronizar.",
      icon: <WifiOff size={24} />,
      themeColor: "#2563eb",
      renderVisual: () => (
        <div className="motion-visual-scene scene-offline">
          <div className="offline-motion-display">
            <div className="offline-status-badge-sim">
              <WifiOff size={18} className="pulse-red" />
              <span>Modo Offline Ativo (Salvo no Celular)</span>
            </div>
            <div className="queue-counter-sim">
              <Package size={20} />
              <span>3 alterações salvas no aparelho</span>
            </div>
            <div className="sync-arrow-anim">
              <CheckCircle2 size={32} color="#10b981" />
              <strong>Sincronizado na Nuvem com Sucesso!</strong>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "4. Inteligência Financeira & Curva ABC",
      subtitle: "Proteja os 80% do investimento concentrado em matérias-primas nobres",
      voiceText: "A classificação Curva ABC protege os oitenta por cento do capital investido concentrado em farinhas e fermentos.",
      icon: <DollarSign size={24} />,
      themeColor: "#10b981",
      renderVisual: () => (
        <div className="motion-visual-scene scene-abc">
          <div className="abc-motion-bars">
            <div className="abc-val-box">
              <span>CUSTO EM INSUMOS</span>
              <strong>R$ 5.430,00</strong>
            </div>
            <div className="motion-progress-container">
              <div className="motion-bar-segment a" style={{ width: '80%' }}>Curva A (80% do Custo)</div>
              <div className="motion-bar-segment b" style={{ width: '15%' }}>B (15%)</div>
              <div className="motion-bar-segment c" style={{ width: '5%' }}>C</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "5. Acessibilidade Inclusiva & Voz",
      subtitle: "Leitor por voz nativo, ajuste de fonte e alto contraste para todos os colaboradores",
      voiceText: "O portal inclui leitores de voz, ajuste de fonte e alto contraste para total inclusão de todos os colaboradores da fábrica.",
      icon: <Eye size={24} />,
      themeColor: "#7e22ce",
      renderVisual: () => (
        <div className="motion-visual-scene scene-accessibility">
          <div className="soundwave-container">
            <div className="soundwave-bar bar1"></div>
            <div className="soundwave-bar bar2"></div>
            <div className="soundwave-bar bar3"></div>
            <div className="soundwave-bar bar4"></div>
            <div className="soundwave-bar bar5"></div>
          </div>
          <span className="voice-narrator-tag">🗣️ Narração por Voz Ativa</span>
          <div className="access-features-pills">
            <span>👁️ Modo Alto Contraste</span>
            <span>🔤 Fontes A+ / A-</span>
            <span>⌨️ Navegação por Teclado</span>
          </div>
        </div>
      )
    }
  ];

  const currentScene = scenes[currentSceneIdx];

  // Speak voice explanation of current scene
  useEffect(() => {
    if (isOpen && isVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.voiceText);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentSceneIdx, isOpen, isVoiceEnabled]);

  // Auto-play timer (5 seconds per scene)
  useEffect(() => {
    let timer: any;
    let progressTimer: any;

    if (isOpen && isPlaying) {
      setProgress(0);
      const stepMs = 50;
      const totalMs = 5000;

      progressTimer = setInterval(() => {
        setProgress(prev => Math.min(100, prev + (stepMs / totalMs) * 100));
      }, stepMs);

      timer = setTimeout(() => {
        setCurrentSceneIdx(prev => (prev + 1) % scenes.length);
      }, totalMs);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [currentSceneIdx, isPlaying, isOpen, scenes.length]);

  if (!isOpen) return null;

  const handleNext = () => {
    setCurrentSceneIdx(prev => (prev + 1) % scenes.length);
  };

  const handlePrev = () => {
    setCurrentSceneIdx(prev => (prev - 1 + scenes.length) % scenes.length);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const toggleVoice = () => {
    if (isVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceEnabled(prev => !prev);
  };

  return (
    <div className="motion-showcase-overlay" role="dialog" aria-label="Apresentação Motion Stock AI">
      <div className="motion-showcase-card card">
        
        {/* Top Header */}
        <div className="motion-top-bar">
          <div className="motion-brand-title">
            <div className="motion-logo-icon" style={{ backgroundColor: currentScene.themeColor }}>
              {currentScene.icon}
            </div>
            <div>
              <h3>Stock AI — Motion Presentation</h3>
              <span className="scene-step-tag">Cena {currentSceneIdx + 1} de {scenes.length}</span>
            </div>
          </div>

          <div className="motion-top-actions">
            <button 
              className={`btn-motion-voice ${isVoiceEnabled ? 'active' : ''}`}
              onClick={toggleVoice}
              title="Alternar Narração por Voz"
            >
              {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{isVoiceEnabled ? 'Voz: Ligada' : 'Voz: Muta'}</span>
            </button>

            <button className="btn-close-motion" onClick={onClose} aria-label="Fechar Motion">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="motion-progress-track">
          <div 
            className="motion-progress-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: currentScene.themeColor 
            }} 
          />
        </div>

        {/* Motion Stage / Visual Body */}
        <div className="motion-stage-container">
          <div className="scene-info-header">
            <h2>{currentScene.title}</h2>
            <p>{currentScene.subtitle}</p>
          </div>

          {/* Animated Visual Canvas */}
          <div className="motion-visual-canvas">
            {currentScene.renderVisual()}
          </div>
        </div>

        {/* Bottom Motion Controller Bar */}
        <div className="motion-controls-bar">
          <div className="scene-thumbnails-group">
            {scenes.map((s, idx) => (
              <button 
                key={s.id} 
                className={`thumb-dot ${idx === currentSceneIdx ? 'active' : ''}`}
                onClick={() => setCurrentSceneIdx(idx)}
                style={{ backgroundColor: idx === currentSceneIdx ? s.themeColor : '#cbd5e1' }}
                title={s.title}
              />
            ))}
          </div>

          <div className="playback-controls">
            <button className="btn-motion-control" onClick={handlePrev} title="Cena Anterior">
              <ChevronLeft size={20} />
            </button>

            <button className="btn-motion-play-pause" onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Reproduzir'}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button className="btn-motion-control" onClick={handleNext} title="Próxima Cena">
              <ChevronRight size={20} />
            </button>

            <button 
              className="btn-motion-control" 
              onClick={() => { setCurrentSceneIdx(0); setIsPlaying(true); }}
              title="Reiniciar Apresentação"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MotionShowcase;
