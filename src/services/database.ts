import Dexie, { Table } from "dexie";
import {
  Job,
  Candidate,
  Assessment,
  AssessmentResponse,
  TimelineEvent,
  Note,
} from "../types/index";

export class TalentFlowDB extends Dexie {
  jobs!: Table<Job>;
  candidates!: Table<Candidate>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;
  timelineEvents!: Table<TimelineEvent>;
  notes!: Table<Note>;

  constructor() {
    super("TalentFlowDB");

    this.version(1).stores({
      jobs: "id, title, slug, status, order, createdAt, updatedAt",
      candidates: "id, name, email, stage, jobId, createdAt, updatedAt",
      assessments: "id, jobId, title, createdAt, updatedAt",
      assessmentResponses:
        "id, assessmentId, candidateId, startedAt, completedAt",
      timelineEvents: "id, candidateId, type, createdAt",
      notes: "id, candidateId, authorId, createdAt",
    });
  }
}

export const db = new TalentFlowDB();

// Database utility functions
export class DatabaseService {
  // Jobs
  static async getAllJobs(): Promise<Job[]> {
    return await db.jobs.orderBy("order").toArray();
  }

  static async getJobById(id: string): Promise<Job | undefined> {
    return await db.jobs.get(id);
  }

  static async createJob(
    job: Omit<Job, "id" | "createdAt" | "updatedAt">
  ): Promise<Job> {
    const newJob: Job = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.jobs.add(newJob);
    return newJob;
  }

  static async updateJob(id: string, updates: Partial<Job>): Promise<void> {
    await db.jobs.update(id, { ...updates, updatedAt: new Date() });
  }

  static async deleteJob(id: string): Promise<void> {
    await db.jobs.delete(id);
  }

  static async reorderJobs(fromOrder: number, toOrder: number): Promise<void> {
    const jobs = await db.jobs.orderBy("order").toArray();

    // Update order for affected jobs
    const updates = jobs.map((job) => {
      let newOrder = job.order;

      if (fromOrder < toOrder) {
        if (job.order === fromOrder) {
          newOrder = toOrder;
        } else if (job.order > fromOrder && job.order <= toOrder) {
          newOrder = job.order - 1;
        }
      } else {
        if (job.order === fromOrder) {
          newOrder = toOrder;
        } else if (job.order >= toOrder && job.order < fromOrder) {
          newOrder = job.order + 1;
        }
      }

      return { id: job.id, order: newOrder };
    });

    await db.transaction("rw", db.jobs, async () => {
      for (const update of updates) {
        await db.jobs.update(update.id, { order: update.order });
      }
    });
  }

  // Candidates
  static async getAllCandidates(): Promise<Candidate[]> {
    return await db.candidates.orderBy("createdAt").reverse().toArray();
  }

  static async getCandidateById(id: string): Promise<Candidate | undefined> {
    return await db.candidates.get(id);
  }

  static async getCandidatesByJobId(jobId: string): Promise<Candidate[]> {
    return await db.candidates.where("jobId").equals(jobId).toArray();
  }

