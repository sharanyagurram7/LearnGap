import {
  calculateMastery,
  getMasteryStatus,
  traceRootCauses,
  validatePrerequisiteGraph,
  generateRecommendations
} from './mastery';
import { Attempt, Topic } from '../types';

export function runEngineSelfTests(): { name: string; passed: boolean; message: string }[] {
  const results: { name: string; passed: boolean; message: string }[] = [];

  // Test 1: Empty history returns null (Never fake 0%)
  const emptyAttempts: Attempt[] = [];
  const emptyResult = calculateMastery(emptyAttempts);
  const test1Passed = emptyResult === null && getMasteryStatus(emptyResult) === 'unassessed';
  results.push({
    name: '1. Empty Assessment History Handled Honestly',
    passed: test1Passed,
    message: test1Passed
      ? 'PASS: Untested topic correctly returns null ("unassessed"), avoiding false 0% penalties.'
      : `FAIL: Expected null, got ${emptyResult}`
  });

  // Test 2: Single correct attempt with prior
  const singleAttempt: Attempt[] = [
    {
      id: 'a1',
      studentId: 's1',
      questionId: 'q1',
      topicId: 'pointers',
      isCorrect: true,
      chosenOptionId: 'opt1',
      timestamp: new Date().toISOString(),
      difficultyWeight: 1.0
    }
  ];
  const singleResult = calculateMastery(singleAttempt);
  // prior=0.5 * 2.0 = 1.0; attempt = 1.0 * 1.0; num = 2.0; den = 3.0 => ~0.667
  const test2Passed = singleResult !== null && Math.abs(singleResult - (2.0 / 3.0)) < 0.05;
  results.push({
    name: '2. Bayesian Prior Smoothes Single-Attempt Outliers',
    passed: test2Passed,
    message: test2Passed
      ? `PASS: Single attempt calculated to ${singleResult?.toFixed(2)} (smoothed by prior, preventing volatile spikes).`
      : `FAIL: Unexpected value ${singleResult}`
  });

  // Test 3: Prerequisite Graph Cycle Detection
  const validDag = {
    trees: ['linked_lists'],
    linked_lists: ['pointers'],
    pointers: []
  };
  const cyclicGraph = {
    a: ['b'],
    b: ['c'],
    c: ['a']
  };
  const validCheck = validatePrerequisiteGraph(validDag);
  const cycleCheck = validatePrerequisiteGraph(cyclicGraph);
  const test3Passed = validCheck.isValid && !cycleCheck.isValid;
  results.push({
    name: '3. Prerequisite DAG Cycle Validation',
    passed: test3Passed,
    message: test3Passed
      ? 'PASS: Correctly verified acyclic prerequisite topology and rejected cyclic dependencies.'
      : 'FAIL: Cycle detection failed to identify invalid graph loop.'
  });

  // Test 4: Root Cause Tracing (Trees weak -> Linked Lists weak -> Pointers is root)
  const mockTopics: Record<string, Topic> = {
    trees: { id: 'trees', subjectId: 'dsa', name: 'Trees', code: 'DSA-04', depth: 2, prerequisites: ['linked_lists'], summary: '', workedExample: { title: '', problem: '', walkthrough: '' }, videoResource: { title: '', channel: '', duration: '', url: '' }, bilingualNotes: { language: 'Hindi', summary: '', keyConceptTakeaway: '' }, misconceptions: [] },
    linked_lists: { id: 'linked_lists', subjectId: 'dsa', name: 'Linked Lists', code: 'DSA-02', depth: 1, prerequisites: ['pointers'], summary: '', workedExample: { title: '', problem: '', walkthrough: '' }, videoResource: { title: '', channel: '', duration: '', url: '' }, bilingualNotes: { language: 'Hindi', summary: '', keyConceptTakeaway: '' }, misconceptions: [] },
    pointers: { id: 'pointers', subjectId: 'dsa', name: 'Pointers', code: 'DSA-01', depth: 0, prerequisites: [], summary: '', workedExample: { title: '', problem: '', walkthrough: '' }, videoResource: { title: '', channel: '', duration: '', url: '' }, bilingualNotes: { language: 'Hindi', summary: '', keyConceptTakeaway: '' }, misconceptions: [] }
  };
  const masteryMap = {
    trees: 0.40,
    linked_lists: 0.52,
    pointers: 0.35
  };
  const traces = traceRootCauses('trees', masteryMap, validDag, mockTopics, 0.60);
  const test4Passed = traces.length > 0 && traces[0].rootTopicId === 'pointers';
  results.push({
    name: '4. Deep Root-Cause Tracing (Trees -> Linked Lists -> Pointers)',
    passed: test4Passed,
    message: test4Passed
      ? `PASS: Correctly isolated root cause "${traces[0]?.rootTopicName}" for struggling topic "${mockTopics.trees.name}".`
      : `FAIL: Expected Pointers as root cause, got ${JSON.stringify(traces)}`
  });

  // Test 5: Student with all topics strong has no urgent blocker
  const strongMap = {
    trees: 0.88,
    linked_lists: 0.85,
    pointers: 0.92
  };
  const strongTopicsList = Object.values(mockTopics);
  const recs = generateRecommendations(strongTopicsList, strongMap, validDag, []);
  const test5Passed = recs.length === 0;
  results.push({
    name: '5. Student with Uniform High Mastery Has Clean Slate',
    passed: test5Passed,
    message: test5Passed
      ? 'PASS: Verified that high-performing students generate 0 critical bottleneck interventions.'
      : `FAIL: Unexpected recommendations generated: ${recs.length}`
  });

  return results;
}
