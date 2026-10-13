import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateStudentRisk } from '../../engine/mastery';
import {
  GraduationCap,
  AlertTriangle,
  Printer,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Flame,
  FileText,
  BarChart3,
  CheckCircle2,
  Users,
  Search,
  Download
} from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const {
    students,
    subjects,
    topics,
    attempts,
    studentMasteryMap,
    topicPrereqsMap,
    studentRootCauses,
    setActiveStudentId,
    setRole
  } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Compute risk predictions for all students
  const riskWatchlist = useMemo(() => {
    return students.map(student => {
      // Find topics for DSA
      const dsaTopics = topics.filter(t => t.subjectId === 'dsa');
      const risk = evaluateStudentRisk(student, dsaTopics, studentMasteryMap, studentRootCauses);
      return {
        student,
        risk
      };
    }).sort((a, b) => b.risk.riskScore - a.risk.riskScore);
  }, [students, topics, studentMasteryMap, studentRootCauses]);

  // High risk students count
  const highRiskCount = riskWatchlist.filter(r => r.risk.riskLevel === 'HIGH').length;
  const moderateRiskCount = riskWatchlist.filter(r => r.risk.riskLevel === 'MODERATE').length;
  const lowRiskCount = riskWatchlist.filter(r => r.risk.riskLevel === 'LOW').length;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Department Head (HOD) Oversight
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold">
              CSE Department
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional early-warning risk radar & prerequisite health metrics.
          </p>
        </div>

        <button
          onClick={() => setShowPrintModal(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-700"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span>Export Department Diagnostic Audit (PDF)</span>
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Students</span>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-0.5">{students.length}</div>
            <span className="text-[11px] text-slate-500">Across 2 Sections</span>
          </div>
          <Users className="w-7 h-7 text-indigo-400 opacity-60" />
        </div>

        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">High Risk Interventions</span>
            <div className="text-2xl font-bold text-red-300 font-mono mt-0.5">{highRiskCount}</div>
            <span className="text-[11px] text-red-400/80">Require Root-Prerequisite Focus</span>
          </div>
          <AlertTriangle className="w-7 h-7 text-red-400 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Moderate Risk</span>
            <div className="text-2xl font-bold text-amber-300 font-mono mt-0.5">{moderateRiskCount}</div>
            <span className="text-[11px] text-amber-400/80">Developing Proficiency</span>
          </div>
          <TrendingDown className="w-7 h-7 text-amber-400 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Satisfactory / Strong</span>
            <div className="text-2xl font-bold text-emerald-300 font-mono mt-0.5">{lowRiskCount}</div>
            <span className="text-[11px] text-emerald-400/80">Consistent Retention</span>
          </div>
          <TrendingUp className="w-7 h-7 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* High-Risk Student Watchlist (With Explainable Factors!) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Explainable Early-Warning Risk Radar</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transparent multi-factor regression: displays exact root-cause drivers rather than opaque black-box labels.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          {riskWatchlist
            .filter(r => r.student.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(({ student, risk }) => {
              const isHigh = risk.riskLevel === 'HIGH';
              const isMod = risk.riskLevel === 'MODERATE';

              return (
                <div
                  key={student.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isHigh
                      ? 'bg-red-950/20 border-red-500/50 hover:bg-red-950/30'
                      : isMod
                      ? 'bg-amber-950/10 border-amber-500/40 hover:bg-amber-950/20'
                      : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{student.name}</span>
                      <span className="font-mono text-xs text-slate-400">({student.rollNumber})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                        isHigh ? 'bg-red-950 border border-red-500/40 text-red-300' :
                        isMod ? 'bg-amber-950 border border-amber-500/40 text-amber-300' :
                        'bg-emerald-950 text-emerald-300'
                      }`}>
                        {risk.riskLevel} RISK ({risk.riskScore}/100)
                      </span>
                    </div>

                    {/* Top Drivers Explanation */}
                    <div className="space-y-1 pt-1">
                      {risk.topReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <span className="text-red-400 font-bold">•</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics and Action */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 block uppercase">Projected Exam</span>
                      <span className={`text-base font-bold ${risk.projectedExamScore < 50 ? 'text-red-400' : 'text-slate-200'}`}>
                        {risk.projectedExamScore}%
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 block uppercase">Attendance</span>
                      <span className={`text-base font-bold ${student.attendanceRate < 0.75 ? 'text-amber-400' : 'text-slate-200'}`}>
                        {Math.round(student.attendanceRate * 100)}%
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveStudentId(student.id);
                        setRole('student');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      View Student Graph
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Printable Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Department Diagnostic Gap Audit Report</span>
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="bg-white text-slate-900 p-6 rounded-xl space-y-4 text-xs font-sans">
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    BVRIT HYDERABAD College of Engineering for Women
                  </h1>
                  <h2 className="text-sm font-semibold text-slate-700">
                    Department of Computer Science & Engineering • Academic Gap Audit
                  </h2>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div>Report ID: LG-AUDIT-2026-01</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                  1. Executive Diagnostic Summary
                </h3>
                <p className="leading-relaxed text-slate-700">
                  LearnGap v2 evaluated 24 active students across Data Structures & Algorithms (CS301). 
                  Rather than surface-level failures in hierarchical structures (Trees & BST), diagnostic tracing identified 
                  that <strong>Pointers & Dynamic Memory Allocation</strong> is the foundational root-cause bottleneck impacting 
                  downstream concepts.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                  2. Identified Root Cause Bottlenecks
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li><strong>DSA-01 (Pointers):</strong> 38% average cohort mastery. Misconception pattern DEREF_VS_ADDRESS_CONFUSION diagnosed in 14 students.</li>
                  <li><strong>DSA-02 (Linked Lists):</strong> 54% mastery. Orphaned pointer reassignments during head insertions.</li>
                  <li><strong>DBMS-02 (Keys & Constraints):</strong> Misconception regarding Primary Key nullability.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 uppercase text-[11px] mb-1">
                  3. Faculty Intervention Directives
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  1. Mandate a 30-minute re-teach workshop on Pointer Memory Semantics (* vs &).<br />
                  2. Distribute personalized mentor nudges to the 4 students identified in the High-Risk category.<br />
                  3. Conduct a targeted re-assessment check before semester mid-terms.
                </p>
              </div>

              <div className="pt-4 border-t flex justify-between text-[11px] font-semibold text-slate-600">
                <div>Prepared by: LearnGap Diagnostic Engine</div>
                <div>Authorized by: Head of Department (CSE)</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handlePrintReport}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
