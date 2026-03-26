/**
 * Google Drive API Service
 * Handles file uploads to Google Drive using the REST API
 */

const CLIENT_ID =
	process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID_HERE";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

console.log("🔍 GoogleDriveService initialized");
console.log(
	"   CLIENT_ID:",
	CLIENT_ID !== "YOUR_CLIENT_ID_HERE" ? "Valid ✓" : "INVALID ❌",
);
console.log("   Has valid CLIENT_ID:", CLIENT_ID !== "YOUR_CLIENT_ID_HERE");

let accessToken: string | null = null;

/**
 * Load and initialize Google Identity Services library
 */
export const initializeGoogleAPI = (): Promise<void> => {
	return new Promise((resolve, reject) => {
		console.log("📱 Checking if Google API already loaded...");

		if ((window as any).google?.accounts?.oauth2) {
			console.log("✅ Google API already loaded");
			resolve();
			return;
		}

		console.log("📥 Loading Google Identity Services library...");
		const script = document.createElement("script");
		script.src = "https://accounts.google.com/gsi/client";
		script.async = true;
		script.defer = true;
		script.onload = () => {
			console.log("✅ Google Identity Services library loaded");
			resolve();
		};
		script.onerror = () => {
			console.error("❌ Failed to load Google API");
			reject(new Error("Failed to load Google API"));
		};
		document.head.appendChild(script);
	});
};

/**
 * Authenticate with Google and get access token
 */
export const authenticateWithGoogle = (): Promise<string> => {
	return new Promise((resolve, reject) => {
		console.log("🔐 Starting Google OAuth authentication...");

		if (!(window as any).google?.accounts?.oauth2) {
			console.error("❌ Google OAuth2 API not available");
			reject(new Error("Google OAuth2 API not available"));
			return;
		}

		try {
			// Create token client for OAuth 2.0 token flow
			const tokenClient = (
				window as any
			).google.accounts.oauth2.initTokenClient({
				client_id: CLIENT_ID,
				scope: SCOPES,
				callback: (response: any) => {
					console.log("📬 OAuth callback received");

					if (response.access_token) {
						console.log("✅ Access token received successfully");
						accessToken = response.access_token;
						resolve(response.access_token);
					} else if (response.error) {
						console.error(
							"❌ OAuth error:",
							response.error,
							response.error_description,
						);
						reject(new Error(`OAuth error: ${response.error}`));
					} else {
						console.error(
							"❌ Unexpected OAuth response:",
							response,
						);
						reject(new Error("Failed to get access token"));
					}
				},
			});

			console.log("🔓 Requesting access token with consent...");
			// Request access token - will show consent screen
			tokenClient.requestAccessToken({ prompt: "consent" });
		} catch (error) {
			console.error("❌ Error creating token client:", error);
			reject(error);
		}
	});
};

/**
 * Upload file to Google Drive
 */
export const uploadFileToDrive = async (file: File): Promise<string> => {
	try {
		console.log("📤 Starting file upload to Google Drive...");
		console.log("   File name:", file.name);
		console.log("   File size:", file.size, "bytes");
		console.log("   File type:", file.type);

		if (!accessToken) {
			console.error("❌ No access token - authenticate first");
			throw new Error(
				"Not authenticated with Google Drive. Please authenticate first.",
			);
		}

		console.log("✅ Access token verified");

		// Create metadata
		const metadata = {
			name: file.name,
			mimeType: file.type,
			parents: ["root"], // Upload to Drive root
		};

		// Create multipart request body
		const formData = new FormData();
		formData.append(
			"metadata",
			new Blob([JSON.stringify(metadata)], { type: "application/json" }),
		);
		formData.append("file", file);

		console.log("📡 Sending upload request to Google Drive API...");
		const response = await fetch(
			"https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
				body: formData,
			},
		);

		console.log(
			"   Response status:",
			response.status,
			response.statusText,
		);

		if (!response.ok) {
			const errorData = await response.json();
			console.error("❌ Upload failed:", errorData);
			throw new Error(
				errorData.error?.message ||
					`Upload failed: ${response.statusText}`,
			);
		}

		const data = await response.json();
		const fileId = data.id;
		console.log("✅ File uploaded successfully");
		console.log("   File ID:", fileId);

		// Make file publicly readable
		console.log("🔗 Setting file to public access...");
		await shareFilePublic(fileId);
		console.log("✅ File is now public");

		// Generate public URL
		const driveUrl = `https://drive.google.com/uc?id=${fileId}`;
		console.log("🎉 Upload complete!");
		console.log("   Public URL:", driveUrl);

		return driveUrl;
	} catch (error) {
		console.error("❌ Error uploading to Google Drive:", error);
		throw error;
	}
};

/**
 * Share file publicly
 */
const shareFilePublic = async (fileId: string): Promise<void> => {
	try {
		const response = await fetch(
			`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					role: "reader",
					type: "anyone",
				}),
			},
		);

		if (!response.ok) {
			throw new Error("Failed to make file public");
		}
	} catch (error) {
		console.error("⚠️ Warning: Could not make file public:", error);
		// Don't fail the upload if sharing fails
	}
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
	return !!accessToken;
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = (): void => {
	if ((window as any).google) {
		(window as any).google.accounts.id.disableAutoSelect();
	}
	accessToken = null;
	console.log("✅ Signed out from Google");
};
