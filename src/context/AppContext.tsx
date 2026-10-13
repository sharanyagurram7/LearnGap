import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  Student,
  Subject,
  Topic,
  Question,
  Attempt,
  UserRole,
  PendingQuestionApproval,
  IntegrityLog,
  RootCauseTrace,
  LearningRecommendation,
  RiskPrediction
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_SUBJECTS,
  INITIAL_TOPICS,
  INITIAL_QUESTIONS,
  INITIAL_ATTEMPTS,
  INITIAL_PENDING_APPROVALS
} from '../data/seedData';
import {
  calculateMastery,
  getMasteryStatus,
  traceRootCauses,
  generateRecommendations,
  evaluateStudentRisk
} from '../engine/mastery';
import confetti from 'canvas-confetti';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  subjects: Subject[];
  topics: Topic[];
  questions: Question[];
  students: Student[];
  attempts: Attempt[];
  pendingApprovals: PendingQuestionApproval[];
  activeSubjectId: string;
  setActiveSubjectId: (id: string) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  
  // Computed helpers for active student & subject
  activeStudent: Student;
  activeSubject: Subject;
  subjectTopics: Topic[];
  topicPrereqsMap: Record<string, string[]>;
  studentMasteryMap: Record<string, number | null>;
  studentRootCauses: RootCauseTrace[];
  studentRecommendations: LearningRecommendation[];
  studentRisk: RiskPrediction;

  // Settings
  reteachThreshold: number;
  setReteachThreshold: (t: number) => void;
  integrityAutoSubmit: boolean;
  setIntegrityAutoSubmit: (v: boolean) => void;
  
  // Actions
  recordAttempt: (attempt: Omit<Attempt, 'id' | 'timestamp'>) => { masteryDelta: number; newMastery: number; pointsEarned: number };
  logIntegrityEvent: (event: Omit<IntegrityLog, 'id' | 'timestamp'>) => void;
  approveQuestion: (id: string) => void;
  rejectQuestion: (id: string) => void;
  addGeneratedQuestion: (pending: PendingQuestionApproval) => void;
  importCsvRecords: (rows: any[]) => { successCount: number; errors: { row: number; error: string }[] };
  markTaskCompleted: (taskId: string) => void;
  
  // Guided Demo Tour
  demoStep: number;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [topics] = useState<Topic[]>(INITIAL_TOPICS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [attempts, setAttempts] = useState<Attempt[]>(INITIAL_ATTEMPTS);
  const [pendingApprovals, setPendingApprovals] = useState<PendingQuestionApproval[]>(INITIAL_PENDING_APPROVALS);

  const [activeSubjectId, setActiveSubjectId] = useState<string>('dsa');
  const [activeStudentId, setActiveStudentId] = useState<string>('stud-ananya');

  const [reteachThreshold, setReteachThreshold] = useState<number>(0.40); // 40% default configurable
  const [integrityAutoSubmit, setIntegrityAutoSubmit] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Active subject object
  const activeSubject = useMemo(() => {
    return subjects.find(s => s.id === activeSubjectId) || subjects[0];
  }, [subjects, activeSubjectId]);

  // Topics for active subject
  const subjectTopics = useMemo(() => {
    return topics.filter(t => t.subjectId === activeSubjectId);
  }, [topics, activeSubjectId]);

  // Prerequisite mapping for subject
  const topicPrereqsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const t of topics) {
      map[t.id] = t.prerequisites;
    }
    return map;
  }, [topics]);

  const topicsMap = useMemo(() => {
    const map: Record<string, Topic> = {};
    for (const t of topics) {
      map[t.id] = t;
    }
    return map;
  }, [topics]);

  // Calculate current topic masteries for active student
  const studentMasteryMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    const studentAttempts = attempts.filter(a => a.studentId === activeStudentId);

    for (const topic of topics) {
      const topicAttempts = studentAttempts.filter(a => a.topicId === topic.id);
      map[topic.id] = calculateMastery(topicAttempts);
    }
    return map;
  }, [attempts, activeStudentId, topics]);

  // Calculate root cause traces for active student in active subject
  const studentRootCauses = useMemo(() => {
    const traces: RootCauseTrace[] = [];
    for (const topic of subjectTopics) {
      const found = traceRootCauses(topic.id, studentMasteryMap, topicPrereqsMap, topicsMap, 0.50);
      for (const f of found) {
        if (!traces.some(t => t.rootTopicId === f.rootTopicId && t.triggeredByTopicId === f.triggeredByTopicId)) {
          traces.push(f);
        }
      }
    }
    return traces;
  }, [subjectTopics, studentMasteryMap, topicPrereqsMap, topicsMap]);

  // Generate learning recommendations
  const studentRecommendations = useMemo(() => {
    return generateRecommendations(subjectTopics, studentMasteryMap, topicPrereqsMap, studentRootCauses);
  }, [subjectTopics, studentMasteryMap, topicPrereqsMap, studentRootCauses]);

  // Evaluate risk prediction
  const studentRisk = useMemo(() => {
    return evaluateStudentRisk(activeStudent, subjectTopics, studentMasteryMap, studentRootCauses);
  }, [activeStudent, subjectTopics, studentMasteryMap, studentRootCauses]);

  // Record an attempt and calculate mastery gain
  const recordAttempt = (newAttemptData: Omit<Attempt, 'id' | 'timestamp'>) => {
    const oldTopicAttempts = attempts.filter(
      a => a.studentId === newAttemptData.studentId && a.topicId === newAttemptData.topicId
    );
    const oldMastery = calculateMastery(oldTopicAttempts) ?? 0.30;

    const fullAttempt: Attempt = {
      ...newAttemptData,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };

    const updatedAttempts = [...attempts, fullAttempt];
    setAttempts(updatedAttempts);

    // Calculate new mastery
    const newTopicAttempts = updatedAttempts.filter(
      a => a.studentId === newAttemptData.studentId && a.topicId === newAttemptData.topicId
    );
    const newMastery = calculateMastery(newTopicAttempts) ?? 0.50;
    const masteryDelta = Number((newMastery - oldMastery).toFixed(3));

    // Award points strictly for mastery gain (prevents point farming)
    let pointsEarned = 0;
    if (masteryDelta > 0) {
      pointsEarned = Math.round(masteryDelta * 100);
      
      // Update student points and check for status band promotion
      setStudents(prev =>
        prev.map(s => {
          if (s.id === newAttemptData.studentId) {
            return {
              ...s,
              points: s.points + pointsEarned,
              streak: s.streak + 1,
              lastActive: new Date().toISOString()
            };
          }
          return s;
        })
      );

      // Trigger celebratory confetti if mastery cross strong or developing threshold
      const oldStatus = getMasteryStatus(oldMastery);
      const newStatus = getMasteryStatus(newMastery);
      if (oldStatus !== newStatus && (newStatus === 'developing' || newStatus === 'strong')) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (_) {}
      }
    }

    return { masteryDelta, newMastery, pointsEarned };
  };

  // Log an exam integrity event
  const logIntegrityEvent = (eventData: Omit<IntegrityLog, 'id' | 'timestamp'>) => {
    const fullLog: IntegrityLog = {
      ...eventData,
      id: `int-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setStudents(prev =>
      prev.map(s => {
        if (s.id === eventData.studentId) {
          return {
            ...s,
            integrityLogs: [fullLog, ...s.integrityLogs]
          };
        }
        return s;
      })
    );
  };

  // Approve pending question
  const approveQuestion = (id: string) => {
    const item = pendingApprovals.find(p => p.id === id);
    if (!item) return;

    setQuestions(prev => [item.question, ...prev]);
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
  };

  // Reject pending question
  const rejectQuestion = (id: string) => {
    setPendingApprovals(prev => prev.filter(p => p.id !== id));
  };

  // Add newly generated question to queue
  const addGeneratedQuestion = (pending: PendingQuestionApproval) => {
    setPendingApprovals(prev => [pending, ...prev]);
  };

  // Mark task completed
  const markTaskCompleted = (taskId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === activeStudentId) {
          if (!s.completedTasks.includes(taskId)) {
            return { ...s, completedTasks: [...s.completedTasks, taskId] };
          }
        }
        return s;
      })
    );
  };

  // Strict CSV upload validator
  const importCsvRecords = (rows: any[]) => {
    const errors: { row: number; error: string }[] = [];
    const validAttempts: Attempt[] = [];
    let successCount = 0;

    const topicIds = new Set(topics.map(t => t.id));
    const studentRollMap = new Map(students.map(s => [s.rollNumber.toUpperCase(), s.id]));

    rows.forEach((row, idx) => {
      const rowNum = idx + 2; // Accounting for 1-based index and header row

      // Required fields check
      if (!row.roll_number || !row.topic_id || row.score === undefined || row.score === '') {
        errors.push({ row: rowNum, error: `Missing required fields (roll_number, topic_id, or score).` });
        return;
      }

      const roll = String(row.roll_number).trim().toUpperCase();
      const studentId = studentRollMap.get(roll);
      if (!studentId) {
        errors.push({ row: rowNum, error: `Unknown student roll number "${roll}".` });
        return;
      }

      const topicId = String(row.topic_id).trim();
      if (!topicIds.has(topicId)) {
        errors.push({ row: rowNum, error: `Unknown topic ID "${topicId}". Valid examples: dsa-pointers, dsa-linked-lists.` });
        return;
      }

      const score = Number(row.score);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.push({ row: rowNum, error: `Score "${row.score}" is outside valid range (0-100).` });
        return;
      }

      // Convert score percentage to pseudo-attempts
      const isCorrect = score >= 50;
      validAttempts.push({
        id: `att-csv-${Date.now()}-${idx}`,
        studentId,
        questionId: `q-csv-import-${topicId}`,
        topicId,
        isCorrect,
        chosenOptionId: isCorrect ? 'opt-corr' : 'opt-wrong',
        timestamp: new Date().toISOString(),
        difficultyWeight: 1.0
      });
      successCount++;
    });

    if (validAttempts.length > 0) {
      setAttempts(prev => [...prev, ...validAttempts]);
    }

    return { successCount, errors };
  };

  // Guided demo navigation
  const nextDemoStep = () => setDemoStep(prev => Math.min(5, prev + 1));
  const prevDemoStep = () => setDemoStep(prev => Math.max(1, prev - 1));

  const resetDemoData = () => {
    setAttempts(INITIAL_ATTEMPTS);
    setStudents(INITIAL_STUDENTS);
    setActiveStudentId('stud-ananya');
    setActiveSubjectId('dsa');
    setDemoStep(1);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        subjects,
        topics,
        questions,
        students,
        attempts,
        pendingApprovals,
        activeSubjectId,
        setActiveSubjectId,
        activeStudentId,
        setActiveStudentId,
        activeStudent,
        activeSubject,
        subjectTopics,
        topicPrereqsMap,
        studentMasteryMap,
        studentRootCauses,
        studentRecommendations,
        studentRisk,
        reteachThreshold,
        setReteachThreshold,
        integrityAutoSubmit,
        setIntegrityAutoSubmit,
        recordAttempt,
        logIntegrityEvent,
        approveQuestion,
        rejectQuestion,
        addGeneratedQuestion,
        importCsvRecords,
        markTaskCompleted,
        demoStep,
        setDemoStep,
        nextDemoStep,
        prevDemoStep,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
