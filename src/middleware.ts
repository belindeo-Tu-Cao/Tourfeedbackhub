import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkEnabled } from '@/lib/clerk';

// Public site + Payload admin (/admin has its own auth) run without forced
// Clerk protection. When Clerk is not configured, the middleware is a no-op so
// the app works before Clerk keys are set. Add route guards here later with
// auth.protect() as needed.
export default clerkEnabled ? clerkMiddleware() : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|gif|png|svg|ico|webp|woff2?|ttf|otf|map)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
