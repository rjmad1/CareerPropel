import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

type WrappedResponse<T> = { data: T } | T;

function isWrapped<T>(r: WrappedResponse<T>): r is { data: T } {
  return r !== null && typeof r === 'object' && 'data' in r && Object.keys(r).length === 1;
}

function unwrap<T>(response: WrappedResponse<T>): T {
  return isWrapped(response) ? response.data : response;
}

export interface Document {
  id: string;
  candidateId: string;
  type: 'resume' | 'cover_letter' | 'portfolio' | 'transcript' | 'other';
  title: string;
  content?: string;
  fileUrl?: string;
  jobId?: string;
  version?: number;
  wordCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsPage {
  items: Document[];
  total: number;
  limit: number;
  offset: number;
}

export interface DocumentUploadInput {
  type: Document['type'];
  title: string;
  content?: string;
  fileUrl?: string;
  jobId?: string;
}

export const documentsQueryKeys = {
  all: ['documents'] as const,
  lists: () => [...documentsQueryKeys.all, 'list'] as const,
  list: (params?: { type?: string; jobId?: string; limit?: number; offset?: number }) =>
    [...documentsQueryKeys.lists(), params] as const,
  detail: (id: string) => [...documentsQueryKeys.all, 'detail', id] as const,
};

async function fetchDocuments(params?: {
  type?: string;
  jobId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<DocumentsPage> {
  const query = new URLSearchParams();
  if (params?.type) query.append('type', params.type);
  if (params?.jobId) query.append('jobId', params.jobId);
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.offset) query.append('offset', String(params.offset));
  if (params?.sortBy) query.append('sortBy', params.sortBy);
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

  const { data } = await axios.get<{ data: DocumentsPage } | DocumentsPage>(
    `/api/documents?${query.toString()}`
  );
  const payload = (data as { data?: DocumentsPage }).data ?? data;
  if (Array.isArray(payload)) {
    return { items: payload, total: payload.length, limit: payload.length, offset: 0 };
  }
  return payload as DocumentsPage;
}

async function fetchDocument(id: string): Promise<Document> {
  const { data } = await axios.get<WrappedResponse<Document>>(`/api/documents/${id}`);
  return unwrap(data);
}

async function uploadDocument(input: DocumentUploadInput): Promise<Document> {
  const { data } = await axios.post<WrappedResponse<Document>>('/api/documents', input);
  return unwrap(data);
}

async function deleteDocument(id: string): Promise<void> {
  await axios.delete(`/api/documents/${id}`);
}

export function useDocuments(params?: {
  type?: string;
  jobId?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: documentsQueryKeys.list(params),
    queryFn: () => fetchDocuments(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsQueryKeys.detail(id),
    queryFn: () => fetchDocument(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DocumentUploadInput) => uploadDocument(input),
    onSuccess: (doc) => {
      queryClient.setQueryData(documentsQueryKeys.detail(doc.id), doc);
      queryClient.invalidateQueries({ queryKey: documentsQueryKeys.lists() });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: (_void, id) => {
      queryClient.removeQueries({ queryKey: documentsQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: documentsQueryKeys.lists() });
    },
  });
}
