import { useQuery } from "react-query";
import { apiService } from "../services/api";
import { Candidate } from "../types";

export function useCandidatesByJob(jobId?: string) {
  return useQuery(["candidates", jobId], async () => {
    if (!jobId) return [];
    const res = await apiService.getCandidates({ jobId });
    return res.candidates as Candidate[];
  }, { enabled: !!jobId });
}
