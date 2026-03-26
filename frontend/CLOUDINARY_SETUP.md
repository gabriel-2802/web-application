# Cloudinary Image Upload Setup

This guide will walk you through setting up Cloudinary for image uploads in the blog application.

## Why Cloudinary?

Cloudinary provides free, simple image hosting without complex authentication. Perfect for development!

## Setup Steps

### Step 1: Create a Cloudinary Account

1. Visit [https://cloudinary.com/](https://cloudinary.com/)
2. Click "Sign Up For Free"
3. Enter your email and create a password
4. Verify your email
5. You'll be redirected to your Cloudinary dashboard

### Step 2: Get Your Cloud Name

1. On the dashboard, look for your **Cloud Name** (appears as `d[xxx]` or similar near the top)
2. Copy this value
3. Open `.env.local` in this project
4. Replace `YOUR_CLOUD_NAME` with your actual Cloud Name:
   ```
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   ```

### Step 3: Create an Upload Preset

1. Go to **Settings** (gear icon, top right)
2. Click the **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset** button
5. Configure:
   - **Preset name:** `blog_images`
   - **Signing Mode:** Unsigned ✓ (important - no auth needed)
   - Leave other settings as default
6. Click **Save**

### Step 4: Update Environment Variables

Edit `.env.local` and ensure it has:

```env
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
REACT_APP_CLOUDINARY_UPLOAD_PRESET=blog_images
```

> **Note:** Replace `your_cloud_name_here` with your actual Cloud Name from Step 2

### Step 5: Restart Dev Server

Since you updated environment variables, you need to restart the development server:

1. Stop the current `npm start` process (Ctrl+C)
2. Run: `npm start`
3. Wait for the app to load

## Testing the Upload

1. Navigate to the **Write** page
2. Click **Select Image** button
3. choose an image file
4. Click **Upload Image** button
5. Check the browser console (F12) for upload progress:
   - 📤 "Starting file upload to Cloudinary..."
   - 📡 "Sending upload request to Cloudinary..."
   - ✅ "File uploaded successfully to Cloudinary"
6. You should see the image URL appear in the form
7. Create a post - the image URL will be saved with the post!

## Troubleshooting

### ❌ "Cloudinary Cloud Name not configured"

- Make sure you added `REACT_APP_CLOUDINARY_CLOUD_NAME` to `.env.local`
- Restart the dev server (`npm start`)
- Check that the Cloud Name is correct (not a placeholder)

### ❌ "Error: Cannot find module 'fileUploadService'"

- Make sure you ran `npm install` (if dependencies changed)
- Check that `/src/services/fileUploadService.ts` exists

### ❌ Upload button isn't working

- Check browser console (F12) for error messages
- Verify your Cloud Name is set correctly
- Make sure the upload preset "blog_images" exists in Cloudinary settings

### ❌ Image URL not appearing in form

- Check browser console for errors
- Verify Cloudinary response in Network tab (F12 → Network)
- Make sure the upload was successful (status 200)

## How It Works

1. **fileUploadService.ts** - Sends image directly to Cloudinary API
2. **Write.tsx** - Calls uploadImageFile() when you click "Upload Image"
3. **Cloudinary** - Hosts the image and returns a public URL
4. **Backend** - Saves the image URL with the post (no image upload to backend)

## Security Note

This setup uses **unsigned uploads**, which is safe for public images. For production, you might want to implement signed uploads for more control.

## Support

For help with Cloudinary:
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Unsigned Upload Documentation](https://cloudinary.com/documentation/upload_api#unsigned_upload)
