// Job types
export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
  assessments?: Assessment[];
}

export interface JobFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  tags?: string[];
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Candidate types
export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  stage: CandidateStage;
  jobId: string;
  resumeUrl?: string;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  mentions: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export interface TimelineEvent {
  id: string;
  candidateId: string;
  type: 'stage_change' | 'note_added' | 'assessment_completed';
  fromStage?: CandidateStage;
  toStage?: CandidateStage;
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface CandidateFilters {
  search?: string;
  stage?: CandidateStage | 'all';
  jobId?: string;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Assessment types
export type QuestionType = 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: string[];
  showIf?: string;
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice';
  options: string[];
  minSelections?: number;
  maxSelections?: number;
  showIf?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: 'short-text' | 'long-text';
  maxLength?: number;
  placeholder?: string;
  showIf?: string;
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  min?: number;
  max?: number;
  step?: number;
  showIf?: string;
}

export interface FileUploadQuestion extends BaseQuestion {
  type: 'file-upload';
  acceptedTypes?: string[];
  maxSize?: number;
  showIf?: string;
}

export type Question = SingleChoiceQuestion | MultiChoiceQuestion | TextQuestion | NumericQuestion | FileUploadQuestion;

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  timeLimit?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface ConditionalRule {
  questionId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  showQuestionIds: string[];
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  answers: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
}

// API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ReorderRequest {
  fromOrder: number;
  toOrder: number;
}

// UI types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'textarea' | 'number' | 'checkbox' | 'file';
  required?: boolean;
  options?: FilterOption[];
  validation?: any;
}
