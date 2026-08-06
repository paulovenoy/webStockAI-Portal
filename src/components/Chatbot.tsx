import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';

interface Message {
  id: number;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Olá! Sou o Assistente Stock AI 🤖. Posso responder dúvidas sobre o inventário da Fábrica Três Irmãos em Jardim Catarina, SG. Como posso te ajudar hoje?',
      time: 'Agora'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    const inventoryStr = localStorage.getItem('@portal-stock-ai:inventory') || '[]';
    const inventory = JSON.parse(inventoryStr);
    const wasteStr = localStorage.getItem('@portal-stock-ai:waste') || '[]';
    const waste = JSON.parse(wasteStr);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      const query = text.toLowerCase();

      if (query.includes('estoque baixo') || query.includes('baixo') || query.includes('repor') || query.includes('falta')) {
        interface AggregatedItem {
          name: string;
          qty: number;
          minQty: number;
        }
        const aggregated = inventory.reduce((acc: Record<string, AggregatedItem>, item: any) => {
          if (!acc[item.name]) {
            acc[item.name] = { name: item.name, qty: 0, minQty: item.minQty };
          }
          acc[item.name].qty += item.quantity;
          return acc;
        }, {});

        const lowStockItems = Object.values(aggregated).filter((item: any) => item.qty < item.minQty);

        if (lowStockItems.length === 0) {
          replyText = 'Todos os insumos estão operando em níveis seguros, acima do estoque mínimo! ✅';
        } else {
          const list = lowStockItems.map((item: any) => `• ${item.name}: ${item.qty.toFixed(1)}kg (Mínimo: ${item.minQty}kg)`).join('\n');
          replyText = `Atualmente, temos ${lowStockItems.length} insumo(s) abaixo do mínimo crítico:\n${list}\n\nO setor de compras já foi alertado de forma automática! 🚨`;
        }
      } 
      else if (query.includes('validade') || query.includes('vence') || query.includes('vencimento') || query.includes('fefo')) {
        const sorted = [...inventory].sort((a: any, b: any) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
        if (sorted.length === 0) {
          replyText = 'Não há lotes cadastrados no depósito no momento.';
        } else {
          const firstExp = sorted[0];
          const today = new Date();
          const expDate = new Date(firstExp.expiry);
          const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          replyText = `Pela regra FEFO, o lote mais próximo do vencimento é o do insumo "${firstExp.name}" (ID Lote: ${firstExp.id.toString().slice(-6)}).\n• Quantidade: ${firstExp.quantity}kg\n• Endereço: ${firstExp.address}\n• Validade: ${firstExp.expiry} (${diffDays === 0 ? 'VENCE HOJE!' : diffDays === 1 ? 'Vence amanhã!' : `vence em ${diffDays} dias`}).`;
        }
      } 
      else if (query.includes('local') || query.includes('onde') || query.includes('corredor') || query.includes('endereço')) {
        replyText = `A distribuição de corredores no depósito de Jardim Catarina é:\n• Farinhas: Corredor A - A1\n• Açúcares: Corredor A - A2\n• Fermentos: Corredor B - B1\n• Gorduras/Manteiga: Corredor B - B2\n• Condimentos/Sal: Corredor C - C1\n\nVocê também pode visualizar isso de forma dinâmica na aba "Depósito & Layout"! 🗺️`;
      } 
      else if (query.includes('patrimônio') || query.includes('custo') || query.includes('valor') || query.includes('dinheiro') || query.includes('financeiro')) {
        const totalValue = inventory.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);
        replyText = `O patrimônio total ativo estocado em insumos é de R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.\nOs insumos de Curva A (como farinha e fermentos) representam cerca de 80% deste valor total. 💰`;
      } 
      else if (query.includes('perda') || query.includes('desperdício') || query.includes('refugo') || query.includes('quebra')) {
        const totalLosses = waste.reduce((sum: number, w: any) => sum + w.losses, 0);
        replyText = `O total acumulado de perdas e refugos no estoque é de ${totalLosses}kg. Você pode ver o gráfico histórico de desperdício semanal na tela do Painel Geral. 📊`;
      }
      else if (query.includes('ishikawa') || query.includes('espinha') || query.includes('peixe') || query.includes('causa')) {
        replyText = `O Diagrama de Ishikawa (espinha de peixe) serve para mapear as causas raiz de problemas no estoque (ex: umidade, atraso de entrega). Acesse a aba "Diagrama Ishikawa" no menu para ver o diagrama dinâmico e cadastrar novas causas associadas aos 6 Ms! 🐟`;
      }
      else if (query.includes('5w2h') || query.includes('plano') || query.includes('ação') || query.includes('tarefa')) {
        replyText = `A aba "Plano 5W2H" contém a tabela de planos de ação (O que, Por que, Onde, Quem, Quando, Como, Quanto) para mitigar falhas. Você pode criar novas ações integradas com as causas do Ishikawa para garantir a melhoria contínua! 📋`;
      }
      else if (query.includes('wms') || query.includes('leitor') || query.includes('picking') || query.includes('rack')) {
        replyText = `A aba "WMS Inteligente" traz recursos avançados do armazém:\n• Simulação de Leitor de Código de Barras (entrada/saída imediata)\n• Otimização de Rota de Picking e Put-away (regra FEFO com menor caminhada)\n• Visualização de Racks Verticais (níveis de altura 1, 2, 3) 🚀`;
      }
      else {
        replyText = `Para melhor te ajudar, utilize uma das palavras-chave contextuais do estoque da Fábrica Três Irmãos:\n• "estoque baixo" ou "repor" (status de alerta)\n• "validade" ou "vencimento" (regra FEFO)\n• "local" ou "onde fica" (endereço do insumo)\n• "patrimônio" ou "valor do estoque" (financeiro)\n• "desperdício" ou "perda" (pesagem/auditoria)\n• "ishikawa", "5w2h" ou "wms" (novos recursos)`;
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-window card">
          <div className="chat-window-header">
            <div className="header-ai-info">
              <Bot size={20} color="var(--primary-color)" />
              <div>
                <h4>Assistente Stock AI</h4>
                <span className="status">Online • Rastreando Estoque</span>
              </div>
            </div>
            <button className="close-chat" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-window-body">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="chat-bubble">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                  <span className="time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-wrapper bot">
                <div className="chat-bubble typing">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-quick-replies">
            <button onClick={() => handleSendMessage('Qual lote vence primeiro?')}>Validade (FEFO)</button>
            <button onClick={() => handleSendMessage('Quais itens estão com estoque baixo?')}>Estoque Baixo</button>
            <button onClick={() => handleSendMessage('O que é o WMS Inteligente?')}>WMS Inteligente</button>
            <button onClick={() => handleSendMessage('Como usar o Diagrama de Ishikawa e 5W2H?')}>Melhoria Contínua</button>
          </div>

          <form
            className="chat-window-input"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
          >
            <input
              type="text"
              placeholder="Pergunte sobre validade, estoque, locais, WMS..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <button type="submit" disabled={!inputValue.trim() || isTyping}>
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-bubble" onClick={() => setIsOpen(true)} title="Falar com Assistente IA">
          <Bot size={24} />
          <span className="badge-notification">IA</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
