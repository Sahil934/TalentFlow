import { rest } from "msw";
import { DatabaseService } from "../services/database";
import {
  Job,
  Candidate,
  Assessment,
  JobFilters,
  CandidateFilters,
  PaginationParams,
  ReorderRequest,
} from "../types/index";

// Utility function to add artificial latency and error simulation
const withLatencyAndErrors = async <T>(
  operation: () => Promise<T>,
  errorRate: number = 0.1
): Promise<T> => {
  // Add artificial latency (200-1200ms)
  const delay = Math.random() * 1000 + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Simulate errors on write operations
  if (Math.random() < errorRate) {
    throw new Error("Simulated network error");
  }

  return operation();
};

// Helper function to filter and paginate jobs
const filterAndPaginateJobs = async (
  filters: JobFilters & PaginationParams
): Promise<{
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  let jobs = await DatabaseService.getAllJobs();

  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchLower) ||
        job.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  if (filters.status && filters.status !== "all") {
    jobs = jobs.filter((job) => job.status === filters.status);
  }

  // Apply sorting
  if (filters.sort) {
    jobs.sort((a, b) => {
      const aValue = a[filters.sort as keyof Job] ?? "";
      const bValue = b[filters.sort as keyof Job] ?? "";
      const order = filters.order === "desc" ? -1 : 1;

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  const total = jobs.length;
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(total / pageSize);

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedJobs = jobs.slice(startIndex, startIndex + pageSize);

  return {
    jobs: paginatedJobs,
    total,
    page,
    pageSize,
    totalPages,
  };
};

// Helper function to filter and paginate candidates
const filterAndPaginateCandidates = async (
  filters: CandidateFilters & PaginationParams
): Promise<{
  candidates: Candidate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  let candidates = await DatabaseService.getAllCandidates();

  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    candidates = candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower)
    );
  }

  if (filters.stage && filters.stage !== "all") {
    candidates = candidates.filter(
      (candidate) => candidate.stage === filters.stage
    );
  }

  if (filters.jobId) {
    candidates = candidates.filter(
      (candidate) => candidate.jobId === filters.jobId
    );
  }

  const total = candidates.length;
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 20;
  const totalPages = Math.ceil(total / pageSize);

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedCandidates = candidates.slice(
    startIndex,
    startIndex + pageSize
  );

  return {
    candidates: paginatedCandidates,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const handlers = [
  // Jobs endpoints
  rest.get("/api/jobs", async (req, res, ctx) => {
    try {
      const url = new URL(req.url);
      const filters = {
        search: url.searchParams.get("search") || undefined,
        status:
          (url.searchParams.get("status") as "active" | "archived" | "all") ||
          "all",
        page: parseInt(url.searchParams.get("page") || "1"),
        pageSize: parseInt(url.searchParams.get("pageSize") || "10"),
        sort: url.searchParams.get("sort") || undefined,
        order: (url.searchParams.get("order") as "asc" | "desc") || "asc",
      };

      const result = await withLatencyAndErrors(
        () => filterAndPaginateJobs(filters),
        0.05
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: result,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to fetch jobs",
        })
      );
    }
  }),

  rest.get("/api/jobs/:id", async (req, res, ctx) => {
    try {
      const { id } = req.params;
      const job = await withLatencyAndErrors(
        () => DatabaseService.getJobById(id as string),
        0.05
      );

      if (!job) {
        return res(
          ctx.status(404),
          ctx.json({
            success: false,
            message: "Job not found",
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: job,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to fetch job",
        })
      );
    }
  }),

  rest.post("/api/jobs", async (req, res, ctx) => {
    try {
      const jobData = await req.json();
      const job = await withLatencyAndErrors(
        () => DatabaseService.createJob(jobData),
        0.1
      );

      return res(
        ctx.status(201),
        ctx.json({
          success: true,
          data: job,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to create job",
        })
      );
    }
  }),

  rest.patch("/api/jobs/:id", async (req, res, ctx) => {
    try {
      const { id } = req.params;
      const updates = await req.json();

      await withLatencyAndErrors(
        () => DatabaseService.updateJob(id as string, updates),
        0.1
      );
      const updatedJob = await DatabaseService.getJobById(id as string);

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: updatedJob,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to update job",
        })
      );
    }
  }),

  rest.patch("/api/jobs/:id/reorder", async (req, res, ctx) => {
    try {
      const { id } = req.params;
      const { fromOrder, toOrder }: ReorderRequest = await req.json();

      // Higher error rate for reorder to test rollback functionality
      await withLatencyAndErrors(
        () => DatabaseService.reorderJobs(fromOrder, toOrder),
        0.15
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          message: "Jobs reordered successfully",
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to reorder jobs",
        })
      );
    }
  }),

  // Candidates endpoints
  rest.get("/api/candidates", async (req, res, ctx) => {
    try {
      const url = new URL(req.url);
      const filters = {
        search: url.searchParams.get("search") || undefined,
        stage: (url.searchParams.get("stage") as any) || "all",
        jobId: url.searchParams.get("jobId") || undefined,
        page: parseInt(url.searchParams.get("page") || "1"),
        pageSize: parseInt(url.searchParams.get("pageSize") || "20"),
      };

      const result = await withLatencyAndErrors(
        () => filterAndPaginateCandidates(filters),
        0.05
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: result,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to fetch candidates",
        })
      );
    }
  }),

  rest.get("/api/candidates/:id", async (req, res, ctx) => {
    try {
      const { id } = req.params;
      const candidate = await withLatencyAndErrors(
        () => DatabaseService.getCandidateById(id as string),
        0.05
      );

      if (!candidate) {
        return res(
          ctx.status(404),
          ctx.json({
            success: false,
            message: "Candidate not found",
          })
        );
      }

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: candidate,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to fetch candidate",
        })
      );
    }
  }),

  rest.post("/api/candidates", async (req, res, ctx) => {
    try {
      const candidateData = await req.json();
      const candidate = await withLatencyAndErrors(
        () => DatabaseService.createCandidate(candidateData),
        0.1
      );

      return res(
        ctx.status(201),
        ctx.json({
          success: true,
          data: candidate,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to create candidate",
        })
      );
    }
  }),

  rest.patch("/api/candidates/:id", async (req, res, ctx) => {
    try {
      const { id } = req.params;
      const updates = await req.json();

      await withLatencyAndErrors(
        () => DatabaseService.updateCandidate(id as string, updates),
        0.1
      );
      const updatedCandidate = await DatabaseService.getCandidateById(
        id as string
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: updatedCandidate,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to update candidate",
        })
      );
    }
  }),

  rest.get("/api/candidates/:id/timeline", async (req, res, ctx) => {
    try {
      const { id } = req.params;
      const timeline = await withLatencyAndErrors(
        () => DatabaseService.getCandidateTimeline(id as string),
        0.05
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: timeline,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to fetch candidate timeline",
        })
      );
    }
  }),

  // Assessments endpoints
  rest.get("/api/assessments/:jobId", async (req, res, ctx) => {
    try {
      const { jobId } = req.params;
      const assessment = await withLatencyAndErrors(
        () => DatabaseService.getAssessmentByJobId(jobId as string),
        0.05
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: assessment,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to fetch assessment",
        })
      );
    }
  }),

  rest.put("/api/assessments/:jobId", async (req, res, ctx) => {
    try {
      const { jobId } = req.params;
      const assessmentData = await req.json();

      const assessment = await withLatencyAndErrors(
        () =>
          DatabaseService.createOrUpdateAssessment({
            ...assessmentData,
            jobId,
          }),
        0.1
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: assessment,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to save assessment",
        })
      );
    }
  }),

  rest.post("/api/assessments/:jobId/submit", async (req, res, ctx) => {
    try {
      const { jobId } = req.params;
      const responseData = await req.json();

      const response = await withLatencyAndErrors(
        () => DatabaseService.saveAssessmentResponse(responseData),
        0.1
      );

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: response,
        })
      );
    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          success: false,
          message: "Failed to submit assessment",
        })
      );
    }
  }),
];
