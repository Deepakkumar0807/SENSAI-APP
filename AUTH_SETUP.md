# Authentication Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here

# Clerk URLs (optional - defaults to localhost:3000)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

## Getting Clerk Keys

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key and secret key from the dashboard
4. Add them to your `.env.local` file

## Features

- ✅ Sign In page at `/sign-in`
- ✅ Sign Up page at `/sign-up`
- ✅ Protected routes middleware
- ✅ Dark theme integration
- ✅ Responsive design
- ✅ Auth utilities for server-side operations

## Protected Routes

The following routes require authentication:
- `/dashboard/*`
- `/resume/*`
- `/interview/*`
- `/ai-cover-letter/*`
- `/onboarding/*`

## Usage

The authentication system is now properly configured with Clerk. Users will be redirected to sign-in when trying to access protected routes.


