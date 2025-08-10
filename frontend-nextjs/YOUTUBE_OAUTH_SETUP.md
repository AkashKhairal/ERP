# YouTube OAuth Integration Setup

This guide will help you set up real YouTube OAuth authentication for the ERP application.

## Prerequisites

1. Google Cloud Console account
2. YouTube Data API v3 enabled
3. OAuth 2.0 credentials configured

## Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

### 1.2 Enable YouTube Data API v3
1. Go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/app/integrations/callback/youtube` (for development)
   - `https://yourdomain.com/app/integrations/callback/youtube` (for production)
5. Copy the Client ID and Client Secret

### 1.4 Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API Key

## Step 2: Environment Configuration

Create a `.env.local` file in the `frontend-nextjs` directory with the following variables:

```env
# YouTube OAuth Configuration
NEXT_PUBLIC_YOUTUBE_CLIENT_ID=your_youtube_client_id_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Step 3: OAuth Flow Implementation

The application now supports real YouTube OAuth authentication:

### 3.1 Connection Flow
1. User clicks "Connect" on YouTube integration
2. New window opens with Google OAuth consent screen
3. User enters their YouTube credentials
4. User grants permissions to the application
5. Authorization code is returned to the callback URL
6. Code is exchanged for access and refresh tokens
7. Tokens are stored securely in localStorage
8. Integration status is updated to "connected"

### 3.2 Data Sync Flow
1. User clicks "Sync" on connected YouTube integration
2. Application uses stored access token to fetch:
   - Channel information (subscribers, views, etc.)
   - Videos (up to 50 most recent)
   - Playlists (up to 50)
3. Data is stored and displayed in the application
4. Sync status and timestamp are updated

## Step 4: Testing

### 4.1 Development Testing
1. Start the development server: `npm run dev`
2. Navigate to `/app/integrations`
3. Click "Connect" on YouTube integration
4. Complete the OAuth flow
5. Test the sync functionality

### 4.2 Production Deployment
1. Update the redirect URIs in Google Cloud Console
2. Set the correct environment variables
3. Deploy the application
4. Test the OAuth flow in production

## Security Considerations

1. **Client Secret**: Never expose the client secret in frontend code
2. **Token Storage**: Tokens are stored in localStorage (consider more secure storage for production)
3. **HTTPS**: Always use HTTPS in production for OAuth flows
4. **Token Refresh**: Implement token refresh logic for expired tokens
5. **Error Handling**: Handle OAuth errors gracefully

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Check that the redirect URI in Google Cloud Console matches exactly
   - Ensure the URI includes the correct protocol (http/https)

2. **"Access denied" error**
   - Check that the YouTube Data API v3 is enabled
   - Verify the OAuth consent screen is configured

3. **"Invalid client" error**
   - Verify the client ID is correct
   - Check that the OAuth 2.0 credentials are properly configured

4. **"Quota exceeded" error**
   - Check your YouTube Data API quota in Google Cloud Console
   - Consider implementing rate limiting

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```env
NEXT_PUBLIC_DEBUG_OAUTH=true
```

## API Endpoints Used

The integration uses the following YouTube Data API v3 endpoints:

- `GET /youtube/v3/channels` - Get channel information
- `GET /youtube/v3/search` - Get videos
- `GET /youtube/v3/playlists` - Get playlists

## Rate Limits

- YouTube Data API v3 has a quota of 10,000 units per day
- Each API call consumes different units:
  - Channels: 1 unit
  - Search: 100 units
  - Playlists: 1 unit

## Support

For issues related to:
- YouTube API: Check [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- OAuth: Check [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Application: Check the application logs and browser console 