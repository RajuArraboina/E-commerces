import React, { useState, useRef, useEffect } from 'react';
import aiService from '../../services/aiService';
import { Sparkles, Send, Bot, User, ArrowRight, HelpCircle, Activity } from 'lucide-react';

const ADMIN_QUICK_QUESTIONS = [
  'How many orders are pending?',
  'Which products sold the most?',
  'Which products have low stock?',
  'What is the total revenue?',
  'Which category generated the most sales?',
  'Show products with declining sales.',
];

const AdminAIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Welcome to **EShop Admin AI Intelligence**. I have direct access to your real-time MongoDB database (Orders, Products, Users, Revenue). What operational insights can I compile for you?',
      metricCard: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question) => {
    const textToSend = question || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.adminChat(textToSend.trim());
      if (res.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.reply,
            metricCard: res.metricCard || null,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Encountered an issue running the database query. Please verify that the backend server is active.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page admin-ai-page">
      <div className="admin-page-header">
        <div>
          <div className="badge-tag badge-tag-ai" style={{ marginBottom: '8px' }}>
            <Sparkles size={14} /> ✨ Enterprise Admin Intelligence
          </div>
          <h1 className="admin-title">EShop Admin AI Assistant</h1>
          <p className="admin-subtitle">
            Query your operational database in natural language for instant metrics, inventory warnings, and revenue trends
          </p>
        </div>
      </div>

      {/* Suggested Quick Questions Grid */}
      <div className="admin-ai-prompts-card card" style={{ marginBottom: '24px' }}>
        <div className="prompts-header">
          <HelpCircle size={16} className="text-primary" />
          <strong>Suggested Operational Queries:</strong>
        </div>
        <div className="admin-prompts-grid">
          {ADMIN_QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="admin-prompt-pill"
              onClick={() => handleSend(q)}
            >
              <span>{q}</span>
              <ArrowRight size={13} />
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Chat Console */}
      <div className="card admin-ai-console-card">
        <div className="ai-console-header">
          <div className="console-title-wrap">
            <span className="live-pulse-dot" />
            <strong>Real-Time MongoDB Analytical Pipeline</strong>
          </div>
          <span className="text-muted text-xs">Role: Administrator Authorization Enforced</span>
        </div>

        <div className="ai-console-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`console-msg-row ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
              <div className="console-avatar">
                {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="console-bubble">
                <div
                  className="console-text"
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>')
                      .replace(/\n• /g, '<br/>• ')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {m.metricCard && (
                  <div className="console-metric-chip" style={{ marginTop: '12px' }}>
                    <Activity size={16} className="text-accent" />
                    <span className="metric-chip-title">{m.metricCard.title}:</span>
                    <strong className="metric-chip-val">{m.metricCard.value}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="console-msg-row msg-ai">
              <div className="console-avatar">
                <Bot size={16} />
              </div>
              <div className="console-bubble typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="console-input-bar"
        >
          <input
            type="text"
            className="console-input-field"
            placeholder="Ask anything (e.g. Which products sold the most? What is our total revenue?)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Ask Admin AI</span>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAIAssistant;
