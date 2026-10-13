import React, { useState } from 'react';
import { Topic, RootCauseTrace } from '../../types';
import { simulateMasteryRipple } from '../../engine/mastery';
import { Sliders, TrendingUp, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface WhatIfSimulatorProps {
  topics: Topic[];
  masteryMap: Record<string, number | null>;
  prereqsMap: Record<string, string[]>;
  rootCauses: RootCauseTrace[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  topics,
  masteryMap,
  prereqsMap,
  rootCauses
}) => {
  // Default to first root cause topic or first topic
  const defaultTargetId = rootCauses.length > 0 ? rootCauses[0].rootTopicId : topics[0]?.id || '';
  const [selectedTopicId, setSelectedTopicId] = useState<string>(defaultTargetId);
  const currentBaseMastery = Math.round(((masteryMap[selectedTopicId] ?? 0.35) * 100));
  const [hypotheticalScore, setHypotheticalScore] = useState<number>(Math.min(85, Math.max(70, currentBaseMastery + 35)));

  const selectedTopic = topics.find(t => t.id === selectedTopicId);

  // Compute projections
  const projections = simulateMasteryRipple(
    selectedTopicId,
    hypotheticalScore / 100,
    masteryMap,
    prereqsMap,
    topics
  );

  // Downstream affected topics
  const affectedTopics = topics.filter(t => t.id !== selectedTopicId && projections[t.id]?.delta > 0);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              Mastery What-If Simulator
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-medium">
              Predictive Ripple Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how strengthening foundational prerequisites propagates downstream to unlock advanced modules.
          </p>
        </div>

        {/* Topic Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 whitespace-nowrap">Focus Prerequisite:</label>
          <select
            value={selectedTopicId}
            onChange={e => {
              setSelectedTopicId(e.target.value);
              const cur = Math.round(((masteryMap[e.target.value] ?? 0.35) * 100));
              setHypotheticalScore(Math.min(90, Math.max(70, cur + 30)));
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {topics.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({masteryMap[t.id] !== null ? `${Math.round(masteryMap[t.id]! * 100)}%` : 'Unassessed'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Simulation Controls */}
      <div className="mt-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Target Mastery for: <strong className="text-purple-300">{selectedTopic?.name}</strong>
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-slate-500">Current: {currentBaseMastery}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-sm font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-950 border border-purple-600/40">
                  {hypotheticalScore}%
                </span>
              </div>
            </div>

            <input
              type="range"
              min={Math.max(10, currentBaseMastery)}
              max={100}
              value={hypotheticalScore}
              onChange={e => setHypotheticalScore(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>{Math.max(10, currentBaseMastery)}% (Current)</span>
              <span>50% (Passing)</span>
              <span>75% (Strong)</span>
              <span>100% (Mastery)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center gap-3 shrink-0">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-purple-300 font-medium">Foundation Leverage</div>
              <div className="text-base font-bold text-slate-100">
                +{hypotheticalScore - currentBaseMastery}% Mastery Push
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Downstream Projection Cards */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Predicted Ripple Effect on Dependent Modules ({affectedTopics.length} Affected)
          </h4>
          <span className="text-[11px] text-slate-500">
            Modeled via Bayesian Prerequisite Propagation
          </span>
        </div>

        {affectedTopics.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
            {selectedTopic?.name} is an endpoint leaf topic in the syllabus. Elevating it reinforces self-proficiency without unblocking other concepts.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {affectedTopics.map(topic => {
              const proj = projections[topic.id];
              const curPct = Math.round(proj.current * 100);
              const projPct = Math.round(proj.projected * 100);
              const deltaPct = Math.round(proj.delta * 100);

              return (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{topic.code}</span>
                    <span className="text-xs font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                      +{deltaPct}%
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-slate-200 line-clamp-1">{topic.name}</h5>

                  {/* Progress visualization */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>{curPct}%</span>
                      <span className="font-bold text-slate-200">{projPct}% projected</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                      {/* Current level */}
                      <div
                        className="h-full bg-slate-600 rounded-full absolute left-0 top-0"
                        style={{ width: `${curPct}%` }}
                      />
                      {/* Projected level */}
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full absolute left-0 top-0 opacity-80"
                        style={{ width: `${projPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
