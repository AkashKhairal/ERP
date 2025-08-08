# Google OAuth Setup Guide

## 🚀 Quick Setup for Google Sign-In

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google+ API** and **Google Identity API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add authorized origins:
   - `http://localhost:3000` (for development)
   - `https://your-domain.com` (for production)
7. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://your-domain.com` (for production)

### 2. Update Environment Variables

#### Backend (.env file in `backend/` directory):
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000
```

#### Frontend (App.js):
Replace `your-google-client-id-here` in `frontend/src/App.js`:
```javascript
<GoogleOAuthProvider clientId="your-actual-google-client-id">
```

### 3. Test the Setup

1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm start`
3. Visit `http://localhost:3000`
4. Click "Sign in with Google" on the login page
5. You should be redirected to Google's OAuth consent screen

### 4. Troubleshooting

#### Common Issues:
- **"Invalid client" error**: Check your Google Client ID
- **"Redirect URI mismatch"**: Verify authorized redirect URIs in Google Console
- **"Token verification failed"**: Ensure Google Client ID matches in both frontend and backend

#### Development vs Production:
- For development: Use `http://localhost:3000`
- For production: Use your actual domain (e.g., `https://yourapp.com`)

### 5. Security Notes

- Never commit your Google Client Secret to version control
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Regularly rotate your OAuth credentials

### 6. Additional Features

The Google Sign-In implementation includes:
- ✅ Automatic user creation for new Google users
- ✅ Profile picture import from Google
- ✅ Audit logging for security tracking
- ✅ JWT token generation
- ✅ Error handling and user feedback

---

**Need help?** Check the Google OAuth documentation or contact support. 