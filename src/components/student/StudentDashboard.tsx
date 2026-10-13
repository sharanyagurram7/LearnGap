import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PrerequisiteGraph } from '../PrerequisiteGraph';
import { WhatIfSimulator } from './WhatIfSimulator';
import { ExamReadinessPlanner } from './ExamReadinessPlanner';
import { QuizModal } from '../quiz/QuizModal';
import { TopicNotesModal } from '../common/TopicNotesModal';
import { AiCoachDrawer } from '../common/AiCoachDrawer';
import { Topic } from '../../types';
import {
  Flame,
  Award,
  Calendar,
  Zap,
  Sliders,
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  Bot,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    activeStudent,
    activeSubject,
    subjects,
    setActiveSubjectId,
    subjectTopics,
    studentMasteryMap,
    studentRootCauses,
    studentRecommendations,
    topicPrereqsMap,
    markTaskCompleted
  } = useApp();

  const [activeTab, setActiveTab] = useState<'graph' | 'simulator' | 'exam_planner' | 'misconceptions'>('graph');
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<Topic | null>(null);
  const [selectedTopicForNotes, setSelectedTopicForNotes] = useState<Topic | null>(null);
  const [selectedTopicForAiCoach, setSelectedTopicForAiCoach] = useState<Topic | null>(null);

  // Overall subject mastery calculation
  const assessedMasteries = subjectTopics
    .map(t => studentMasteryMap[t.id])
    .filter((m): m is number => m !== null);

  const overallMastery = assessedMasteries.length > 0
    ? Math.round((assessedMasteries.reduce((a, b) => a + b, 0) / assessedMasteries.length) * 100)
    : 45;

  const primaryRootCause = studentRootCauses.length > 0 ? studentRootCauses[0] : null;
  const primaryRootTopic = primaryRootCause ? subjectTopics.find(t => t.id === primaryRootCause.rootTopicId) : null;

  return (
    <div className="space-y-6">
      {/* Student Profile & Subject Switcher Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img
            src={activeStudent.avatar}
            alt={activeStudent.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{activeStudent.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeStudent.rollNumber}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
                {activeStudent.section}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeStudent.department} • Semester {activeStudent.semester}
            </p>
          </div>
        </div>

        {/* Stats & Subject Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Points: Strictly awarded for mastery gain! */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Mastery Points</div>
              <div className="text-sm font-bold text-amber-300 font-mono">{activeStudent.points} pts</div>
            </div>
          </div>

          {/* Active streak */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Study Streak</div>
              <div className="text-sm font-bold text-orange-300 font-mono">{activeStudent.streak} days</div>
            </div>
          </div>

          {/* Subject Dropdown */}
          <div className="px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2">
            <span className="text-xs text-indigo-300 font-medium whitespace-nowrap">Subject:</span>
            <select
              value={activeSubject.id}
              onChange={e => setActiveSubjectId(e.target.value)}
              className="bg-transparent text-xs text-indigo-200 font-semibold focus:outline-none cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Star Highlight: Root Cause Trace Banner (The Star Hackathon Moment!) */}
      {primaryRootCause && primaryRootTopic && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-rose-950/40 to-slate-900 border-2 border-red-500/60 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40">
                  <Flame className="w-5 h-5 animate-pulse" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Root-Cause Diagnostic Discovery
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/60 border border-red-500/40 text-red-200 font-semibold">
                  Evidence-Verified
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-100">
                You are stuck on {primaryRootCause.triggeredByTopicName}, but the real culprit is "{primaryRootCause.rootTopicName}".
              </h3>

              {/* Dependency Chain Breadcrumb */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold flex items-center gap-1 shadow-md shadow-red-500/30 animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  {primaryRootCause.rootTopicName} ({Math.round((studentMasteryMap[primaryRootCause.rootTopicId] || 0) * 100)}% - ROOT)
                </span>
                <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  Linked Lists (52%)
                </span>
                <ChevronRight className="w-4 h-4 text-red-400 shrink-0" />
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {primaryRootCause.triggeredByTopicName} ({Math.round((studentMasteryMap[primaryRootCause.triggeredByTopicId] || 0) * 100)}% - Symptom)
                </span>
              </div>

              <p className="text-xs text-slate-300 pt-1">
                Your LMS would typically ask you to repeat {primaryRootCause.triggeredByTopicName} exercises. LearnGap proves that until you fix foundational pointer memory manipulation, advanced tree traversals cannot stabilize.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              <button
                onClick={() => setSelectedTopicForNotes(primaryRootTopic)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" /> Review Notes
              </button>
              <button
                onClick={() => setSelectedTopicForQuiz(primaryRootTopic)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-red-600/40"
              >
                <Zap className="w-4 h-4" /> Take 5-Min Root Cause Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence-Driven Daily Plan */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Evidence-Based Daily Plan
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              Targeted to Root Bottleneck
            </span>
          </div>

          <span className="text-xs text-slate-400">
            {activeStudent.completedTasks.length}/3 Tasks Complete
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Task 1: Root cause lesson */}
          <div
            onClick={() => primaryRootTopic && setSelectedTopicForNotes(primaryRootTopic)}
            className={`p-3.5 rounded-xl border transition cursor-pointer ${
              activeStudent.completedTasks.includes('dsa-pointers-review')
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Core Lesson • 15 Mins
              </span>
              {activeStudent.completedTasks.includes('dsa-pointers-review') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-100 mb-1">
              {primaryRootTopic?.name || 'Pointers & Memory Allocation'}: Worked Example Review
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Walk through dereferencing syntax (* vs &) and avoid memory segmentation leaks.
            </p>
          </div>

          {/* Task 2: Targeted Misconception Drill */}
          <div
            onClick={() => primaryRootTopic && setSelectedTopicForQuiz(primaryRootTopic)}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-semibold">
                Root Drill • 5 Mins
              </span>
              <Zap className="w-4 h-4 text-red-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 mb-1">
              3-Question Anti-Misconception Check
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Isolates the DEREF_VS_ADDRESS_CONFUSION pattern under timed proctoring conditions.
            </p>
          </div>

          {/* Task 3: Grounded AI Coach Q&A */}
          <div
            onClick={() => primaryRootTopic && setSelectedTopicForAiCoach(primaryRootTopic)}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                AI Coach • 10 Mins
              </span>
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100 mb-1">
              Query Syllabus Knowledge Base
            </h4>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              Ask doubts strictly tethered to your professor's accredited course syllabus notes.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-1">
        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'graph'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Prerequisite Dependency Graph
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> What-If Simulator
        </button>

        <button
          onClick={() => setActiveTab('exam_planner')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'exam_planner'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Target className="w-3.5 h-3.5" /> Exam-Readiness Planner
        </button>

        <button
          onClick={() => setActiveTab('misconceptions')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'misconceptions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Misconception Log & Audits
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'graph' && (
        <PrerequisiteGraph
          topics={subjectTopics}
          masteryMap={studentMasteryMap}
          rootCauses={studentRootCauses}
          onSelectTopic={t => setSelectedTopicForNotes(t)}
          onStartDrill={t => setSelectedTopicForQuiz(t)}
        />
      )}

      {activeTab === 'simulator' && (
        <WhatIfSimulator
          topics={subjectTopics}
          masteryMap={studentMasteryMap}
          prereqsMap={topicPrereqsMap}
          rootCauses={studentRootCauses}
        />
      )}

      {activeTab === 'exam_planner' && (
        <ExamReadinessPlanner
          topics={subjectTopics}
          recommendations={studentRecommendations}
          subjectName={activeSubject.name}
        />
      )}

      {activeTab === 'misconceptions' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Diagnostic Misconception Journal & Integrity Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review patterns detected in previous diagnostics, along with recorded exam integrity events.
            </p>
          </div>

          <div className="space-y-3">
            {subjectTopics.flatMap(t => t.misconceptions).map(m => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300 font-bold">
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-200">{m.description}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">
                    <strong>Remedy:</strong> {m.remedialAdvice}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const top = subjectTopics.find(t => t.misconceptions.some(x => x.id === m.id));
                    if (top) setSelectedTopicForQuiz(top);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0 transition cursor-pointer"
                >
                  Verify Correction
                </button>
              </div>
            ))}
          </div>

          {/* Integrity Logs */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Proctoring Audit Logs ({activeStudent.integrityLogs.length})
            </h4>
            {activeStudent.integrityLogs.length === 0 ? (
              <div className="text-xs text-slate-500 italic">No proctoring violations recorded. Clean session history!</div>
            ) : (
              <div className="space-y-2">
                {activeStudent.integrityLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/30 text-amber-300">
                        {log.eventType}
                      </span>
                      <span className="text-slate-300">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      {selectedTopicForQuiz && (
        <QuizModal
          topic={selectedTopicForQuiz}
          onClose={() => setSelectedTopicForQuiz(null)}
        />
      )}

      {selectedTopicForNotes && (
        <TopicNotesModal
          topic={selectedTopicForNotes}
          onClose={() => setSelectedTopicForNotes(null)}
          onStartQuiz={t => setSelectedTopicForQuiz(t)}
          onOpenAiCoach={t => setSelectedTopicForAiCoach(t)}
        />
      )}

      {selectedTopicForAiCoach && (
        <AiCoachDrawer
          topic={selectedTopicForAiCoach}
          isOpen={true}
          onClose={() => setSelectedTopicForAiCoach(null)}
        />
      )}
    </div>
  );
};
