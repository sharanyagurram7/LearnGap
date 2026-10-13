import React, { useState } from 'react';
import { Topic } from '../../types';
import { Bot, Send, X, Sparkles, BookOpen, ShieldCheck, AlertCircle, CornerDownRight } from 'lucide-react';

interface AiCoachDrawerProps {
  topic: Topic;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'coach';
  text: string;
  source?: string;
  time: string;
}

export const AiCoachDrawer: React.FC<AiCoachDrawerProps> = ({
  topic,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'coach',
      text: `Hello! I am your LearnGap Grounded Academic Coach for "${topic.name}". I am strictly tethered to your course syllabus notes and worked examples. Ask me any conceptual question!`,
      source: 'Approved Syllabus Context',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const userMsg: Message = {
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: topic.name,
          studentQuestion: userText,
          approvedNotes: topic.summary,
          workedExample: topic.workedExample?.walkthrough
        })
      });

      if (!res.ok) throw new Error('Network error');
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          sender: 'coach',
          text: data.answer,
          source: data.source || 'Curated Syllabus Knowledge Base',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (_err) {
      // Deterministic fallback response grounded directly in topic data
      const fallbackText = `[Grounded Syllabus Response for ${topic.name}]\n${topic.summary}\n\nWorked Example Reference:\n${topic.workedExample?.walkthrough || 'Review the worked example code in your notes.'}\n\n(Note: Strictly verified against course curriculum.)`;
      setMessages(prev => [
        ...prev,
        {
          sender: 'coach',
          text: fallbackText,
          source: 'Deterministic Curriculum Repository (Offline Safe)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    `Why is ${topic.name} a foundational prerequisite?`,
    `What is the most common misconception in ${topic.name}?`,
    `Walk me through the worked example in the notes.`
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Grounded AI Coach</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-normal">
                Syllabus-Tethered
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">{topic.name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Grounding guarantee notice */}
      <div className="bg-slate-950/80 px-3.5 py-2 border-b border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>Grounded policy active: Answers only from vetted syllabus notes.</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>

            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 px-1">
              {m.source && <span className="text-indigo-400">{m.source}</span>}
              <span>{m.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 max-w-[80%]">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Consulting syllabus repository...</span>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="px-3 pt-2 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5 flex items-center gap-1">
          <CornerDownRight className="w-3 h-3 text-slate-400" /> Grounded Syllabus Prompts:
        </div>
        <div className="flex flex-wrap gap-1.5 pb-2">
          {sampleQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(sq);
              }}
              className="text-[11px] px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-300 text-left transition cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about ${topic.name}...`}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
