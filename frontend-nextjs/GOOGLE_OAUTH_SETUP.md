# Google OAuth Setup Guide

## Current Issue
Your login page is showing errors because Google OAuth is not properly configured.

## Quick Fix
1. **Create a `.env.local` file** in your `frontend-nextjs` directory with:

```bash
# Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NODE_ENV=development

# Add your Google OAuth client ID here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

## How to Get Google OAuth Client ID

### Option 1: Use Your Existing Backend Configuration
1. Check your backend `.env` file for `GOOGLE_CLIENT_ID`
2. Copy that value to `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend `.env.local`

### Option 2: Create New Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
7. Copy the Client ID to your `.env.local`

## After Setup
1. Restart your development server: `npm run dev`
2. The Google login button will appear on your login page
3. No more "Google OAuth components must be used within GoogleOAuthProvider" errors

## Temporary Workaround
If you don't want to set up Google OAuth right now:
- The login page will work without Google OAuth
- Only email/password login will be available
- No errors will be shown

## Files Modified
- `src/app/layout.tsx` - Added conditional GoogleOAuthProvider
- `src/components/pages/Auth/Login.tsx` - Added conditional Google login rendering
