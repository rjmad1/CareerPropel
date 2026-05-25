/**
 * GET /api/analytics/export
 *
 * Multi-format analytics export for reporting, coaching summaries, and
 * executive-style career intelligence reports.
 *
 * Query params:
 *   format: json (default) | csv | html
 *   type:   full (default) | pipeline | compensation | coaching
 *
 * Formats:
 *   json  — raw analytics data, structured for programmatic use
 *   csv   — flat tabular export for spreadsheet analysis
 *   html  — styled HTML report, PDF-ready via browser print
 *
 * Content-Disposition headers set for browser download in csv/html modes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { computeOpportunityQuality } from '@/lib/analytics/opportunity-intelligence';
import { computeCompensationIntelligence } from '@/lib/analytics/compensation-intelligence';
import { computeBehavioralAnalytics } from '@/lib/analytics/behavioral-analytics';
import { generateStrategicRecommendations } from '@/lib/analytics/recommendations-engine';
import type {
  OpportunityQualityResult,
} from '@/lib/analytics/opportunity-intelligence';
import type {
  CompensationIntelligenceResult,
} from '@/lib/analytics/compensation-intelligence';
import type { BehavioralAnalyticsResult } from '@/lib/analytics/behavioral-analytics';
import type { StrategicRecommendation } from '@/lib/analytics/types';

export const dynamic = 'force-dynamic';

function safe<T>(r: PromiseSettledResult<T>): T | null {
  return r.status === 'fulfilled' ? r.value : null;
}

// ── CSV Builder ───────────────────────────────────────────────────────────────

function buildCSV(
  candidateName: string,
  opp: OpportunityQualityResult | null,
  comp: CompensationIntelligenceResult | null,
  beh: BehavioralAnalyticsResult | null,
  recs: StrategicRecommendation[],
): string {
  const rows: string[] = [
    'Career Propel — Analytics Export',
    `Candidate,"${candidateName}"`,
    `Generated,"${new Date().toISOString()}"`,
  ];

  if (opp) {
    rows.push('', 'OPPORTUNITY QUALITY');
    rows.push(`Active Opportunities,${opp.totalActive}`);
    rows.push(`High Priority,${opp.highProbability.length}`);
    rows.push(`Low ROI,${opp.lowROI.length}`);
    rows.push(`Compensation Mismatches,${opp.compensationMismatches.length}`);
    if (opp.scores.length > 0) {
      rows.push('', 'Role,Company,Quality Score,Recommendation,Success Probability');
      for (const s of opp.scores.slice(0, 25)) {
        rows.push(
          `"${s.title}","${s.company}",${s.qualityScore},${s.recommendation},${s.successProbability.value}%`,
        );
      }
    }
  }

  if (comp) {
    rows.push('', 'COMPENSATION SUMMARY');
    rows.push(`Total Offers,${comp.totalOffers}`);
    rows.push(`Negotiated,${comp.negotiatedCount}`);
    rows.push(`Avg Offer Salary,${comp.avgSalaryAllOffers ?? 'N/A'}`);
    rows.push(`Max Salary Offered,${comp.maxSalaryOffered ?? 'N/A'}`);
    rows.push(`Min Salary Offered,${comp.minSalaryOffered ?? 'N/A'}`);
    if (comp.offers.length > 0) {
      rows.push('', 'Company,Title,Salary,Bonus,Total Comp,Status,Negotiated');
      for (const o of comp.offers) {
        rows.push(
          `"${o.company}","${o.title}",${o.salary ?? ''},${o.bonus ?? ''},${o.totalComp ?? ''},${o.status},${o.negotiated}`,
        );
      }
    }
    rows.push(`"${comp.benchmarkNote}"`);
  }

  if (beh) {
    rows.push('', 'BEHAVIORAL ANALYTICS');
    rows.push(`Apps Per Week (90d),${beh.applicationCadence.appsPerWeek}`);
    rows.push(`Cadence Trend,${beh.applicationCadence.trend}`);
    rows.push(`Weekly Consistency,${beh.applicationCadence.consistency}%`);
    rows.push(`Peak Application Day,${beh.applicationCadence.peakDayOfWeek ?? 'N/A'}`);
    rows.push(`Follow-up Score,${beh.followUpConsistency.value}%`);
    rows.push(`Avg Response Days,${beh.recruiterResponsePatterns.avgResponseDays ?? 'N/A'}`);
    rows.push(`Response Rate,${beh.recruiterResponsePatterns.responseRate ?? 'N/A'}%`);
    rows.push(`Burnout Risk,${beh.burnoutRisk.value}`);
    rows.push(`Workflow Effectiveness,${beh.workflowEffectiveness.value}%`);

    if (beh.insights.length > 0) {
      rows.push('', 'Category,Severity,Message,Recommendation');
      for (const i of beh.insights) {
        rows.push(`${i.category},${i.severity},"${i.message}","${i.recommendation}"`);
      }
    }
  }

  if (recs.length > 0) {
    rows.push('', 'STRATEGIC RECOMMENDATIONS');
    rows.push('Priority,Category,Title,Action,Confidence');
    for (const r of recs) {
      rows.push(
        `${r.priority},${r.category},"${r.title}","${r.action}",${r.confidence}`,
      );
    }
  }

  return rows.join('\n');
}

// ── HTML Report Builder ───────────────────────────────────────────────────────

function buildHTML(
  candidateName: string,
  opp: OpportunityQualityResult | null,
  comp: CompensationIntelligenceResult | null,
  beh: BehavioralAnalyticsResult | null,
  recs: StrategicRecommendation[],
): string {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const priorityColor = (p: string) =>
    ({ critical: '#dc2626', high: '#d97706', medium: '#4f46e5', low: '#64748b' })[p] ?? '#64748b';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Intelligence Report — ${candidateName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .page { max-width: 1080px; margin: 0 auto; padding: 40px 24px; }
    .header { background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%); color: #fff; padding: 40px 44px; border-radius: 14px; margin-bottom: 32px; }
    .header h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
    .header .sub { font-size: 13px; opacity: 0.85; }
    .section { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px 32px; margin-bottom: 24px; }
    .section h2 { font-size: 17px; font-weight: 700; color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
    .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 24px; }
    .kpi { background: #f8fafc; border-left: 3px solid #4338ca; border-radius: 8px; padding: 14px 16px; }
    .kpi-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #64748b; margin-bottom: 4px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f1f5f9; padding: 9px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
    td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    .rec { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; }
    .rec-priority { font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
    .rec-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .rec-summary { font-size: 13px; color: #475569; margin-bottom: 8px; }
    .rec-action { font-size: 13px; font-weight: 600; color: #4338ca; }
    .rec-impact { font-size: 12px; color: #64748b; margin-top: 6px; }
    .note { font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 8px; }
    .insight { border-left: 3px solid #e2e8f0; padding: 8px 12px; margin-bottom: 8px; font-size: 13px; }
    .insight-warn { border-color: #f59e0b; }
    .insight-crit { border-color: #ef4444; }
    .footer { text-align: center; color: #94a3b8; font-size: 11px; padding-top: 32px; border-top: 1px solid #e2e8f0; margin-top: 32px; }
    @media print { body { background: #fff; } .page { padding: 20px; } }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <h1>Career Intelligence Report</h1>
    <div class="sub">${candidateName} &nbsp;·&nbsp; ${date}</div>
  </div>

  ${opp && opp.totalActive > 0 ? `
  <div class="section">
    <h2>🎯 Opportunity Quality</h2>
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Active</div><div class="kpi-value">${opp.totalActive}</div></div>
      <div class="kpi"><div class="kpi-label">Prioritize</div><div class="kpi-value">${opp.highProbability.length}</div></div>
      <div class="kpi"><div class="kpi-label">Low ROI</div><div class="kpi-value">${opp.lowROI.length}</div></div>
      <div class="kpi"><div class="kpi-label">Comp Mismatches</div><div class="kpi-value">${opp.compensationMismatches.length}</div></div>
    </div>
    <table>
      <thead><tr><th>Role</th><th>Company</th><th>Quality</th><th>Probability</th><th>Action</th></tr></thead>
      <tbody>
        ${opp.scores.slice(0, 15).map((s) => `
        <tr>
          <td>${s.title}</td>
          <td>${s.company}</td>
          <td><strong>${s.qualityScore}</strong>/100</td>
          <td>${s.successProbability.value}% <span class="note">(${s.successProbability.meta.confidence})</span></td>
          <td><span class="badge ${s.recommendation === 'prioritize' ? 'badge-green' : s.recommendation === 'deprioritize' ? 'badge-red' : 'badge-yellow'}">${s.recommendation}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${comp && comp.totalOffers > 0 ? `
  <div class="section">
    <h2>💰 Compensation Intelligence</h2>
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Total Offers</div><div class="kpi-value">${comp.totalOffers}</div></div>
      <div class="kpi"><div class="kpi-label">Negotiated</div><div class="kpi-value">${comp.negotiatedCount}</div></div>
      <div class="kpi"><div class="kpi-label">Avg Salary</div><div class="kpi-value">${comp.avgSalaryAllOffers ? '$' + comp.avgSalaryAllOffers.toLocaleString() : '—'}</div></div>
      <div class="kpi"><div class="kpi-label">Max Offered</div><div class="kpi-value">${comp.maxSalaryOffered ? '$' + comp.maxSalaryOffered.toLocaleString() : '—'}</div></div>
    </div>
    <table>
      <thead><tr><th>Company</th><th>Role</th><th>Salary</th><th>Total Comp</th><th>Status</th><th>Negotiated</th></tr></thead>
      <tbody>
        ${comp.offers.map((o) => `
        <tr>
          <td>${o.company}</td><td>${o.title}</td>
          <td>${o.salary ? '$' + o.salary.toLocaleString() : '—'}</td>
          <td>${o.totalComp ? '$' + o.totalComp.toLocaleString() : '—'}</td>
          <td>${o.status}</td>
          <td>${o.negotiated ? '✓' : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p class="note">${comp.benchmarkNote}</p>
  </div>` : ''}

  ${beh ? `
  <div class="section">
    <h2>📊 Behavioral Analytics</h2>
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Apps/Week</div><div class="kpi-value">${beh.applicationCadence.appsPerWeek}</div></div>
      <div class="kpi"><div class="kpi-label">Trend</div><div class="kpi-value" style="font-size:18px;text-transform:capitalize">${beh.applicationCadence.trend}</div></div>
      <div class="kpi"><div class="kpi-label">Consistency</div><div class="kpi-value">${beh.applicationCadence.consistency}%</div></div>
      <div class="kpi"><div class="kpi-label">Follow-ups</div><div class="kpi-value">${beh.followUpConsistency.value}%</div></div>
      <div class="kpi"><div class="kpi-label">Burnout Risk</div><div class="kpi-value" style="font-size:18px;text-transform:capitalize;color:${beh.burnoutRisk.value === 'high' ? '#dc2626' : beh.burnoutRisk.value === 'medium' ? '#d97706' : '#15803d'}">${beh.burnoutRisk.value}</div></div>
      <div class="kpi"><div class="kpi-label">Workflow Score</div><div class="kpi-value">${beh.workflowEffectiveness.value}%</div></div>
    </div>
    ${beh.insights.length > 0 ? `
    <h3 style="font-size:14px;font-weight:600;margin-bottom:10px;color:#475569">Behavioral Insights</h3>
    ${beh.insights.map((i) => `
    <div class="insight ${i.severity === 'critical' ? 'insight-crit' : i.severity === 'warning' ? 'insight-warn' : ''}">
      <strong>${i.category}:</strong> ${i.message}<br>
      <span style="color:#4338ca">→ ${i.recommendation}</span>
    </div>`).join('')}` : ''}
  </div>` : ''}

  ${recs.length > 0 ? `
  <div class="section">
    <h2>🧭 Strategic Recommendations</h2>
    ${recs.map((r) => `
    <div class="rec">
      <div class="rec-priority" style="color:${priorityColor(r.priority)}">${r.priority.toUpperCase()} · ${r.category.replace(/_/g, ' ')}</div>
      <div class="rec-title">${r.title}</div>
      <div class="rec-summary">${r.summary}</div>
      <div class="rec-action">→ ${r.action}</div>
      ${r.expectedImpact ? `<div class="rec-impact">${r.expectedImpact}</div>` : ''}
      <div class="note">Confidence: ${r.confidence} · Evidence: ${r.evidence.slice(0, 2).join(' | ')}</div>
    </div>`).join('')}
  </div>` : ''}

  <div class="footer">
    Career Propel &copy; ${new Date().getFullYear()} &nbsp;·&nbsp;
    All estimates are labeled accordingly and derived from your own data &nbsp;·&nbsp;
    Not financial or legal advice
  </div>

</div>
</body>
</html>`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const format = req.nextUrl.searchParams.get('format') ?? 'json';
    const type = req.nextUrl.searchParams.get('type') ?? 'full';
    const dateStr = new Date().toISOString().slice(0, 10);

    // Fetch all analytics in parallel; isolate failures
    const [oppResult, compResult, behResult, recsResult] = await Promise.allSettled([
      computeOpportunityQuality(candidate.id),
      computeCompensationIntelligence(candidate.id),
      computeBehavioralAnalytics(candidate.id),
      generateStrategicRecommendations(candidate.id),
    ]);

    const opp = safe(oppResult);
    const comp = safe(compResult);
    const beh = safe(behResult);
    const recsData = safe(recsResult);
    const recs: StrategicRecommendation[] = recsData?.recommendations ?? [];

    // ── JSON ────────────────────────────────────────────────────────────────
    if (format === 'json') {
      return NextResponse.json({
        candidateName: candidate.name,
        generatedAt: new Date().toISOString(),
        reportType: type,
        opportunityQuality: opp,
        compensation: comp,
        behavioral: beh,
        recommendations: recs,
      });
    }

    // ── CSV ─────────────────────────────────────────────────────────────────
    if (format === 'csv') {
      const csv = buildCSV(candidate.name, opp, comp, beh, recs);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="career-analytics-${dateStr}.csv"`,
        },
      });
    }

    // ── HTML ────────────────────────────────────────────────────────────────
    if (format === 'html') {
      const html = buildHTML(candidate.name, opp, comp, beh, recs);
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="career-intelligence-report-${dateStr}.html"`,
        },
      });
    }

    return NextResponse.json(
      { error: `Unknown format "${format}". Valid: json, csv, html` },
      { status: 400 },
    );
  } catch (error) {
    console.error('[analytics/export]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}
