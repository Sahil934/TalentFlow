declare module 'react-query' {
  // Minimal, temporary typings to satisfy the editor before npm install.
  // Remove this file once dependencies are installed.
  export type QueryKey = readonly unknown[] | string;

  export function useQuery<TData = any>(
    key: QueryKey,
    fn: (...args: any[]) => Promise<TData> | TData,
    options?: any
  ): any;

  export function useMutation<TData = any, TError = any, TVariables = any, TContext = any>(
    fn: (variables: TVariables) => Promise<TData> | TData,
    options?: {
      onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void;
      onError?: (error: TError, variables: TVariables, context?: TContext) => void;
      onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
      onSettled?: (data?: TData, error?: TError, variables?: TVariables, context?: TContext) => void;
    }
  ): any;

  export function useQueryClient(): {
    cancelQueries: (key?: QueryKey) => Promise<void> | void;
    getQueriesData: (key?: QueryKey) => Array<[unknown, unknown]>;
    setQueriesData: (key: QueryKey, updater: (old: any) => any) => void;
    invalidateQueries: (key?: QueryKey) => Promise<void> | void;
    setQueryData: (key: QueryKey, data: unknown) => void;
  };

  export class QueryClient {
    constructor(options?: any);
  }

  export const QueryClientProvider: React.ComponentType<{ client: QueryClient; children: React.ReactNode }>;
}
