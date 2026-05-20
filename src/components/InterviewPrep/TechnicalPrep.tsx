import React, { useMemo, useState } from 'react';
import {
  Code2,
  Zap,
  BarChart3,
  BookOpen,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';

interface TechnicalPrepProps {
  prep: InterviewPrep;
}

/**
 * TechnicalPrep Tab
 * Displays technical interview preparation:
 * - Programming language proficiency review
 * - Algorithm and data structure fundamentals
 * - Practice problems with difficulty progression
 * - Topic coverage and learning paths
 * - Time recommendations for practice
 * - Common patterns and gotchas
 */
export const TechnicalPrep: React.FC<TechnicalPrepProps> = ({ prep }) => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>('arrays');

  const technicalData = useMemo(() => {
    return prep.technicalPrep || {};
  }, [prep]);

  const languages = useMemo(() => {
    return technicalData.programmingLanguages || [];
  }, [technicalData]);

  const practiceProblemsByDifficulty = useMemo(() => {
    const problems = technicalData.practiceProblems || [];
    const easy = problems.filter(p => p.difficulty === 'easy').length;
    const medium = problems.filter(p => p.difficulty === 'medium').length;
    const hard = problems.filter(p => p.difficulty === 'hard').length;
    return { easy, medium, hard };
  }, [technicalData]);

  const commonTopics = useMemo(() => {
    return [
      {
        category: 'Data Structures',
        topics: [
          { name: 'Arrays & Strings', keyPoints: ['Indexing', 'Two-pointer', 'Sliding window'] },
          {
            name: 'Hash Tables',
            keyPoints: ['Hash collisions', 'Load factor', 'Time complexity'],
          },
          {
            name: 'Linked Lists',
            keyPoints: ['Node manipulation', 'Cycle detection', 'Reverse linked list'],
          },
          {
            name: 'Trees & Graphs',
            keyPoints: ['DFS/BFS', 'Tree traversal', 'Graph representation'],
          },
          { name: 'Stacks & Queues', keyPoints: ['LIFO/FIFO', 'Monotonic stack'] },
          { name: 'Heaps', keyPoints: ['Min/Max heap', 'Priority queue', 'Heap operations'] },
        ],
      },
      {
        category: 'Algorithms',
        topics: [
          { name: 'Sorting', keyPoints: ['Merge sort', 'Quick sort', 'Time/space complexity'] },
          { name: 'Searching', keyPoints: ['Binary search', 'Variants', 'Boundary conditions'] },
          { name: 'Dynamic Programming', keyPoints: ['Memoization', 'Bottom-up', 'State design'] },
          { name: 'Greedy', keyPoints: ['Optimal substructure', 'Proof of correctness'] },
          { name: 'Backtracking', keyPoints: ['Recursion', 'Pruning', 'Permutations/combinations'] },
        ],
      },
      {
        category: 'System Design Foundations',
        topics: [
          { name: 'Complexity Analysis', keyPoints: ['Big O', 'Time vs space', 'Amortized'] },
          { name: 'Database Basics', keyPoints: ['Indexing', 'Transactions', 'Query optimization'] },
          { name: 'API Design', keyPoints: ['REST principles', 'Status codes', 'Error handling'] },
        ],
      },
    ];
  }, []);

  const practiceStrategy = useMemo(() => {
    return {
      'Arrays': {
        difficulty: 'Foundation',
        estimatedHours: 4,
        problems: 8,
        keyPatterns: [
          'Two-pointer technique',
          'Sliding window',
          'Prefix sums',
          'Sorting in-place',
        ],
      },
      'Hash Maps': {
        difficulty: 'Foundation',
        estimatedHours: 3,
        problems: 6,
        keyPatterns: [
          'Counting frequencies',
          'Finding pairs',
          'Anagrams',
          'Top K elements',
        ],
      },
      'Linked Lists': {
        difficulty: 'Intermediate',
        estimatedHours: 4,
        problems: 6,
        keyPatterns: [
          'Reversing lists',
          'Cycle detection',
          'Merging lists',
          'Slow/fast pointers',
        ],
      },
      'Trees': {
        difficulty: 'Intermediate',
        estimatedHours: 5,
        problems: 10,
        keyPatterns: [
          'Tree traversal (DFS/BFS)',
          'Level-order traversal',
          'Path sum problems',
          'Lowest Common Ancestor',
        ],
      },
      'Graphs': {
        difficulty: 'Intermediate',
        estimatedHours: 5,
        problems: 8,
        keyPatterns: [
          'BFS/DFS',
          'Shortest path',
          'Topological sort',
          'Union-Find',
        ],
      },
      'Dynamic Programming': {
        difficulty: 'Advanced',
        estimatedHours: 8,
        problems: 12,
        keyPatterns: [
          'Memoization',
          'Tabulation',
          'State definition',
          'Transition equations',
        ],
      },
    };
  }, []);

  return (
    <div data-cy="technical-prep-tab" className="space-y-12 py-8">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-10">
        <div className="flex items-start gap-6">
          <Code2 className="w-10 h-10 text-emerald-600 flex-shrink-0 mt-2" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Technical Interview Prep</h3>
            <p className="text-sm text-emerald-800 mb-6">
              Most technical interviews focus on algorithms, data structures, and problem-solving. This
              guide covers the essential topics and practice path.
            </p>
            <div className="text-xs text-emerald-700 font-medium bg-white bg-opacity-50 px-6 py-4 rounded inline-block">
              💡 Estimated preparation time: 40-60 hours for proficiency
            </div>
          </div>
        </div>
      </section>

      {/* Programming Languages */}
      {languages.length > 0 && (
        <section className="space-y-6">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
            <Code2 className="w-10 h-10 text-blue-600" />
            Primary Languages
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {languages.map((lang, idx) => (
              <div
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6"
                data-cy={`language-${idx}`}
              >
                <div className="text-sm font-semibold text-blue-900 mb-2">{lang.language}</div>
                <div className="text-xs text-blue-700">
                  Have working knowledge of this language
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> You'll likely code in your language of choice. Make sure you're
              comfortable with syntax, string manipulation, and built-in data structures.
            </p>
          </div>
        </section>
      )}

      {/* Practice Problems Summary */}
      <section className="space-y-6">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <BarChart3 className="w-10 h-10 text-orange-600" />
          Practice Problem Roadmap
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-2xl font-bold text-green-700">{practiceProblemsByDifficulty.easy}</div>
            <div className="text-sm text-green-800 font-medium">Easy</div>
            <div className="text-xs text-green-700 mt-2">Warmup problems</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-2xl font-bold text-yellow-700">{practiceProblemsByDifficulty.medium}</div>
            <div className="text-sm text-yellow-800 font-medium">Medium</div>
            <div className="text-xs text-yellow-700 mt-2">Most interview questions</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-2xl font-bold text-red-700">{practiceProblemsByDifficulty.hard}</div>
            <div className="text-sm text-red-800 font-medium">Hard</div>
            <div className="text-xs text-red-700 mt-2">For senior positions</div>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6">
          <p className="text-xs text-slate-700">
            <strong>Recommended approach:</strong> Master 5-10 easy problems first, then 15-20 medium
            problems. Hard problems are optional unless interviewing for senior/staff roles.
          </p>
        </div>
      </section>

      {/* Core Topics Breakdown */}
      <section className="space-y-8">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-4">
          <BookOpen className="w-10 h-10 text-slate-700" />
          Core Topics & Learning Path
        </h3>

        {commonTopics.map((categoryGroup, catIdx) => (
          <div key={catIdx} className="space-y-6" data-cy={`topic-category-${catIdx}`}>
            <h4 className="font-semibold text-slate-800 text-sm">{categoryGroup.category}</h4>
            <div className="space-y-4">
              {categoryGroup.topics.map((topic, topicIdx) => {
                const strategy = practiceStrategy[topic.name as keyof typeof practiceStrategy];
                return (
                  <div
                    key={topicIdx}
                    className="border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-slate-300 transition-colors"
                    onClick={() =>
                      setExpandedTopic(expandedTopic === topic.name ? null : topic.name)
                    }
                    data-cy={`topic-${topicIdx}`}
                  >
                    <div className="bg-slate-50 hover:bg-slate-100 p-6 flex items-start justify-between transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 mb-2">{topic.name}</div>
                        <div className="flex flex-wrap gap-2">
                          {topic.keyPoints.map((point, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-xs bg-white border border-slate-300 text-slate-700 px-4 py-0.5 rounded"
                            >
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                      {strategy && (
                        <div className="ml-6 flex-shrink-0 text-right">
                          <div className="text-xs font-semibold text-slate-600">
                            {strategy.estimatedHours}h
                          </div>
                          <div className="text-xs text-slate-500">{strategy.problems} problems</div>
                        </div>
                      )}
                    </div>

                    {expandedTopic === topic.name && strategy && (
                      <div className="border-t border-slate-200 p-8 bg-white space-y-6">
                        <div>
                          <div className="text-sm font-semibold text-slate-800 mb-4">
                            Key Patterns to Master
                          </div>
                          <ul className="space-y-2">
                            {strategy.keyPatterns.map((pattern, pIdx) => (
                              <li
                                key={pIdx}
                                className="text-sm text-slate-700 flex items-start gap-4"
                              >
                                <span className="text-slate-400 mt-0.5">•</span>
                                <span>{pattern}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="text-xs font-semibold text-emerald-900 mb-2">
                            Difficulty: {strategy.difficulty}
                          </div>
                          <div className="text-xs text-emerald-800">
                            Estimated time: {strategy.estimatedHours} hours | Problems: {strategy.problems}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Recommended Study Order */}
      <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-semibold text-indigo-900 flex items-center gap-4">
          <TrendingUp className="w-10 h-10" />
          Recommended Study Path
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="bg-indigo-600 text-white font-semibold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold text-indigo-900">
                Week 1-2: Fundamentals (Arrays, Hash Maps, Strings)
              </div>
              <div className="text-xs text-indigo-800">Get comfortable with basic data structures and string manipulation. Solve 5-10 easy problems.</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="bg-indigo-600 text-white font-semibold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold text-indigo-900">
                Week 3-4: Intermediate (Trees, Graphs, Linked Lists)
              </div>
              <div className="text-xs text-indigo-800">Master traversal patterns and graph algorithms. Solve 15-20 medium problems.</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="bg-indigo-600 text-white font-semibold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold text-indigo-900">
                Week 5-6: Advanced (Dynamic Programming, Design Problems)
              </div>
              <div className="text-xs text-indigo-800">Tackle DP problems and system design fundamentals. 10-15 problems, mock interviews.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="bg-amber-50 border border-amber-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-semibold text-amber-900 flex items-center gap-4">
          <AlertCircle className="w-10 h-10" />
          Common Mistakes to Avoid
        </h3>
        <ul className="space-y-4">
          <li className="text-sm text-amber-900 flex items-start gap-4">
            <span className="text-amber-600 mt-0.5">✗</span>
            <span>
              <strong>Jumping to hard problems:</strong> Master medium difficulty first. Hard problems
              are diminishing returns.
            </span>
          </li>
          <li className="text-sm text-amber-900 flex items-start gap-4">
            <span className="text-amber-600 mt-0.5">✗</span>
            <span>
              <strong>Memorizing solutions:</strong> Understand the approach and principles. You won't
              memorize every problem pattern.
            </span>
          </li>
          <li className="text-sm text-amber-900 flex items-start gap-4">
            <span className="text-amber-600 mt-0.5">✗</span>
            <span>
              <strong>Skipping complexity analysis:</strong> Always discuss time and space complexity
              with your interviewer.
            </span>
          </li>
          <li className="text-sm text-amber-900 flex items-start gap-4">
            <span className="text-amber-600 mt-0.5">✗</span>
            <span>
              <strong>Not coding during practice:</strong> Actually write code, don't just think
              through it. Practice clean code habits.
            </span>
          </li>
        </ul>
      </section>

      {/* Interview Tips */}
      <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 space-y-6">
        <h3 className="text-base font-semibold text-emerald-900 flex items-center gap-4">
          <Zap className="w-10 h-10" />
          During the Interview
        </h3>
        <div className="space-y-4 text-sm text-emerald-800">
          <div>
            <strong>1. Clarify the problem:</strong> Ask clarifying questions about input constraints,
            edge cases, and output format.
          </div>
          <div>
            <strong>2. Think out loud:</strong> Explain your approach before coding. Discuss trade-offs.
          </div>
          <div>
            <strong>3. Start simple:</strong> Get a brute force solution working first, then optimize.
          </div>
          <div>
            <strong>4. Test thoroughly:</strong> Walk through your code with test cases and edge cases.
          </div>
          <div>
            <strong>5. Discuss complexity:</strong> Clearly explain time and space complexity with Big O
            notation.
          </div>
          <div>
            <strong>6. Optimize:</strong> Can you improve the solution? Is there a more elegant approach?
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-8">
        <div className="text-sm font-semibold text-slate-900 mb-6">📚 Recommended Resources</div>
        <ul className="space-y-4 text-xs text-slate-700">
          <li>• <strong>LeetCode</strong> - Structured problem practice with explanations</li>
          <li>• <strong>GeeksforGeeks</strong> - In-depth algorithm tutorials and code examples</li>
          <li>• <strong>NeetCode</strong> - Video walkthrough of popular interview problems</li>
          <li>• <strong>System Design Primer</strong> - Foundations for system design (interviews might ask)</li>
          <li>• <strong>Mock interview platform</strong> - Practice with real-time feedback</li>
        </ul>
      </section>

      {/* Last Updated */}
      {prep.lastUpdated && (
        <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
          Last updated: {new Date(prep.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default TechnicalPrep;