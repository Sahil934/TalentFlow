import { Job, Candidate, Assessment, CandidateStage, Question, AssessmentSection } from '@/types';
import { DatabaseService } from '../services/database';

// Mock data generators
const jobTitles = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Data Scientist',
  'Mobile Developer',
  'QA Engineer',
  'Technical Lead',
  'Software Architect',
  'Machine Learning Engineer',
  'Cloud Engineer',
  'Security Engineer',
  'Database Administrator',
  'Site Reliability Engineer',
  'Business Analyst',
  'Scrum Master',
  'Technical Writer',
  'Sales Engineer',
  'Customer Success Manager',
  'Marketing Manager',
  'HR Specialist',
  'Finance Analyst',
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

function generateJobs(): Omit<Job, 'id' | 'createdAt' | 'updatedAt'>[] {
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
      description: `We are looking for a talented ${title} to join our growing team. This is an excellent opportunity to work with cutting-edge technologies and make a significant impact.`,
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

function generateCandidates(jobs: Job[]): Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes'>[] {
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
      jobId: job.id,
      resumeUrl: `https://example.com/resumes/${firstName.toLowerCase()}-${lastName.toLowerCase()}.pdf`
    });
  }
  
  return candidates;
}

function generateAssessments(jobs: Job[]): Assessment[] {
  const assessments: Assessment[] = [];
  
  // Create assessments for first 3 jobs
  for (let i = 0; i < 3; i++) {
    const job = jobs[i];
    const sections: AssessmentSection[] = [];
    
    // Technical Skills Section
    const techSection: AssessmentSection = {
      id: `section-tech-${i}`,
      title: 'Technical Skills',
      description: 'Assess your technical knowledge and experience',
      order: 1,
      questions: []
    };
    
    // Add various question types
    const questions: Question[] = [
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
        title: 'Which of the following technologies have you worked with?',
        required: true,
        order: 2,
        options: ['TypeScript', 'Node.js', 'GraphQL', 'Docker', 'AWS', 'MongoDB'],
        minSelections: 1,
        maxSelections: 6
      },
      {
        id: `q3-${i}`,
        type: 'short-text',
        title: 'What is your preferred programming language?',
        required: true,
        order: 3,
        maxLength: 100,
        placeholder: 'e.g., JavaScript, Python, Java'
      },
      {
        id: `q4-${i}`,
        type: 'long-text',
        title: 'Describe a challenging project you worked on recently',
        required: true,
        order: 4,
        maxLength: 1000,
        placeholder: 'Please provide details about the project, your role, challenges faced, and how you overcame them...'
      },
      {
        id: `q5-${i}`,
        type: 'numeric',
        title: 'Rate your proficiency in JavaScript (1-10)',
        required: true,
        order: 5,
        min: 1,
        max: 10,
        step: 1
      },
      {
        id: `q6-${i}`,
        type: 'file-upload',
        title: 'Upload your portfolio or code samples',
        required: false,
        order: 6,
        acceptedTypes: ['.pdf', '.zip', '.github'],
        maxSize: 10485760 // 10MB
      }
    ];
    
    techSection.questions = questions.slice(0, 6);
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
          title: 'What is your current employment status?',
          required: true,
          order: 1,
          options: ['Employed', 'Unemployed', 'Student', 'Freelancer', 'Consultant']
        },
        {
          id: `q8-${i}`,
          type: 'short-text',
          title: 'What is your current job title?',
          required: false,
          order: 2,
          maxLength: 100
        },
        {
          id: `q9-${i}`,
          type: 'long-text',
          title: 'Why are you interested in this position?',
          required: true,
          order: 3,
          maxLength: 500
        },
        {
          id: `q10-${i}`,
          type: 'numeric',
          title: 'What is your expected salary range (in thousands)?',
          required: false,
          order: 4,
          min: 30,
          max: 300,
          step: 5
        }
      ]
    };
    
    sections.push(expSection);
    
    // Availability Section
    const availSection: AssessmentSection = {
      id: `section-avail-${i}`,
      title: 'Availability',
      description: 'Let us know about your availability',
      order: 3,
      questions: [
        {
          id: `q11-${i}`,
          type: 'single-choice',
          title: 'When can you start?',
          required: true,
          order: 1,
          options: ['Immediately', 'Within 2 weeks', 'Within 1 month', '2+ months']
        },
        {
          id: `q12-${i}`,
          type: 'single-choice',
          title: 'Are you willing to relocate?',
          required: true,
          order: 2,
          options: ['Yes', 'No', 'Depends on location']
        }
      ]
    };
    
    sections.push(availSection);
    
    const assessment: Assessment = {
      id: `assessment-${job.id}`,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Complete this assessment to apply for the ${job.title} position. It should take approximately 15-20 minutes.`,
      sections,
      timeLimit: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    assessments.push(assessment);
  }
  
  return assessments;
}

export async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data
    await DatabaseService.clearAllData();
    
    // Generate and insert jobs
    console.log('Generating jobs...');
    const jobsData = generateJobs();
    const jobs: Job[] = [];
    
    for (const jobData of jobsData) {
      const job = await DatabaseService.createJob(jobData);
      jobs.push(job);
    }
    
    console.log(`Created ${jobs.length} jobs`);
    
    // Generate and insert candidates
    console.log('Generating candidates...');
    const candidatesData = generateCandidates(jobs);
    const candidates: Candidate[] = [];
    
    for (const candidateData of candidatesData) {
      const candidate = await DatabaseService.createCandidate(candidateData);
      candidates.push(candidate);
    }
    
    console.log(`Created ${candidates.length} candidates`);
    
    // Generate and insert assessments
    console.log('Generating assessments...');
    const assessments = generateAssessments(jobs);
    
    for (const assessment of assessments) {
      await DatabaseService.createOrUpdateAssessment(assessment);
    }
    
    console.log(`Created ${assessments.length} assessments`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export async function checkAndSeedIfEmpty(): Promise<void> {
  try {
    const jobs = await DatabaseService.getAllJobs();
    if (jobs.length === 0) {
      console.log('Database is empty, seeding with initial data...');
      await seedDatabase();
    } else {
      console.log(`Database already contains ${jobs.length} jobs, skipping seeding`);
    }
  } catch (error) {
    console.error('Error checking database:', error);
    // If there's an error, try to seed anyway
    await seedDatabase();
  }
}
