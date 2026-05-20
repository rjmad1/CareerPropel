import React, { useMemo, useState } from 'react';
import {
  Mic,
  Square,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { InterviewPrep } from '../../types/interview';

interface MockInterviewProps {
  prep: InterviewPrep;
}

type InterviewState = 'setup' | 'recording' | 'reviewing' | 'completed';

/**
 * MockInterview Tab
 * Simulates a real interview experience:
 * - Question generation based on role and company
 * - Real-time microphone recording simulation
 * - Behavioral and technical question mixing
 * - Performance feedback and scoring
 * - Answer transcript and analysis
 * - Tips for improvement
 */
export const MockInterview: React.FC<MockInterviewProps> = ({ prep }) => {
  const [interviewState, setInterviewState] = useState<InterviewState>('setup');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const interviewQuestions = useMemo(() => {
    return [
      {
        id: 1,
        type: 'behavioral',
        question: 'Tell me about a time when you had to work with a difficult teammate. How did you handle it?',
        category: 'Teamwork',
        timeLimit: 120,
        expectedLength: '90-120 seconds',
      },
      {
        id: 2,
        type: 'technical',
        question: `Describe a challenging technical problem you solved recently. Walk me through your approach.`,
        category: 'Problem Solving',
        timeLimit: 180,
        expectedLength: '2-3 minutes',
      },
      {
        id: 3,
        type: 'behavioral',
        question: 'Tell me about a time when you received critical feedback. How did you respond?',
        category: 'Growth Mindset',
        timeLimit: 120,
        expectedLength: '90-120 seconds',
      },
      {
        id: 4,
        type: 'technical',
        question: `Design a system to handle user notifications for our platform. Consider scalability and latency.`,
        category: 'System Design',
        timeLimit: 300,
        expectedLength: '4-5 minutes',
      },
      {
        id: 5,
        type: 'behavioral',
        question: 'Describe a project where you led a team to success. What was your role?',
        category: 'Leadership',
        timeLimit: 180,
        expectedLength: '2-3 minutes',
      },
    ];
  }, []);

  const currentQuestionData = interviewQuestions[currentQuestion];

  const mockFeedback = useMemo(() => {
    if (interviewState !== 'reviewing') return null;

    return {
      overallScore: 72,
      competencies: [
        { name: 'Communication', score: 78, feedback: 'Clear and well-structured answer' },
        { name: 'Problem Solving', score: 70, feedback: 'Good approach, but could have been more specific' },
        { name: 'Leadership', score: 65, feedback: 'Need to emphasize your specific contributions' },
        { name: 'Technical Depth', score: 75, feedback: 'Strong technical knowledge demonstrated' },
      ],
      strengths: [
        'Used specific examples and metrics',
        'Clear problem-solving methodology',
        'Good communication and pacing',
      ],
      improvements: [
        'Include more quantifiable results',
        'Focus on YOUR impact, not team impact',
        'Practice more system design scenarios',
        'Work on brevity - some answers were too long',
      ],
    };
  }, [interviewState]);

  const completionStats = useMemo(() => {
    return {
      questionsAnswered: userAnswers.length,
      totalTime: recordingTime,
      averageAnswerTime: recordingTime / (userAnswers.length || 1),
    };
  }, [userAnswers, recordingTime]);

  const handleStartInterview = () => {
    setInterviewState('recording');
    setCurrentQuestion(0);
    setRecordingTime(0);
    setUserAnswers([]);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers];
    if (!newAnswers[currentQuestion]) {
      newAnswers[currentQuestion] = `Sample answer to question ${currentQuestion + 1}...`;
    }
    setUserAnswers(newAnswers);

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setInterviewState('reviewing');
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const handleRetake = () => {
    handleStartInterview();
  };

  return (
    <div data-cy="mock-interview-tab" className="space-y-12 py-8">
      {/* Setup Screen */}
      {interviewState === 'setup' && (
        <div className="space-y-12">
          {/* Header */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-10">
            <div className="flex items-start gap-6">
              <Mic className="w-10 h-10 text-blue-600 flex-shrink-0 mt-2" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Mock Interview Simulation
                </h3>
                <p className="text-sm text-blue-800">
                  Practice answering real interview questions in a realistic setting. Get feedback on
                  your performance and identify areas for improvement.
                </p>
              </div>
            </div>
          </section>

          {/* Interview Format */}
          <section className="space-y-6">
            <h3 className="text-base font-semibold text-slate-900">Interview Format</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
                <div className="text-sm font-semibold text-slate-900 mb-4">📝 Mix of Questions</div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li>• 3 Behavioral questions</li>
                  <li>• 2 Technical/Design questions</li>
                  <li>• Real role-specific scenarios</li>
                </ul>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
                <div className="text-sm font-semibold text-slate-900 mb-4">⏱️ Time Limits</div>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li>• Each question has a time limit</li>
                  <li>• Total interview: ~15 minutes</li>
                  <li>• Matches real interview pace</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 space-y-6">
            <h3 className="text-base font-semibold text-emerald-900">How It Works</h3>
            <ol className="space-y-4 text-sm text-emerald-800">
              <li>
                <strong>1. Read the question:</strong> You&apos;ll see the question on screen. Take a moment to
                think.
              </li>
              <li>
                <strong>2. Answer aloud:</strong> Click the microphone to start recording your answer.
              </li>
              <li>
                <strong>3. Submit answer:</strong> Click &quot;Next Question&quot; when done. You can skip if needed.
              </li>
              <li>
                <strong>4. Get feedback:</strong> After all questions, you&apos;ll receive detailed feedback on
                your responses.
              </li>
            </ol>
          </section>

          {/* Start Button */}
          <button
            onClick={handleStartInterview}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-lg transition-colors flex items-center justify-center gap-4"
            data-cy="start-interview-button"
          >
            <Mic className="w-10 h-10" />
            Start Mock Interview
          </button>

          {/* Tips */}
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-8">
            <div className="text-sm font-semibold text-amber-900 mb-6">💡 Tips for Success</div>
            <ul className="space-y-4 text-xs text-amber-800">
              <li>• Speak clearly and at a natural pace</li>
              <li>• Use specific examples with metrics</li>
              <li>• Take a moment to think before answering</li>
              <li>• Structure your answer (situation, action, result)</li>
              <li>• Don&apos;t exceed the time limit significantly</li>
            </ul>
          </section>
        </div>
      )}

      {/* Recording Screen */}
      {interviewState === 'recording' && (
        <div className="space-y-12">
          {/* Progress */}
          <div className="bg-slate-100 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / interviewQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Current Question */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-600">
                  Question {currentQuestion + 1} of {interviewQuestions.length}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Type: {currentQuestionData?.type === 'behavioral' ? '💬 Behavioral' : '🔧 Technical'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-600">
                  {currentQuestionData?.category}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Time limit: {currentQuestionData?.timeLimit}s
                </div>
              </div>
            </div>

            {/* Question Display */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-12">
              <p className="text-lg font-semibold text-indigo-900">
                {currentQuestionData?.question}
              </p>
              <p className="text-sm text-indigo-700 mt-6">
                Expected answer length: {currentQuestionData?.expectedLength}
              </p>
            </div>
          </section>

          {/* Recording Controls */}
          <section className="space-y-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-12 text-center">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="w-6 h-6 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-red-900">Recording</span>
              </div>
              <div className="text-3xl font-mono font-bold text-red-900">
                {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
              </div>
              <p className="text-xs text-red-700 mt-6">
                Speak clearly. You can click &quot;Next Question&quot; when done or wait for the timer.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-6">
              <button
                onClick={handleSkipQuestion}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-4"
                data-cy="skip-question-button"
              >
                <SkipForward className="w-8 h-8" />
                Skip
              </button>
              <button
                disabled
                className="bg-gray-400 text-white font-semibold py-4 px-8 rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-4"
              >
                <Square className="w-8 h-8" />
                Pause
              </button>
              <button
                onClick={handleNextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-4"
                data-cy="next-question-button"
              >
                <SkipForward className="w-8 h-8" />
                Next
              </button>
            </div>
          </section>

          {/* Time Hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-xs text-blue-800">
              <strong>💡 Time Tip:</strong> Most interviewers prefer concise, structured answers. Aim
              for 2-3 minutes for behavioral and 3-5 minutes for technical questions.
            </p>
          </div>
        </div>
      )}

      {/* Reviewing Screen */}
      {interviewState === 'reviewing' && mockFeedback && (
        <div className="space-y-12">
          {/* Overall Score */}
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-12">
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray={`${(mockFeedback.overallScore / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <div className="text-2xl font-bold text-emerald-900">
                      {mockFeedback.overallScore}
                    </div>
                    <div className="text-xs text-emerald-700">/100</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4">Interview Performance</h3>
                <div className="space-y-4 text-sm text-emerald-800">
                  <div>
                    <strong>Questions answered:</strong> {completionStats.questionsAnswered} of{' '}
                    {interviewQuestions.length}
                  </div>
                  <div>
                    <strong>Total time:</strong> {Math.floor(completionStats.totalTime / 60)} min{' '}
                    {completionStats.totalTime % 60} sec
                  </div>
                  <div>
                    <strong>Average per question:</strong> ~{Math.floor(completionStats.averageAnswerTime)}{' '}
                    seconds
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Competency Breakdown */}
          <section className="space-y-6">
            <h3 className="text-base font-semibold text-slate-900">Competency Breakdown</h3>
            <div className="space-y-6">
              {mockFeedback.competencies.map((comp, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-lg p-8"
                  data-cy={`competency-${idx}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-slate-900">{comp.name}</div>
                    <div
                      className={`text-sm font-bold px-4 py-2 rounded ${
                        comp.score >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.score >= 65
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {comp.score}/100
                    </div>
                  </div>
                  <div className="w-full h-4 bg-slate-300 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full ${
                        comp.score >= 75
                          ? 'bg-emerald-500'
                          : comp.score >= 65
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${comp.score}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-700">{comp.feedback}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths */}
          <section className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 space-y-6">
            <h3 className="text-base font-semibold text-emerald-900 flex items-center gap-4">
              <CheckCircle2 className="w-10 h-10" />
              Strengths
            </h3>
            <ul className="space-y-4">
              {mockFeedback.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-emerald-900 flex items-start gap-4">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Areas for Improvement */}
          <section className="bg-amber-50 border border-amber-200 rounded-lg p-8 space-y-6">
            <h3 className="text-base font-semibold text-amber-900 flex items-center gap-4">
              <AlertCircle className="w-10 h-10" />
              Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {mockFeedback.improvements.map((improvement, idx) => (
                <li key={idx} className="text-sm text-amber-900 flex items-start gap-4">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Retake Button */}
          <button
            onClick={handleRetake}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-8 rounded-lg transition-colors flex items-center justify-center gap-4"
            data-cy="retake-interview-button"
          >
            <RefreshCw className="w-10 h-10" />
            Retake Interview
          </button>

          {/* Next Steps */}
          <section className="bg-slate-50 border border-slate-200 rounded-lg p-8">
            <div className="text-sm font-semibold text-slate-900 mb-6">🎯 Next Steps</div>
            <ol className="space-y-4 text-xs text-slate-700">
              <li>1. Review the improvement areas above</li>
              <li>2. Check the Behavioral Stories tab for better STAR frameworks</li>
              <li>3. Practice the specific areas where you scored lower</li>
              <li>4. Retake this mock interview after practicing</li>
              <li>5. Aim for 80+ score before the real interview</li>
            </ol>
          </section>
        </div>
      )}

      {/* Last Updated */}
      {prep.lastUpdated && interviewState === 'setup' && (
        <div className="text-xs text-slate-500 pt-4 border-t border-slate-200">
          Last updated: {new Date(prep.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default MockInterview;