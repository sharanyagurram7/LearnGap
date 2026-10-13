import React, { useState } from 'react';
import { Topic, Question, RemedialFollowUp } from '../../types';
import { useApp } from '../../context/AppContext';
import { IntegrityMonitor } from './IntegrityMonitor';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  Sparkles,
  HelpCircle,
  BookOpen,
  Languages,
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';

interface QuizModalProps {
  topic: Topic;
  onClose: () => void;
  isDiagnosticBaseline?: boolean;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  topic,
  onClose,
  isDiagnosticBaseline = false
}) => {
  const {
    activeStudent,
    questions,
    recordAttempt,
    logIntegrityEvent,
    integrityAutoSubmit,
    studentMasteryMap
  } = useApp();

  // Filter questions for this topic
  const topicQuestions = questions.filter(q => q.topicId === topic.id);
  const activeQuestions = topicQuestions.length > 0 ? topicQuestions : questions.slice(0, 3);

  // States
  const [pledgeAccepted, setPledgeAccepted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isLanguageHindi, setIsLanguageHindi] = useState<boolean>(false);
  const [remedialActive, setRemedialActive] = useState<boolean>(false);
  const [remedialSelected, setRemedialSelected] = useState<number | null>(null);
  const [remedialSubmitted, setRemedialSubmitted] = useState<boolean>(false);

  // Results tracking
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [sessionPointsEarned, setSessionPointsEarned] = useState<number>(0);
  const [masteryGainSummary, setMasteryGainSummary] = useState<{ before: number; after: number; delta: number } | null>(null);

  const currentQ = activeQuestions[currentIndex];
  const initialMastery = studentMasteryMap[topic.id] ?? 0.35;

  const handleIntegrityBreach = (
    eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'CAMERA_MUTED' | 'UNAUTHORIZED_WINDOW',
    details: string,
    shouldAutoSubmit: boolean
  ) => {
    logIntegrityEvent({
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      eventType,
      assessmentTitle: `${topic.name} Diagnostic Assessment`,
      severity: shouldAutoSubmit ? 'auto_submitted' : 'warning',
      details
    });

    if (shouldAutoSubmit && !quizFinished) {
      alert(`Integrity Violation Detected: Automatic submission triggered per exam policy.`);
      setQuizFinished(true);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOptionId === currentQ.correctOptionId;
    const chosenOption = currentQ.options.find(o => o.id === selectedOptionId);

    // Record attempt
    const result = recordAttempt({
      studentId: activeStudent.id,
      questionId: currentQ.id,
      topicId: topic.id,
      isCorrect,
      chosenOptionId: selectedOptionId,
      misconceptionTag: chosenOption?.misconceptionTag,
      difficultyWeight: currentQ.difficulty === 'hard' ? 1.3 : currentQ.difficulty === 'medium' ? 1.0 : 0.8
    });

    setSessionPointsEarned(prev => prev + result.pointsEarned);

    // Track before/after mastery
    setMasteryGainSummary(prev => {
      const before = prev ? prev.before : initialMastery;
      return {
        before,
        after: result.newMastery,
        delta: Number((result.newMastery - before).toFixed(2))
      };
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
      setRemedialActive(false);
      setRemedialSelected(null);
      setRemedialSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  // Pre-quiz Proctoring Pledge Modal
  if (!pledgeAccepted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Diagnostic Assessment: {topic.name}
              </h3>
              <p className="text-xs text-slate-400">
                Standard Evidence Proctoring & Honor Protocol
              </p>
            </div>
          </div>

          <div className="space-y-3 my-5 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Camera & Sensor Readiness:</strong> Video feed and window focus will be monitored to certify authentic evidence.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Misconception Isolation:</strong> Wrong options diagnose underlying flaws rather than just marking you wrong.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Mastery-Based Rewards:</strong> LearnGap points are awarded purely for verified mastery gain, not clicks or quiz repetition.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => setPledgeAccepted(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Zap className="w-4 h-4" /> Start Monitored Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Finished Screen
  if (quizFinished) {
    const beforePct = Math.round((masteryGainSummary?.before ?? initialMastery) * 100);
    const afterPct = Math.round((masteryGainSummary?.after ?? initialMastery) * 100);
    const deltaPct = afterPct - beforePct;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Award className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-100">
            Assessment Complete: Evidence Verified!
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your Bayesian topic mastery and downstream prerequisite graph have been recalculated in real time.
          </p>

          {/* Mastery Gain comparison card */}
          <div className="my-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Before</span>
              <div className="text-xl font-bold text-slate-400 font-mono mt-0.5">{beforePct}%</div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">Mastery Gain</span>
              <div className={`text-xl font-bold font-mono mt-0.5 ${deltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deltaPct >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">New Mastery</span>
              <div className="text-xl font-bold text-emerald-300 font-mono mt-0.5">{afterPct}%</div>
            </div>
          </div>

          {sessionPointsEarned > 0 && (
            <div className="mb-6 p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Earned <strong>+{sessionPointsEarned} Mastery Points</strong> for verified retention gain!</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <span>Close & Return to Updated Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const chosenOption = currentQ.options.find(o => o.id === selectedOptionId);
  const isCorrect = isAnswerSubmitted && selectedOptionId === currentQ.correctOptionId;
  const isWrong = isAnswerSubmitted && !isCorrect;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              {topic.code}
            </span>
            <h3 className="text-sm font-bold text-slate-100">
              {topic.name}
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (Question {currentIndex + 1} of {activeQuestions.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bilingual toggle */}
            <button
              onClick={() => setIsLanguageHindi(!isLanguageHindi)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer border ${
                isLanguageHindi
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Bilingual Hindi explanation"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{isLanguageHindi ? 'हिन्दी (Hindi)' : 'English'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proctoring integrity bar */}
        <div className="mt-3">
          <IntegrityMonitor
            studentId={activeStudent.id}
            studentName={activeStudent.name}
            assessmentTitle={`${topic.name} Assessment`}
            autoSubmitOnBreach={integrityAutoSubmit}
            onIntegrityBreach={handleIntegrityBreach}
            active={pledgeAccepted}
          />
        </div>

        {/* Question Body */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold">
              Difficulty: <span className="text-slate-200 capitalize">{currentQ.difficulty}</span>
            </span>
            <span className="font-mono">
              Progress: {currentIndex + 1}/{activeQuestions.length}
            </span>
          </div>

          <p className="text-sm font-medium text-slate-100 leading-relaxed">
            {currentQ.text}
          </p>

          {/* Code snippet if present */}
          {currentQ.codeSnippet && (
            <pre className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}

          {/* Options Grid */}
          <div className="mt-4 space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const letter = String.fromCharCode(65 + optIdx);
              const isSelected = selectedOptionId === option.id;
              const isOptionCorrect = option.id === currentQ.correctOptionId;

              let optionStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200';
              if (isSelected && !isAnswerSubmitted) {
                optionStyle = 'bg-indigo-950/40 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500';
              } else if (isAnswerSubmitted) {
                if (isOptionCorrect) {
                  optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                } else if (isSelected && !isOptionCorrect) {
                  optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                } else {
                  optionStyle = 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-60';
                }
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xs font-bold font-mono text-slate-300 shrink-0">
                      {letter}
                    </span>
                    <span className="text-xs font-medium leading-relaxed">
                      {option.text}
                    </span>
                  </div>

                  {isAnswerSubmitted && isOptionCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isOptionCorrect && (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Misconception Diagnostic Feedback Area (The Star Feature!) */}
        {isAnswerSubmitted && (
          <div className="mt-5 space-y-3">
            {isCorrect ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Correct! Evidence Confirmed.</span>
                </div>
                <p className="text-emerald-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Diagnostic Misconception Isolated:</span>
                  </div>
                  {chosenOption?.misconceptionTag && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold">
                      {chosenOption.misconceptionTag}
                    </span>
                  )}
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {chosenOption?.misconceptionExplanation || currentQ.explanation}
                </p>

                {/* Bilingual explanation card if toggled */}
                {isLanguageHindi && topic.bilingualNotes && (
                  <div className="mt-2.5 p-3 rounded-lg bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
                    <div className="font-semibold mb-1 flex items-center gap-1.5 text-amber-300">
                      <Languages className="w-3.5 h-3.5" />
                      <span>हिन्दी में मुख्य स्पष्टीकरण:</span>
                    </div>
                    <p>{topic.bilingualNotes.summary}</p>
                    <p className="mt-1 font-medium text-amber-100">
                      💡 {topic.bilingualNotes.keyConceptTakeaway}
                    </p>
                  </div>
                )}

                {/* Remedial Follow-Up mini check question */}
                {currentQ.remedialFollowUp && (
                  <div className="mt-3 p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Quick Remedial Verification
                      </span>
                      <span className="text-[10px] text-slate-500">Test Recovery Immediately</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2.5">
                      {currentQ.remedialFollowUp.text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentQ.remedialFollowUp.options.map((opt, rIdx) => {
                        const isRemSelected = remedialSelected === rIdx;
                        const isRemCorr = rIdx === currentQ.remedialFollowUp!.correctIndex;
                        return (
                          <button
                            key={rIdx}
                            disabled={remedialSubmitted}
                            onClick={() => {
                              setRemedialSelected(rIdx);
                              setRemedialSubmitted(true);
                            }}
                            className={`p-2 rounded text-left text-xs transition border cursor-pointer ${
                              remedialSubmitted
                                ? isRemCorr
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                                  : isRemSelected
                                  ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {remedialSubmitted && (
                      <p className="text-[11px] text-emerald-400 mt-2">
                        {currentQ.remedialFollowUp.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {topic.summary.slice(0, 70)}...
          </div>

          <div className="flex items-center gap-3">
            {!isAnswerSubmitted ? (
              <button
                disabled={!selectedOptionId}
                onClick={handleSubmitAnswer}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <span>{currentIndex < activeQuestions.length - 1 ? 'Next Question' : 'View Verified Mastery Delta'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