  static async createCandidate(
    candidate: Omit<Candidate, "id" | "createdAt" | "updatedAt" | "notes">
  ): Promise<Candidate> {
    const newCandidate: Candidate = {
      ...candidate,
      id: crypto.randomUUID(),
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.candidates.add(newCandidate);

    // Create timeline event
    await this.createTimelineEvent({
      candidateId: newCandidate.id,
      type: "stage_change",
      toStage: candidate.stage,
      description: `Candidate applied for position`,
      createdBy: "system",
    });

    return newCandidate;
  }

  static async updateCandidate(
    id: string,
    updates: Partial<Candidate>
  ): Promise<void> {
    const candidate = await db.candidates.get(id);
    if (!candidate) return;

    // If stage is changing, create timeline event
    if (updates.stage && updates.stage !== candidate.stage) {
      await this.createTimelineEvent({
        candidateId: id,
        type: "stage_change",
        fromStage: candidate.stage,
        toStage: updates.stage,
        description: `Stage changed from ${candidate.stage} to ${updates.stage}`,
        createdBy: "system",
      });
    }

    await db.candidates.update(id, { ...updates, updatedAt: new Date() });
  }

  static async addNoteToCandidate(
    candidateId: string,
    note: Omit<Note, "id" | "createdAt">
  ): Promise<void> {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const candidate = await db.candidates.get(candidateId);
    if (candidate) {
      const updatedNotes = [...candidate.notes, newNote];
      await db.candidates.update(candidateId, { notes: updatedNotes });

      await this.createTimelineEvent({
        candidateId,
        type: "note_added",
        description: `Note added: ${note.content.substring(0, 50)}...`,
        createdBy: note.authorName,
      });
    }
  }

  // Timeline Events
  static async createTimelineEvent(
    event: Omit<TimelineEvent, "id" | "createdAt">
  ): Promise<TimelineEvent> {
    const newEvent: TimelineEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    await db.timelineEvents.add(newEvent);
    return newEvent;
  }

  static async getCandidateTimeline(
    candidateId: string
  ): Promise<TimelineEvent[]> {
    return await db.timelineEvents
      .where("candidateId")
      .equals(candidateId)
      .reverse()
      .sortBy("createdAt");
  }

  // Assessments
  static async getAssessmentByJobId(
    jobId: string
  ): Promise<Assessment | undefined> {
    return await db.assessments.where("jobId").equals(jobId).first();
  }

  static async createOrUpdateAssessment(
    assessment: Omit<Assessment, "createdAt" | "updatedAt">
  ): Promise<Assessment> {
    const existing = await db.assessments.get(assessment.id);

    if (existing) {
      const updated = { ...assessment, updatedAt: new Date() };
      await db.assessments.update(assessment.id, updated);
      return updated as Assessment;
    } else {
      const newAssessment: Assessment = {
        ...assessment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.assessments.add(newAssessment);
      return newAssessment;
    }
  }

  // Assessment Responses
  static async saveAssessmentResponse(
    response: Omit<AssessmentResponse, "id">
  ): Promise<AssessmentResponse> {
    const newResponse: AssessmentResponse = {
      ...response,
      id: crypto.randomUUID(),
    };
    await db.assessmentResponses.add(newResponse);

    if (response.completedAt) {
      await this.createTimelineEvent({
        candidateId: response.candidateId,
        type: "assessment_completed",
        description: "Assessment completed",
        createdBy: "system",
      });
    }

    return newResponse;
  }

  static async getAssessmentResponse(
    assessmentId: string,
    candidateId: string
  ): Promise<AssessmentResponse | undefined> {
    return await db.assessmentResponses
      .where(["assessmentId", "candidateId"])
      .equals([assessmentId, candidateId])
      .first();
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    await db.transaction(
      "rw",
      [
        db.jobs,
        db.candidates,
        db.assessments,
        db.assessmentResponses,
        db.timelineEvents,
      ],
      async () => {
        await db.jobs.clear();
        await db.candidates.clear();
        await db.assessments.clear();
        await db.assessmentResponses.clear();
        await db.timelineEvents.clear();
      }
    );
  }

  static async exportData(): Promise<any> {
    return {
      jobs: await db.jobs.toArray(),
      candidates: await db.candidates.toArray(),
      assessments: await db.assessments.toArray(),
      assessmentResponses: await db.assessmentResponses.toArray(),
      timelineEvents: await db.timelineEvents.toArray(),
    };
  }

  static async importData(data: any): Promise<void> {
    await db.transaction(
      "rw",
      [
        db.jobs,
        db.candidates,
        db.assessments,
        db.assessmentResponses,
        db.timelineEvents,
      ],
      async () => {
        if (data.jobs) await db.jobs.bulkAdd(data.jobs);
        if (data.candidates) await db.candidates.bulkAdd(data.candidates);
        if (data.assessments) await db.assessments.bulkAdd(data.assessments);
        if (data.assessmentResponses)
          await db.assessmentResponses.bulkAdd(data.assessmentResponses);
        if (data.timelineEvents)
          await db.timelineEvents.bulkAdd(data.timelineEvents);
      }
    );
  }
}
