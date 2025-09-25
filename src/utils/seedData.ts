import { Job, Candidate, Assessment, CandidateStage, Question, AssessmentSection } from '@/types';

// Mock data generators
const jobTitles = [
  'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer',
  'Product Manager', 'UX Designer', 'Data Scientist', 'Mobile Developer', 'QA Engineer',
  'Technical Lead', 'Software Architect', 'Machine Learning Engineer', 'Cloud Engineer',
  'Security Engineer', 'Database Administrator', 'Site Reliability Engineer',
  'Business Analyst', 'Scrum Master', 'Technical Writer', 'Sales Engineer',
  'Customer Success Manager', 'Marketing Manager', 'HR Specialist', 'Finance Analyst',
  'Operations Manager'
];

const techTags = [
  'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C#', 'Go', 'Rust',
  'TypeScript', 'JavaScript', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Flutter',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
  'Redis', 'GraphQL', 'REST API', 'Microservices', 'Machine Learning',
  'AI', 'Blockchain', 'IoT', 'Mobile', 'Web', 'Desktop', 'DevOps'
];

const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jessica',
  'William', 'Ashley', 'James', 'Amanda', 'Christopher', 'Stephanie', 'Daniel',
  'Melissa', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth', 'Mark', 'Helen',
  'Donald', 'Deborah', 'Steven', 'Rachel', 'Paul', 'Carolyn', 'Andrew', 'Janet',
  'Joshua', 'Catherine', 'Kenneth', 'Maria', 'Kevin', 'Heather', 'Brian', 'Diane',
  'George', 'Ruth', 'Edward', 'Julie', 'Ronald', 'Joyce', 'Timothy', 'Virginia'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const stages: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Generate Jobs
export function generateJobs(): Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] {
  const jobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  for (let i = 0; i < 25; i++) {
    const title = getRandomElement(jobTitles);
    const status = Math.random() > 0.3 ? 'active' : 'archived';
    const tags = getRandomElements(techTags, Math.floor(Math.random() * 5) + 2);

    jobs.push({
      title,
      slug: generateSlug(title) + '-' + (i + 1),
      status,
      tags,
      order: i + 1,
      description: `We are looking for a talented ${title} to join our team. Work with cutting-edge technologies and make an impact.`,
      requirements: [
        `3+ years of experience in ${getRandomElement(tags)}`,
        `Strong knowledge of ${getRandomElement(tags)} and ${getRandomElement(tags)}`,
        'Excellent problem-solving skills',
        'Strong communication and teamwork abilities',
        'Bachelor\'s degree in Computer Science or related field'
      ]
    });
  }

  return jobs;
}

// Generate Candidates
export function generateCandidates(jobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]): Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes'>[] {
  const candidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes'>[] = [];

  for (let i = 0; i < 1000; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
    const job = getRandomElement(jobs);
    const stage = getRandomElement(stages);
    const phone = `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;

    candidates.push({
      name,
      email,
      phone,
      stage,
      jobId: job.slug, // use slug as ID for browser-only
      resumeUrl: `https://example.com/resumes/${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`
    });
  }

  return candidates;
}

// Generate Assessments
export function generateAssessments(jobs: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[]): Assessment[] {
  const assessments: Assessment[] = [];

  for (let i = 0; i < 3; i++) {
    const job = jobs[i];
    const sections: AssessmentSection[] = [];

    // Technical Skills
    const techSection: AssessmentSection = {
      id: `section-tech-${i}`,
      title: 'Technical Skills',
      description: 'Assess your technical knowledge and experience',
      order: 1,
      questions: [
        {
          id: `q1-${i}`,
          type: 'single-choice',
          title: 'How many years of experience do you have with React?',
          required: true,
          order: 1,
          options: ['Less than 1 year', '1-2 years', '3-5 years', '5+ years']
        },
        {
          id: `q2-${i}`,
          type: 'multi-choice',
          title: 'Which technologies have you worked with?',
          required: true,
          order: 2,
          options: ['TypeScript', 'Node.js', 'GraphQL', 'Docker', 'AWS', 'MongoDB'],
          minSelections: 1,
          maxSelections: 6
        }
      ]
    };
    sections.push(techSection);

    // Experience Section
    const expSection: AssessmentSection = {
      id: `section-exp-${i}`,
      title: 'Professional Experience',
      description: 'Tell us about your work experience',
      order: 2,
      questions: [
        {
          id: `q7-${i}`,
          type: 'single-choice',
          title: 'Current employment status?',
          required: true,
          order: 1,
          options: ['Employed', 'Unemployed', 'Student', 'Freelancer', 'Consultant']
        }
      ]
    };
    sections.push(expSection);

    // Availability Section
    const availSection: AssessmentSection = {
      id: `section-avail-${i}`,
      title: 'Availability',
      description: 'Your availability',
      order: 3,
      questions: [
        {
          id: `q11-${i}`,
          type: 'single-choice',
          title: 'When can you start?',
          required: true,
          order: 1,
          options: ['Immediately', 'Within 2 weeks', 'Within 1 month', '2+ months']
        }
      ]
    };
    sections.push(availSection);

    assessments.push({
      id: `assessment-${job.slug}`,
      jobId: job.slug,
      title: `${job.title} Assessment`,
      description: `Complete this assessment to apply for the ${job.title} position.`,
      sections,
      timeLimit: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return assessments;
}

// Seed data in browser
export function seedBrowserData() {
  if (!localStorage.getItem('isSeeded')) {
    const jobs = generateJobs();
    const candidates = generateCandidates(jobs);
    const assessments = generateAssessments(jobs);

    localStorage.setItem('jobs', JSON.stringify(jobs));
    localStorage.setItem('candidates', JSON.stringify(candidates));
    localStorage.setItem('assessments', JSON.stringify(assessments));
    localStorage.setItem('isSeeded', 'true');

    console.log('Browser data seeded!');
  } else {
    console.log('Browser data already seeded.');
  }
}
