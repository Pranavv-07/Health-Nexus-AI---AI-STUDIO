import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { queryAi } from '../services/api.ts';
import {
  Activity,
  Bot,
  CornerDownLeft,
  HelpCircle,
  MessageSquare,
  Radio,
  Send,
  Sparkles,
  User,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  intent?: string;
  entities?: { phcs: string[]; resources: string[] };
  sources?: string[];
  suggestedFollowUps?: string[];
}

export const AiCopilotView: React.FC = () => {
  const { role, selectedPhcId, isAiConnected } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'gemini',
      text: `Hello! I am your **Health-Nexus AI Operations Copilot**, powered by Google Gemini and grounded in real-time PHC telemetry across your monitored health network.\n\nYou can ask me natural language operational questions such as:\n* "Which PHCs are at risk of medicine shortages within 48 hours?"\n* "Why is Guntur Rural PHC at critical risk?"\n* "What surplus beds or ORS stocks are available in nearby facilities?"\n* "Summarize today's critical healthcare risks."`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedFollowUps: [
        'Which PHCs are at risk of medicine shortages?',
        'Why is Guntur Rural at critical risk?',
        'What happens if patient footfall increases by 30%?'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await queryAi(q, role, selectedPhcId || undefined, 'Healthcare Officer');
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'gemini',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        entities: response.matchedEntities,
        sources: response.sources,
        suggestedFollowUps: response.suggestedFollowUps
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'gemini',
        text: 'I encountered an issue querying application telemetry. Falling back to deterministic operations mode.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which PHCs are at risk of medicine shortages within 5 days?',
    'Why is Guntur Rural PHC at critical risk?',
    'What resources are available nearby in Vijayawada?',
    'What happens if patient footfall increases by 30%?',
    'Summarize today\'s critical healthcare bottlenecks.'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Health-Nexus AI Operations Copilot
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Natural language healthcare resource intelligence grounded in live inventory, weather, disease vectors, and federated forecasts
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isAiConnected ? 'Gemini 3.8 Flash Active' : 'Demo AI Fallback Mode'}</span>
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col h-[620px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs font-sans shadow-lg ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-tr-none'
                      : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                  }`}
                >
                  {/* Message Body with markdown simulation */}
                  <div className="leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </div>

                  {/* Grounded Sources & Matched Entities */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-1">
                      <span className="text-cyan-400 font-bold block uppercase tracking-wider">
                        Grounded Data Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                        Suggested Follow-Up Prompts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(f)}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 transition-colors text-left"
                          >
                            ↳ {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="block text-[9px] font-mono text-slate-400 text-right">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-600/30 flex items-center justify-center text-cyan-400 animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Gemini is synthesizing live telemetry context...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts Strip */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-slate-400 whitespace-nowrap">
          <span className="text-slate-500 font-bold shrink-0">Prompts:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask Health-Nexus anything (e.g. 'Show me PHCs with ORS shortages within 5 days')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
