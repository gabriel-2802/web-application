# Google Drive API Integration Setup Guide

This guide explains how to set up Google Drive API for image uploads in your blog application.

## Overview

Images uploaded to Google Drive will be:
1. Uploaded to your Google Drive
2. Made publicly accessible via a shareable link
3. Passed to the backend as a URL

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Blog App")
5. Click "CREATE"
6. Wait for the project to be created

### 2. Enable Google Drive API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **ENABLE**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** and choose **OAuth client ID**
3. If prompted to create a consent screen first:
   - Click "Configure Consent Screen"
   - Choose "External" user type
   - Fill in the app name, user support email, and developer contact
   - For scopes, add `.../auth/drive.file`
   - Add test users if needed
   - Save and continue

4. Back in Credentials, click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. Choose **Web application**
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000`
   - `http://localhost:3000/`
7. Click **CREATE**
8. Copy the **Client ID** (you'll also need this for the next step)

### 4. Get Your API Key (Optional but recommended)

1. In Credentials, click **+ CREATE CREDENTIALS** > **API Key**
2. Copy the API Key
3. (Optional) Restrict the key to only allow Drive API

### 5. Update Environment Variables

1. Open `.env.local` in the project root
2. Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID
3. Replace `YOUR_API_KEY_HERE` with your API Key
4. Save the file

Example:
```
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc...xyz@developer.gserviceaccount.com
REACT_APP_GOOGLE_API_KEY=AIzaSyD...xyz
```

### 6. Restart the Development Server

```bash
npm start
```

## How It Works

1. **Select an image**: Click the image icon in the Write page
2. **Upload to Drive**: Click "Upload to Drive" button
3. **Authenticate**: First time, you'll be prompted to sign in with Google
4. **File uploaded**: The image URL is automatically captured
5. **Publish post**: Create your post normally; the image URL is sent to the backend

## Testing

1. Go to http://localhost:3000
2. Log in to your writer account
3. Navigate to the Write/Create Post page
4. Select an image and click "Upload to Drive"
5. Check your Google Drive to confirm the file was uploaded
6. The image URL will appear in the post

## Troubleshooting

### "Google API not initialized" error
- Make sure your Client ID is correctly set in `.env.local`
- Verify the environment variables by checking the browser console

### "Failed to upload image" error
- Check that Google Drive API is enabled in Cloud Console
- Verify OAuth scopes include `https://www.googleapis.com/auth/drive.file`
- Ensure `http://localhost:3000` is in the authorized redirect URIs

### Images not loading in posts
- Check that the Drive file is publicly accessible
- Verify the image URL format: `https://drive.google.com/uc?id=FILE_ID`

### "Not authenticated" error
- Click the upload button again to trigger the authentication flow
- Make sure you're logged into your Google account

## Security Notes

- The Client ID and API Key are development credentials
- For production, implement proper server-side OAuth flow
- Consider rate limiting uploads on the backend
- Validate image types and sizes on both frontend and backend

## Further Reading

- [Google Drive API Documentation](https://developers.google.com/drive)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server-flow)
