import { 
  Job, 
  Candidate, 
  Assessment, 
  AssessmentResponse, 
  TimelineEvent,
  JobFilters, 
  CandidateFilters, 
  PaginationParams,
  JobsResponse,
  CandidatesResponse,
  ApiResponse,
  ReorderRequest
} from '@/types';

const API_BASE_URL = '/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }

  // Jobs API
  async getJobs(filters: JobFilters & PaginationParams = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.order) params.append('order', filters.order);
    
    const response = await this.request<JobsResponse>(`/jobs?${params.toString()}`);
    return response.data;
  }

  async getJob(id: string): Promise<Job> {
    const response = await this.request<Job>(`/jobs/${id}`);
    return response.data;
  }

  async createJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const response = await this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
    return response.data;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const response = await this.request<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async reorderJobs(id: string, reorderData: ReorderRequest): Promise<void> {
    await this.request(`/jobs/${id}/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(reorderData),
    });
  }

  // Candidates API
  async getCandidates(filters: CandidateFilters & PaginationParams = {}): Promise<CandidatesResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await this.request<CandidatesResponse>(`/candidates?${params.toString()}`);
    return response.data;
  }

  async getCandidate(id: string): Promise<Candidate> {
    const response = await this.request<Candidate>(`/candidates/${id}`);
    return response.data;
  }

  async createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Candidate> {
    const response = await this.request<Candidate>('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidate),
    });
    return response.data;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const response = await this.request<Candidate>(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async getCandidateTimeline(id: string): Promise<TimelineEvent[]> {
    const response = await this.request<TimelineEvent[]>(`/candidates/${id}/timeline`);
    return response.data;
  }

  // Assessments API
  async getAssessment(jobId: string): Promise<Assessment | null> {
    try {
      const response = await this.request<Assessment>(`/assessments/${jobId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async saveAssessment(jobId: string, assessment: Omit<Assessment, 'jobId' | 'createdAt' | 'updatedAt'>): Promise<Assessment> {
    const response = await this.request<Assessment>(`/assessments/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    });
    return response.data;
  }

  async submitAssessmentResponse(jobId: string, responseData: Omit<AssessmentResponse, 'id'>): Promise<AssessmentResponse> {
    const response = await this.request<AssessmentResponse>(`/assessments/${jobId}/submit`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
    return response.data;
  }
}

export const apiService = new ApiService();
