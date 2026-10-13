import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { StudentDashboard } from './components/student/StudentDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { HodDashboard } from './components/hod/HodDashboard';
import { DemoTourBar } from './components/common/DemoTourBar';
import { EngineTestModal } from './components/common/EngineTestModal';
import { AiCoachDrawer } from './components/common/AiCoachDrawer';
import { UserRole } from './types';
import {
  Brain,
  GraduationCap,
  Users,
  Shield,
  Layers,
  Cpu,
  Bot,
  Compass,
  CheckCircle2,
  Sparkles,
  Flame,
  ChevronDown
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    role,
    setRole,
    students,
    activeStudentId,
    setActiveStudentId,
    subjectTopics,
    pendingApprovals,
    activeStudent
  } = useApp();

  const [showTestsModal, setShowTestsModal] = useState<boolean>(false);
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [showDemoTour, setShowDemoTour] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  LearnGap <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">v2</span>
                </h1>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold hidden md:inline">
                  Deterministic Core Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Your LMS tells you what to do today. LearnGap proves why you're stuck and which earlier concept is the real cause.
              </p>
            </div>
          </div>

          {/* Role Switcher & Utilities */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Guided Tour Toggle */}
            <button
              onClick={() => setShowDemoTour(!showDemoTour)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                showDemoTour
                  ? 'bg-indigo-950 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Judge Demo Tour</span>
            </button>

            {/* Self-Tests Engine Modal Button */}
            <button
              onClick={() => setShowTestsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Inspect 5 Unit Tests"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Engine Tests (5/5)</span>
            </button>

            {/* Grounded AI Coach */}
            <button
              onClick={() => setShowAiDrawer(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
            >
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Coach</span>
            </button>

            {/* Role Switcher Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-0.5 text-xs">
              <button
                onClick={() => setRole('student')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                  role === 'student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                onClick={() => setRole('faculty')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 relative ${
                  role === 'faculty'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Faculty</span>
                {pendingApprovals.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => setRole('hod')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                  role === 'hod'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>HOD</span>
              </button>
            </div>

            {/* Student Switcher when in student view */}
            {role === 'student' && (
              <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                <span className="text-[11px] text-slate-500">Student:</span>
                <select
                  value={activeStudentId}
                  onChange={e => setActiveStudentId(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                      {s.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Judge 4-Minute Demo Walkthrough Bar */}
        {showDemoTour && <DemoTourBar />}

        {/* Role Content */}
        {role === 'student' && <StudentDashboard />}
        {role === 'faculty' && <FacultyDashboard />}
        {role === 'hod' && <HodDashboard />}
      </main>

      {/* Global AI Coach Drawer */}
      <AiCoachDrawer
        topic={subjectTopics[0]}
        isOpen={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
      />

      {/* Unit Tests Modal */}
      {showTestsModal && (
        <EngineTestModal onClose={() => setShowTestsModal(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>LearnGap v2 Engine</span>
            <span>•</span>
            <span>Evidence → Diagnosis → Action → Re-verification</span>
          </div>
          <div className="text-[11px]">
            BVRIT HYDERABAD College of Engineering for Women • CSE Department
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
