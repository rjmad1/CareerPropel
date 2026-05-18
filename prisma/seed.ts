import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding synthetic data for Raja Jeevan Kumar Maduri...');

  // ─── Candidate ──────────────────────────────────────────────────────────────
  const candidate = await prisma.candidate.upsert({
    where: { email: 'rajajeevankumar@gmail.com' },
    update: {},
    create: {
      email: 'rajajeevankumar@gmail.com',
      name: 'Raja Jeevan Kumar Maduri',
      phone: '+1 (512) 874-3291',
      location: 'Austin, TX',
      summary:
        'Senior Group Product Manager and Product Director with 14+ years of experience building and scaling enterprise SaaS, AI/ML, and platform products. ' +
        'Proven track record leading cross-functional teams of 50+ to deliver 0→1 products and scale platforms to $500M+ ARR. ' +
        'Deep expertise in B2B product strategy, monetization, data-driven roadmap prioritization, and executive stakeholder alignment. ' +
        'Passionate about AI-native products, workflow automation, and developer tooling.',
    },
  });

  console.log(`  ✓ Candidate: ${candidate.name} (${candidate.id})`);

  // ─── Skills ──────────────────────────────────────────────────────────────────
  const skillsData = [
    { name: 'Product Strategy', proficiency: 'expert' },
    { name: 'Roadmap Prioritization', proficiency: 'expert' },
    { name: 'Cross-Functional Leadership', proficiency: 'expert' },
    { name: 'Enterprise SaaS', proficiency: 'expert' },
    { name: 'Stakeholder Management', proficiency: 'expert' },
    { name: 'Go-to-Market Strategy', proficiency: 'expert' },
    { name: 'OKR / KPI Frameworks', proficiency: 'expert' },
    { name: 'AI/ML Product Development', proficiency: 'advanced' },
    { name: 'Platform & API Products', proficiency: 'advanced' },
    { name: 'B2B SaaS Monetization', proficiency: 'advanced' },
    { name: 'User Research & Discovery', proficiency: 'advanced' },
    { name: 'Data-Driven Decision Making', proficiency: 'advanced' },
    { name: 'Agile / Scrum', proficiency: 'advanced' },
    { name: 'P&L Ownership', proficiency: 'advanced' },
    { name: 'Executive Communication', proficiency: 'advanced' },
    { name: 'Developer Experience (DX)', proficiency: 'advanced' },
    { name: 'SQL & Analytics', proficiency: 'intermediate' },
    { name: 'Python (Product Prototyping)', proficiency: 'intermediate' },
    { name: 'Figma / Product Design Collaboration', proficiency: 'intermediate' },
    { name: 'Competitive Intelligence', proficiency: 'advanced' },
  ];

  for (const s of skillsData) {
    await prisma.skill.upsert({
      where: { candidateId_name: { candidateId: candidate.id, name: s.name } },
      update: {},
      create: { candidateId: candidate.id, ...s },
    });
  }
  console.log(`  ✓ Skills: ${skillsData.length} records`);

  // ─── Achievements ────────────────────────────────────────────────────────────
  const achievementsData = [
    {
      title: 'Scaled AI Workflow Platform from $0 to $120M ARR in 3 years',
      description:
        'Led product strategy and execution for an enterprise AI workflow automation platform at a Fortune 500 SaaS company. ' +
        'Defined 0→1 product vision, assembled and mentored a 12-person PM team, and drove 3 major platform releases per year.',
      metrics: {
        arr_growth: '$0 → $120M',
        timeline: '3 years',
        team_size: 12,
        releases_per_year: 3,
        nps_improvement: '+34 points',
      },
    },
    {
      title: 'Launched LLM-powered Co-Pilot Feature with 68% Enterprise Adoption',
      description:
        'Owned the product strategy for an AI co-pilot embedded in enterprise workflow tooling. ' +
        'Partnered with ML research and engineering to ship an MVP in 4 months; drove adoption to 68% of enterprise seats within 6 months of GA.',
      metrics: {
        enterprise_adoption: '68%',
        time_to_mvp: '4 months',
        time_to_adoption: '6 months post-GA',
        daily_active_users: '42,000',
      },
    },
    {
      title: 'Reduced Customer Churn by 22% via Proactive Health Scoring Product',
      description:
        'Identified retention risk signals in product telemetry and led a cross-functional squad to build a customer health scoring engine. ' +
        'The product surfaced early churn signals to CSMs, reducing annual churn from 14% to 11%.',
      metrics: {
        churn_reduction: '22% relative reduction',
        churn_before: '14%',
        churn_after: '11%',
        revenue_retained: '$18M ARR protected',
      },
    },
    {
      title: 'Delivered Platform API Ecosystem Generating $45M New ARR',
      description:
        'Built and launched a partner API / marketplace platform, enabling 200+ ISV integrations. ' +
        'Drove partner-sourced pipeline to represent 28% of new business within 18 months.',
      metrics: {
        new_arr: '$45M',
        integrations: '200+ ISVs',
        partner_pipeline_share: '28%',
        timeline: '18 months',
      },
    },
    {
      title: 'Consolidated 4 Disparate Products into a Unified Platform — $30M Cost Savings',
      description:
        'Led a multi-year platform consolidation program across 4 legacy products with overlapping capabilities. ' +
        'Drove alignment across 6 engineering orgs, reduced infrastructure spend by 40%, and improved NPS by 18 points.',
      metrics: {
        cost_savings: '$30M annually',
        infrastructure_reduction: '40%',
        nps_improvement: '+18 points',
        products_consolidated: 4,
        engineering_orgs_aligned: 6,
      },
    },
    {
      title: 'Hired and Developed a 20-person PM Organization from Scratch',
      description:
        'Built and scaled the product management org at a Series C startup from 2 PMs to 20 over 3 years. ' +
        'Established career laddering, PM competency frameworks, and quarterly calibration processes that became the company standard.',
      metrics: {
        team_growth: '2 → 20 PMs',
        timeline: '3 years',
        retention_rate: '91%',
        internal_promotions: 7,
      },
    },
  ];

  for (const a of achievementsData) {
    await prisma.achievement.create({
      data: { candidateId: candidate.id, ...a },
    });
  }
  console.log(`  ✓ Achievements: ${achievementsData.length} records`);

  // ─── ProfileData ──────────────────────────────────────────────────────────────
  await prisma.profileData.upsert({
    where: { candidateId_type: { candidateId: candidate.id, type: 'resume' } },
    update: {},
    create: {
      candidateId: candidate.id,
      type: 'resume',
      content: {
        headline: 'Senior Group Product Manager | Product Director | AI & Enterprise SaaS',
        experience: [
          {
            title: 'Senior Group Product Manager',
            company: 'Salesforce',
            location: 'Austin, TX',
            start: '2021-03',
            end: null,
            current: true,
            description:
              'Lead a portfolio of 4 product lines within Salesforce Einstein AI, managing a team of 8 PMs and partnering with 3 engineering orgs (180+ engineers). Own the $320M ARR product P&L and roadmap.',
            highlights: [
              'Launched AI-powered Sales Co-Pilot — reached $40M ARR in 12 months',
              'Drove platform adoption from 22% to 61% of enterprise seats in 18 months',
              'Defined 3-year platform vision adopted as org-wide strategy by SVP',
            ],
          },
          {
            title: 'Group Product Manager',
            company: 'ServiceNow',
            location: 'San Jose, CA',
            start: '2018-07',
            end: '2021-02',
            current: false,
            description:
              'Owned the Now Platform workflow automation product, overseeing 3 PMs, 2 designers, and an engineering org of 90+ engineers.',
            highlights: [
              'Grew workflow automation ARR from $0 to $120M in 3 years',
              'Launched partner API ecosystem with 200+ ISV integrations',
              'Led platform consolidation of 4 legacy products, saving $30M annually',
            ],
          },
          {
            title: 'Senior Product Manager',
            company: 'Oracle',
            location: 'Austin, TX',
            start: '2015-04',
            end: '2018-06',
            current: false,
            description:
              'Led product development for Oracle HCM Cloud talent management module, working with global customers and GTM teams.',
            highlights: [
              'Delivered 6 major releases with on-time delivery and 94% customer satisfaction',
              'Partnered with UX and engineering to redesign core workflows, reducing task time by 35%',
              'Represented product at Oracle OpenWorld and industry analyst briefings',
            ],
          },
          {
            title: 'Product Manager',
            company: 'Infosys',
            location: 'Hyderabad, India',
            start: '2011-07',
            end: '2015-03',
            current: false,
            description:
              'Owned product delivery for an enterprise HRMS platform serving 50+ enterprise clients across APAC and Middle East.',
            highlights: [
              'Built and launched payroll automation module used by 1.2M employees across 18 countries',
              'Reduced implementation cycle from 9 months to 4 months through templatization',
            ],
          },
        ],
        education: [
          {
            degree: 'MBA, Strategy & Technology Management',
            institution: 'McCombs School of Business, UT Austin',
            year: 2011,
            honors: 'Dean\'s List',
          },
          {
            degree: 'B.Tech, Computer Science',
            institution: 'JNTU Hyderabad',
            year: 2008,
            honors: 'First Class with Distinction',
          },
        ],
        certifications: [
          'Pragmatic Institute — Certified Product Manager (PMC IV)',
          'AWS Certified Cloud Practitioner',
          'Professional Scrum Product Owner (PSPO II)',
          'Google Analytics Certified',
        ],
      },
    },
  });

  await prisma.profileData.upsert({
    where: { candidateId_type: { candidateId: candidate.id, type: 'linkedin_export' } },
    update: {},
    create: {
      candidateId: candidate.id,
      type: 'linkedin_export',
      content: {
        url: 'https://linkedin.com/in/rajajeevankumar',
        connections: 3847,
        followers: 5200,
        headline: 'Group Product Manager @ Salesforce | AI Products | Enterprise SaaS | Building at Scale',
        about:
          '14+ years building enterprise SaaS products from 0→1 and scaling them to $100M+ ARR. ' +
          'I lead product teams that ship AI-powered, data-driven products customers love. ' +
          'Currently at Salesforce driving the Einstein AI platform strategy. Previously ServiceNow, Oracle, Infosys.',
        recommendations: 24,
      },
    },
  });

  console.log(`  ✓ ProfileData: 2 records`);

  // ─── Jobs ────────────────────────────────────────────────────────────────────
  const jobsPayload = [
    // ── Active / High Priority ──
    {
      title: 'Director of Product Management, Google Workspace AI',
      company: 'Google',
      location: 'Mountain View, CA (Hybrid)',
      url: 'https://careers.google.com/jobs/results/12345',
      salary: 340000,
      matchScore: 0.94,
      priority: 'high',
      stage: 'final_round',
      appliedAt: new Date('2026-04-02'),
      recruiterName: 'Jessica Tran',
      recruiterEmail: 'jtran@google.com',
      recruiterPhone: '+1 (650) 555-0182',
      tags: ['AI', 'Workspace', 'Director', 'Google'],
      notes:
        'Final round on May 20. Meeting with VP of Workspace + 3 PDs. Prep: STAR stories for platform consolidation and org leadership. Strong signal from hiring manager loop.',
      description:
        'Lead product strategy for Google Workspace AI features (Duet AI, Smart Compose, meeting intelligence). Manage a group of 6 PMs. Report to VP Workspace.',
    },
    {
      title: 'Group Product Manager, Copilot for Microsoft 365',
      company: 'Microsoft',
      location: 'Redmond, WA (Hybrid)',
      url: 'https://careers.microsoft.com/jobs/67890',
      salary: 310000,
      matchScore: 0.91,
      priority: 'high',
      stage: 'offer',
      appliedAt: new Date('2026-03-15'),
      recruiterName: 'Priya Sharma',
      recruiterEmail: 'psharma@microsoft.com',
      recruiterPhone: '+1 (425) 555-0147',
      tags: ['AI', 'Copilot', 'Microsoft', 'Offer'],
      notes:
        'Verbal offer received May 12: $310K base, $180K RSU/yr, $60K signing, $40K bonus. Deadline May 22. Competing against Google final round. Need to negotiate equity vesting cliff.',
      description:
        'Own PM strategy for Copilot integrations across Word, Excel, PowerPoint, Outlook. Manage 5 PMs, partner with Azure AI and Office engineering teams.',
    },
    {
      title: 'Director of Product Management, AWS Billing & Cost Intelligence',
      company: 'Amazon',
      location: 'Seattle, WA (Hybrid)',
      url: 'https://amazon.jobs/en/jobs/34567',
      salary: 295000,
      matchScore: 0.86,
      priority: 'high',
      stage: 'technical_interview',
      appliedAt: new Date('2026-04-10'),
      recruiterName: 'Marcus Webb',
      recruiterEmail: 'mwebb@amazon.com',
      tags: ['AWS', 'Platform', 'Amazon', 'FinTech'],
      notes:
        'Bar raiser interview scheduled May 22. Amazon leadership principles deep dive. Revisit Working Backwards memo format. Recruiter confirmed strong interest from HM.',
      description:
        'Define and own the product vision for AWS cost management and billing intelligence. Lead a team of 4 PMs. Own a $180M ARR product line.',
    },
    {
      title: 'VP of Product Management, Einstein AI Platform',
      company: 'Salesforce',
      location: 'San Francisco, CA',
      url: 'https://salesforce.wd12.myworkdayjobs.com/External_Career_Site/job/78901',
      salary: 380000,
      matchScore: 0.89,
      priority: 'high',
      stage: 'negotiation',
      appliedAt: new Date('2026-03-01'),
      recruiterName: 'Anil Kapoor',
      recruiterEmail: 'akapoor@salesforce.com',
      tags: ['Salesforce', 'VP', 'AI', 'Internal'],
      notes:
        'Internal promotion track. Verbal offer at $380K + L9 equity. Negotiating for additional RSU cliff adjustment. Decision expected by May 25. This would be internal — proceed with caution vs external offers.',
      description:
        'Expand current Group PM role to VP scope across full Einstein AI portfolio. Lead team of 12 PMs, own $500M+ ARR product P&L.',
    },
    {
      title: 'Senior Director of Product, ServiceNow Platform Intelligence',
      company: 'ServiceNow',
      location: 'Santa Clara, CA (Remote-first)',
      url: 'https://careers.servicenow.com/jobs/90123',
      salary: 330000,
      matchScore: 0.88,
      priority: 'high',
      stage: 'behavioral',
      appliedAt: new Date('2026-04-18'),
      recruiterName: 'Laura Chen',
      recruiterEmail: 'lchen@servicenow.com',
      tags: ['ServiceNow', 'Platform', 'Senior Director'],
      notes:
        'Behavioral panel May 21 with CPTO, CPO, and 2 PDs. Strong alumni network advantage — ex-ServiceNow. Emphasize platform consolidation achievement.',
      description:
        'Lead product strategy for the Now Platform intelligence layer, including AI-powered automation, predictive analytics, and low-code tooling.',
    },
    // ── Mid-Pipeline ──
    {
      title: 'Director of Product, LinkedIn Talent Solutions',
      company: 'LinkedIn',
      location: 'Sunnyvale, CA (Hybrid)',
      url: 'https://careers.linkedin.com/jobs/45678',
      salary: 305000,
      matchScore: 0.82,
      priority: 'medium',
      stage: 'hiring_manager',
      appliedAt: new Date('2026-04-25'),
      recruiterName: 'Sophie Nakamura',
      recruiterEmail: 'snakamura@linkedin.com',
      tags: ['LinkedIn', 'Talent', 'Director', 'Microsoft'],
      notes:
        'HM loop May 19 with Director of Product, Talent. Research LinkedIn Talent Insights and Recruiter product. Focus on enterprise GTM angle.',
      description:
        'Own PM vision for LinkedIn Recruiter, Job Seeker AI Assist, and talent intelligence features. Manage 4 PMs embedded across 3 engineering squads.',
    },
    {
      title: 'Group Product Manager, Adobe Firefly Enterprise',
      company: 'Adobe',
      location: 'San Jose, CA (Hybrid)',
      url: 'https://adobe.wd5.myworkdayjobs.com/external_experienced/job/56789',
      salary: 290000,
      matchScore: 0.79,
      priority: 'medium',
      stage: 'recruiter_screen',
      appliedAt: new Date('2026-05-01'),
      recruiterName: 'Kevin Patel',
      recruiterEmail: 'kpatel@adobe.com',
      tags: ['Adobe', 'AI', 'Creative', 'Generative AI'],
      notes:
        'Recruiter screen May 16. Research Firefly enterprise offering and content supply chain angle. Adobe has strong PM culture — emphasize metrics-driven approach.',
      description:
        'Lead product strategy for Adobe Firefly commercial and enterprise product lines. Own AI content generation features used by Fortune 500 marketing orgs.',
    },
    {
      title: 'Director of Product Management, Snowflake Data Intelligence',
      company: 'Snowflake',
      location: 'San Mateo, CA (Remote)',
      url: 'https://careers.snowflake.com/jobs/67890',
      salary: 320000,
      matchScore: 0.84,
      priority: 'medium',
      stage: 'applied',
      appliedAt: new Date('2026-05-05'),
      recruiterName: 'Dana Willis',
      recruiterEmail: 'dwillis@snowflake.com',
      tags: ['Snowflake', 'Data', 'Analytics', 'Director'],
      notes:
        'Applied via referral from ex-ServiceNow colleague. Snowflake is scaling PM org — strong opportunity. Waiting on recruiter outreach.',
      description:
        'Define product vision for Snowflake Cortex AI, Streamlit integration, and data application development platform. Own developer experience strategy.',
    },
    // ── Early / Sourced ──
    {
      title: 'Senior Group Product Manager, Databricks Data Intelligence Platform',
      company: 'Databricks',
      location: 'San Francisco, CA (Hybrid)',
      url: 'https://databricks.com/company/careers/product/78901',
      salary: 335000,
      matchScore: 0.81,
      priority: 'medium',
      stage: 'resume_tailoring',
      appliedAt: null,
      tags: ['Databricks', 'Data', 'AI', 'ML Platform'],
      notes:
        'Resume tailoring in progress. Emphasize AI/ML platform experience and developer tooling background. Databricks values engineers-turned-PMs — highlight B.Tech.',
      description:
        'Own product strategy for Databricks Unity Catalog, Delta Lake developer experience, and LLM fine-tuning workflows.',
    },
    {
      title: 'Director of Product, Meta AI Products',
      company: 'Meta',
      location: 'Menlo Park, CA (Hybrid)',
      url: 'https://metacareers.com/jobs/89012',
      salary: 360000,
      matchScore: 0.77,
      priority: 'medium',
      stage: 'interested',
      appliedAt: null,
      tags: ['Meta', 'AI', 'LLM', 'Consumer + Enterprise'],
      notes:
        'Identified via LinkedIn signal. Meta AI studio product is interesting. Research Llama 3 ecosystem and Meta Business AI products. Have a warm intro from ex-colleague at Meta.',
      description:
        'Lead product vision for Meta AI assistant across Facebook, Instagram, and WhatsApp enterprise integrations.',
    },
    {
      title: 'Head of Product, Stripe Payments Intelligence',
      company: 'Stripe',
      location: 'San Francisco, CA (Hybrid)',
      url: 'https://stripe.com/jobs/listing/head-of-product-payments',
      salary: 345000,
      matchScore: 0.80,
      priority: 'low',
      stage: 'sourced',
      appliedAt: null,
      tags: ['Stripe', 'Payments', 'FinTech', 'Platform'],
      notes:
        'Flagged as stretch role. Stripe PM culture is highly engineering-oriented. Assess fit before applying. Could be good hedge option.',
      description:
        'Own the product strategy for Stripe Radar (fraud intelligence), payment optimization, and financial data APIs.',
    },
    // ── Closed ──
    {
      title: 'Group Product Manager, Workday HCM Platform',
      company: 'Workday',
      location: 'Pleasanton, CA (Hybrid)',
      url: 'https://workday.wd5.myworkdayjobs.com/Workday/job/90123',
      salary: 280000,
      matchScore: 0.72,
      priority: 'low',
      stage: 'rejected',
      appliedAt: new Date('2026-03-20'),
      recruiterName: 'Rachel Torres',
      recruiterEmail: 'rtorres@workday.com',
      tags: ['Workday', 'HCM', 'Rejected'],
      notes:
        'Rejected after HM loop — feedback was "looking for someone with deeper HCM domain expertise". Understandable given Oracle HCM background was 8+ years ago. Noted for future calibration.',
      description:
        'Own product roadmap for Workday People Experience, skills intelligence, and talent management platform.',
    },
  ];

  const createdJobs: Record<string, string> = {};
  for (const j of jobsPayload) {
    const job = await prisma.job.create({
      data: { candidateId: candidate.id, ...j },
    });
    createdJobs[j.company + ':' + j.title.slice(0, 20)] = job.id;

    // Create initial activity for each job
    await prisma.jobActivity.create({
      data: {
        jobId: job.id,
        action: 'sourced',
        metadata: { source: 'LinkedIn' },
      },
    });
    if (j.appliedAt) {
      await prisma.jobActivity.create({
        data: {
          jobId: job.id,
          action: 'applied',
          metadata: { method: 'online', portal: j.url ?? null },
        },
      });
    }
  }
  console.log(`  ✓ Jobs: ${jobsPayload.length} records + activities`);

  // ─── Interviews ──────────────────────────────────────────────────────────────
  const googleJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('Google:'))?.[1];
  const msftJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('Microsoft:'))?.[1];
  const amazonJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('Amazon:'))?.[1];
  const salesforceJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('Salesforce:'))?.[1];
  const sNowJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('ServiceNow:'))?.[1];
  const linkedInJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('LinkedIn:'))?.[1];
  const adobeJobId = Object.entries(createdJobs).find(([k]) => k.startsWith('Adobe:'))?.[1];

  const interviewsData = [
    // Google – final round series
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      type: 'phone',
      scheduledAt: new Date('2026-04-08T15:00:00Z'),
      duration: 45,
      location: 'Google Meet',
      notes: 'Recruiter intro screen with Jessica Tran. Background overview. Strong fit confirmed.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      type: 'video',
      scheduledAt: new Date('2026-04-18T17:00:00Z'),
      duration: 60,
      location: 'Google Meet',
      notes:
        'Hiring Manager loop with Alex Korolev (Director, Workspace AI). Discussed platform consolidation and AI product metrics. Very positive signal.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      type: 'panel',
      scheduledAt: new Date('2026-05-02T14:00:00Z'),
      duration: 240,
      location: 'Google Onsite - Mountain View',
      notes:
        'Full onsite panel: 4 x 45-min sessions. Strategy, cross-functional leadership, product sense, and data/metrics rounds. Went very well overall.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      type: 'behavioral',
      scheduledAt: new Date('2026-05-20T16:00:00Z'),
      duration: 90,
      location: 'Google Meet',
      notes: 'Final round with VP Workspace + 3 PDs. Prepare: org leadership, exec alignment, and product vision presentation.',
      status: 'scheduled',
    },
    // Microsoft – completed loop, offer received
    {
      candidateId: candidate.id,
      jobId: msftJobId!,
      type: 'phone',
      scheduledAt: new Date('2026-03-21T16:00:00Z'),
      duration: 30,
      location: 'Teams',
      notes: 'Recruiter screen with Priya Sharma. Confirmed scope, comp band, and timeline.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: msftJobId!,
      type: 'video',
      scheduledAt: new Date('2026-04-01T18:00:00Z'),
      duration: 60,
      location: 'Teams',
      notes: 'HM loop with Rajiv Mathur (PM Lead, Copilot). Deep dive on AI product strategy and cross-org alignment. Very strong.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: msftJobId!,
      type: 'panel',
      scheduledAt: new Date('2026-04-22T14:00:00Z'),
      duration: 300,
      location: 'Microsoft Virtual Loop',
      notes: '5-round virtual loop: as-appropriate + exec interviews. All rounds went well. Debrief positive.',
      status: 'completed',
    },
    // Amazon – bar raiser pending
    {
      candidateId: candidate.id,
      jobId: amazonJobId!,
      type: 'phone',
      scheduledAt: new Date('2026-04-14T15:00:00Z'),
      duration: 45,
      location: 'Chime',
      notes: 'Phone screen with Marcus Webb + HM. STAR format. Covered customer obsession and Working Backwards approach.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: amazonJobId!,
      type: 'technical',
      scheduledAt: new Date('2026-05-05T17:00:00Z'),
      duration: 60,
      location: 'Chime',
      notes:
        'Written case study review: Working Backwards memo for an AWS cost intelligence feature. Feedback was very positive from panel.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: amazonJobId!,
      type: 'behavioral',
      scheduledAt: new Date('2026-05-22T15:00:00Z'),
      duration: 60,
      location: 'Chime',
      notes: 'Bar raiser interview — Amazon leadership principles deep dive. Prepare 3 stories per LP.',
      status: 'scheduled',
    },
    // Salesforce internal
    {
      candidateId: candidate.id,
      jobId: salesforceJobId!,
      type: 'behavioral',
      scheduledAt: new Date('2026-03-10T16:00:00Z'),
      duration: 60,
      location: 'Slack Huddle',
      notes: 'Initial conversation with EVP Product, Sanjay Khanna. Discussed VP readiness and org expansion plans.',
      status: 'completed',
    },
    {
      candidateId: candidate.id,
      jobId: salesforceJobId!,
      type: 'panel',
      scheduledAt: new Date('2026-04-05T15:00:00Z'),
      duration: 120,
      location: 'Salesforce HQ - SF',
      notes: 'Exec loop with CPO and 2 SVPs. Presented 3-year Einstein AI platform vision. Standing ovation from CPO.',
      status: 'completed',
    },
    // ServiceNow behavioral panel
    {
      candidateId: candidate.id,
      jobId: sNowJobId!,
      type: 'panel',
      scheduledAt: new Date('2026-05-21T15:00:00Z'),
      duration: 180,
      location: 'Zoom',
      notes: 'Behavioral panel: CPTO, CPO, 2 PDs. Emphasize Now Platform consolidation and AI-powered automation roadmap.',
      status: 'scheduled',
    },
    // LinkedIn HM loop
    {
      candidateId: candidate.id,
      jobId: linkedInJobId!,
      type: 'video',
      scheduledAt: new Date('2026-05-19T17:00:00Z'),
      duration: 60,
      location: 'Zoom',
      notes: 'HM loop with Director of Product, Talent. Research LinkedIn Talent Insights, Recruiter AI features.',
      status: 'scheduled',
    },
    // Adobe recruiter screen
    {
      candidateId: candidate.id,
      jobId: adobeJobId!,
      type: 'phone',
      scheduledAt: new Date('2026-05-16T15:00:00Z'),
      duration: 30,
      location: 'Phone',
      notes: 'Recruiter intro. Discussed Adobe Firefly enterprise trajectory and PM team structure.',
      status: 'completed',
    },
  ];

  for (const iv of interviewsData.filter((i) => i.jobId)) {
    await prisma.interview.create({ data: iv });
  }
  console.log(`  ✓ Interviews: ${interviewsData.filter((i) => i.jobId).length} records`);

  // ─── Interview Feedback ──────────────────────────────────────────────────────
  const feedbackData = [
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      type: 'behavioral',
      selfRating: 4,
      notes:
        'Onsite went very well. Product sense round was strongest — the Google Workspace AI opportunity sizing question played well to my enterprise platform background. ' +
        'Cross-functional leadership round was good but could have been tighter on the conflict resolution story. Metrics round: nailed the North Star metric definition for Duet AI.',
    },
    {
      candidateId: candidate.id,
      jobId: msftJobId!,
      type: 'behavioral',
      selfRating: 5,
      notes:
        'Best interview loop I\'ve done. Copilot HM Rajiv was very engaged. The panel loved the AI co-pilot adoption story — 68% enterprise adoption resonated deeply. ' +
        'Offer received at top of band. Strong signal from EVP endorsement.',
    },
    {
      candidateId: candidate.id,
      jobId: amazonJobId!,
      type: 'technical',
      selfRating: 4,
      notes:
        'Working Backwards memo exercise was well-received. I focused on AWS cost anomaly detection for SMB customers — strong customer obsession angle. ' +
        'Bar raiser coming up — need to prep more LP stories especially "Disagree and Commit" and "Invent and Simplify".',
    },
    {
      candidateId: candidate.id,
      jobId: salesforceJobId!,
      type: 'behavioral',
      selfRating: 5,
      notes:
        'Exec loop was exceptional. CPO Ariel Kelman specifically praised the Einstein AI platform vision presentation. ' +
        'Internal promotion track is real — this is the front-runner if the external options fall through.',
    },
  ];

  for (const fb of feedbackData.filter((f) => f.jobId)) {
    await prisma.interviewFeedback.create({ data: fb });
  }
  console.log(`  ✓ Interview Feedback: ${feedbackData.filter((f) => f.jobId).length} records`);

  // ─── Offers ──────────────────────────────────────────────────────────────────
  const offersData = [
    {
      candidateId: candidate.id,
      jobId: msftJobId!,
      salary: 310000,
      equity: '$180,000 RSU / year (4-yr vest, 1-yr cliff)',
      bonus: 40000,
      benefits:
        'Full medical/dental/vision family coverage, 401k 50% match up to 6%, $5K education budget, stock purchase plan, 22 days PTO, 4 months parental leave',
      startDate: new Date('2026-07-01'),
      status: 'received',
      negotiated: false,
      notes:
        'Verbal offer May 12. Written offer expected May 15. Total comp ~$570K. Need to negotiate: (1) signing bonus from $60K to $80K, (2) equity cliff from 1yr to 6mo. ' +
        'Counter deadline: May 22. Benchmark: Google comp likely $40-50K higher — use as leverage.',
    },
    {
      candidateId: candidate.id,
      jobId: salesforceJobId!,
      salary: 380000,
      equity: '$250,000 RSU / year (4-yr vest)',
      bonus: 50000,
      benefits:
        'Full benefits package, 401k match 4%, Wellbeing reimbursement $2K/yr, flexible PTO',
      startDate: new Date('2026-08-01'),
      status: 'negotiating',
      negotiated: true,
      notes:
        'Initial offer L9 at $380K base + $1M RSU over 4yrs. Negotiating: (1) RSU cliff adjustment from Jan to July (aligns with Salesforce fiscal year for acceleration), ' +
        '(2) base to $395K to match external market. Awaiting HR response by May 20.',
    },
  ];

  for (const offer of offersData.filter((o) => o.jobId)) {
    await prisma.offer.create({ data: offer });
  }
  console.log(`  ✓ Offers: ${offersData.filter((o) => o.jobId).length} records`);

  // ─── Documents ───────────────────────────────────────────────────────────────
  const documentsData = [
    {
      candidateId: candidate.id,
      jobId: null,
      name: 'Raja_Maduri_Resume_2026_GPM.pdf',
      type: 'resume',
      url: null,
      content:
        'Raja Jeevan Kumar Maduri — Senior Group Product Manager | Product Director | AI & Enterprise SaaS\n\n' +
        'PROFESSIONAL SUMMARY\n14+ years leading enterprise SaaS, AI/ML, and platform product organizations. ' +
        'Track record scaling products from 0→1 to $500M+ ARR. Expert in cross-functional leadership, B2B GTM, and AI product strategy.\n\n' +
        'EXPERIENCE\nSenior Group PM @ Salesforce (2021–present)\nGroup PM @ ServiceNow (2018–2021)\nSenior PM @ Oracle (2015–2018)\nPM @ Infosys (2011–2015)',
      version: 'v4.2',
      tags: ['master', 'gpm', '2026'],
    },
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      name: 'Raja_Maduri_Resume_Google_Workspace_AI.pdf',
      type: 'resume',
      url: null,
      content: 'Tailored resume emphasizing Google Workspace AI, Duet AI, enterprise collaboration platform, and org leadership at scale.',
      version: 'v1.0',
      tags: ['google', 'tailored', 'final_round'],
    },
    {
      candidateId: candidate.id,
      jobId: msftJobId!,
      name: 'Raja_Maduri_Resume_Microsoft_Copilot.pdf',
      type: 'resume',
      url: null,
      content: 'Tailored resume for Microsoft Copilot GPM role. Emphasis on AI co-pilot product launches, enterprise adoption metrics, and M365 ecosystem.',
      version: 'v1.1',
      tags: ['microsoft', 'tailored', 'offer'],
    },
    {
      candidateId: candidate.id,
      jobId: googleJobId!,
      name: 'Cover_Letter_Google_Workspace_AI.pdf',
      type: 'cover_letter',
      url: null,
      content:
        'Dear Alex Korolev,\n\nI am excited to apply for the Director of Product Management, Google Workspace AI role. ' +
        'With 14 years building AI-powered enterprise products — including launching Salesforce Einstein AI Co-Pilot to 68% enterprise seat adoption — ' +
        'I am uniquely positioned to accelerate Workspace AI\'s mission to make knowledge work effortless for every enterprise user.\n\n' +
        'At Salesforce, I\'ve owned a $320M ARR AI product portfolio and led a team of 8 PMs embedded across 180+ engineers. ' +
        'I\'d bring that depth of enterprise AI product leadership to Google.\n\nWarm regards,\nRaja Jeevan Kumar Maduri',
      version: 'v1.0',
      tags: ['google', 'cover_letter'],
    },
    {
      candidateId: candidate.id,
      jobId: salesforceJobId!,
      name: 'Einstein_AI_Platform_Vision_2026-2029.pdf',
      type: 'pdf',
      url: null,
      content:
        'Einstein AI Platform — 3-Year Product Vision (2026-2029)\n\nPresented to Salesforce CPO and SVP Product.\n\n' +
        'Vision: Make Einstein AI the intelligence layer for every enterprise workflow.\n' +
        'Phase 1 (2026): Deepen LLM integration into Sales, Service, Marketing clouds.\n' +
        'Phase 2 (2027): Launch Einstein Agents platform for autonomous workflow execution.\n' +
        'Phase 3 (2028-29): Einstein as the enterprise OS for agentic AI — $1B ARR target.',
      version: 'v2.0',
      tags: ['salesforce', 'vision', 'internal', 'exec-presentation'],
    },
  ];

  for (const doc of documentsData) {
    await prisma.document.create({ data: doc });
  }
  console.log(`  ✓ Documents: ${documentsData.length} records`);

  // ─── Profile Entities ─────────────────────────────────────────────────────────
  const profileEntities = [
    {
      candidateId: candidate.id,
      type: 'experience',
      source: 'resume',
      confidence: 0.98,
      data: {
        company: 'Salesforce',
        title: 'Senior Group Product Manager',
        start: '2021-03',
        current: true,
        level: 'Senior Group PM / L9',
        team_size: 8,
        arr_owned: '$320M',
        key_products: ['Einstein AI Co-Pilot', 'Einstein Analytics', 'Salesforce Flows'],
      },
    },
    {
      candidateId: candidate.id,
      type: 'experience',
      source: 'resume',
      confidence: 0.97,
      data: {
        company: 'ServiceNow',
        title: 'Group Product Manager',
        start: '2018-07',
        end: '2021-02',
        level: 'Group PM',
        team_size: 3,
        arr_owned: '$120M',
        key_products: ['Now Platform Workflows', 'Partner API Ecosystem'],
      },
    },
    {
      candidateId: candidate.id,
      type: 'education',
      source: 'resume',
      confidence: 0.99,
      data: {
        degree: 'MBA',
        focus: 'Strategy & Technology Management',
        institution: 'McCombs School of Business, UT Austin',
        year: 2011,
      },
    },
    {
      candidateId: candidate.id,
      type: 'certification',
      source: 'linkedin_export',
      confidence: 0.95,
      data: {
        name: 'Certified Product Manager (PMC IV)',
        issuer: 'Pragmatic Institute',
        year: 2019,
      },
    },
    {
      candidateId: candidate.id,
      type: 'skill',
      source: 'resume',
      confidence: 0.92,
      data: {
        skill: 'AI/ML Product Strategy',
        evidence: ['Einstein AI Co-Pilot launch', 'LLM co-pilot 68% adoption', 'Now Platform ML automation'],
        proficiency: 'expert',
      },
    },
    {
      candidateId: candidate.id,
      type: 'skill',
      source: 'resume',
      confidence: 0.95,
      data: {
        skill: 'Cross-Functional Leadership',
        evidence: ['Led 8 PMs + 180 engineers at Salesforce', 'Aligned 6 eng orgs at ServiceNow', '20-person PM org build'],
        proficiency: 'expert',
      },
    },
    {
      candidateId: candidate.id,
      type: 'project',
      source: 'resume',
      confidence: 0.93,
      data: {
        name: 'Einstein AI Co-Pilot',
        company: 'Salesforce',
        type: '0→1 product launch',
        outcome: '$40M ARR in 12 months',
        scope: 'Enterprise — Fortune 500 customers',
      },
    },
    {
      candidateId: candidate.id,
      type: 'project',
      source: 'resume',
      confidence: 0.96,
      data: {
        name: 'Now Platform Partner API Ecosystem',
        company: 'ServiceNow',
        type: 'Platform / API product',
        outcome: '$45M ARR, 200+ ISV integrations',
        scope: 'Global enterprise platform',
      },
    },
  ];

  for (const pe of profileEntities) {
    await prisma.profileEntity.create({ data: pe });
  }
  console.log(`  ✓ Profile Entities: ${profileEntities.length} records`);

  // ─── Profile Score ────────────────────────────────────────────────────────────
  await prisma.profileScore.upsert({
    where: { candidateId: candidate.id },
    update: {},
    create: {
      candidateId: candidate.id,
      overall: 91,
      sections: {
        resume_completeness: 95,
        achievement_metrics: 88,
        skills_coverage: 90,
        job_pipeline_health: 92,
        interview_readiness: 89,
      },
      recommendations: [
        'Add 2-3 more quantified achievements in the Oracle tenure to strengthen the mid-career narrative.',
        'Consider adding a GitHub / portfolio link to demonstrate technical depth for engineering-oriented PM roles (e.g., Databricks, Snowflake).',
        'Update LinkedIn headline to include "Product Director" to catch recruiter searches for Director-level roles.',
        'Prepare a Working Backwards memo template to accelerate tailoring for Amazon pipeline.',
      ],
    },
  });
  console.log(`  ✓ Profile Score: overall 91/100`);

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n✅  Seed complete!');
  console.log(`   Candidate      : Raja Jeevan Kumar Maduri`);
  console.log(`   Jobs           : ${jobsPayload.length} (across 9 pipeline stages)`);
  console.log(`   Interviews     : ${interviewsData.filter((i) => i.jobId).length}`);
  console.log(`   Offers         : ${offersData.filter((o) => o.jobId).length}`);
  console.log(`   Skills         : ${skillsData.length}`);
  console.log(`   Achievements   : ${achievementsData.length}`);
  console.log(`   Documents      : ${documentsData.length}`);
  console.log(`   Profile Score  : 91 / 100`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
