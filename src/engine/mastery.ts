import {
  Attempt,
  MasteryStatus,
  TopicMastery,
  RootCauseTrace,
  LearningRecommendation,
  RiskPrediction,
  Student,
  Topic
} from '../types';

/**
 * Calculates deterministic topic mastery using recency weighting (half-life decay)
 * and Bayesian prior so that a single attempt doesn't skew a student's profile.
 *
 * Returns null if the topic has NEVER been assessed (ensures honest "Not assessed yet" status).
 */
export function calculateMastery(
  attempts: Attempt[],
  now: Date = new Date(),
  halfLifeDays: number = 30,
  prior: number = 0.5,
  priorWeight: number = 2.0
): number | null {
  if (!attempts || attempts.length === 0) {
    return null;
  }

  let numerator = prior * priorWeight;
  let denominator = priorWeight;

  for (const attempt of attempts) {
    const attemptTime = new Date(attempt.timestamp).getTime();
    const ageDays = Math.max((now.getTime() - attemptTime) / (1000 * 60 * 60 * 24), 0);
    // Recency exponential decay weight
    const recencyFactor = Math.pow(0.5, ageDays / halfLifeDays);
    const weight = attempt.difficultyWeight * recencyFactor;

    numerator += weight * (attempt.isCorrect ? 1.0 : 0.0);
    denominator += weight;
  }

  if (denominator === 0) return null;
  return numerator / denominator;
}

/**
 * Classifies a mastery score into human-digestible academic status bands.
 */
export function getMasteryStatus(mastery: number | null): MasteryStatus {
  if (mastery === null) return 'unassessed';
  if (mastery < 0.40) return 'critical';
  if (mastery < 0.60) return 'weak';
  if (mastery < 0.75) return 'developing';
  return 'strong';
}

/**
 * Checks if a topic is weak at a given cutoff threshold (default 0.50).
 */
export function isTopicWeak(mastery: number | null, threshold: number = 0.50): boolean {
  return mastery !== null && mastery < threshold;
}

/**
 * Verifies that the prerequisite graph is acyclic.
 */
export function validatePrerequisiteGraph(prereqs: Record<string, string[]>): { isValid: boolean; cycle?: string[] } {
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function hasCycle(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = prereqs[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }

    recStack.delete(node);
    path.pop();
    return false;
  }

  for (const node of Object.keys(prereqs)) {
    if (!visited.has(node)) {
      if (hasCycle(node)) {
        return { isValid: false, cycle: [...path] };
      }
    }
  }

  return { isValid: true };
}

/**
 * Root-Cause Tracing:
 * Given a topic that is weak, recursively navigates backward through its prerequisite hierarchy
 * to discover the deepest root prerequisite that is weak.
 *
 * E.g.: Trees weak (0.38) -> Linked Lists weak (0.48) -> Pointers weak (0.32).
 * Result: Pointers is the verified root cause!
 */
export function traceRootCauses(
  targetTopicId: string,
  masteryMap: Record<string, number | null>,
  prereqs: Record<string, string[]>,
  topicsMap: Record<string, Topic>,
  threshold: number = 0.50
): RootCauseTrace[] {
  const traces: RootCauseTrace[] = [];
  const visited = new Set<string>();

  function search(currentId: string, currentChain: string[]): string[] {
    visited.add(currentId);
    const parents = prereqs[currentId] || [];
    const weakParents = parents.filter(pId => isTopicWeak(masteryMap[pId], threshold));

    if (weakParents.length === 0) {
      // If current topic is weak and has no weak parents, it is a root cause!
      if (isTopicWeak(masteryMap[currentId], threshold)) {
        return [currentId];
      }
      return [];
    }

    const deepestRoots: string[] = [];
    for (const parentId of weakParents) {
      if (!visited.has(parentId)) {
        const found = search(parentId, [...currentChain, parentId]);
        deepestRoots.push(...found);
      }
    }

    return deepestRoots.length > 0 ? deepestRoots : (isTopicWeak(masteryMap[currentId], threshold) ? [currentId] : []);
  }

  const targetMastery = masteryMap[targetTopicId];
  if (!isTopicWeak(targetMastery, threshold)) {
    return [];
  }

  const rootIds = Array.from(new Set(search(targetTopicId, [targetTopicId])));

  for (const rootId of rootIds) {
    if (rootId !== targetTopicId) {
      // Trace chain from rootId to targetTopicId
      const chain = reconstructChain(rootId, targetTopicId, prereqs);
      const rootTopic = topicsMap[rootId];
      const targetTopic = topicsMap[targetTopicId];
      
      const rootScorePct = Math.round((masteryMap[rootId] || 0) * 100);
      const targetScorePct = Math.round((targetMastery || 0) * 100);

      traces.push({
        rootTopicId: rootId,
        rootTopicName: rootTopic ? rootTopic.name : rootId,
        triggeredByTopicId: targetTopicId,
        triggeredByTopicName: targetTopic ? targetTopic.name : targetTopicId,
        chain: chain,
        explanation: `Symptom: ${targetTopic?.name || targetTopicId} is struggling at ${targetScorePct}%. Diagnostic tracing reveals the genuine bottleneck is foundational prerequisite "${rootTopic?.name || rootId}" (${rootScorePct}%). Fixing ${rootTopic?.name || rootId} is required before ${targetTopic?.name || targetTopicId} can reach stable mastery.`
      });
    }
  }

  return traces;
}

