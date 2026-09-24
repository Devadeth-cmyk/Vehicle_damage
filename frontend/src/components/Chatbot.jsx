import React from 'react';
import { Bot, X, Send, Sparkles, FileText, ChevronRight } from 'lucide-react';
import { chatService } from '../services/api';

const Chatbot = ({ isOpen, onClose, claimId = null, vehicleInfo = null }) => {
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      sender: 'ai',
      text: claimId
        ? `Hello! I am your AI Insurance Assistant for Claim #${claimId}. How can I help you regarding your claim or policy?`
        : 'Hello! I am your AI Insurance Assistant. How can I help you with your motor insurance policy or claim procedure today?',
      sources: []
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuestion = input.trim();
    const userMsg = { id: Date.now(), sender: 'user', text: userQuestion };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let res;
      if (claimId) {
        res = await chatService.sendClaimMessage(claimId, userQuestion);
      } else {
        res = await chatService.sendMessage(userQuestion);
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.answer || res.response || res.message || 'I have processed your request based on your policy documents.',
        sources: res.sources || res.references || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an issue retrieving policy information. Please try again or contact your service center representative.',
        sources: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-4 text-white flex items-center justify-between shadow">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center border border-white/20">
            <Bot className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Insurance Assistant</h3>
            <p className="text-[11px] text-blue-200">RAG Powered Policy & Claim Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Claim Banner Context if applicable */}
      {claimId && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-800">
          <span className="font-semibold truncate">Active Claim Context: {claimId}</span>
          {vehicleInfo && <span className="text-blue-600 text-[11px]">{vehicleInfo}</span>}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
              }`}
            >
              {msg.text}
            </div>

            {/* Sources / Citations */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-1.5 max-w-[85%] bg-amber-50/90 border border-amber-200/80 rounded-xl p-2 text-[11px] text-amber-900">
                <div className="font-semibold text-amber-800 flex items-center space-x-1 mb-1">
                  <FileText className="w-3 h-3 text-amber-600" />
                  <span>Sources & Citations:</span>
                </div>
                <ul className="space-y-0.5 list-disc list-inside text-amber-700">
                  {msg.sources.map((src, i) => (
                    <li key={i} className="truncate">
                      {typeof src === 'string' ? src : `${src.document || 'Policy Doc'} - Page ${src.page || 'N/A'}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic bg-white p-3 rounded-2xl border border-slate-200 w-max">
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
            <span>Analyzing policy documents...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex space-x-1.5 overflow-x-auto text-[11px]">
        {['What is covered?', 'Required documents', 'Claim status explanation'].map((prompt, i) => (
          <button
            key={i}
            onClick={() => setInput(prompt)}
            className="whitespace-nowrap px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your policy or claim..."
          className="flex-1 text-sm bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
