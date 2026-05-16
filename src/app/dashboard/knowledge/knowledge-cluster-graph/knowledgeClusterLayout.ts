import type { KnowledgePattern } from "@/lib/mock-dashboard-data";
import { KNOWLEDGE_CLUSTER_TYPE_CONFIG, type KnowledgeType, type NodePosition } from "./knowledgeClusterConfig";

export function knowledgeClusterSuccessRate(pattern: KnowledgePattern): number {
  const total = pattern.successCount + pattern.failureCount;
  return total > 0 ? pattern.successCount / total : 0;
}

export function computeKnowledgeNodePositions(
  patterns: KnowledgePattern[],
  width: number,
  height: number,
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.32;
  const groups = new Map<KnowledgeType, KnowledgePattern[]>();

  for (const pattern of patterns) {
    if (!groups.has(pattern.knowledgeType)) groups.set(pattern.knowledgeType, []);
    groups.get(pattern.knowledgeType)!.push(pattern);
  }

  for (const [type, members] of groups) {
    const config = KNOWLEDGE_CLUSTER_TYPE_CONFIG[type];
    const angle = (config.clusterAngle * Math.PI) / 180;
    const clusterCx = cx + Math.cos(angle) * radius;
    const clusterCy = cy + Math.sin(angle) * radius;
    const spreadRadius = 30 + members.length * 12;

    members.forEach((pattern, index) => {
      const memberAngle = (index / members.length) * Math.PI * 2;
      const dist = spreadRadius * (0.4 + pattern.confidence * 0.6);
      positions.set(pattern.id, {
        x: clusterCx + Math.cos(memberAngle) * dist,
        y: clusterCy + Math.sin(memberAngle) * dist,
      });
    });
  }

  return positions;
}

export function computeKnowledgeEdges(patterns: KnowledgePattern[]): { from: string; to: string; persona: string }[] {
  const edges: { from: string; to: string; persona: string }[] = [];
  const byPersona = new Map<string, KnowledgePattern[]>();

  for (const pattern of patterns) {
    if (!byPersona.has(pattern.personaName)) byPersona.set(pattern.personaName, []);
    byPersona.get(pattern.personaName)!.push(pattern);
  }

  for (const [persona, members] of byPersona) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        edges.push({ from: members[i].id, to: members[j].id, persona });
      }
    }
  }

  return edges;
}
