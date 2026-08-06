import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ZoomOut, 
  MousePointer, 
  Sparkles, 
  Keyboard, 
  X,
  Sliders,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

export const AccessibilityHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [isBigCursor, setIsBigCursor] = useState(false);
  const [isReduceMotion, setIsReduceMotion] = useState(false);
  const [isHighlightLinks, setIsHighlightLinks] = useState(false);

  // Keyboard Shortcuts (ALT + C, ALT + V, ALT + H)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          setIsOpen(prev => !prev);
        } else if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          toggleHighContrast();
        } else if (e.key.toLowerCase() === 'v') {
          e.preventDefault();
          toggleSpeechReader();
        } else if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          toggleHighlightLinks();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpeaking, isHighContrast, isHighlightLinks]);

  // High Contrast
  const toggleHighContrast = () => {
    setIsHighContrast(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      return next;
    });
  };

  // Font Scaling
  const updateFontScale = (delta: number) => {
    setFontScale(prev => {
      const newScale = Math.min(1.4, Math.max(0.85, prev + delta));
      document.documentElement.style.fontSize = `${newScale * 100}%`;
      return newScale;
    });
  };

  const resetFontScale = () => {
    setFontScale(1);
    document.documentElement.style.fontSize = '100%';
  };

  // Big Cursor
  const toggleBigCursor = () => {
    setIsBigCursor(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('big-cursor-mode');
      } else {
        document.body.classList.remove('big-cursor-mode');
      }
      return next;
    });
  };

  // Reduce Motion
  const toggleReduceMotion = () => {
    setIsReduceMotion(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('reduce-motion-mode');
      } else {
        document.body.classList.remove('reduce-motion-mode');
      }
      return next;
    });
  };

  // Highlight Links
  const toggleHighlightLinks = () => {
    setIsHighlightLinks(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('highlight-links-mode');
      } else {
        document.body.classList.remove('highlight-links-mode');
      }
      return next;
    });
  };

  // Audio Screen Reader
  const toggleSpeechReader = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const textToRead = "Portal Stock AI - Fábrica Três Irmãos em São Gonçalo. Atalhos de acessibilidade disponíveis: Alt H abre este painel, Alt C alterna alto contraste, Alt V ativa o leitor de voz.";
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = 'pt-BR';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      alert("Seu navegador não suporta sintetizador de voz.");
    }
  };

  return (
    <>
      {/* Floating Trigger Widget (Bottom Left) */}
      <button 
        className={`accessibility-widget-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Painel de Acessibilidade Inclusiva (Alt + H)"
        aria-label="Abrir Painel de Acessibilidade"
      >
        <Sparkles size={18} />
        <span>♿ Acessibilidade</span>
      </button>

      {/* Accessibility Panel Modal */}
      {isOpen && (
        <div className="accessibility-panel-modal card" role="region" aria-label="Opções de Acessibilidade Inclusiva">
          <div className="access-panel-header">
            <div className="access-panel-title">
              <Sliders size={18} color="#ea580c" />
              <div>
                <h4>Central de Acessibilidade</h4>
                <span>Inclusão Visual, Auditiva & Motora (WCAG 2.1)</span>
              </div>
            </div>
            <button className="btn-close-access" onClick={() => setIsOpen(false)} aria-label="Fechar Painel">
              <X size={16} />
            </button>
          </div>

          <div className="access-panel-body">
            
            {/* Audio Reader */}
            <div className="access-control-row">
              <div className="control-label">
                <Volume2 size={16} color="#2563eb" />
                <div>
                  <strong>Leitor por Voz (Áudio)</strong>
                  <p>Lê em português a explicação da tela (Alt + V)</p>
                </div>
              </div>
              <button 
                className={`access-toggle-btn ${isSpeaking ? 'active' : ''}`}
                onClick={toggleSpeechReader}
              >
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                <span>{isSpeaking ? 'Parar' : 'Ouvir'}</span>
              </button>
            </div>

            {/* High Contrast */}
            <div className="access-control-row">
              <div className="control-label">
                <Eye size={16} color="#eab308" />
                <div>
                  <strong>Modo Alto Contraste</strong>
                  <p>Preto & Amarelo para baixa visão (Alt + C)</p>
                </div>
              </div>
              <button 
                className={`access-toggle-btn ${isHighContrast ? 'active' : ''}`}
                onClick={toggleHighContrast}
              >
                <span>{isHighContrast ? 'Ativo' : 'Ligar'}</span>
              </button>
            </div>

            {/* Font Resizing */}
            <div className="access-control-row">
              <div className="control-label">
                <ZoomIn size={16} color="#10b981" />
                <div>
                  <strong>Tamanho do Texto</strong>
                  <p>Escala atual: {Math.round(fontScale * 100)}%</p>
                </div>
              </div>
              <div className="btn-group-scale">
                <button onClick={() => updateFontScale(-0.1)} title="Diminuir Texto"><ZoomOut size={13} /></button>
                <button onClick={resetFontScale} title="Resetar Fonte">100%</button>
                <button onClick={() => updateFontScale(0.1)} title="Aumentar Texto"><ZoomIn size={13} /></button>
              </div>
            </div>

            {/* Big Cursor */}
            <div className="access-control-row">
              <div className="control-label">
                <MousePointer size={16} color="#7e22ce" />
                <div>
                  <strong>Cursor Gigante</strong>
                  <p>Aumenta a ponteira do mouse</p>
                </div>
              </div>
              <button 
                className={`access-toggle-btn ${isBigCursor ? 'active' : ''}`}
                onClick={toggleBigCursor}
              >
                <span>{isBigCursor ? 'Ativo' : 'Ligar'}</span>
              </button>
            </div>

            {/* Highlight Links */}
            <div className="access-control-row">
              <div className="control-label">
                <Sparkles size={16} color="#ea580c" />
                <div>
                  <strong>Destacar Botões & Links</strong>
                  <p>Sublinhado amarelo reluzente (Alt + L)</p>
                </div>
              </div>
              <button 
                className={`access-toggle-btn ${isHighlightLinks ? 'active' : ''}`}
                onClick={toggleHighlightLinks}
              >
                <span>{isHighlightLinks ? 'Ativo' : 'Ligar'}</span>
              </button>
            </div>

            {/* Reduce Motion */}
            <div className="access-control-row">
              <div className="control-label">
                {isReduceMotion ? <PauseCircle size={16} color="#ef4444" /> : <PlayCircle size={16} color="#64748b" />}
                <div>
                  <strong>Pausar Animações</strong>
                  <p>Para fotossensibilidade / labirintite</p>
                </div>
              </div>
              <button 
                className={`access-toggle-btn ${isReduceMotion ? 'active' : ''}`}
                onClick={toggleReduceMotion}
              >
                <span>{isReduceMotion ? 'Pausado' : 'Normal'}</span>
              </button>
            </div>

            {/* Keyboard Shortcuts List */}
            <div className="keyboard-shortcuts-box">
              <div className="shortcuts-head">
                <Keyboard size={14} />
                <strong>Atalhos por Teclado:</strong>
              </div>
              <div className="shortcuts-grid">
                <span><kbd>Alt</kbd> + <kbd>H</kbd> : Painel</span>
                <span><kbd>Alt</kbd> + <kbd>C</kbd> : Contraste</span>
                <span><kbd>Alt</kbd> + <kbd>V</kbd> : Voz Áudio</span>
                <span><kbd>Alt</kbd> + <kbd>L</kbd> : Links</span>
                <span><kbd>TAB</kbd> : Navegar Foco</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
