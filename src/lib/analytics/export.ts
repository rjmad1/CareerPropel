/**
 * Analytics Export Module
 * Provides comprehensive analytics calculation and multi-format export functionality
 * Supports: CSV, JSON, HTML, and PDF formats
 */

import { Job } from '@prisma/client';

export interface AnalyticsMetrics {
  totalApplications: number;
  successRate: number;
  stageBreakdown: Record<string, number>;
  salaryMetrics: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  matchScoreDistribution: Record<string, number>;
  outcomesSummary: {
    interested: number;
    applied: number;
    interviewing: number;
    offered: number;
    rejected: number;
    withdrawn: number;
  };
  averageDaysInPipeline: number;
  applicationsByDate: Record<string, number>;
  topCompanies: Array<{
    name: string;
    applications: number;
    successRate: number;
  }>;
  rejectionRate: number;
  interviewRate: number;
  offerRate: number;
}

/**
 * Calculate comprehensive analytics from job applications
 */
export function calculateAnalytics(jobs: Job[]): AnalyticsMetrics {
  if (jobs.length === 0) {
    return getEmptyAnalytics();
  }

  const stages = jobs.reduce(
    (acc, job) => {
      acc[job.stage] = (acc[job.stage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const salaries = jobs
    .filter((job) => {
      const s = job.salary as { min?: number; max?: number } | null;
      return s?.min || s?.max;
    })
    .map((job) => {
      const s = job.salary as { min?: number; max?: number } | null;
      return { min: s?.min || 0, max: s?.max || 0 };
    });

  const salaryValues = salaries.flatMap((s) => [s.min, s.max]);
  const salaryMetrics = {
    min: Math.min(...salaryValues, 0),
    max: Math.max(...salaryValues, 0),
    average:
      salaryValues.length > 0
        ? salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length
        : 0,
    median:
      salaryValues.length > 0
        ? salaryValues.sort((a, b) => a - b)[
            Math.floor(salaryValues.length / 2)
          ]
        : 0,
  };

  const matchScoreDistribution = getMatchScoreDistribution(jobs);
  const outcomesSummary = getOutcomesSummary(jobs);
  const averageDaysInPipeline = calculateAverageDaysInPipeline(jobs);
  const applicationsByDate = getApplicationsByDate(jobs);
  const topCompanies = getTopCompanies(jobs);

  const rejectedCount = jobs.filter(
    (job) => job.stage === 'rejected'
  ).length;
  const interviewCount = jobs.filter(
    (job) =>
      [
        'recruiter_screen',
        'hiring_manager',
        'technical_interview',
        'system_design',
        'behavioral',
        'final_round',
      ].includes(job.stage)
  ).length;
  const offeredCount = jobs.filter((job) => job.stage === 'offer').length;

  return {
    totalApplications: jobs.length,
    successRate:
      jobs.length > 0 ? (offeredCount / jobs.length) * 100 : 0,
    stageBreakdown: stages,
    salaryMetrics,
    matchScoreDistribution,
    outcomesSummary,
    averageDaysInPipeline,
    applicationsByDate,
    topCompanies,
    rejectionRate:
      jobs.length > 0 ? (rejectedCount / jobs.length) * 100 : 0,
    interviewRate:
      jobs.length > 0 ? (interviewCount / jobs.length) * 100 : 0,
    offerRate: jobs.length > 0 ? (offeredCount / jobs.length) * 100 : 0,
  };
}

function getEmptyAnalytics(): AnalyticsMetrics {
  return {
    totalApplications: 0,
    successRate: 0,
    stageBreakdown: {},
    salaryMetrics: {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
    },
    matchScoreDistribution: {},
    outcomesSummary: {
      interested: 0,
      applied: 0,
      interviewing: 0,
      offered: 0,
      rejected: 0,
      withdrawn: 0,
    },
    averageDaysInPipeline: 0,
    applicationsByDate: {},
    topCompanies: [],
    rejectionRate: 0,
    interviewRate: 0,
    offerRate: 0,
  };
}

function getMatchScoreDistribution(jobs: Job[]): Record<string, number> {
  const distribution: Record<string, number> = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };

  jobs.forEach((job) => {
    const score = (job as { matchScore?: number }).matchScore ?? 0;
    if (score <= 20) distribution['0-20']++;
    else if (score <= 40) distribution['21-40']++;
    else if (score <= 60) distribution['41-60']++;
    else if (score <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });

  return distribution;
}

function getOutcomesSummary(jobs: Job[]) {
  return {
    interested: jobs.filter((job) => job.stage === 'interested').length,
    applied: jobs.filter((job) => job.stage === 'applied').length,
    interviewing: jobs.filter((job) =>
      [
        'recruiter_screen',
        'hiring_manager',
        'technical_interview',
        'system_design',
        'behavioral',
        'final_round',
      ].includes(job.stage)
    ).length,
    offered: jobs.filter((job) => job.stage === 'offer').length,
    rejected: jobs.filter((job) => job.stage === 'rejected').length,
    withdrawn: jobs.filter((job) => job.stage === 'archived').length,
  };
}

function calculateAverageDaysInPipeline(jobs: Job[]): number {
  if (jobs.length === 0) return 0;

  const now = new Date();
  const daysInPipeline = jobs.map((job) => {
    const createdDate = new Date(job.createdAt);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });

  return (
    daysInPipeline.reduce((a, b) => a + b, 0) / daysInPipeline.length
  );
}

function getApplicationsByDate(jobs: Job[]): Record<string, number> {
  const byDate: Record<string, number> = {};

  jobs.forEach((job) => {
    const dateKey = job.createdAt.toISOString().split('T')[0];
    byDate[dateKey] = (byDate[dateKey] || 0) + 1;
  });

  return byDate;
}

function getTopCompanies(
  jobs: Job[]
): Array<{ name: string; applications: number; successRate: number }> {
  const companyStats: Record<
    string,
    { applications: number; offers: number }
  > = {};

  jobs.forEach((job) => {
    const company = job.company;
    if (!companyStats[company]) {
      companyStats[company] = { applications: 0, offers: 0 };
    }
    companyStats[company].applications++;
    if (job.stage === 'offer') {
      companyStats[company].offers++;
    }
  });

  return Object.entries(companyStats)
    .map(([name, stats]) => ({
      name,
      applications: stats.applications,
      successRate:
        stats.applications > 0
          ? (stats.offers / stats.applications) * 100
          : 0,
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 10);
}

/**
 * Export analytics to CSV format
 */
export function exportAnalyticsToCSV(metrics: AnalyticsMetrics): string {
  const rows: string[] = [];

  rows.push('Career Propel Analytics Report');
  rows.push(`Generated: ${new Date().toISOString()}`);
  rows.push('');

  // Summary Metrics
  rows.push('SUMMARY METRICS');
  rows.push(`Total Applications,${metrics.totalApplications}`);
  rows.push(`Success Rate,${metrics.successRate.toFixed(2)}%`);
  rows.push(`Interview Rate,${metrics.interviewRate.toFixed(2)}%`);
  rows.push(`Rejection Rate,${metrics.rejectionRate.toFixed(2)}%`);
  rows.push(`Offer Rate,${metrics.offerRate.toFixed(2)}%`);
  rows.push(`Average Days in Pipeline,${metrics.averageDaysInPipeline.toFixed(1)}`);
  rows.push('');

  // Stage Breakdown
  rows.push('STAGE BREAKDOWN');
  rows.push('Stage,Count');
  Object.entries(metrics.stageBreakdown).forEach(([stage, count]) => {
    rows.push(`${stage},${count}`);
  });
  rows.push('');

  // Salary Metrics
  rows.push('SALARY METRICS');
  rows.push(`Minimum,${metrics.salaryMetrics.min}`);
  rows.push(`Maximum,${metrics.salaryMetrics.max}`);
  rows.push(`Average,${metrics.salaryMetrics.average.toFixed(2)}`);
  rows.push(`Median,${metrics.salaryMetrics.median.toFixed(2)}`);
  rows.push('');

  // Match Score Distribution
  rows.push('MATCH SCORE DISTRIBUTION');
  rows.push('Range,Count');
  Object.entries(metrics.matchScoreDistribution).forEach(([range, count]) => {
    rows.push(`${range},${count}`);
  });
  rows.push('');

  // Top Companies
  rows.push('TOP COMPANIES');
  rows.push('Company,Applications,Success Rate');
  metrics.topCompanies.forEach((company) => {
    rows.push(
      `${company.name},${company.applications},${company.successRate.toFixed(2)}%`
    );
  });

  return rows.join('\n');
}

/**
 * Export analytics to JSON format
 */
export function exportAnalyticsToJSON(metrics: AnalyticsMetrics): string {
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      ...metrics,
    },
    null,
    2
  );
}

/**
 * Generate analytics HTML report
 */
export function generateAnalyticsHTML(metrics: AnalyticsMetrics): string {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Propel Analytics Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #ddd;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    
    tr:hover {
      background: #f9f9f9;
    }
    
    .footer {
      background: #f5f5f5;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Career Propel Analytics Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2 class="section-title">Summary Metrics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Applications</div>
            <div class="metric-value">${metrics.totalApplications}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Success Rate</div>
            <div class="metric-value">${metrics.successRate.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Interview Rate</div>
            <div class="metric-value">${metrics.interviewRate.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Rejection Rate</div>
            <div class="metric-value">${metrics.rejectionRate.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Offer Rate</div>
            <div class="metric-value">${metrics.offerRate.toFixed(1)}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Avg Days in Pipeline</div>
            <div class="metric-value">${metrics.averageDaysInPipeline.toFixed(1)}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Pipeline Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(metrics.stageBreakdown)
              .map(
                ([stage, count]) => `
              <tr>
                <td>${stage}</td>
                <td>${count}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2 class="section-title">Top Companies</h2>
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Applications</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.topCompanies
              .map(
                (company) => `
              <tr>
                <td>${company.name}</td>
                <td>${company.applications}</td>
                <td>${company.successRate.toFixed(1)}%</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="footer">
      <p>Career Propel &copy; 2026. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  return html;
}

/**
 * Download file helper
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
