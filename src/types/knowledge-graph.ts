/**
 * Knowledge Graph and Document Parsing Type Definitions
 * 
 * Defines relationships and entities for mapping profile elements
 * (skills, achievements, projects, companies) into a semantic net.
 */

export type NodeType = 'skill' | 'achievement' | 'project' | 'company';

export type RelationshipType = 
  | 'demonstrates'  // Achievement/Project -> Skill
  | 'requires'      // Company/Project -> Skill
  | 'worked_at'     // Achievement -> Company
  | 'achieved_at'   // Achievement -> Project
  | 'associated_with'; // General semantic link

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  importance: number; // 1-10 scale for visual scaling
  x?: number; // Visual coordinates for graph mapping
  y?: number;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: RelationshipType;
  confidence: number; // 0-1 scale for semantic strength
}

export interface ProfileKnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type ParsingJobStatus = 'idle' | 'uploading' | 'parsing' | 'indexing' | 'completed' | 'failed';

export interface DocumentParsingJob {
  id: string;
  fileName: string;
  fileSize: number; // bytes
  status: ParsingJobStatus;
  progress: number; // 0-100%
  startedAt: string;
  completedAt?: string;
  confidenceScore: number; // average extraction confidence
  entitiesExtracted: number;
  logs: ParsingLogEntry[];
}

export interface ParsingLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}
