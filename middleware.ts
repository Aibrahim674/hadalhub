import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: ['/', '/api/translate'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};