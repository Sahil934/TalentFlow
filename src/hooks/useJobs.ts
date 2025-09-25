import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import { Job, JobFilters, PaginationParams, ReorderRequest, JobsResponse } from '../types';

export const useJobs = (filters: JobFilters & PaginationParams = {}) => {
  return useQuery<JobsResponse>(
    ['jobs', filters],
    () => apiService.getJobs(filters),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useJob = (id: string) => {
  return useQuery<Job>(
    ['job', id],
    () => apiService.getJob(id),
    {
      enabled: !!id,
    }
  );
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Job, Error, Omit<Job, 'id' | 'createdAt' | 'updatedAt'>>( 
    (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => apiService.createJob(job),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['jobs']);
      },
    }
  );
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Job, Error, { id: string; updates: Partial<Job> }>(
    ({ id, updates }: { id: string; updates: Partial<Job> }) => 
      apiService.updateJob(id, updates),
    {
      onSuccess: (updatedJob: Job) => {
        queryClient.setQueryData(['job', updatedJob.id], updatedJob);
        queryClient.invalidateQueries(['jobs']);
      },
    }
  );
};

export const useReorderJobs = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    void,
    Error,
    { id: string; reorderData: ReorderRequest },
    { previousJobs: Array<[unknown, unknown]> }
  >(
    ({ id, reorderData }: { id: string; reorderData: ReorderRequest }) => 
      apiService.reorderJobs(id, reorderData),
    {
      onMutate: async ({ reorderData }: { reorderData: ReorderRequest }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries(['jobs']);
        
        // Snapshot the previous value
        const previousJobs = queryClient.getQueriesData(['jobs']);
        
        // Optimistically update jobs order
        queryClient.setQueriesData(['jobs'], (old: JobsResponse | undefined) => {
          if (!old || !('jobs' in old) || !Array.isArray((old as JobsResponse).jobs)) return old;
          
          const jobs = [...(old as JobsResponse).jobs];
          const { fromOrder, toOrder } = reorderData;
          
          // Find the job being moved
          const jobIndex = jobs.findIndex(job => job.order === fromOrder);
          if (jobIndex === -1) return old;
          
          const [movedJob] = jobs.splice(jobIndex, 1);
          
          // Update orders
          jobs.forEach(job => {
            if (fromOrder < toOrder) {
              if (job.order > fromOrder && job.order <= toOrder) {
                job.order -= 1;
              }
            } else {
              if (job.order >= toOrder && job.order < fromOrder) {
                job.order += 1;
              }
            }
          });
          
          movedJob.order = toOrder;
          jobs.push(movedJob);
          
          // Sort by order
          jobs.sort((a, b) => a.order - b.order);
          
          return { ...(old as JobsResponse), jobs } as JobsResponse;
        });
        
        return { previousJobs };
      },
      onError: (
        err: Error, 
        variables: { id: string; reorderData: ReorderRequest }, 
        context?: { previousJobs: Array<[unknown, unknown]> }
      ) => {
        // Rollback on error
        if (context?.previousJobs) {
          context.previousJobs.forEach(([queryKey, data]: [unknown, unknown]) => {
            queryClient.setQueryData(queryKey as any, data);
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['jobs']);
      },
    }
  );
};
