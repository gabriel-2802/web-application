import { FC, useEffect, useState, useContext } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Alert,
	CircularProgress,
	Box,
	Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FEEDBACK_ENDPOINTS } from "../constants/api";
import { LoginContext, isWriter } from "../context/Context";
import { useNavigate } from "react-router-dom";
import "../styles/feedback-table.css";

interface FeedbackResponse {
	id: number;
	rating: string;
	wouldRecommend: boolean;
	feedbackText: string;
	submittedAt: string;
}

const FeedbackTable: FC = () => {
	const { user } = useContext(LoginContext);
	const navigate = useNavigate();
	const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [deleteId, setDeleteId] = useState<number | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		if (!isWriter(user)) {
			navigate("/");
			return;
		}

		fetchFeedbacks();
	}, [user, navigate]);

	const fetchFeedbacks = async () => {
		setLoading(true);
		setError("");

		try {
			const jwt = JSON.parse(localStorage.getItem("jwt") || "null");

			const response = await fetch(FEEDBACK_ENDPOINTS.GET_ALL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwt}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch feedback");
			}

			const data = await response.json();
			setFeedbacks(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while fetching feedback"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteClick = (id: number) => {
		setDeleteId(id);
	};

	const handleDeleteConfirm = async () => {
		if (deleteId === null) return;

		setDeleteLoading(true);

		try {
			const jwt = JSON.parse(localStorage.getItem("jwt") || "null");

			const response = await fetch(
				FEEDBACK_ENDPOINTS.DELETE(deleteId.toString()),
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${jwt}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to delete feedback");
			}

			setFeedbacks(feedbacks.filter((f) => f.id !== deleteId));
			setDeleteId(null);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while deleting feedback"
			);
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteId(null);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<Box className="feedback-table-container loading-state">
				<CircularProgress sx={{ color: "var(--accent-primary)" }} />
			</Box>
		);
	}

	return (
		<Box className="feedback-table-container">
			<Box className="feedback-table-header">
				<Typography
					sx={{
						fontSize: "2rem",
						fontWeight: 700,
						color: "var(--accent-primary)",
						fontFamily: "var(--font-serif-heading)",
					}}
				>
					Feedback Management
				</Typography>
				<Typography
					sx={{
						color: "var(--text-muted)",
						marginTop: "0.5rem",
					}}
				>
					Total Feedback: {feedbacks.length}
				</Typography>
			</Box>

			{error && (
				<Alert
					severity="error"
					sx={{ mb: 3 }}
					onClose={() => setError("")}
				>
					{error}
				</Alert>
			)}

			{feedbacks.length === 0 ? (
				<Box
					sx={{
						textAlign: "center",
						py: 6,
						bgcolor: "var(--bg-card, #1a1a2e)",
						borderRadius: 2,
						border: "1px solid var(--border-light)",
					}}
				>
					<Typography
						sx={{
							color: "var(--text-muted)",
							fontSize: "1.1rem",
						}}
					>
						No feedback received yet.
					</Typography>
				</Box>
			) : (
				<TableContainer
					component={Paper}
					className="feedback-table-wrapper"
				>
					<Table>
						<TableHead>
							<TableRow className="table-header-row">
								<TableCell>Rating</TableCell>
								<TableCell align="center">
									Would Recommend
								</TableCell>
								<TableCell>Feedback</TableCell>
								<TableCell>Submitted At</TableCell>
								<TableCell align="center">Action</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{feedbacks.map((feedback) => (
								<TableRow
									key={feedback.id}
									className="table-body-row"
								>
									<TableCell className="rating-cell">
										<Box className="rating-badge">
											{feedback.rating}
										</Box>
									</TableCell>
									<TableCell align="center">
										<Box className="recommend-cell">
											{feedback.wouldRecommend ? (
												<span className="checkmark">
													✓
												</span>
											) : (
												<span className="cross">
													✗
												</span>
											)}
										</Box>
									</TableCell>
									<TableCell className="feedback-cell">
										<Typography
											sx={{
												fontSize: "0.95rem",
												color: "var(--text-primary)",
												wordBreak: "break-word",
											}}
										>
											{feedback.feedbackText}
										</Typography>
									</TableCell>
									<TableCell className="date-cell">
										{formatDate(feedback.submittedAt)}
									</TableCell>
									<TableCell align="center">
										<Button
											variant="outlined"
											size="small"
											color="error"
											startIcon={<DeleteIcon />}
											onClick={() =>
												handleDeleteClick(feedback.id)
											}
											sx={{
												borderColor:
													"rgba(244, 67, 54, 0.5)",
												color: "#f44336",
												"&:hover": {
													borderColor: "#f44336",
													backgroundColor:
														"rgba(244, 67, 54, 0.1)",
												},
											}}
										>
											Delete
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteId !== null}
				onClose={handleDeleteCancel}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
				PaperProps={{
					sx: {
						bgcolor: "var(--bg-card, #1a1a2e)",
						color: "var(--text-primary)",
						border: "1px solid var(--border-light)",
					},
				}}
			>
				<DialogTitle
					id="alert-dialog-title"
					sx={{ color: "var(--accent-primary)" }}
				>
					Delete Feedback
				</DialogTitle>
				<DialogContent>
					<DialogContentText
						id="alert-dialog-description"
						sx={{ color: "var(--text-muted)" }}
					>
						Are you sure you want to delete this feedback? This
						action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ gap: 1 }}>
					<Button
						onClick={handleDeleteCancel}
						disabled={deleteLoading}
						sx={{ color: "var(--accent-primary)" }}
					>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						disabled={deleteLoading}
						autoFocus
						variant="contained"
						color="error"
					>
						{deleteLoading ? "Deleting..." : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default FeedbackTable;
