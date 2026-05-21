import { ProfileSummary } from '@/types/profile';
import { ProfileKnowledgeGraph, GraphNode, GraphEdge } from '@/types/knowledge-graph';
import { normalizeEntityName } from './normalizer';

/**
 * Knowledge Graph Constructor
 * 
 * Takes candidate profile components (skills, achievements) and builds
 * a connected semantic graph. Assigns circular layout coordinates (x, y)
 * for beautiful SVG diagram rendering.
 */

export function buildProfileKnowledgeGraph(
  profile: ProfileSummary
): ProfileKnowledgeGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // 1. Create central candidate/profile node
  const centralId = 'node_profile_center';
  nodes.push({
    id: centralId,
    label: profile.careerNarrative ? 'Career Narrative' : 'Candidate Profile',
    type: 'project', // treated as main hub
    importance: 10,
    x: 300,
    y: 200,
    metadata: { isCenter: true }
  });

  // 2. Add Top Skills as nodes
  const skillNodes: GraphNode[] = [];
  (profile.topSkills || []).forEach((skill, idx) => {
    const skillId = `node_skill_${skill.name.toLowerCase().replace(/\s+/g, '_')}`;
    const standardName = normalizeEntityName(skill.name);
    
    // Circular positioning around center (radius = 160)
    const angle = (idx / Math.max(profile.topSkills.length, 1)) * 2 * Math.PI;
    const x = Math.round(300 + 160 * Math.cos(angle));
    const y = Math.round(200 + 160 * Math.sin(angle));

    const node: GraphNode = {
      id: skillId,
      label: standardName,
      type: 'skill',
      importance: skill.proficiency === 'expert' ? 8 : skill.proficiency === 'proficient' ? 6 : 4,
      x,
      y,
      metadata: { proficiency: skill.proficiency, demand: skill.marketDemand }
    };
    
    nodes.push(node);
    skillNodes.push(node);

    // Link skill back to center
    edges.push({
      id: `edge_center_${skillId}`,
      sourceId: centralId,
      targetId: skillId,
      relationType: 'associated_with',
      confidence: 0.9
    });
  });

  // 3. Add Achievements as nodes
  (profile.recentAchievements || []).forEach((achievement, idx) => {
    const achId = `node_ach_${achievement.id}`;
    
    // Circular positioning at wider radius (radius = 280)
    const angle = ((idx + 0.5) / Math.max(profile.recentAchievements.length, 1)) * 2 * Math.PI;
    const x = Math.round(300 + 260 * Math.cos(angle));
    const y = Math.round(200 + 260 * Math.sin(angle));

    nodes.push({
      id: achId,
      label: achievement.title.length > 22 ? achievement.title.substring(0, 20) + '...' : achievement.title,
      type: 'achievement',
      importance: 7,
      x,
      y,
      metadata: { description: achievement.description, context: achievement.context }
    });

    // Link achievement back to center
    edges.push({
      id: `edge_center_${achId}`,
      sourceId: centralId,
      targetId: achId,
      relationType: 'demonstrates',
      confidence: 0.95
    });

    // Link achievement to matching skills
    achievement.relevantSkills.forEach((skillName) => {
      const skillId = `node_skill_${skillName.toLowerCase().replace(/\s+/g, '_')}`;
      if (nodes.some((n) => n.id === skillId)) {
        edges.push({
          id: `edge_ach_skill_${achievement.id}_${skillName}`,
          sourceId: achId,
          targetId: skillId,
          relationType: 'demonstrates',
          confidence: 0.85
        });
      }
    });
  });

  return { nodes, edges };
}
