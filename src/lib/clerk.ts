/**
 * Whether Clerk is configured with a real publishable key.
 * Evaluated from a NEXT_PUBLIC_ constant so it is inlined identically in the
 * server and client bundles at build time (stable across renders).
 */
const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

export const clerkEnabled =
  key.startsWith('pk_') && !key.includes('your_publishable_key');
