import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * Server-side singleton access to the Payload Local API (Neon Postgres).
 * Use in Server Components, Route Handlers, and Server Actions only.
 */
export const getPayloadClient = async () => {
  return getPayload({ config });
};

/**
 * Resolve a Payload upload/media relation to a public URL.
 * Accepts an id, a populated media object, or null.
 */
export function mediaUrl(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return '';
  if (typeof value === 'object' && value !== null && 'url' in value) {
    const url = (value as { url?: unknown }).url;
    return typeof url === 'string' ? url : '';
  }
  return '';
}