/**
 * Reconstructs a shortest path chain from root to target in prerequisite graph
 */
function reconstructChain(rootId: string, targetId: string, prereqs: Record<string, string[]>): string[] {
  // prereqs maps: child -> parents (target -> [prereq1, prereq2])
  // We want chain: [root, intermediate..., target]
  const queue: { current: string; path: string[] }[] = [{ current: targetId, path: [targetId] }];
  const visited = new Set<string>([targetId]);

  while (queue.length > 0) {
    const { current, path } = queue.shift()!;
    const parents = prereqs[current] || [];
    for (const p of parents) {
      if (p === rootId) {
        return [rootId, ...path.slice().reverse().slice(1)];
      }
      if (!visited.has(p)) {
        visited.add(p);
        queue.push({ current: p, path: [...path, p] });
      }
    }
  }

  return [rootId, targetId];
}

/**
 * Generates prioritized learning recommendations using the formula:
 * Priority = (1 - mastery) * (number of dependent topics) / (prerequisite depth + 1)
 */
export function generateRecommendations(
  topics: Topic[],
  masteryMap: Record<string, number | null>,
  prereqs: Record<string, string[]>,
  rootCauses: RootCauseTrace[]
): LearningRecommendation[] {
  // Count dependents for each topic
  const dependentsCount: Record<string, string[]> = {};
  for (const topic of topics) {
    dependentsCount[topic.id] = [];
  }
  for (const [childId, parentIds] of Object.entries(prereqs)) {
    for (const parentId of parentIds) {
      if (!dependentsCount[parentId]) dependentsCount[parentId] = [];
      dependentsCount[parentId].push(childId);
    }
  }

  const rootCauseIds = new Set(rootCauses.map(r => r.rootTopicId));
  const topicsMap = new Map(topics.map(t => [t.id, t]));

  const recommendations: LearningRecommendation[] = [];

  for (const topic of topics) {
    const m = masteryMap[topic.id];
    const status = getMasteryStatus(m);

    // If already strong, lower recommendation priority
    if (status === 'strong') continue;

    const masteryValue = m === null ? 0.45 : m; // unassessed treated moderately
    const dependents = dependentsCount[topic.id] || [];
    const depCount = dependents.length;
    const depth = topic.depth;

    // Formula: (1 - mastery) * (dependent topics + 1) / (depth + 1)
    let priorityScore = ((1.0 - masteryValue) * (depCount + 1.2)) / (depth + 1.0);

    // Boost priority if this topic is a verified root cause of other topics
    const isRoot = rootCauseIds.has(topic.id);
    if (isRoot) {
      priorityScore *= 1.8;
    }

    const dependentNames = dependents
      .map(dId => topicsMap.get(dId)?.name || dId)
      .filter(Boolean);

    let actionText = 'Review foundational concepts & worked examples';
    if (isRoot) {
      actionText = '🔥 Urgent: Resolve Root Bottleneck to unblock downstream topics';
    } else if (status === 'critical') {
      actionText = 'Take targeted misconception drill';
    } else if (status === 'unassessed') {
      actionText = 'Take diagnostic baseline assessment';
    }

    recommendations.push({
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.subjectId,
      priorityScore: Number(priorityScore.toFixed(3)),
      status,
      mastery: m,
      isRootCause: isRoot,
      dependentTopicNames: dependentNames,
      depth: topic.depth,
      actionText,
      estimatedMinutes: isRoot ? 35 : 20
    });
  }

  // Sort descending by priority score
  recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  return recommendations;
}

/**
 * What-If Simulator:
 * Predicts the ripple effect of elevating a specific prerequisite's mastery.
 * When root prerequisite rises, dependent topics benefit based on depth and coupling.
 */
