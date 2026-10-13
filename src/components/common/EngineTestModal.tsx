import React from 'react';
import { runEngineSelfTests } from '../../engine/mastery.test';
import { CheckCircle2, XCircle, X, ShieldCheck, Cpu } from 'lucide-react';

interface EngineTestModalProps {
  onClose: () => void;
}

export const EngineTestModal: React.FC<EngineTestModalProps> = ({ onClose }) => {
  const testResults = runEngineSelfTests();
  const allPassed = testResults.every(t => t.passed);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Deterministic Engine Self-Verification</span>
              {allPassed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold">
                  5/5 Unit Tests Passing
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Built on mathematical Bayesian inference & acyclic DAG traversal without live cloud dependencies.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 my-4">
          {testResults.map((test, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">{test.name}</span>
                {test.passed ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                    <XCircle className="w-3.5 h-3.5" /> FAIL
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{test.message}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
