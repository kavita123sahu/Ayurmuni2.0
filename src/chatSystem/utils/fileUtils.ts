import { AttachmentType } from '../types/chat';

export function getAttachmentTypeFromMime(mime: string): AttachmentType {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  return 'document';
}

export function getExtensionFromName(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
}

export function formatFileSize(bytes?: number): string {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Generates a stable, unique client-side id for optimistic messages/attachments. */
export function generateClientId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
