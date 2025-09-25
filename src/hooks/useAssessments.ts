import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import { Assessment } from '../types';

export const useAssessmentByJob = (jobId?: string) => {
  return useQuery<Assessment | null>(['assessment', jobId], () => jobId ? apiService.getAssessment(jobId) : Promise.resolve(null), { enabled: !!jobId });
};

export const useSaveAssessment = () => {
  const qc = useQueryClient();
  return useMutation<Assessment, Error, { jobId: string; assessment: Omit<Assessment, 'jobId' | 'createdAt' | 'updatedAt'> }>(
    ({ jobId, assessment }) => apiService.saveAssessment(jobId, assessment),
    {
      onSuccess: (a) => {
        qc.setQueryData(['assessment', a.jobId], a);
      },
    }
  );
};
