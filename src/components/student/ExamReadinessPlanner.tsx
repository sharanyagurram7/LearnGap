import React, { useState, useMemo } from 'react';
import { Topic, LearningRecommendation } from '../../types';
import { Calendar, Clock, Target, CheckCircle2, AlertCircle, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

interface ExamReadinessPlannerProps {
  topics: Topic[];
  recommendations: LearningRecommendation[];
  subjectName: string;
}

export const ExamReadinessPlanner: React.FC<ExamReadinessPlannerProps> = ({
  topics,
  recommendations,
  subjectName
}) => {
  // Target exam date: default 14 days from now
  const defaultExamDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }, []);

  const [examDate, setExamDate] = useState<string>(defaultExamDate);
  const [dailyHours, setDailyHours] = useState<number>(2);

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    const target = new Date(examDate).getTime();
    const today = new Date().getTime();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }, [examDate]);

  const totalStudyHoursAvailable = daysRemaining * dailyHours;

  // Schedule construction: allocate high-priority topics into study days
  const schedule = useMemo(() => {
    const items: { day: number; date: string; topic: LearningRecommendation; allocatedHours: number; focus: string }[] = [];
    let currentTopicIndex = 0;
    const prioritized = recommendations.length > 0 ? recommendations : topics.map(t => ({
      topicId: t.id,
      topicName: t.name,
      subjectId: t.subjectId,
      priorityScore: 0.5,
      status: 'developing' as const,
      mastery: 0.6,
      isRootCause: false,
      dependentTopicNames: [],
      depth: t.depth,
      actionText: 'Revision Drill',
      estimatedMinutes: 30
    }));

    for (let day = 1; day <= Math.min(daysRemaining, 14); day++) {
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + day);
      const dateStr = scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

      const rec = prioritized[currentTopicIndex % prioritized.length];
      const hours = Math.min(dailyHours, 2.5);

      let focus = 'Prerequisite Mastery & Anti-Misconception Practice';
      if (rec.isRootCause) {
        focus = '🔥 Root Bottleneck Deconstruction & Core Examples';
      } else if (rec.depth === 0) {
        focus = 'Fundamental Formulae & Pointer/Schema Invariants';
      } else if (day >= daysRemaining - 2) {
        focus = 'Comprehensive Timed Re-assessment & Mock Questions';
      }

      items.push({
        day,
        date: dateStr,
        topic: rec,
        allocatedHours: hours,
        focus
      });

      // Advance topic after covering
      if (day % 2 === 0) {
        currentTopicIndex++;
      }
    }

    return items;
  }, [daysRemaining, dailyHours, recommendations, topics]);

  // Estimated readiness %
  const estimatedReadiness = Math.min(96, Math.max(50, 60 + Math.round((dailyHours * Math.min(daysRemaining, 14)) * 1.2)));

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              Exam-Readiness Adaptive Planner
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-medium">
              Root-Priority Ordered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamically sequences your study timeline based on foundational prerequisite leverage, not generic chronological order.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <label className="text-[11px] text-slate-400">Exam Date:</label>
            <input
              type="date"
              value={examDate}
              onChange={e => setExamDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <label className="text-[11px] text-slate-400">Daily Study:</label>
            <select
              value={dailyHours}
              onChange={e => setDailyHours(Number(e.target.value))}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={1} className="bg-slate-800">1 hr/day</option>
              <option value={2} className="bg-slate-800">2 hrs/day</option>
              <option value={3} className="bg-slate-800">3 hrs/day</option>
              <option value={4} className="bg-slate-800">4 hrs/day</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Days to Exam</span>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">{daysRemaining} Days</div>
          </div>
          <Calendar className="w-6 h-6 text-indigo-400 opacity-60" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Dedicated Budget</span>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">{totalStudyHoursAvailable} Hours</div>
          </div>
          <Clock className="w-6 h-6 text-cyan-400 opacity-60" />
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Projected Exam Readiness</span>
            <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">{estimatedReadiness}%</div>
          </div>
          <Sparkles className="w-6 h-6 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Generated Revision Schedule Table */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Automated Revision Roadmap ({schedule.length} Targeted Sessions)
          </h4>
          <span className="text-[11px] text-indigo-400 font-medium">
            Prioritized by Bottleneck Severity
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {schedule.map(item => (
            <div
              key={item.day}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                item.topic.isRootCause
                  ? 'bg-red-950/20 border-red-500/40 hover:bg-red-950/30'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">DAY</span>
                  <span className="text-xs font-bold text-slate-200 font-mono leading-none">{item.day}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {item.topic.topicName}
                    </span>
                    {item.topic.isRootCause && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 border border-red-500/30 text-red-300 font-bold">
                        Root Bottleneck
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="text-slate-500">{item.date}</span>
                    <span>•</span>
                    <span className="text-indigo-300">{item.focus}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
                  {item.allocatedHours} hrs
                </span>
                <span className="text-xs text-indigo-400 flex items-center gap-1 font-medium">
                  Assigned <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
