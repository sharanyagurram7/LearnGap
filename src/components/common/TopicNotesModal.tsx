import React, { useState } from 'react';
import { Topic } from '../../types';
import {
  X,
  BookOpen,
  Video,
  Languages,
  Zap,
  Bot,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TopicNotesModalProps {
  topic: Topic;
  onClose: () => void;
  onStartQuiz: (topic: Topic) => void;
  onOpenAiCoach: (topic: Topic) => void;
}

export const TopicNotesModal: React.FC<TopicNotesModalProps> = ({
  topic,
  onClose,
  onStartQuiz,
  onOpenAiCoach
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'example' | 'bilingual' | 'misconceptions'>('notes');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
              {topic.code}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">{topic.name}</h3>
              <p className="text-xs text-slate-400">
                Syllabus Depth Level: {topic.depth === 0 ? 'Foundation' : `Tier ${topic.depth}`} • {topic.prerequisites.length} Prerequisites
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAiCoach(topic)}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" /> AI Coach
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pt-3 pb-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Core Notes & Video
          </button>
          <button
            onClick={() => setActiveTab('example')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'example'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Worked Example
          </button>
          <button
            onClick={() => setActiveTab('bilingual')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'bilingual'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            हिन्दी (Bilingual)
          </button>
          <button
            onClick={() => setActiveTab('misconceptions')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'misconceptions'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Misconception Traps ({topic.misconceptions.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 text-xs text-slate-300 space-y-4">
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 leading-relaxed text-slate-200 text-sm">
                {topic.summary}
              </div>

              {/* Curated Video resource */}
              {topic.videoResource && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-red-600/20 text-red-400 border border-red-600/30 shrink-0">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                        Approved Video Reference
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-0.5">{topic.videoResource.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {topic.videoResource.channel} • {topic.videoResource.duration}
                      </p>
                    </div>
                  </div>

                  <a
                    href={topic.videoResource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                  >
                    <span>Watch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === 'example' && topic.workedExample && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                  Problem Challenge
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-0.5 mb-1.5">
                  {topic.workedExample.title}
                </h4>
                <p className="text-xs text-slate-300">{topic.workedExample.problem}</p>
              </div>

              {topic.workedExample.code && (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                  <code>{topic.workedExample.code}</code>
                </pre>
              )}

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                <span className="font-bold text-indigo-300 block mb-1">Pedagogical Walkthrough:</span>
                <p className="leading-relaxed">{topic.workedExample.walkthrough}</p>
              </div>
            </div>
          )}

          {activeTab === 'bilingual' && topic.bilingualNotes && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs leading-relaxed">
                <span className="font-bold text-amber-300 block mb-1 flex items-center gap-1.5">
                  <Languages className="w-4 h-4" /> मुख्य अवधारणा (Core Concept):
                </span>
                <p className="text-sm text-slate-200">{topic.bilingualNotes.summary}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-indigo-300 block mb-1">💡 महत्वपूर्ण सीख (Key Takeaway):</span>
                <p>{topic.bilingualNotes.keyConceptTakeaway}</p>
              </div>
            </div>
          )}

          {activeTab === 'misconceptions' && (
            <div className="space-y-3">
              {topic.misconceptions.map(misc => (
                <div
                  key={misc.id}
                  className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold">
                      {misc.tag}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium">{misc.description}</p>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-emerald-300">
                    <strong>Remedial Correction:</strong> {misc.remedialAdvice}
                  </div>
                  {misc.remedialExample && (
                    <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded">
                      {misc.remedialExample}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close Notes
          </button>

          <button
            onClick={() => {
              onClose();
              onStartQuiz(topic);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Zap className="w-4 h-4" /> Take Misconception Drill
          </button>
        </div>
      </div>
    </div>
  );
};
