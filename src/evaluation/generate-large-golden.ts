import * as fs from 'fs';
import * as path from 'path';

// Define structures
interface Resume {
  id: string;
  name: string;
  category: string;
  text: string;
  expectedSkills: string[];
  expectedAchievements: string[];
  expectedEducationsCount: number;
  expectedCertificationsCount: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  expectedRankOrder: string[]; // List of resume IDs in expected match order (rank correlation)
  expectedSkillGaps: Record<string, string[]>; // mapping of resumeId -> expected skill gaps
}

interface NetworkingLead {
  id: string;
  company: string;
  targetRole: string;
  expectedContacts: Array<{
    name: string;
    title: string;
    department: string;
    relevance: 'high' | 'medium' | 'low';
  }>;
}

export function generateDataset() {
  console.log('Generating large-scale golden datasets (200+ resumes)...');

  const resumes: Resume[] = [];
  
  // Archetype Seed Data
  const categories = [
    {
      name: 'Technical (Software/Data/Cloud)',
      skills: ['react', 'typescript', 'next.js', 'node.js', 'postgresql', 'prisma', 'docker', 'kubernetes', 'python', 'aws', 'jest', 'graphql', 'snowflake', 'spark', 'airflow', 'dbt'],
      achievements: [
        'Optimized database index query executions by 35% in PostgreSQL.',
        'Led migration of frontend components to Next.js, accelerating load speeds by 2.4s.',
        'Built real-time data streaming pipelines handling 15M+ daily logs.',
        'Configured automated deployment workflows using Docker and Kubernetes clusters.'
      ]
    },
    {
      name: 'Non-Technical (Product/Marketing/Sales)',
      skills: ['product management', 'agile', 'scrum', 'seo', 'google analytics', 'crm', 'salesforce', 'customer retention', 'market research', 'conversions', 'ab testing'],
      achievements: [
        'Drove product feature alignment resulting in 18% month-over-month user retention growth.',
        'Designed custom A/B conversion tests, raising registration rates by 12.4%.',
        'Managed $15,000 monthly marketing budget across digital channels, scaling lead flow by 2.2x.'
      ]
    },
    {
      name: 'Executive (CTO/VP/Director)',
      skills: ['leadership', 'strategic planning', 'budgeting', 'team scaling', 'vendor management', 'risk mitigation', 'executive presence', 'governance'],
      achievements: [
        'Scaled engineering division from 8 to 45 developers across three international squads.',
        'Negotiated primary vendor SaaS contracts, saving $85,000 in operational overhead.',
        'Established engineering security governance auditing frameworks across corporate departments.'
      ]
    },
    {
      name: 'Academic (Graduates/PhD/Research)',
      skills: ['mathematical modeling', 'data analysis', 'scientific writing', 'r programming', 'latex', 'python', 'hypothesis testing', 'academic research'],
      achievements: [
        'Published empirical research thesis analyzing machine learning models in IEEE publications.',
        'Designed statistical hypothesis regression models evaluated across 1,200 research participants.',
        'Graduated with Summa Cum Laude honors in Computer Science, maintaining 3.96 GPA.'
      ]
    },
    {
      name: 'Career Switchers (Sales to Tech)',
      skills: ['javascript', 'html', 'css', 'git', 'react', 'communication', 'negotiation', 'customer success', 'sales operations'],
      achievements: [
        'Completed intensive software engineering bootcamp coding 650+ hours of full-stack projects.',
        'Leveraged client operations background to lead technical project presentations for corporate partners.',
        'Built local web applications utilizing React and CSS grids for small businesses.'
      ]
    },
    {
      name: 'International Formats (EuroPass/CV)',
      skills: ['java', 'spring boot', 'oracle', 'rest api', 'maven', 'jenkins', 'scrum', 'hibernate'],
      achievements: [
        'Refactored legacy Java banking microservices to Spring Boot, increasing transaction performance by 15%.',
        'Implemented Jenkins continuous integration automated pipelines for 8 microservices.'
      ]
    }
  ];

  // Generate 204 Resumes (34 per category)
  let resumeIdCounter = 1;
  categories.forEach(cat => {
    for (let i = 1; i <= 34; i++) {
      const id = `bench_res_${resumeIdCounter++}`;
      const name = `Candidate ${resumeIdCounter - 1} (${cat.name} Spec ${i})`;
      
      // Determine expected values based on category
      const skillCount = 5 + (i % 5);
      const expectedSkills = cat.skills.slice(0, skillCount);
      const expectedAchievements = cat.achievements.slice(0, 1 + (i % 3));
      
      const educationCount = 1 + (i % 2);
      const certCount = i % 2;

      // Construct plain text resume
      const textSegments = [
        `${name} | Professional Resume`,
        `Summary: Capable professional specializing in ${cat.name} with demonstrated execution proof.`,
        `Technical Skills: ${expectedSkills.join(', ')}.`,
        `Experience:`,
        expectedAchievements.map(ach => `* ${ach}`).join('\n'),
        `Education:`,
        `- University of Corporate Excellence | Degree Programme | GPA: 3.${8 + (i % 2)}`,
        certCount > 0 ? `Certifications:\n- Professional Board Credentials` : ''
      ];

      resumes.push({
        id,
        name,
        category: cat.name,
        text: textSegments.filter(Boolean).join('\n\n'),
        expectedSkills,
        expectedAchievements,
        expectedEducationsCount: educationCount,
        expectedCertificationsCount: certCount
      });
    }
  });

  // Create Jobs with calibrated Expected Ranks
  const jobs: Job[] = [
    {
      id: 'bench_job_1',
      title: 'Senior Software Engineer (React/TypeScript)',
      description: 'Looking for a Senior Software Engineer specializing in frontend development with React, TypeScript, and Next.js, who has experience deploying on AWS.',
      expectedRankOrder: [], // Calibrated programmatically
      expectedSkillGaps: {}
    },
    {
      id: 'bench_job_2',
      title: 'Principal Product Manager',
      description: 'Seeking a Product Management specialist with experience in Agile scrum methodologies, Google Analytics conversions, and digital product user retention.',
      expectedRankOrder: [],
      expectedSkillGaps: {}
    },
    {
      id: 'bench_job_3',
      title: 'Engineering Director / Executive',
      description: 'Looking for an Engineering Director with experience in strategic leadership, scalable budgeting, vendor management, and scaling squads globally.',
      expectedRankOrder: [],
      expectedSkillGaps: {}
    }
  ];

  // Programmatically Calibrate ATS matching rankings and skill gaps
  jobs.forEach(job => {
    const scores: Array<{ id: string; score: number; gaps: string[] }> = [];
    const keywords = job.description.toLowerCase();

    resumes.forEach(res => {
      // Simple exact match matching score computation
      let matchCount = 0;
      let totalMatchable = 0;
      const gaps: string[] = [];

      const targetWords = ['react', 'typescript', 'next.js', 'aws', 'product management', 'agile', 'scrum', 'google analytics', 'conversions', 'user retention', 'leadership', 'budgeting', 'vendor management', 'scaling'];
      targetWords.forEach(word => {
        if (keywords.includes(word)) {
          totalMatchable++;
          const hasSkill = res.expectedSkills.some(s => s.toLowerCase().includes(word) || word.includes(s.toLowerCase()));
          if (hasSkill) {
            matchCount++;
          } else {
            gaps.push(word);
          }
        }
      });

      const score = totalMatchable > 0 ? matchCount / totalMatchable : 0;
      scores.push({ id: res.id, score, gaps });
    });

    // Sort by score descending to get expected rank order
    scores.sort((a, b) => b.score - a.score);
    job.expectedRankOrder = scores.map(s => s.id);
    
    scores.forEach(s => {
      job.expectedSkillGaps[s.id] = s.gaps;
    });
  });

  // Create Networking Leads for validation
  const networkingLeads: NetworkingLead[] = [
    {
      id: 'net_lead_1',
      company: 'TechCorp Solutions',
      targetRole: 'Software Engineer',
      expectedContacts: [
        { name: 'Sarah Connor', title: 'Director of Engineering', department: 'Engineering', relevance: 'high' },
        { name: 'John Doe', title: 'HR Talent Acquisition', department: 'Recruiting', relevance: 'high' },
        { name: 'Alice Smith', title: 'Senior Recruiter', department: 'HR', relevance: 'high' },
        { name: 'Bob Johnson', title: 'Office Manager', department: 'Operations', relevance: 'low' }
      ]
    },
    {
      id: 'net_lead_2',
      company: 'AnalyticsCorp',
      targetRole: 'Product Manager',
      expectedContacts: [
        { name: 'David Lee', title: 'Head of Product', department: 'Product', relevance: 'high' },
        { name: 'Elena Rivas', title: 'Lead Recruiter', department: 'Talent', relevance: 'high' },
        { name: 'Chris Miller', title: 'Customer Support Lead', department: 'Support', relevance: 'low' }
      ]
    }
  ];

  // Ensure output directory exists
  const goldenDir = path.join(__dirname, 'golden');
  if (!fs.existsSync(goldenDir)) {
    fs.mkdirSync(goldenDir, { recursive: true });
  }

  // Save Golden JSON files
  fs.writeFileSync(path.join(goldenDir, 'resumes-large.json'), JSON.stringify(resumes, null, 2));
  fs.writeFileSync(path.join(goldenDir, 'jobs-large.json'), JSON.stringify(jobs, null, 2));
  fs.writeFileSync(path.join(goldenDir, 'networking.json'), JSON.stringify(networkingLeads, null, 2));

  console.log(`✅ Success! Datasets written to:`);
  console.log(`   - ${path.join(goldenDir, 'resumes-large.json')} (${resumes.length} resumes generated)`);
  console.log(`   - ${path.join(goldenDir, 'jobs-large.json')} (${jobs.length} jobs calibrated)`);
  console.log(`   - ${path.join(goldenDir, 'networking.json')} (${networkingLeads.length} leads configured)`);
}

generateDataset();
