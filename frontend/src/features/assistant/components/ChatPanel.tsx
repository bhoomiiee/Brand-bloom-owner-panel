import React, { useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { EvidencePanel } from './EvidencePanel';
import { SuggestedQuestions } from './SuggestedQuestions';
import { assistantApi } from '../api/assistant.api';
import { BotanicalCardAccent } from '../../../components/botanical/BotanicalDecorations';

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; evidence?: any }>>([
    { sender: 'assistant', text: 'Hello! I am your verified Store Assistant. Ask me anything about your sales, orders, or low-stock inventory.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (question: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setIsLoading(true);
    try {
      const res = await assistantApi.ask(question);
      setMessages(prev => [...prev, { sender: 'assistant', text: res.answer, evidence: res.evidence }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'assistant', text: `Unable to answer from verified records: ${err.message || 'The question could not be answered using approved store metrics.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bb-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '640px',
        background: 'var(--bb-white)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <BotanicalCardAccent position="top-right" size={90} opacity={0.35} />

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <ChatMessage sender={m.sender} text={m.text} />
            {m.evidence && <EvidencePanel evidence={m.evidence} />}
          </div>
        ))}
        {isLoading && (
          <div style={{ color: 'var(--bb-muted-text)', fontSize: '13px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌸</span> Querying verified store database metrics...
          </div>
        )}
      </div>
      <SuggestedQuestions onSelect={handleSend} />
      <ChatComposer onSend={handleSend} disabled={isLoading} />
    </div>
  );
};
