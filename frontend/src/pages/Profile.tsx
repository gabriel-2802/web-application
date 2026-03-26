import { FC, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { LoginContext, isWriter } from "../context/Context";
import ProfileImage from "../assets/profile.jpg";
import axios from "axios";
import { USER_ENDPOINTS } from "../constants/api";
import { uploadImageFile } from "../services/fileUploadService";

const Profile: FC = () => {
	const navigate = useNavigate();
	const { user, jwt, dispatch } = useContext(LoginContext);
	const isWriterRole = isWriter(user);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Common fields for all users
	const [email, setEmail] = useState(user?.email || "");
	const [profileImageUrl, setProfileImageUrl] = useState(
		user?.profilePicture || "",
	);

	// Password change fields
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPasswordForm, setShowPasswordForm] = useState(false);

	// Writer-specific fields
	const [websiteUrl, setWebsiteUrl] = useState("");
	const [location, setLocation] = useState("");
	const [professionalTitle, setProfessionalTitle] = useState("");
	const [bio, setBio] = useState("");
	const [userPosts, setUserPosts] = useState<any[]>([]);
	const [userCollections, setUserCollections] = useState<any[]>([]);

	const [error, setError] = useState(false);
	const [errorText, setErrorText] = useState("");
	const [errorField, setErrorField] = useState<string | null>(null);

	const [completed, setCompleted] = useState(false);
	const [completedText, setCompletedText] = useState("");
	const [completedField, setCompletedField] = useState<string | null>(null);

	const [uploadingImage, setUploadingImage] = useState(false);
	const [loading, setLoading] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!user || !jwt) {
			navigate("/login", { replace: true });
		}
	}, [user, jwt, navigate]);

	// Helper function to format error messages
	const formatErrorMessage = (error: any): string => {
		if (!error) return "An unexpected error occurred";
		
		// Handle axios error responses
		if (error.response?.status === 401) {
			return "Your session has expired. Please log in again.";
		}
		if (error.response?.status === 409) {
			const data = error.response.data;
			if (typeof data === "string") {
				if (data.toLowerCase().includes("username")) {
					return "This username is already taken. Please choose another.";
				}
				if (data.toLowerCase().includes("email")) {
					return "This email is already registered. Please use another.";
				}
			}
			return "This value is already in use. Please try another.";
		}
		if (error.response?.status === 400) {
			return error.response.data || "Invalid input. Please check your data and try again.";
		}
		if (error.response?.status === 500) {
			return "Server error. Please try again later.";
		}
		if (error.response?.data) {
			if (typeof error.response.data === "string") {
				return error.response.data;
			}
			if (error.response.data.message) {
				return error.response.data.message;
			}
		}
		
		// Handle network errors
		if (error.message === "Network Error" || !error.response) {
			return "Network error. Please check your connection and try again.";
		}
		
		return error.message || "An unexpected error occurred";
	};

	// Helper to show error with auto-clear
	const showError = (fieldName: string, message: string) => {
		setError(true);
		setErrorField(fieldName);
		setErrorText(message);
		setCompleted(false);
		setCompletedField(null);
		setTimeout(() => setError(false), 4000);
	};

	// Helper to show success with auto-clear
	const showSuccess = (fieldName: string, message: string) => {
		setCompleted(true);
		setCompletedField(fieldName);
		setCompletedText(message);
		setError(false);
		setErrorField(null);
		setTimeout(() => setCompleted(false), 3000);
	};

	// Fetch profile on mount
	useEffect(() => {
		if (jwt) {
			fetchCurrentProfile();
			if (isWriterRole) {
				fetchWriterProfile();
			}
		}
	}, [isWriterRole, jwt]);

	const fetchCurrentProfile = async () => {
		try {
			const res = await axios.get(USER_ENDPOINTS.PROFILE, {
				headers: { Authorization: `Bearer ${jwt}` },
			});
			if (res.data) {
				setEmail(res.data.email || "");
				setProfileImageUrl(res.data.profileImageUrl || "");
			}
		} catch (error: any) {
			console.error("Failed to fetch current profile:", error);
			// Only auto-logout if session is expired
			if (error.response?.status === 401) {
				dispatch({ type: "LOGOUT" });
			}
		}
	};

	const fetchWriterProfile = async () => {
		try {
			const res = await axios.get(USER_ENDPOINTS.GET_CURRENT_WRITER, {
				headers: { Authorization: `Bearer ${jwt}` },
			});
			if (res.data) {
				setProfileImageUrl(res.data.profileImageUrl || "");
				setWebsiteUrl(res.data.websiteUrl || "");
				setLocation(res.data.location || "");
				setProfessionalTitle(res.data.professionalTitle || "");
				setBio(res.data.bio || "");
				setUserPosts(res.data.posts || []);
				setUserCollections(res.data.collections || []);
			}
		} catch (error: any) {
			console.error("Failed to fetch writer profile:", error);
			// Only auto-logout if session is expired
			if (error.response?.status === 401) {
				dispatch({ type: "LOGOUT" });
			}
		}
	};

	const updateField = async (
		endpoint: string,
		fieldName: string,
		payload: Record<string, string>,
		displayName: string,
	) => {
		try {
			const res = await axios.put(endpoint, payload, {
				headers: { Authorization: `Bearer ${jwt}` },
			});

			// Update user context if user object was returned
			if (res.data && res.data.id) {
				dispatch({
					type: "UPDATE_USER",
					payload: {
						...user,
						username: res.data.username || user?.username,
						email: res.data.email || user?.email,
						profilePicture: res.data.profileImageUrl || user?.profilePicture,
					},
				});
			}

			setCompleted(true);
			setCompletedField(fieldName);
			setCompletedText(`${displayName} updated successfully!`);
			setError(false);
			setErrorField(null);
			setTimeout(() => setCompleted(false), 3000);
		} catch (error: any) {
			setError(true);
			setErrorField(fieldName);
			setCompleted(false);
			setErrorText(error.response?.data || "An error occurred");
			setTimeout(() => setError(false), 3000);
		}
	};

	const updateEmailField = () => {
		const trimmedEmail = email.trim().toLowerCase();
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		
		if (!trimmedEmail) {
			showError("email", "Email cannot be empty");
			return;
		}
		if (!emailRegex.test(trimmedEmail)) {
			showError("email", "Please enter a valid email address");
			return;
		}
		updateField(
			USER_ENDPOINTS.UPDATE_EMAIL,
			"email",
			{ newEmail: trimmedEmail },
			"Email",
		);
	};

	const updatePasswordField = () => {
		if (!currentPassword.trim()) {
			showError("password", "Current password is required");
			return;
		}
		if (!newPassword.trim()) {
			showError("password", "New password cannot be empty");
			return;
		}
		if (newPassword.length < 6) {
			showError("password", "New password must be at least 6 characters");
			return;
		}
		if (currentPassword === newPassword) {
			showError("password", "New password must be different from current password");
			return;
		}
		if (newPassword !== confirmPassword) {
			showError("password", "Passwords do not match");
			return;
		}

		updateField(
			USER_ENDPOINTS.UPDATE_PASSWORD,
			"password",
			{
				currentPassword,
				newPassword,
				confirmPassword,
			},
			"Password",
		);

		// Clear password fields on success
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setShowPasswordForm(false);
	};

	const updateWebsite = () =>
		updateField(
			USER_ENDPOINTS.UPDATE_WEBSITE_URL,
			"websiteUrl",
			{ websiteUrl },
			"Website URL",
		);
	const updateLocationField = () =>
		updateField(
			USER_ENDPOINTS.UPDATE_LOCATION,
			"location",
			{ location },
			"Location",
		);
	const updateTitle = () =>
		updateField(
			USER_ENDPOINTS.UPDATE_PROFESSIONAL_TITLE,
			"professionalTitle",
			{ professionalTitle },
			"Professional Title",
		);
	const updateBioField = () =>
		updateField(
			USER_ENDPOINTS.UPDATE_BIO,
			"bio",
			{ bio },
			"Bio",
		);

	const handleImageFileSelect = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
		if (!validImageTypes.includes(file.type)) {
			showError("profileImage", "Please upload a valid image file (JPG, PNG, WebP, or GIF)");
			return;
		}

		// Validate file size (max 5MB)
		const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
		if (file.size > maxSizeInBytes) {
			showError("profileImage", "File size must not exceed 5MB");
			return;
		}

		if (!jwt) {
			showError("profileImage", "Authentication required. Please log in.");
			return;
		}

		setUploadingImage(true);
		try {
			// Upload to Cloudinary and get URL
			const imageUrl = await uploadImageFile(file);

			if (!imageUrl) {
				throw new Error("Invalid image URL returned from upload");
			}

			// Update local state with the URL
			setProfileImageUrl(imageUrl);

			// Send to backend
			await axios.put(
				USER_ENDPOINTS.UPDATE_PROFILE_IMAGE,
				{ profileImageUrl: imageUrl },
				{ headers: { Authorization: `Bearer ${jwt}` } },
			);

			// Update user context so navbar reflects the change immediately
			dispatch({
				type: "UPDATE_USER",
				payload: { ...user, profilePicture: imageUrl },
			});

			showSuccess("profileImage", "Profile image updated successfully!");
		} catch (error: any) {
			const errorMsg = formatErrorMessage(error);
			const displayError = error instanceof Error 
				? error.message 
				: errorMsg;
			showError("profileImage", displayError);
			
			if (error.response?.status === 401) {
				setTimeout(() => dispatch({ type: "LOGOUT" }), 2000);
			}
		} finally {
			setUploadingImage(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const deleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (!showDeleteConfirm) {
			setShowDeleteConfirm(true);
			return;
		}

		if (!jwt) {
			showError("delete", "Authentication required. Please log in.");
			return;
		}

		setLoading(true);
		try {
			await axios.delete(USER_ENDPOINTS.DELETE_ACCOUNT, {
				headers: { Authorization: `Bearer ${jwt}` },
			});
			// Add a slight delay before logout to show success message
			setTimeout(() => {
				dispatch({ type: "LOGOUT" });
			}, 1000);
			showSuccess("delete", "Account deleted successfully. Logging out...");
		} catch (error: any) {
			const errorMsg = formatErrorMessage(error);
			showError("delete", errorMsg);
			setShowDeleteConfirm(false);
		} finally {
			setLoading(false);
		}
	};

	const cancelDelete = () => {
		setShowDeleteConfirm(false);
	};

	// Show loading/redirect state if not authenticated
	if (!user || !jwt) {
		return (
			<div className="profile">
				<div className="profileWrapper">
					<p style={{ textAlign: "center", color: "var(--text-secondary)" }}>
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="profile">
			<div className="profileWrapper">
				<h2>{isWriterRole ? "Writer Profile" : "My Profile"}</h2>

				{/* COMMON FIELDS SECTION */}
				{/* Profile Picture */}
				<div className="profileSection">
					<label>Profile Picture</label>
					<div className="profilePP">
						<img
							src={profileImageUrl || user?.profilePicture || ProfileImage}
							className="profileImg"
							alt="profile"
						/>
						<label
							htmlFor="profileImageInput"
							onClick={triggerFileInput}
							style={{ cursor: "pointer" }}
						>
							<i
								className={`profilePPIcon ${uploadingImage ? "uploading" : ""}`}
							>
								<AddAPhotoIcon />
							</i>
						</label>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						id="profileImageInput"
						style={{ display: "none" }}
						accept="image/*"
						onChange={handleImageFileSelect}
						disabled={uploadingImage}
					/>
					{uploadingImage && (
						<p style={{ marginTop: "10px", color: "#666" }}>
							Uploading image...
						</p>
					)}
					{!uploadingImage && (
						<p
							style={{
								marginTop: "10px",
								fontSize: "12px",
								color: "#666",
							}}
						>
							Click the camera icon to upload a new image
						</p>
					)}
				</div>

				{/* Email */}
				<div className="profileSection">
					<label>Email</label>
					<input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<button
						type="button"
						onClick={updateEmailField}
						className={`profileSaveButton ${
							completedField === "email"
								? "success"
								: errorField === "email"
									? "error"
									: ""
						}`}
					>
						Update Email
					</button>
				</div>

				{/* Password Change */}
				<div className="profileSection">
					<label>Password</label>
					{!showPasswordForm ? (
						<button
							type="button"
							onClick={() => setShowPasswordForm(true)}
							className="profileSaveButton"
						>
							Change Password
						</button>
					) : (
						<div className="passwordFormContainer">
							<input
								type="password"
								placeholder="Current password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								style={{ marginBottom: "10px" }}
							/>
							<input
								type="password"
								placeholder="New password (min 6 chars)"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								style={{ marginBottom: "10px" }}
							/>
							<input
								type="password"
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								style={{ marginBottom: "10px" }}
							/>
							<div style={{ display: "flex", gap: "10px" }}>
								<button
									type="button"
									onClick={updatePasswordField}
									className={`profileSaveButton ${
										completedField === "password"
											? "success"
											: errorField === "password"
												? "error"
												: ""
									}`}
								>
									Update Password
								</button>
								<button
									type="button"
									onClick={() => {
										setShowPasswordForm(false);
										setCurrentPassword("");
										setNewPassword("");
										setConfirmPassword("");
									}}
									className="profileCancelButton"
								>
									Cancel
								</button>
							</div>
						</div>
					)}
				</div>

				{/* WRITER-SPECIFIC FIELDS SECTION */}
				{isWriterRole && (
					<>
						<div className="profileDivider"></div>
						<h3 style={{ marginTop: "20px", marginBottom: "15px" }}>
							Writer Information
						</h3>

						{/* Professional Title */}
						<div className="profileSection">
							<label>Professional Title</label>
							<input
								type="text"
								placeholder="e.g., Software Engineer & Author"
								value={professionalTitle}
								onChange={(e) =>
									setProfessionalTitle(e.target.value)
								}
							/>
							<button
								type="button"
								onClick={updateTitle}
								className={`profileSaveButton ${
									completedField === "professionalTitle"
										? "success"
										: errorField === "professionalTitle"
											? "error"
											: ""
								}`}
							>
								Update Title
							</button>
						</div>

						{/* Location */}
						<div className="profileSection">
							<label>Location</label>
							<input
								type="text"
								placeholder="e.g., New York, USA"
								value={location}
								onChange={(e) => setLocation(e.target.value)}
							/>
							<button
								type="button"
								onClick={updateLocationField}
								className={`profileSaveButton ${
									completedField === "location"
										? "success"
										: errorField === "location"
											? "error"
											: ""
								}`}
							>
								Update Location
							</button>
						</div>

						{/* Website URL */}
						<div className="profileSection">
							<label>Website URL</label>
							<input
								type="url"
								placeholder="e.g., example.com"
								value={websiteUrl}
								onChange={(e) => setWebsiteUrl(e.target.value)}
							/>
							<button
								type="button"
								onClick={updateWebsite}
								className={`profileSaveButton ${
									completedField === "websiteUrl"
										? "success"
										: errorField === "websiteUrl"
											? "error"
											: ""
								}`}
							>
								Update Website
							</button>
						</div>

						{/* Bio */}
						<div className="profileSection">
							<label>Bio</label>
							<textarea
								placeholder="Tell about yourself..."
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								rows={4}
						/>
							<button
								type="button"
								onClick={updateBioField}
								className={`profileSaveButton ${
									completedField === "bio"
										? "success"
										: errorField === "bio"
											? "error"
											: ""
								}`}
							>
								Update Bio
							</button>
						</div>

						{/* Stats Section */}
						<div className="profileDivider"></div>
						<div className="profileStats">
							<div className="profileStat">
								<label>Posts</label>
								<span className="statValue">
									{userPosts?.length || 0}
								</span>
							</div>
							<div className="profileStat">
								<label>Collections</label>
								<span className="statValue">
									{userCollections?.length || 0}
								</span>
							</div>
						</div>
					</>
				)}

				{/* Delete Account Button */}
				<div className="profileDivider"></div>
				{!showDeleteConfirm ? (
					<button
						className="profileDeleteButton"
						onClick={deleteClick}
						disabled={loading}
					>
						{loading ? "Deleting..." : "Delete Account"}
					</button>
				) : (
					<div style={{
						padding: "24px",
						backgroundColor: "rgba(212, 165, 116, 0.08)",
						border: "1px solid rgba(212, 165, 116, 0.5)",
						borderRadius: "8px",
						marginTop: "20px",
						textAlign: "center",
						maxWidth: "600px",
						margin: "20px auto"
					}}>
						<p style={{ color: "var(--text-primary)", marginBottom: "12px", fontWeight: "600", fontSize: "1.1rem", letterSpacing: "0.5px" }}>
							Are you sure? This action cannot be undone.
						</p>
						<p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.95rem", lineHeight: "1.6" }}>
							All your data will be permanently deleted.
						</p>
						<div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
							<button
								className="profileDeleteButton"
								onClick={deleteClick}
								disabled={loading}
								style={{ flex: "0 1 calc(50% - 6px)", minWidth: "140px", marginTop: 0 }}
							>
								{loading ? "Deleting..." : "Confirm Delete"}
							</button>
							<button
								className="profileCancelButton"
								onClick={cancelDelete}
								disabled={loading}
								style={{ flex: "0 1 calc(50% - 6px)", minWidth: "140px" }}
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{error && !completedField && (
					<span className="profileError">{errorText}</span>
				)}
				{completed && !errorField && (
					<span className="profileSuccess">{completedText}</span>
				)}
			</div>
		</div>
	);
};

export default Profile;
