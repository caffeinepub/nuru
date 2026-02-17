import type { CultureContent, ConversationScenario, UserProgress } from '../../backend';
import { getCultureDisplayText } from '../../utils/learningContent';

export type NodeType = 'culture' | 'conversation';

export interface PathNode {
  id: string;
  type: NodeType;
  title: string;
  xpReward: number;
  isCompleted: boolean;
  isNextUp: boolean;
  isLocked: boolean;
  unitIndex: number;
  unitTitle: string;
  data: CultureContent | ConversationScenario;
}

export function buildLearningPath(
  cultureEntries: CultureContent[],
  scenarios: ConversationScenario[],
  progress: UserProgress | null
): PathNode[] {
  const completedCulture = progress?.completedCultureEntries || [];
  const completedDialogues = progress?.completedDialogues || [];

  // Combine and interleave content for variety
  const allNodes: PathNode[] = [];

  // Create nodes from culture entries
  const cultureNodes: PathNode[] = cultureEntries.map((entry, index) => {
    const entryId = BigInt(Math.abs(hashCode(entry.title)));
    return {
      id: `culture-${entryId}`,
      type: 'culture' as NodeType,
      title: entry.title,
      xpReward: Number(entry.xpReward),
      isCompleted: completedCulture.some((id) => id === entryId),
      isNextUp: false,
      isLocked: false,
      unitIndex: 0,
      unitTitle: '',
      data: entry,
    };
  });

  // Create nodes from conversation scenarios
  const conversationNodes: PathNode[] = scenarios.map((scenario) => ({
    id: `conversation-${scenario.id}`,
    type: 'conversation' as NodeType,
    title: scenario.title,
    xpReward: Number(scenario.xpReward),
    isCompleted: completedDialogues.some((id) => id === scenario.id),
    isNextUp: false,
    isLocked: false,
    unitIndex: 0,
    unitTitle: '',
    data: scenario,
  }));

  // Interleave nodes for variety (2 culture, 1 conversation pattern)
  let cultureIndex = 0;
  let conversationIndex = 0;

  while (cultureIndex < cultureNodes.length || conversationIndex < conversationNodes.length) {
    // Add 2 culture nodes
    if (cultureIndex < cultureNodes.length) {
      allNodes.push(cultureNodes[cultureIndex++]);
    }
    if (cultureIndex < cultureNodes.length) {
      allNodes.push(cultureNodes[cultureIndex++]);
    }
    // Add 1 conversation node
    if (conversationIndex < conversationNodes.length) {
      allNodes.push(conversationNodes[conversationIndex++]);
    }
  }

  // Group into units (5 nodes per unit)
  const nodesPerUnit = 5;
  allNodes.forEach((node, index) => {
    const unitIndex = Math.floor(index / nodesPerUnit);
    node.unitIndex = unitIndex;
    node.unitTitle = `Unit ${unitIndex + 1}`;
  });

  // Find the first incomplete node for "Next up"
  const firstIncompleteIndex = allNodes.findIndex((node) => !node.isCompleted);
  if (firstIncompleteIndex !== -1) {
    allNodes[firstIncompleteIndex].isNextUp = true;

    // Mark nodes after "Next up" as locked (visual only, still clickable)
    for (let i = firstIncompleteIndex + 1; i < allNodes.length; i++) {
      if (!allNodes[i].isCompleted) {
        allNodes[i].isLocked = true;
      }
    }
  } else if (allNodes.length > 0) {
    // All completed, mark first as "next up" for practice
    allNodes[0].isNextUp = true;
  }

  return allNodes;
}

// Simple hash function for generating stable IDs from strings
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}
