export type UserRole = 'student' | 'faculty' | 'hod' | 'admin';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type MasteryStatus = 'critical' | 'weak' | 'developing' | 'strong' | 'unassessed';

export interface Misconception {
  id: string;
  tag: string;
  description: string;
  remedialAdvice: string;
  remedialExample?: string;
  bilingualNotice?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  misconceptionTag?: string;
  misconceptionExplanation?: string;
}

export interface RemedialFollowUp {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Question {
  id: string;
  topicId: string;
  subjectId: string;
  difficulty: DifficultyLevel;
  text: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  misconceptionFocus?: string;
  remedialFollowUp?: RemedialFollowUp;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  code: string;
  depth: number;
  prerequisites: string[]; // IDs of prerequisite topics (must be acyclic)
  summary: string;
  workedExample: {
    title: string;
    problem: string;
    code?: string;
    walkthrough: string;
  };
  videoResource: {
    title: string;
    channel: string;
    duration: string;
    url: string;
  };
  bilingualNotes: {
    language: 'Hindi' | 'Telugu' | 'Tamil';
    summary: string;
    keyConceptTakeaway: string;
  };
  misconceptions: Misconception[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  department: string;
  description: string;
  iconName: string;
  totalHours: number;
}

export interface Attempt {
  id: string;
  studentId: string;
  questionId: string;
  topicId: string;
  isCorrect: boolean;
  chosenOptionId: string;
  misconceptionTag?: string;
  timestamp: string; // ISO date string
  difficultyWeight: number; // 0.8 for easy, 1.0 for medium, 1.3 for hard
}

export interface IntegrityLog {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  eventType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'CAMERA_MUTED' | 'UNAUTHORIZED_WINDOW';
  assessmentTitle: string;
  severity: 'warning' | 'flagged' | 'auto_submitted';
  details: string;
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  avatar: string;
  semester: number;
  section: string;
  department: string;
  attendanceRate: number; // e.g. 0.61 for 61%
  points: number; // points strictly awarded for verified mastery gains
  streak: number; // consecutive active days
  lastActive: string;
  integrityLogs: IntegrityLog[];
  completedTasks: string[];
}

export interface TopicMastery {
  topicId: string;
  mastery: number | null; // null if unassessed
  status: MasteryStatus;
  attemptsCount: number;
  correctCount: number;
  lastAssessedAt?: string;
}

export interface RootCauseTrace {
  rootTopicId: string;
  rootTopicName: string;
  triggeredByTopicId: string;
  triggeredByTopicName: string;
  chain: string[]; // Topic IDs in order: [root, intermediate, ..., leaf]
  explanation: string;
}

export interface LearningRecommendation {
  topicId: string;
  topicName: string;
  subjectId: string;
  priorityScore: number;
  status: MasteryStatus;
  mastery: number | null;
  isRootCause: boolean;
  dependentTopicNames: string[];
  depth: number;
  actionText: string;
  estimatedMinutes: number;
}

export interface RiskPrediction {
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  riskScore: number; // 0 - 100
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  topReasons: string[];
  projectedExamScore: number;
  attendanceRate: number;
  weakestRootTopic?: string;
}

export interface PendingQuestionApproval {
  id: string;
  topicId: string;
  subjectId: string;
  question: Question;
  generatedBy: 'AI Curated from Syllabus' | 'Faculty Draft';
  generatedAt: string;
  syllabusExcerpt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface QuestionQualityMetric {
  questionId: string;
  topicId: string;
  topicName: string;
  questionText: string;
  attemptsCount: number;
  failureRate: number; // 0 - 1
  isFlaggedAmbiguous: boolean; // true if failureRate > 0.85
  flagReason?: string;
}
