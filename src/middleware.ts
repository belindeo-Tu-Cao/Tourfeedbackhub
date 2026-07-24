import createIntlMiddleware from 'next-intl/middleware'
import { clerkMiddleware } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { clerkEnabled } from '@/lib/clerk'

const intlMiddleware = createIntlMiddleware(routing)

const handler = clerkEnabled
  ? clerkMiddleware((_auth, req: NextRequest) => intlMiddleware(req))
  : (req: NextRequest) => intlMiddleware(req)

export default handler

export const config = {
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}
