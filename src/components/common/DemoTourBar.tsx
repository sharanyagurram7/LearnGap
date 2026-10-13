import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';

export const DemoTourBar: React.FC = () => {
  const {
    demoStep,
    setDemoStep,
    nextDemoStep,
    prevDemoStep,
    resetDemoData,
    setRole,
    setActiveStudentId,
    setActiveSubjectId
  } = useApp();

  const steps = [
    {
      step: 1,
      title: 'Step 1: Student Assessment Profile',
      desc: 'Ananya Sharma has failing scores in Trees and Linked Lists.',
      action: () => {
        setRole('student');
        setActiveStudentId('stud-ananya');
        setActiveSubjectId('dsa');
      }
    },
    {
      step: 2,
      title: 'Step 2: Discover Hidden Learning Gap',
      desc: 'The prerequisite DAG reveals the REAL root cause is Pointers (32%), not Trees!',
      action: () => {
        setRole('student');
        setActiveStudentId('stud-ananya');
        setActiveSubjectId('dsa');
      }
    },
    {
      step: 3,
      title: 'Step 3: Root-Cause Remediation Plan',
      desc: 'Daily plan recommends worked example on Pointer dereferencing (* vs &).',
      action: () => {
        setRole('student');
        setActiveStudentId('stud-ananya');
        setActiveSubjectId('dsa');
      }
    },
    {
      step: 4,
      title: 'Step 4: Proctoring & Misconception Drill',
      desc: 'Proctored quiz tests misconception isolation and tracks tab switching.',
      action: () => {
        setRole('student');
      }
    },
    {
      step: 5,
      title: 'Step 5: Verified Learning Loop',
      desc: 'Instant Bayesian recalculation proves mastery gain (+32%) and updates faculty heatmap.',
      action: () => {
        setRole('faculty');
      }
    }
  ];

  const currentStepData = steps[demoStep - 1] || steps[0];

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-2xl p-4 shadow-2xl mb-6 relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Step indicator */}
        <div className="flex items-start md:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
                Judge 4-Min Demo Tour
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Step {demoStep} of 5
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-100 mt-0.5">
              {currentStepData.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              {currentStepData.desc}
            </p>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            onClick={() => {
              resetDemoData();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset to initial state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              prevDemoStep();
              steps[demoStep - 2]?.action();
            }}
            disabled={demoStep === 1}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Prev
          </button>

          <button
            onClick={() => {
              if (demoStep < 5) {
                nextDemoStep();
                steps[demoStep]?.action();
              } else {
                setDemoStep(1);
                steps[0].action();
              }
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/40"
          >
            <span>{demoStep === 5 ? 'Restart Tour' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${(demoStep / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};
