import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import { Candidate, CandidateFilters, CandidatesResponse } from '../types';

export const useCandidates = (filters: CandidateFilters & { page?: number; pageSize?: number } = {}) => {
  return useQuery<CandidatesResponse>(
    ['candidates', filters],
    () => apiService.getCandidates(filters),
    { keepPreviousData: true }
  );
};

export const useCandidate = (id: string) => {
  return useQuery<Candidate>(['candidate', id], () => apiService.getCandidate(id), { enabled: !!id });
};

export const useUpdateCandidate = () => {
  const qc = useQueryClient();
  return useMutation<Candidate, Error, { id: string; updates: Partial<Candidate> }>(
    ({ id, updates }) => apiService.updateCandidate(id, updates),
    {
      onSuccess: (c) => {
        qc.setQueryData(['candidate', c.id], c);
        qc.invalidateQueries(['candidates']);
      },
    }
  );
};

export const useCandidateTimeline = (id: string) => {
  return useQuery<any[]>(['candidateTimeline', id], () => apiService.getCandidateTimeline(id), { enabled: !!id });
};
