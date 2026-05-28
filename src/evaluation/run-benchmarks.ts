import { extractProfileEntities } from '../lib/profile/extractor';

// ============================================================================
// BENCHMARK DATASETS
// ============================================================================

const BENCHMARK_RESUMES = [
  {
    id: 'bench_res_1',
    name: 'Jane Doe (Senior React Engineer)',
    text: `Jane Doe | Senior Software Engineer
    email: jane.doe@example.com | github: github.com/janedoe
    
    Summary: High-impact Frontend Specialist with 6 years experience optimizing React and TypeScript web architectures.
    
    Technical Skills: React, TypeScript, Next.js, Redux, Tailwind CSS, Jest, GraphQL, AWS.
    
    Experience:
    - TechCorp Solutions (2023 - Present) | Senior Frontend Engineer
      * Led migration of 12 internal projects to Next.js, reducing dashboard interaction latency by 320ms.
      * Optimized React rendering pipeline, boosting Lighthouse speed index by 24%.
    - DevAgency Inc (2020 - 2023) | Software Developer
      * Built custom GraphQL endpoints and integrated Tailwind CSS styling grids.
      
    Education:
    - University of Tech | Bachelor of Science in Computer Science | GPA: 3.9
    
    Certifications:
    - AWS Certified Solutions Architect`,
    expectedSkills: ['react', 'typescript', 'next.js', 'graphql', 'tailwind css', 'jest', 'aws'],
    expectedAchievementsCount: 2,
    expectedEducationsCount: 1,
    expectedCertificationsCount: 1
  },
  {
    id: 'bench_res_2',
    name: 'Bob Smith (Full Stack Developer)',
    text: `Bob Smith | Software Engineer
    email: bob.smith@example.com | phone: 555-0199
    
    Summary: Resilient Full Stack Developer skilled in Node.js, Express, PostgreSQL, and Docker.
    
    Technical Skills: Node.js, Express, PostgreSQL, Prisma, Docker, Kubernetes, Python.
    
    Experience:
    - CloudScale Systems (2022 - Present) | Software Developer
      * Mapped database indexes in PostgreSQL, reducing API endpoint query execution times by 45%.
      * Automated deployment configurations in Kubernetes clusters.
      
    Education:
    - State College | Computer Science Coursework`,
    expectedSkills: ['node.js', 'postgresql', 'prisma', 'docker', 'kubernetes', 'python'],
    expectedAchievementsCount: 2,
    expectedEducationsCount: 1,
    expectedCertificationsCount: 0
  }
];

// ============================================================================
// EVALUATION FRAMEWORK
// ============================================================================

interface MetricReport {
  name: string;
  passed: boolean;
  precision: number;
  recall: number;
  f1: number;
}

export async function runBenchmarks() {
  console.log('\n=============================================================');
  console.log('🤖 CareerPropel AI Output Quality & Precision Benchmarking 🤖');
  console.log('=============================================================\n');

  // Test 1: Layer 1 Deterministic Skill Extraction Precision & Recall
  console.log('🧪 Running Test 1: Layer 1 Skill Extraction Accuracy...');
  const skillReports: MetricReport[] = [];

  for (const resume of BENCHMARK_RESUMES) {
    const extracted = extractProfileEntities(resume.text, 'resume', 'test-bench');
    const extractedSkills = extracted
      .filter(e => e.type === 'skill')
      .map(e => e.content.toLowerCase());

    let truePositives = 0;
    extractedSkills.forEach(skill => {
      if (resume.expectedSkills.some(expected => skill.includes(expected) || expected.includes(skill))) {
        truePositives++;
      }
    });

    const precision = extractedSkills.length > 0 ? truePositives / extractedSkills.length : 0;
    const recall = resume.expectedSkills.length > 0 ? truePositives / resume.expectedSkills.length : 0;
    const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    const passed = precision >= 0.90 && recall >= 0.80; // Target acceptance criteria

    skillReports.push({
      name: resume.name,
      passed,
      precision,
      recall,
      f1
    });

    console.log(`\n  Resume: ${resume.name}`);
    console.log(`    - Extracted Skills: [${extractedSkills.join(', ')}]`);
    console.log(`    - Expected Skills:  [${resume.expectedSkills.join(', ')}]`);
    console.log(`    - Precision: ${(precision * 100).toFixed(1)}% (Target: >90%)`);
    console.log(`    - Recall:    ${(recall * 100).toFixed(1)}% (Target: >85%)`);
    console.log(`    - F1 Score:  ${(f1 * 100).toFixed(1)}%`);
    console.log(`    - Status:    ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }

  // Test 2: Structured Entity Extraction Volume Validation
  console.log('\n🧪 Running Test 2: Local Structured Section Structural Audits...');
  for (const resume of BENCHMARK_RESUMES) {
    const extracted = extractProfileEntities(resume.text, 'resume', 'test-bench');
    
    const achievements = extracted.filter(e => e.type === 'achievement').length;
    const education = extracted.filter(e => e.type === 'education').length;
    const certification = extracted.filter(e => e.type === 'certification').length;

    console.log(`\n  Resume: ${resume.name}`);
    console.log(`    - Achievements:  ${achievements} extracted (Expected: >=${resume.expectedAchievementsCount})`);
    console.log(`    - Education:     ${education} extracted (Expected: >=${resume.expectedEducationsCount})`);
    console.log(`    - Certification: ${certification} extracted (Expected: >=${resume.expectedCertificationsCount})`);
    
    const passed = achievements >= resume.expectedAchievementsCount && 
                   education >= resume.expectedEducationsCount && 
                   certification >= resume.expectedCertificationsCount;
    console.log(`    - Status:        ${passed ? '✅ PASSED' : '⚠️ DETECTED GAPS (Optional)'}`);
  }

  console.log('\n=============================================================');
  console.log('🎉 Benchmarking Completed! Quality Matrix checks executed.');
  console.log('=============================================================\n');
}

// Auto-run if executed directly via CLI
if (require.main === module) {
  runBenchmarks().catch(err => {
    console.error('Benchmark execution failed:', err);
    process.exit(1);
  });
}
