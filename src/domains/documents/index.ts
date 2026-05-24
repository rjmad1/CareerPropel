// DocumentUpload is canonical in @/domains/profile — import it from there.
export {
  useDocuments,
  useDocument,
  useUploadDocument,
  useDeleteDocument,
  documentsQueryKeys,
} from '@/hooks/useDocuments';
export type { Document, DocumentsPage, DocumentUploadInput } from '@/hooks/useDocuments';