export function simulateMasteryRipple(
  targetTopicId: string,
  newTargetMastery: number,
  currentMasteryMap: Record<string, number | null>,
  prereqs: Record<string, string[]>,
  topics: Topic[]
): Record<string, { current: number; projected: number; delta: number }> {
  const result: Record<string, { current: number; projected: number; delta: number }> = {};
  const currentTarget = currentMasteryMap[targetTopicId] ?? 0.40;
  const targetGain = Math.max(0, newTargetMastery - currentTarget);

  for (const topic of topics) {
    const cur = currentMasteryMap[topic.id] ?? 0.45;

    if (topic.id === targetTopicId) {
      result[topic.id] = {
        current: Number(cur.toFixed(2)),
        projected: Number(newTargetMastery.toFixed(2)),
        delta: Number((newTargetMastery - cur).toFixed(2))
      };
      continue;
    }

    // Check if topic depends on targetTopicId
    const isDependent = checkIsDependent(topic.id, targetTopicId, prereqs);
    if (isDependent) {
      // Coupling diminishes with distance
      const couplingFactor = Math.max(0.35, 0.75 - topic.depth * 0.12);
      const projected = Math.min(0.95, cur + targetGain * couplingFactor);
      result[topic.id] = {
        current: Number(cur.toFixed(2)),
        projected: Number(projected.toFixed(2)),
        delta: Number((projected - cur).toFixed(2))
      };
    } else {
      result[topic.id] = {
        current: Number(cur.toFixed(2)),
        projected: Number(cur.toFixed(2)),
        delta: 0
      };
    }
  }

  return result;
}

function checkIsDependent(childId: string, ancestorId: string, prereqs: Record<string, string[]>): boolean {
  const parents = prereqs[childId] || [];
  if (parents.includes(ancestorId)) return true;
  for (const p of parents) {
    if (checkIsDependent(p, ancestorId, prereqs)) return true;
  }
  return false;
}

/**
 * Explainable Early-Warning Risk Model
 * Multi-factor heuristic regression producing exact human-readable top drivers
 */
export function evaluateStudentRisk(
  student: Student,
  subjectTopics: Topic[],
  masteryMap: Record<string, number | null>,
  rootCauses: RootCauseTrace[]
): RiskPrediction {
  const topicMasteries = subjectTopics
    .map(t => masteryMap[t.id])
    .filter((m): m is number => m !== null);

  const avgMastery = topicMasteries.length > 0
    ? topicMasteries.reduce((a, b) => a + b, 0) / topicMasteries.length
    : 0.50;

  const attendance = student.attendanceRate; // e.g. 0.62
  const criticalCount = subjectTopics.filter(t => (masteryMap[t.id] ?? 0) < 0.40).length;
  const rootCauseCount = rootCauses.length;

  // Risk score formula (0 to 100)
  // Higher mastery & attendance reduce risk; critical gaps & unaddressed root causes increase risk
  let riskScore = 100 - (avgMastery * 55 + attendance * 35);
  riskScore += rootCauseCount * 6;
  riskScore += criticalCount * 4;
  riskScore = Math.max(5, Math.min(96, Math.round(riskScore)));

  let riskLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  if (riskScore >= 65) riskLevel = 'HIGH';
  else if (riskScore >= 40) riskLevel = 'MODERATE';

  // Projected exam score (0 to 100)
  const projectedExamScore = Math.max(25, Math.min(98, Math.round(avgMastery * 70 + attendance * 25 + (student.points > 100 ? 5 : 0))));

  // Construct explainable top reasons
  const topReasons: string[] = [];

  if (rootCauses.length > 0) {
    const primary = rootCauses[0];
    const rootMastery = Math.round((masteryMap[primary.rootTopicId] || 0) * 100);
    topReasons.push(`Root cause "${primary.rootTopicName}" mastery is only ${rootMastery}%, directly blocking ${primary.triggeredByTopicName}`);
  }

  if (attendance < 0.75) {
    topReasons.push(`Class attendance is critically low at ${Math.round(attendance * 100)}% (threshold is 75%)`);
  }

  if (criticalCount > 1) {
    topReasons.push(`${criticalCount} topics are in Critical danger zone (<40% retention)`);
  } else if (criticalCount === 1) {
    const critTopic = subjectTopics.find(t => (masteryMap[t.id] ?? 0) < 0.40);
    topReasons.push(`Foundational topic "${critTopic?.name}" has not reached minimum proficiency`);
  }

  if (avgMastery < 0.50) {
    topReasons.push(`Subject-level average mastery is ${Math.round(avgMastery * 100)}%, below passing standard`);
  }

  if (topReasons.length === 0) {
    topReasons.push(`Consistent practice detected: maintaining strong prerequisite grasp across all evaluated modules`);
  }

  return {
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    subjectId: subjectTopics[0]?.subjectId || 'dsa',
    riskScore,
    riskLevel,
    topReasons,
    projectedExamScore,
    attendanceRate: attendance,
    weakestRootTopic: rootCauses[0]?.rootTopicName
  };
}
