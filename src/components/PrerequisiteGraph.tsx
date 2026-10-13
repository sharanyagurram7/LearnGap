import React, { useState, useMemo } from 'react';
import { Topic, MasteryStatus, RootCauseTrace } from '../types';
import { getMasteryStatus } from '../engine/mastery';
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';

interface PrerequisiteGraphProps {
  topics: Topic[];
  masteryMap: Record<string, number | null>;
  rootCauses: RootCauseTrace[];
  onSelectTopic: (topic: Topic) => void;
  onStartDrill?: (topic: Topic) => void;
}

export const PrerequisiteGraph: React.FC<PrerequisiteGraphProps> = ({
  topics,
  masteryMap,
  rootCauses,
  onSelectTopic,
  onStartDrill
}) => {
  const [highlightRootId, setHighlightRootId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Group topics by depth level for clean layered DAG layout
  const depthColumns = useMemo(() => {
    const columns: Record<number, Topic[]> = {};
    for (const t of topics) {
      if (!columns[t.depth]) columns[t.depth] = [];
      columns[t.depth].push(t);
    }
    const maxDepth = Math.max(...topics.map(t => t.depth), 0);
    const sortedDepths = Array.from({ length: maxDepth + 1 }, (_, i) => i);
    return { columns, sortedDepths };
  }, [topics]);

  // Set of root cause topic IDs
  const rootCauseIds = useMemo(() => new Set(rootCauses.map(r => r.rootTopicId)), [rootCauses]);

  // Set of symptom topic IDs that triggered a root cause
  const symptomTopicIds = useMemo(() => new Set(rootCauses.map(r => r.triggeredByTopicId)), [rootCauses]);

  // Status color badge helper
  const getStatusVisuals = (status: MasteryStatus, isRoot: boolean) => {
    if (isRoot) {
      return {
        border: 'border-red-500 shadow-lg shadow-red-500/20 ring-2 ring-red-500/50',
        bg: 'bg-red-950/40 hover:bg-red-950/60',
        badgeBg: 'bg-red-500 text-white font-bold',
        badgeText: 'ROOT BOTTLENECK',
        dot: 'bg-red-500'
      };
    }
    switch (status) {
      case 'critical':
        return {
          border: 'border-rose-600/70',
          bg: 'bg-rose-950/30 hover:bg-rose-950/50',
          badgeBg: 'bg-rose-900/60 text-rose-300',
          badgeText: 'Critical (<40%)',
          dot: 'bg-rose-500'
        };
      case 'weak':
        return {
          border: 'border-amber-500/70',
          bg: 'bg-amber-950/30 hover:bg-amber-950/50',
          badgeBg: 'bg-amber-900/60 text-amber-300',
          badgeText: 'Weak (40-59%)',
          dot: 'bg-amber-500'
        };
      case 'developing':
        return {
          border: 'border-cyan-500/70',
          bg: 'bg-cyan-950/30 hover:bg-cyan-950/50',
          badgeBg: 'bg-cyan-900/60 text-cyan-300',
          badgeText: 'Developing (60-74%)',
          dot: 'bg-cyan-400'
        };
      case 'strong':
        return {
          border: 'border-emerald-500/70',
          bg: 'bg-emerald-950/30 hover:bg-emerald-950/50',
          badgeBg: 'bg-emerald-900/60 text-emerald-300',
          badgeText: 'Strong (≥75%)',
          dot: 'bg-emerald-500'
        };
      case 'unassessed':
      default:
        return {
          border: 'border-slate-700',
          bg: 'bg-slate-900/40 hover:bg-slate-800/60',
          badgeBg: 'bg-slate-800 text-slate-400',
          badgeText: 'Not Assessed',
          dot: 'bg-slate-500'
        };
    }
  };

  const activeHighlightedTopic = topics.find(t => t.id === (selectedTopicId || highlightRootId));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              Prerequisite Dependency Graph & Root-Cause Tracer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Directed Acyclic Graph (DAG) of foundational concepts. Red pulsing nodes isolate verified root causes.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-medium animate-pulse">
            <Flame className="w-3.5 h-3.5 text-red-400" /> Root Cause
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Weak
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-600/40 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Developing
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-600/40 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Strong
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Not Assessed
          </span>
        </div>
      </div>

      {/* Root cause callout banner if active */}
      {rootCauses.length > 0 && (
        <div className="mt-4 p-3.5 bg-gradient-to-r from-red-950/50 via-rose-950/30 to-slate-900 border border-red-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-red-400">Diagnostic Verdict</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  {rootCauses.length} Root Cause{rootCauses.length > 1 ? 's' : ''} Detected
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 mt-0.5">
                {rootCauses[0].explanation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const topic = topics.find(t => t.id === rootCauses[0].rootTopicId);
                if (topic && onStartDrill) onStartDrill(topic);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" /> Drill Root Cause Now
            </button>
          </div>
        </div>
      )}

      {/* Graph Visual Grid */}
      <div className="mt-5 overflow-x-auto pb-4">
        <div className="min-w-[760px] grid grid-cols-5 gap-4 relative">
          {depthColumns.sortedDepths.map(depth => {
            const depthTopics = depthColumns.columns[depth] || [];
            return (
              <div key={depth} className="flex flex-col gap-3">
                {/* Column Header */}
                <div className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 text-center">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {depth === 0 ? 'Foundation' : `Depth ${depth}`}
                  </span>
                </div>

                {/* Topic Cards */}
                <div className="flex flex-col gap-3">
                  {depthTopics.map(topic => {
                    const mastery = masteryMap[topic.id];
                    const status = getMasteryStatus(mastery);
                    const isRoot = rootCauseIds.has(topic.id);
                    const isSymptom = symptomTopicIds.has(topic.id);
                    const isSelected = selectedTopicId === topic.id;
                    const visuals = getStatusVisuals(status, isRoot);

                    const scoreFormatted = mastery !== null ? `${Math.round(mastery * 100)}%` : 'N/A';

                    return (
                      <div
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          onSelectTopic(topic);
                        }}
                        className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative group ${
                          visuals.bg
                        } ${visuals.border} ${
                          isRoot ? 'animate-pulse-glow' : ''
                        } ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : ''}`}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                            {topic.code}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${visuals.badgeBg}`}>
                            {scoreFormatted}
                          </span>
                        </div>

                        {/* Topic Name */}
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {topic.name}
                        </h4>

                        {/* Indicators for Root or Symptom */}
                        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60">
                          {isRoot ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400">
                              <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                              Root Cause
                            </span>
                          ) : isSymptom ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Struggling Symptom
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 capitalize">
                              <span className={`w-1.5 h-1.5 rounded-full ${visuals.dot}`} />
                              {status}
                            </span>
                          )}

                          {topic.prerequisites.length > 0 && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {topic.prerequisites.length} prereq{topic.prerequisites.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Quick hover action */}
                        <div className="mt-2 hidden group-hover:flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-800/80 text-[11px] text-indigo-400 font-medium">
                          <span>Inspect details</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Topic Quick Inspector */}
      {activeHighlightedTopic && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                {activeHighlightedTopic.code}
              </span>
              <h4 className="text-sm font-bold text-slate-100">
                {activeHighlightedTopic.name}
              </h4>
              <span className="text-xs text-slate-400">
                (Mastery: {masteryMap[activeHighlightedTopic.id] !== null ? `${Math.round(masteryMap[activeHighlightedTopic.id]! * 100)}%` : 'Not Assessed'})
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl">
              {activeHighlightedTopic.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectTopic(activeHighlightedTopic)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Lesson & Notes
            </button>
            {onStartDrill && (
              <button
                onClick={() => onStartDrill(activeHighlightedTopic)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <Zap className="w-3.5 h-3.5" /> Practice Drill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
