import { FC, useState, useEffect, useContext, useCallback } from "react";
import { CircularProgress, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { LoginContext } from "../context/Context";
import { COLLECTION_ENDPOINTS } from "../constants/api";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import FormInput from "../components/FormInput";
import "../styles/collections-table.css";

interface Collection {
	id?: number;
	name?: string;
	description?: string;
	userId?: number;
	createdAt?: Date | string;
	updatedAt?: Date | string;
	postCount?: number;
}

interface FormData {
	name: string;
	description: string;
}

const CollectionsTable: FC = () => {
	const { jwt } = useContext(LoginContext);
	const [collections, setCollections] = useState<Collection[]>([]);
	const [filteredCollections, setFilteredCollections] = useState<
		Collection[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [openModal, setOpenModal] = useState(false);
	const [modalMode, setModalMode] = useState<"add" | "edit">("add");
	const [selectedCollection, setSelectedCollection] =
		useState<Collection | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		description: "",
	});
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
	const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const ROWS_PER_PAGE = 10;

	const fetchCollections = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const res = await axios.get(COLLECTION_ENDPOINTS.ALL);
			setCollections(res.data);
			setFilteredCollections(res.data);
			setCurrentPage(1);
		} catch (err) {
			console.error("Failed to fetch collections:", err);
			setError("Failed to load collections. Please try again.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCollections();
	}, [fetchCollections]);

	const handleSearch = (query: string) => {
		const lowercaseQuery = query.toLowerCase();
		const filtered = collections.filter(
			(collection) =>
				collection.name?.toLowerCase().includes(lowercaseQuery) ||
				collection.description?.toLowerCase().includes(lowercaseQuery),
		);
		setFilteredCollections(filtered);
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setFilteredCollections(collections);
		setCurrentPage(1);
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

	const handleAddClick = () => {
		setModalMode("add");
		setFormData({ name: "", description: "" });
		setFormErrors({});
		setSelectedCollection(null);
		setOpenModal(true);
	};

	const handleEditClick = (collection: Collection) => {
		setModalMode("edit");
		setSelectedCollection(collection);
		setFormData({
			name: collection.name || "",
			description: collection.description || "",
		});
		setFormErrors({});
		setOpenModal(true);
	};

	const handleDeleteClick = (collectionId: number | undefined) => {
		if (collectionId) {
			setDeleteTargetId(collectionId);
			setDeleteConfirmOpen(true);
		}
	};

	const handleDeleteConfirm = async () => {
		if (deleteTargetId === null) return;

		try {
			setDeleting(true);
			await axios.delete(
				COLLECTION_ENDPOINTS.DELETE(deleteTargetId.toString()),
				{
					headers: { Authorization: `Bearer ${jwt}` },
				},
			);
			setCollections(collections.filter((c) => c.id !== deleteTargetId));
			setFilteredCollections(
				filteredCollections.filter((c) => c.id !== deleteTargetId),
			);
			setDeleteConfirmOpen(false);
			setDeleteTargetId(null);
		} catch (err) {
			console.error("Failed to delete collection:", err);
			setError("Failed to delete collection. Please try again.");
		} finally {
			setDeleting(false);
		}
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
			if (modalMode === "add") {
				const res = await axios.post(
					COLLECTION_ENDPOINTS.CREATE,
					formData,
					{
						headers: { Authorization: `Bearer ${jwt}` },
					},
				);
				setCollections([...collections, res.data]);
				setFilteredCollections([...filteredCollections, res.data]);
			} else if (modalMode === "edit" && selectedCollection?.id) {
				const res = await axios.put(
					COLLECTION_ENDPOINTS.UPDATE(
						selectedCollection.id.toString(),
					),
					formData,
					{
						headers: { Authorization: `Bearer ${jwt}` },
					},
				);
				const updatedCollections = collections.map((c) =>
					c.id === selectedCollection.id ? res.data : c,
				);
				setCollections(updatedCollections);
				setFilteredCollections(
					filteredCollections.map((c) =>
						c.id === selectedCollection.id ? res.data : c,
					),
				);
			}
			setOpenModal(false);
			setFormData({ name: "", description: "" });
			setFormErrors({});
		} catch (err) {
			console.error("Failed to save collection:", err);
			setError(
				modalMode === "add"
					? "Failed to create collection."
					: "Failed to update collection.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const paginatedData = filteredCollections.slice(
		(currentPage - 1) * ROWS_PER_PAGE,
		currentPage * ROWS_PER_PAGE,
	);
	const totalPages = Math.ceil(filteredCollections.length / ROWS_PER_PAGE);

	const formatDate = (date: string | Date | undefined) => {
		if (!date) return "-";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const truncateText = (text: string | undefined, maxLength: number) => {
		if (!text) return "-";
		return text.length > maxLength
			? text.substring(0, maxLength) + "..."
			: text;
	};

	if (loading) {
		return (
			<div
				className="collections-table-container"
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "400px",
				}}
			>
				<CircularProgress />
			</div>
		);
	}

	return (
		<div className="collections-table-container">
			<div className="collections-table-card">
				<div className="collections-table-header">
					<h2 className="collections-table-title">My Collections</h2>
					<button
						className="collections-add-button"
						onClick={handleAddClick}
					>
						<AddIcon
							style={{ marginRight: "8px", fontSize: "18px" }}
						/>
						Add Collection
					</button>
				</div>

				{error && (
					<div
						style={{
							color: "#d4a574",
							margin: "16px",
							padding: "12px",
							backgroundColor: "rgba(212, 165, 116, 0.1)",
							borderRadius: "4px",
						}}
					>
						{error}
					</div>
				)}

				<div style={{ padding: "16px" }}>
					<SearchBar
						onSearch={handleSearch}
						onClear={handleClearSearch}
						placeholder="Search collections by name or description..."
					/>
				</div>

				{filteredCollections.length === 0 ? (
					<div className="collections-empty-state">
						{collections.length === 0
							? "No collections yet."
							: "No collections match your search."}
					</div>
				) : (
					<>
						<table className="collections-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Description</th>
									<th>Created</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginatedData.map((collection) => (
									<tr key={collection.id}>
										<td>
											{truncateText(collection.name, 40)}
										</td>
										<td>
											{truncateText(
												collection.description,
												50,
											)}
										</td>
										<td>
											{formatDate(collection.createdAt)}
										</td>
										<td>
											<div className="collections-table-actions">
												<button
													className="collections-edit-button"
													onClick={() =>
														handleEditClick(
															collection,
														)
													}
												>
													<EditIcon
														style={{
															marginRight: "4px",
															fontSize: "14px",
														}}
													/>
													Edit
												</button>
												<button
													className="collections-delete-button"
													onClick={() =>
														handleDeleteClick(
															collection.id,
														)
													}
												>
													<DeleteIcon
														style={{
															marginRight: "4px",
															fontSize: "14px",
														}}
													/>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						{totalPages > 1 && (
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
							/>
						)}
					</>
				)}
			</div>

			{/* Add/Edit Modal */}
			<Modal
				open={openModal}
				title={
					modalMode === "add"
						? "Add New Collection"
						: "Edit Collection"
				}
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
							className="collections-edit-button"
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
							className="collections-add-button"
							onClick={handleFormSubmit}
							disabled={submitting}
							style={{
								cursor: submitting ? "not-allowed" : "pointer",
								opacity: submitting ? 0.6 : 1,
							}}
						>
							{submitting
								? "Saving..."
								: modalMode === "add"
									? "Create"
									: "Update"}
						</button>
					</Stack>
				</div>
			</Modal>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={deleteConfirmOpen}
				title="Delete Collection"
				message="Are you sure you want to delete this collection? This action cannot be undone."
				onConfirm={handleDeleteConfirm}
				onCancel={() => {
					setDeleteConfirmOpen(false);
					setDeleteTargetId(null);
				}}
				confirmText="Delete"
				cancelText="Cancel"
				isLoading={deleting}
				isDangerous={true}
			/>
		</div>
	);
};

export default CollectionsTable;
