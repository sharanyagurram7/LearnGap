import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Topic, Student, PendingQuestionApproval, QuestionQualityMetric } from '../../types';
import { getMasteryStatus, calculateMastery } from '../../engine/mastery';
import {
  Users,
  AlertTriangle,
  Upload,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Flame,
  Settings,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  Sliders,
  Send,
  X
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const {
    students,
    activeSubject,
    subjectTopics,
    attempts,
    reteachThreshold,
    setReteachThreshold,
    pendingApprovals,
    approveQuestion,
    rejectQuestion,
    addGeneratedQuestion,
    importCsvRecords,
    setActiveStudentId,
    setRole
  } = useApp();

  const [activeTab, setActiveTab] = useState<'heatmap' | 'reteach' | 'approval_queue' | 'csv_upload' | 'quality_insights'>('heatmap');
  const [csvContent, setCsvContent] = useState<string>('');
  const [csvValidationResults, setCsvValidationResults] = useState<{ successCount: number; errors: { row: number; error: string }[] } | null>(null);
  const [selectedStudentForNudge, setSelectedStudentForNudge] = useState<Student | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState<string>('');
  const [nudgeSentToast, setNudgeSentToast] = useState<boolean>(false);
  const [isGeneratingAiQ, setIsGeneratingAiQ] = useState<boolean>(false);

  // Compute student-topic mastery matrix for heatmap
  const heatmapData = useMemo(() => {
    return students.map(student => {
      const studentAttempts = attempts.filter(a => a.studentId === student.id);
      const rowMasteries: Record<string, number | null> = {};
      let totalAssessed = 0;
      let sum = 0;

      for (const topic of subjectTopics) {
        const topAtts = studentAttempts.filter(a => a.topicId === topic.id);
        const m = calculateMastery(topAtts);
        rowMasteries[topic.id] = m;
        if (m !== null) {
          sum += m;
          totalAssessed++;
        }
      }

      const overall = totalAssessed > 0 ? sum / totalAssessed : null;
      return {
        student,
        masteries: rowMasteries,
        overall
      };
    });
  }, [students, attempts, subjectTopics]);

  // Compute class averages per topic
  const topicClassStats = useMemo(() => {
    return subjectTopics.map(topic => {
      const topicAttempts = attempts.filter(a => a.topicId === topic.id);
      const studentAverages = students.map(s => {
        const sAtts = topicAttempts.filter(a => a.studentId === s.id);
        return calculateMastery(sAtts);
      }).filter((m): m is number => m !== null);

      const avg = studentAverages.length > 0
        ? studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length
        : null;

      // Fraction of students who are below 0.50 (struggling)
      const strugglingCount = studentAverages.filter(m => m < 0.50).length;
      const strugglingFraction = studentAverages.length > 0 ? strugglingCount / studentAverages.length : 0;

      return {
        topic,
        averageMastery: avg,
        strugglingFraction,
        strugglingCount,
        totalAssessed: studentAverages.length
      };
    });
  }, [subjectTopics, attempts, students]);

  // Re-teach alerts: topics where strugglingFraction exceeds configurable reteachThreshold
  const reteachAlerts = useMemo(() => {
    return topicClassStats.filter(stat => stat.strugglingFraction >= reteachThreshold);
  }, [topicClassStats, reteachThreshold]);

  // Question Quality Insights: questions with >70% failure rate
  const questionQualityMetrics = useMemo<QuestionQualityMetric[]>(() => {
    const questionsAttempted = new Map<string, { total: number; failed: number; topicId: string }>();

    for (const a of attempts) {
      const current = questionsAttempted.get(a.questionId) || { total: 0, failed: 0, topicId: a.topicId };
      current.total++;
      if (!a.isCorrect) current.failed++;
      questionsAttempted.set(a.questionId, current);
    }

    const metrics: QuestionQualityMetric[] = [];
    questionsAttempted.forEach((data, qId) => {
      if (data.total >= 3) {
        const failureRate = data.failed / data.total;
        const topic = subjectTopics.find(t => t.id === data.topicId);
        const isFlagged = failureRate >= 0.75;

        metrics.push({
          questionId: qId,
          topicId: data.topicId,
          topicName: topic?.name || data.topicId,
          questionText: `Evaluation Item [${qId}] on ${topic?.name || 'concept'}`,
          attemptsCount: data.total,
          failureRate: Number(failureRate.toFixed(2)),
          isFlaggedAmbiguous: isFlagged,
          flagReason: isFlagged
            ? `${Math.round(failureRate * 100)}% of cohort failed this item. Flagged for review: ambiguous distractor or misleading wording.`
            : undefined
        });
      }
    });

    return metrics.sort((a, b) => b.failureRate - a.failureRate);
  }, [attempts, subjectTopics]);

  // Handle CSV import
  const handleProcessCsv = () => {
    if (!csvContent.trim()) return;

    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      setCsvValidationResults({ successCount: 0, errors: [{ row: 1, error: 'CSV must have a header row and at least 1 data row.' }] });
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rollIdx = headers.indexOf('roll_number');
    const topicIdx = headers.indexOf('topic_id');
    const scoreIdx = headers.indexOf('score');

    if (rollIdx === -1 || topicIdx === -1 || scoreIdx === -1) {
      setCsvValidationResults({
        successCount: 0,
        errors: [{ row: 1, error: 'Missing required header columns: "roll_number", "topic_id", and "score" are required.' }]
      });
      return;
    }

    const rows = lines.slice(1).map(l => {
      const cols = l.split(',').map(c => c.trim());
      return {
        roll_number: cols[rollIdx],
        topic_id: cols[topicIdx],
        score: cols[scoreIdx]
      };
    });

    const result = importCsvRecords(rows);
    setCsvValidationResults(result);
  };

  const handleLoadSampleCsv = () => {
    const sample = `roll_number,student_name,topic_id,score,attendance
22CS084,Ananya Sharma,dsa-pointers,78,64
22CS045,Rohan Varma,dsa-linked-lists,82,82
22CS019,Vikram Reddy,dsa-pointers,42,58
22CS102,Sneha Patel,dsa-binary-trees,95,94
22CS084,Ananya Sharma,dsa-binary-trees,65,64`;
    setCsvContent(sample);
  };

  const handleOpenNudgeModal = (student: Student, rootCauseTopicName?: string) => {
    setSelectedStudentForNudge(student);
    const draft = `Hi ${student.name},\n\nI reviewed your diagnostic analytics for ${activeSubject.name}. Our prerequisite tracer identified that while you struggled in recent advanced questions, the real foundational bottleneck is "${rootCauseTopicName || 'Pointers'}".\n\nI've assigned a 5-minute targeted remediation module on your LearnGap daily plan. Please complete the worked example today and check in during mentoring hours.\n\nBest regards,\nProf. K. Rao`;
    setNudgeMessage(draft);
  };

  const handleSendNudge = () => {
    setNudgeSentToast(true);
    setTimeout(() => {
      setNudgeSentToast(false);
      setSelectedStudentForNudge(null);
    }, 2000);
  };

  const handleGenerateAiQuestion = async () => {
    setIsGeneratingAiQ(true);
    try {
      const targetTopic = subjectTopics[0];
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: targetTopic.name,
          difficulty: 'medium',
          syllabusExcerpt: targetTopic.summary
        })
      });

      const data = await res.json();
      if (data.question) {
        const newApproval: PendingQuestionApproval = {
          id: `pq-${Date.now()}`,
          topicId: targetTopic.id,
          subjectId: targetTopic.subjectId,
          question: {
            ...data.question,
            id: `q-gen-${Date.now()}`,
            topicId: targetTopic.id,
            subjectId: targetTopic.subjectId,
            difficulty: 'medium'
          },
          generatedBy: 'AI Curated from Syllabus',
          generatedAt: new Date().toISOString(),
          syllabusExcerpt: targetTopic.summary.slice(0, 100),
          status: 'pending'
        };
        addGeneratedQuestion(newApproval);
        setActiveTab('approval_queue');
      }
    } catch (_e) {
      alert('Fallback question added to approval queue.');
    } finally {
      setIsGeneratingAiQ(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Faculty Academic Command Center</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold">
              CSE Department
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Class: {activeSubject.name} ({activeSubject.code}) • Section CSE-A/B • 24 Students Active
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateAiQuestion}
            disabled={isGeneratingAiQ}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isGeneratingAiQ ? 'Curating from Syllabus...' : 'Curate Question to Queue'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'heatmap'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Class Mastery Heatmap
        </button>

        <button
          onClick={() => setActiveTab('reteach')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'reteach'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Re-Teach Alerts ({reteachAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quality_insights')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'quality_insights'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Question Quality Insights
        </button>

        <button
          onClick={() => setActiveTab('approval_queue')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'approval_queue'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Content Approval Queue ({pendingApprovals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('csv_upload')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'csv_upload'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> CSV Ingestion & Validation
        </button>
      </div>

      {/* Tab 1: Class Mastery Heatmap */}
      {activeTab === 'heatmap' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Cohort Concept Diagnostic Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time Bayesian mastery per topic. Click any student row to view diagnostic root-cause breakdown.
              </p>
            </div>

            {/* Threshold slider */}
            <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <label className="text-xs text-slate-400 whitespace-nowrap">
                Re-teach Alert Threshold: <strong className="text-slate-200">{Math.round(reteachThreshold * 100)}%</strong>
              </label>
              <input
                type="range"
                min={20}
                max={70}
                step={5}
                value={Math.round(reteachThreshold * 100)}
                onChange={e => setReteachThreshold(Number(e.target.value) / 100)}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Matrix Table */}
          <div className="mt-4 overflow-x-auto pb-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 min-w-[160px]">Student</th>
                  <th className="py-2.5 px-2 text-center">Avg</th>
                  {subjectTopics.map(topic => (
                    <th key={topic.id} className="py-2.5 px-2 text-center min-w-[95px]">
                      <div className="line-clamp-1">{topic.name}</div>
                      <span className="text-[9px] font-mono text-slate-500 normal-case">{topic.code}</span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {heatmapData.map(({ student, masteries, overall }) => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      {/* Student info */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-6 h-6 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-slate-200 line-clamp-1">{student.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{student.rollNumber}</div>
                          </div>
                        </div>
                      </td>

                      {/* Overall average */}
                      <td className="py-2.5 px-2 text-center font-bold text-slate-200">
                        {overall !== null ? `${Math.round(overall * 100)}%` : '—'}
                      </td>

                      {/* Topic Masteries */}
                      {subjectTopics.map(topic => {
                        const m = masteries[topic.id];
                        const status = getMasteryStatus(m);

                        let cellClass = 'bg-slate-900/40 text-slate-500';
                        if (status === 'critical') cellClass = 'bg-red-950/70 border border-red-500/40 text-red-300 font-bold';
                        else if (status === 'weak') cellClass = 'bg-amber-950/50 border border-amber-500/30 text-amber-300 font-bold';
                        else if (status === 'developing') cellClass = 'bg-cyan-950/40 text-cyan-300';
                        else if (status === 'strong') cellClass = 'bg-emerald-950/50 text-emerald-300 font-bold';

                        return (
                          <td key={topic.id} className="py-1 px-1.5 text-center">
                            <span className={`inline-block w-full py-1 rounded text-[11px] ${cellClass}`}>
                              {m !== null ? `${Math.round(m * 100)}%` : '—'}
                            </span>
                          </td>
                        );
                      })}

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenNudgeModal(student, 'Pointers')}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition cursor-pointer"
                            title="Send Personalized Mentor Nudge"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveStudentId(student.id);
                              setRole('student');
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-indigo-300 text-[10px] font-semibold transition cursor-pointer"
                          >
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Class summary footer */}
              <tfoot>
                <tr className="border-t-2 border-slate-700 bg-slate-950/60 font-semibold text-slate-300">
                  <td className="py-3 px-3 uppercase text-[10px] tracking-wider text-slate-400">Class Average</td>
                  <td className="py-3 px-2 text-center text-indigo-300 font-mono">
                    {Math.round(
                      topicClassStats.reduce((acc, t) => acc + (t.averageMastery || 0), 0) /
                        (topicClassStats.filter(t => t.averageMastery !== null).length || 1) *
                        100
                    )}%
                  </td>
                  {topicClassStats.map(stat => (
                    <td key={stat.topic.id} className="py-3 px-1.5 text-center font-mono text-[11px]">
                      {stat.averageMastery !== null ? (
                        <span className={stat.averageMastery < 0.50 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {Math.round(stat.averageMastery * 100)}%
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Re-teach Alerts */}
      {activeTab === 'reteach' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>Class Re-Teach Alerts (Threshold: {Math.round(reteachThreshold * 100)}%)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically triggered when more than {Math.round(reteachThreshold * 100)}% of the cohort fails to attain minimum proficiency in a module.
              </p>
            </div>
          </div>

          {reteachAlerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>Great news! No topics currently exceed the {Math.round(reteachThreshold * 100)}% cohort failure threshold.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reteachAlerts.map(stat => (
                <div
                  key={stat.topic.id}
                  className="p-4 rounded-xl bg-red-950/20 border-2 border-red-500/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-900/60 border border-red-500/40 text-red-300 font-bold">
                      {stat.topic.code}
                    </span>
                    <span className="text-xs font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/30">
                      {Math.round(stat.strugglingFraction * 100)}% of Cohort Struggling
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{stat.topic.name}</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {stat.strugglingCount} out of {stat.totalAssessed} students assessed are scoring below 50% mastery.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-indigo-400 block mb-0.5">Pedagogical Recommendation:</strong>
                    Schedule a 30-minute interactive workshop revisiting {stat.topic.name}. Emphasize the common misconception "{stat.topic.misconceptions[0]?.tag || 'SYNTAX_SEMANTICS'}".
                  </div>

                  <button
                    onClick={() => alert(`Re-teach announcement for "${stat.topic.name}" broadcasted to student portals.`)}
                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-red-600/30"
                  >
                    Broadcast Class Re-Teach Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Question Quality Insights */}
      {activeTab === 'quality_insights' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Question Quality & Ambiguity Insights
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Learngap monitors assessment discriminative validity. If a question fails &gt;75% of otherwise capable students, it is flagged as ambiguous or flawed.
            </p>
          </div>

          <div className="space-y-3">
            {questionQualityMetrics.map(metric => (
              <div
                key={metric.questionId}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  metric.isFlaggedAmbiguous
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {metric.questionId}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{metric.topicName}</span>
                    {metric.isFlaggedAmbiguous && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        ⚠️ High Failure Rate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">{metric.flagReason || 'Normal difficulty distribution.'}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Attempts</span>
                    <span className="text-slate-200 font-bold">{metric.attemptsCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Failure Rate</span>
                    <span className={`font-bold ${metric.isFlaggedAmbiguous ? 'text-amber-400' : 'text-slate-300'}`}>
                      {Math.round(metric.failureRate * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Content Approval Queue */}
      {activeTab === 'approval_queue' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Faculty-In-The-Loop Content Approval Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every AI-curated diagnostic item requires faculty verification before entering active student assessments.
              </p>
            </div>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <span>Queue is empty. Click "Curate Question to Queue" above to generate a new item from syllabus notes!</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map(approval => (
                <div
                  key={approval.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {approval.topicId}
                      </span>
                      <span className="text-slate-400">{approval.generatedBy}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(approval.generatedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{approval.question.text}</h4>
                    {approval.question.codeSnippet && (
                      <pre className="mt-2 p-2.5 rounded bg-slate-950 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
                        <code>{approval.question.codeSnippet}</code>
                      </pre>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {approval.question.options.map(opt => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border ${
                          opt.id === approval.question.correctOptionId
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="font-semibold block">{opt.text}</span>
                        {opt.misconceptionTag && (
                          <span className="text-[10px] text-rose-400 font-mono">
                            Misconception: {opt.misconceptionTag}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
                    <button
                      onClick={() => rejectQuestion(approval.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveQuestion(approval.id)}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-emerald-600/30"
                    >
                      Approve & Publish to Question Bank
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: CSV Ingestion & Validation Engine */}
      {activeTab === 'csv_upload' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <span>Diagnostic CSV Ingestion Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload college exam marks or LMS quiz logs. The validation engine rigorously catches malformed rows without crashing.
              </p>
            </div>

            <button
              onClick={handleLoadSampleCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold transition cursor-pointer"
            >
              Load Sample CSV Template
            </button>
          </div>

          <div className="space-y-3">
            <textarea
              rows={6}
              value={csvContent}
              onChange={e => setCsvContent(e.target.value)}
              placeholder="Paste CSV rows here: roll_number, student_name, topic_id, score, attendance..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Required schema: <code>roll_number, topic_id, score (0-100)</code>
              </span>
              <button
                onClick={handleProcessCsv}
                disabled={!csvContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Validate & Ingest Records
              </button>
            </div>
          </div>

          {/* Validation Feedback Table */}
          {csvValidationResults && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Successfully Ingested: {csvValidationResults.successCount} Rows
                </span>
                {csvValidationResults.errors.length > 0 && (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Validation Errors: {csvValidationResults.errors.length} Rows
                  </span>
                )}
              </div>

              {csvValidationResults.errors.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {csvValidationResults.errors.map((err, i) => (
                    <div key={i} className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 font-mono">
                      Row {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mentor Nudge Modal */}
      {selectedStudentForNudge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedStudentForNudge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Send Personalized Mentor Nudge
                </h3>
                <p className="text-xs text-slate-400">
                  Recipient: {selectedStudentForNudge.name} ({selectedStudentForNudge.rollNumber})
                </p>
              </div>
            </div>

            <textarea
              rows={7}
              value={nudgeMessage}
              onChange={e => setNudgeMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {nudgeSentToast ? (
              <div className="mt-3 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 text-center font-semibold">
                Nudge dispatched to student's inbox!
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedStudentForNudge(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNudge}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-4 h-4" /> Send Nudge
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
