import { FC, useState, useContext, useEffect } from "react";
import "../styles/write.css";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PublishIcon from "@mui/icons-material/Publish";
import AddIcon from "@mui/icons-material/Add";
import Image from "../assets/pexels-sheep-1846422.jpg";
import axios from "axios";
import { LoginContext, Post, isWriter } from "../context/Context";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { POST_ENDPOINTS, COLLECTION_ENDPOINTS } from "../constants/api";
import Modal from "../components/Modal";
import FormInput from "../components/FormInput";
import { Stack } from "@mui/material";
import { uploadImageFile } from "../services/fileUploadService";

interface Collection {
	id: number;
	name: string;
	description: string;
}

interface FormData {
	name: string;
	description: string;
}

const Write: FC = () => {
	const { jwt, user } = useContext(LoginContext);
	const nav = useNavigate();
	const location = useLocation();
	const { postId } = useParams<{ postId?: string }>();
	const statePost = location.state as Post | null;
	const isEditMode = !!postId;

	const [title, setTitle] = useState("");
	const [text, setText] = useState("");
	const [collectionId, setCollectionId] = useState<number | "">("");
	const [collections, setCollections] = useState<Collection[]>([]);
	const [file, setFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(isEditMode);

	// Collection modal states
	const [openModal, setOpenModal] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		description: "",
	});
	const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!jwt || !user) {
			nav("/login");
			return;
		}
		if (!isWriter(user)) {
			setError(
				"You do not have permission to write posts. Only writers can create posts.",
			);
			setTimeout(() => nav("/"), 3000);
			return;
		}
	}, [jwt, user, nav]);

	useEffect(() => {
		const fetchCollections = async () => {
			try {
				const res = await axios.get(COLLECTION_ENDPOINTS.ALL);
				setCollections(res.data);
			} catch (error) {
				console.error("Failed to fetch collections:", error);
			}
		};
		fetchCollections();
	}, []);

	useEffect(() => {
		if (isEditMode && postId) {
			const fetchPost = async () => {
				try {
					const res = await axios.get(POST_ENDPOINTS.FIND(postId));
					const post = res.data;
					setTitle(post.title || "");
					setText(post.content || "");
					setCollectionId(post.collectionId || "");
					setIsLoading(false);
				} catch (err: any) {
					setError("Failed to load post for editing.");
					setIsLoading(false);
					setTimeout(() => nav("/"), 3000);
				}
			};
			fetchPost();
		} else if (statePost) {
			setTitle(statePost.title || "");
			setText(statePost.content || "");
			setCollectionId(statePost.collectionId || "");
		}
	}, [isEditMode, postId, statePost, nav]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!title.trim() || !text.trim()) {
			setError("Title and content cannot be empty.");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			// Upload image first if a file exists and hasn't been uploaded yet
			let finalImageUrl = imageUrl;
			if (file && !imageUrl) {
				setIsSubmitting(true);
				finalImageUrl = await uploadImageFile(file);
				setImageUrl(finalImageUrl);
			}

			const newPost: any = { title, content: text };
			if (collectionId) newPost.collectionId = collectionId;
			if (finalImageUrl) newPost.imageUrl = finalImageUrl;

			if (isEditMode && postId) {
				await axios.put(POST_ENDPOINTS.UPDATE(postId), newPost, {
					headers: { Authorization: `Bearer ${jwt}` },
				});
			} else {
				await axios.post(POST_ENDPOINTS.CREATE, newPost, {
					headers: { Authorization: `Bearer ${jwt}` },
				});
			}
			setIsSubmitting(false);
			nav("/");
		} catch (err: any) {
			setIsSubmitting(false);
			const errorMessage =
				err.response?.data?.message ||
				err.response?.data ||
				err.message ||
				"Failed to save post.";
			console.error("Post submission failed:", errorMessage);
			setError(
				typeof errorMessage === "string"
					? errorMessage
					: JSON.stringify(errorMessage),
			);
		}
	};

	const validateForm = (): boolean => {
		const errors: Partial<FormData> = {};
		if (!formData.name.trim()) {
			errors.name = "Name is required";
		}
		if (!formData.description.trim()) {
			errors.description = "Description is required";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error for this field as user types
		if (formErrors[name as keyof FormData]) {
			setFormErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	const handleFormSubmit = async () => {
		if (!validateForm()) return;

		try {
			setSubmitting(true);
			const res = await axios.post(
				COLLECTION_ENDPOINTS.CREATE,
				formData,
				{
					headers: { Authorization: `Bearer ${jwt}` },
				},
			);
			// Add the new collection to the list and set it as selected
			setCollections([...collections, res.data]);
			setCollectionId(res.data.id);
			setOpenModal(false);
			setFormData({ name: "", description: "" });
			setFormErrors({});
		} catch (err) {
			console.error("Failed to create collection:", err);
			setError("Failed to create collection. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleOpenModal = () => {
		setFormData({ name: "", description: "" });
		setFormErrors({});
		setOpenModal(true);
	};

	if (!jwt || !user) {
		return (
			<div className="write">
				<div className="writeMessage">
					<p>Redirecting to login...</p>
				</div>
			</div>
		);
	}

	if (!isWriter(user)) {
		return (
			<div className="write">
				<div className="writeAccessDenied">
					<h2>Access Denied</h2>
					<p>
						You do not have permission to write posts. Only writers
						can create posts.
					</p>
					<p>Register with a writer code to become a writer.</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="write">
				<div className="writeMessage">
					<p>Loading post...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="write">
			<form className="writeForm" onSubmit={handleSubmit}>
				{/* ── Image preview ── */}
				<div className="writeImageWrapper">
					<img
						className="writeImg"
						src={
							imageUrl ||
							(file != null ? URL.createObjectURL(file) : Image)
						}
						alt=""
					/>
				</div>

				{/* ── Title row: upload icon + title input ── */}
				<div className="writeTitleRow">
					<label
						className="writeIcon"
						htmlFor="fileInput"
						title="Change cover image"
					>
						<AddPhotoAlternateIcon fontSize="small" />
					</label>
					<input
						type="file"
						id="fileInput"
						accept="image/*"
						style={{ display: "none" }}
						onChange={(e) => {
							setFile(e.target.files ? e.target.files[0] : null);
							setError("");
						}}
					/>
					<input
						type="text"
						placeholder="Title"
						className="writeInput"
						autoFocus={true}
						onChange={(e) => setTitle(e.target.value)}
						value={title}
					/>
				</div>

				{/* ── Divider ── */}
				<div className="writeDivider" />

				{/* ── Body textarea ── */}
				<textarea
					placeholder="State..."
					className="writeText"
					onChange={(e) => setText(e.target.value)}
					value={text}
				/>

				{/* ── Collection select ── */}
				<div
					style={{
						display: "flex",
						gap: "8px",
						alignItems: "center",
						marginBottom: "var(--spacing-lg)",
					}}
				>
					<select
						className="writeSelect"
						value={collectionId}
						onChange={(e) =>
							setCollectionId(
								e.target.value ? parseInt(e.target.value) : "",
							)
						}
						style={{ flex: 1 }}
					>
						<option value="">
							— Select a Collection (Optional) —
						</option>
						{collections.map((collection) => (
							<option key={collection.id} value={collection.id}>
								{collection.name}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={handleOpenModal}
						className="writeCollectionAddButton"
						title="Create new collection"
					>
						<AddIcon fontSize="small" />
					</button>
				</div>

				{/* ── Error ── */}
				{error && (
					<div className="writeError">
						<strong>Error:</strong> {error}
					</div>
				)}

				{/* ── Submit ── */}
				<button
					className="writeSubmit"
					type="submit"
					disabled={isSubmitting}
				>
					<PublishIcon />
					<span>{isEditMode ? "Update" : "Publish"}</span>
				</button>
			</form>

			{/* Collection Modal */}
			<Modal
				open={openModal}
				title="Create New Collection"
				onClose={() => setOpenModal(false)}
				size="medium"
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "16px",
					}}
				>
					<FormInput
						name="name"
						label="Collection Name"
						value={formData.name}
						onChange={handleFormChange}
						required
						error={!!formErrors.name}
						helperText={formErrors.name}
					/>
					<FormInput
						name="description"
						label="Description"
						value={formData.description}
						onChange={handleFormChange}
						multiline
						rows={4}
						required
						error={!!formErrors.description}
						helperText={formErrors.description}
					/>
					<Stack
						direction="row"
						spacing={2}
						justifyContent="flex-end"
					>
						<button
							className="writeCollectionCancel"
							onClick={() => setOpenModal(false)}
							disabled={submitting}
							style={{
								cursor: submitting ? "not-allowed" : "pointer",
								opacity: submitting ? 0.6 : 1,
							}}
						>
							Cancel
						</button>
						<button
							className="writeCollectionCreate"
							onClick={handleFormSubmit}
							disabled={submitting}
							style={{
								cursor: submitting ? "not-allowed" : "pointer",
								opacity: submitting ? 0.6 : 1,
							}}
						>
							{submitting ? "Creating..." : "Create"}
						</button>
					</Stack>
				</div>
			</Modal>
		</div>
	);
};

export default Write;
