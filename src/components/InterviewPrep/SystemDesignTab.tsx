import React, { useMemo, useState } from 'react';
import {
  Boxes,
  GitBranch,
  Zap,
  TrendingUp,
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';

interface SystemDesignTabProps {
  prep: InterviewPrep;
}

/**
 * SystemDesign Tab
 * Displays system design interview preparation:
 * - Scaling principles and patterns
 * - Database design and trade-offs
 * - Distributed systems concepts
 * - Caching strategies
 * - API design best practices
 * - Common design problems with solutions
 */
export const SystemDesignTab: React.FC<SystemDesignTabProps> = ({ prep }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('approach');

  const scalingConcepts = useMemo(() => {
    return [
      {
        concept: 'Horizontal Scaling',
        description: 'Add more servers/instances to handle load',
        pros: ['High availability', 'Better fault tolerance', 'Easy to scale up/down'],
        cons: ['Complexity increases', 'Network overhead', 'Data consistency challenges'],
        icon: '↔️',
      },
      {
        concept: 'Vertical Scaling',
        description: 'Increase resources on a single server',
        pros: ['Simpler architecture', 'Good for initial growth', 'Lower complexity'],
        cons: ['Hit hardware limits', 'Single point of failure', 'Higher downtime risk'],
        icon: '⬆️',
      },
      {
        concept: 'Load Balancing',
        description: 'Distribute requests across servers',
        pros: ['Even resource utilization', 'Better performance', 'Fault tolerance'],
        cons: ['Adds latency', 'Can become bottleneck', 'Session management complexity'],
        icon: '⚖️',
      },
      {
        concept: 'Caching',
        description: 'Store frequently accessed data in fast storage',
        pros: ['Reduced latency', 'Lower database load', 'Better user experience'],
        cons: ['Invalidation complexity', 'Stale data risk', 'Memory cost'],
        icon: '💾',
      },
      {
        concept: 'Database Sharding',
        description: 'Partition data across multiple databases',
        pros: ['Handle larger datasets', 'Parallel query processing', 'Geographic distribution'],
        cons: ['Increased complexity', 'Cross-shard queries hard', 'Data rebalancing'],
        icon: '🔀',
      },
      {
        concept: 'Replication',
        description: 'Maintain multiple copies of data',
        pros: ['High availability', 'Read scalability', 'Disaster recovery'],
        cons: ['Consistency challenges', 'Network overhead', 'Replication lag'],
        icon: '🔄',
      },
    ];
  }, []);

  const architecturePatterns = useMemo(() => {
    return [
      {
        pattern: 'Monolithic',
        description: 'Single unified codebase and deployment',
        useWhen: ['Small to medium projects', 'Simple requirements', 'Tight coupling needed'],
        risks: ['Hard to scale', 'Technology lock-in', 'Deployment risk'],
      },
      {
        pattern: 'Microservices',
        description: 'Independent services communicating via APIs',
        useWhen: ['Large complex applications', 'Multiple teams', 'Different tech stacks needed'],
        risks: ['Distributed system complexity', 'Eventual consistency', 'Network latency'],
      },
      {
        pattern: 'Layered/N-Tier',
        description: 'Presentation → Business Logic → Data',
        useWhen: ['Traditional web applications', 'Clear separation of concerns'],
        risks: ['Can become monolithic', 'Tight vertical coupling'],
      },
      {
        pattern: 'Event-Driven',
        description: 'Components communicate via events/messages',
        useWhen: ['Decoupled systems', 'Real-time data', 'Complex workflows'],
        risks: ['Debugging difficulty', 'Eventual consistency', 'Performance unpredictability'],
      },
    ];
  }, []);

  const commonProblems = useMemo(() => {
    return [
      {
        problem: 'Design a URL Shortener (bit.ly)',
        complexity: 'Medium',
        topics: ['Database design', 'URL generation', 'Caching', 'Analytics'],
        estimatedTime: '45 min',
      },
      {
        problem: 'Design Twitter / Real-time Feed',
        complexity: 'Hard',
        topics: [
          'Timeline generation',
          'Fan-out pattern',
          'Caching strategy',
          'Real-time updates',
        ],
        estimatedTime: '60 min',
      },
      {
        problem: 'Design a Distributed Cache (Redis)',
        complexity: 'Hard',
        topics: ['Data structures', 'Eviction policies', 'Replication', 'Cluster management'],
        estimatedTime: '60 min',
      },
      {
        problem: 'Design Uber / Location Services',
        complexity: 'Hard',
        topics: ['Geospatial indexing', 'Real-time matching', 'Routing', 'Scale'],
        estimatedTime: '60 min',
      },
      {
        problem: 'Design YouTube / Video Streaming',
        complexity: 'Hard',
        topics: ['Video encoding', 'CDN', 'Streaming protocols', 'Storage optimization'],
        estimatedTime: '60 min',
      },
      {
        problem: 'Design E-Commerce Platform (Amazon)',
        complexity: 'Hard',
        topics: ['Transactions', 'Inventory management', 'Payment processing', 'Search'],
        estimatedTime: '60 min',
      },
    ];
  }, []);

  return (
    <div data-cy="system-design-tab" className="space-y-6 py-4">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Boxes className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">System Design</h3>
            <p className="text-sm text-purple-800 mb-3">
              System design interviews evaluate your ability to design scalable, reliable systems. They
              focus on trade-offs, trade-off reasoning, and architectural thinking.
            </p>
            <div className="text-xs text-purple-700 font-medium bg-white bg-opacity-50 px-3 py-2 rounded inline-block">
              ⏱️ Typical interview: 45-60 minutes with discussion
            </div>
          </div>
        </div>
      </section>

      {/* System Design Approach */}
      <section className="space-y-3">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === 'approach' ? null : 'approach')
          }
          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-4 flex items-center justify-between transition-colors"
        >
          <h3 className="text-base font-semibold text-slate-900">📋 System Design Approach</h3>
          {expandedSection === 'approach' ? (
            <ChevronUp className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {expandedSection === 'approach' && (
          <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-white">
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  1️⃣ Understand Requirements (5-10 min)
                </div>
                <ul className="text-xs text-slate-700 space-y-1 ml-0">
                  <li>• Ask clarifying questions about functional and non-functional requirements</li>
                  <li>• Understand scale: users, requests per second, data size</li>
                  <li>• Identify constraints: latency, availability, consistency</li>
                  <li>• Ask about growth expectations</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  2️⃣ High-Level Architecture (10-15 min)
                </div>
                <ul className="text-xs text-slate-700 space-y-1 ml-0">
                  <li>• Draw simple blocks for major components</li>
                  <li>• Show data flow between components</li>
                  <li>• Identify key decisions (sync vs async, monolith vs microservices)</li>
                  <li>• Talk through alternatives with trade-offs</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  3️⃣ Deep Dives (20-30 min)
                </div>
                <ul className="text-xs text-slate-700 space-y-1 ml-0">
                  <li>• Database schema and indexing</li>
                  <li>• API endpoints and data models</li>
                  <li>• Caching strategy and invalidation</li>
                  <li>• Scaling solutions (sharding, replication)</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  4️⃣ Bottlenecks & Optimization (5-10 min)
                </div>
                <ul className="text-xs text-slate-700 space-y-1 ml-0">
                  <li>• Identify potential bottlenecks</li>
                  <li>• Propose monitoring and alerting</li>
                  <li>• Discuss failure modes and recovery</li>
                  <li>• Future scaling considerations</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Pro tip:</strong> Think out loud. The interviewer cares more about your reasoning
                than the final answer. Be comfortable discussing trade-offs and changing your mind.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Scaling Concepts */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Core Scaling Concepts
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {scalingConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
              data-cy={`scaling-concept-${idx}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{concept.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{concept.concept}</div>
                  <p className="text-sm text-slate-700 mt-1">{concept.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-700 mb-2">✓ Advantages</div>
                  <ul className="text-xs text-emerald-700 space-y-1">
                    {concept.pros.map((pro, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1">
                        <span className="mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-2">⚠️ Trade-offs</div>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {concept.cons.map((con, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1">
                        <span className="mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Patterns */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          Architecture Patterns
        </h3>
        <div className="space-y-3">
          {architecturePatterns.map((arch, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-4"
              data-cy={`architecture-pattern-${idx}`}
            >
              <div className="font-semibold text-slate-900 mb-2">{arch.pattern}</div>
              <p className="text-sm text-slate-700 mb-3">{arch.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-600 mb-2">Use When:</div>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {arch.useWhen.map((when, wIdx) => (
                      <li key={wIdx} className="flex items-start gap-1">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{when}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-700 mb-2">Risks:</div>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {arch.risks.map((risk, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1">
                        <span className="text-amber-600 mt-0.5">✗</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Design Problems */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-700" />
          Common Design Problems
        </h3>
        <div className="space-y-2">
          {commonProblems.map((problem, idx) => (
            <div
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start justify-between"
              data-cy={`design-problem-${idx}`}
            >
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{problem.problem}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {problem.topics.map((topic, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-3 flex-shrink-0 text-right">
                <div
                  className={`text-xs font-semibold px-2 py-1 rounded mb-1 ${
                    problem.complexity === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {problem.complexity}
                </div>
                <div className="text-xs text-slate-600">{problem.estimatedTime}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-xs text-blue-800">
            <strong>Preparation tip:</strong> Practice 3-4 problems deeply. Understand the trade-offs
            and why certain architectural decisions were made. You'll likely face variations of these
            problems.
          </p>
        </div>
      </section>

      {/* Key Terms */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          Key Terminology
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-semibold text-slate-900 mb-1">Consistency Models</div>
            <ul className="space-y-1 text-slate-700">
              <li>• <strong>Strong:</strong> All reads see latest write</li>
              <li>• <strong>Eventual:</strong> Consistency over time</li>
              <li>• <strong>Causal:</strong> Related operations ordered</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">Availability Concepts</div>
            <ul className="space-y-1 text-slate-700">
              <li>• <strong>HA:</strong> Minimize downtime</li>
              <li>• <strong>DR:</strong> Recovery from disasters</li>
              <li>• <strong>SLA/SLO:</strong> Service guarantees</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">Networking</div>
            <ul className="space-y-1 text-slate-700">
              <li>• <strong>Latency:</strong> Time for round trip</li>
              <li>• <strong>Throughput:</strong> Data per time unit</li>
              <li>• <strong>Bandwidth:</strong> Network capacity</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">Storage Concepts</div>
            <ul className="space-y-1 text-slate-700">
              <li>• <strong>ACID:</strong> Transaction properties</li>
              <li>• <strong>BASE:</strong> Eventual consistency</li>
              <li>• <strong>CAP:</strong> Distributed system trade-offs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interview Tips */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
        <h3 className="text-base font-semibold text-emerald-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Interview Tips
        </h3>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li>
            <strong>1. Ask questions first:</strong> Don't assume requirements. Clarify scale, users,
            regions, real-time needs.
          </li>
          <li>
            <strong>2. Think out loud:</strong> Talk through your reasoning. Explain trade-offs as you
            make decisions.
          </li>
          <li>
            <strong>3. Start simple:</strong> Begin with basic architecture, then scale up. Add
            complexity as needed.
          </li>
          <li>
            <strong>4. Draw diagrams:</strong> Use boxes, arrows, and labels. Visual communication helps
            clarify thinking.
          </li>
          <li>
            <strong>5. Discuss trade-offs:</strong> No perfect solution. Explain pros/cons of your
            choices.
          </li>
          <li>
            <strong>6. Identify bottlenecks:</strong> Proactively point out limitations and how you'd
            scale further.
          </li>
        </ul>
      </section>

      {/* Last Updated */}
      {prep.lastUpdated && (
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          Last updated: {new Date(prep.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SystemDesignTab;