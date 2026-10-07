import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import aiService from '../../services/aiService';
import { Sparkles, X, Send, ExternalLink, Bot, User, ArrowRight } from 'lucide-react';

const DEFAULT_SUGGESTIONS = [
  'Find a phone under ₹50,000',
  'Compare laptops for programming',
  'Help me choose a gift under ₹3,000',
  'Show recommended trending products',
];

const AIShoppingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am **ShopSphere AI**, your intelligent shopping concierge. How can I help you discover the perfect products today?',
      products: [],
      suggestedQuestions: DEFAULT_SUGGESTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    // Append user message
    const userMsg = { sender: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.aiChat(textToSend.trim());
      if (res.success) {
        const aiMsg = {
          sender: 'ai',
          text: res.reply,
          products: res.recommendedProducts || [],
          suggestedQuestions: res.suggestedQuestions || DEFAULT_SUGGESTIONS,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I apologize, I am temporarily having trouble reaching the product database. Please try another question.',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-wrapper">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="ai-floating-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Shopping Assistant"
        >
          <div className="ai-btn-glow" />
          <Sparkles size={20} className="ai-sparkle-spin" />
          <span className="ai-btn-text">Ask ShopSphere AI</span>
        </button>
      )}

      {/* Chat Window Drawer / Modal */}
      {isOpen && (
        <div className="ai-chat-window card" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar-badge">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="ai-chat-title">ShopSphere AI</h3>
                <span className="ai-chat-status">
                  <span className="status-indicator-dot" /> Online • Live Catalog Grounded
                </span>
              </div>
            </div>
            <button
              className="ai-chat-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message-row ${msg.sender === 'user' ? 'message-user' : 'message-ai'}`}>
                <div className="message-avatar">
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className="message-bubble">
                  <div className="message-text-content" dangerouslySetInnerHTML={{ __html: formatMessageMarkdown(msg.text) }} />

                  {/* Recommended Products Carousel / List */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="message-products-grid">
                      {msg.products.map((prod) => (
                        <div key={prod._id} className="chat-product-card card">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                            alt={prod.name}
                            className="chat-product-thumb"
                          />
                          <div className="chat-product-info">
                            <h4 className="chat-product-name" title={prod.name}>
                              {prod.name}
                            </h4>
                            <div className="chat-product-meta">
                              <span className="chat-product-price">₹{Number(prod.price).toLocaleString('en-IN')}</span>
                              {prod.rating && <span className="chat-product-rating">⭐ {prod.rating}</span>}
                            </div>
                            <Link
                              to={`/products/${prod._id}`}
                              className="btn btn-outline btn-xs chat-view-btn"
                              onClick={() => setIsOpen(false)}
                            >
                              <span>View</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-up Questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="message-suggestions-box">
                      <span className="suggestions-title">Suggested questions:</span>
                      <div className="suggestions-list">
                        {msg.suggestedQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            type="button"
                            className="suggestion-chip"
                            onClick={() => handleSend(q)}
                          >
                            <span>{q}</span>
                            <ArrowRight size={11} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message-row message-ai">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="ai-chat-input-bar"
          >
            <input
              type="text"
              placeholder="Ask about products, comparisons, gift ideas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="ai-chat-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary ai-send-btn"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// Simple Markdown bold & bullet formatter for safe display
function formatMessageMarkdown(text = '') {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n• /g, '<br/>• ')
    .replace(/\n/g, '<br/>');
}

export default AIShoppingAssistant;
