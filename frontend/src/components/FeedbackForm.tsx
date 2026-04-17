import { FC, useState } from "react";
import {
	Modal as MuiModal,
	Box,
	Button,
	Typography,
	IconButton,
	FormControlLabel,
	Checkbox,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	RadioGroup,
	Radio,
	FormLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FEEDBACK_ENDPOINTS } from "../constants/api";

interface FeedbackFormProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

const FeedbackForm: FC<FeedbackFormProps> = ({ open, onClose, onSuccess }) => {
	const [rating, setRating] = useState("");
	const [feedbackType, setFeedbackType] = useState("general");
	const [wouldRecommend, setWouldRecommend] = useState(false);
	const [feedbackText, setFeedbackText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess(false);

		if (!rating) {
			setError("Please select a rating");
			return;
		}
		if (!feedbackText.trim()) {
			setError("Please enter your feedback");
			return;
		}

		setLoading(true);

		try {
			const jwt = JSON.parse(localStorage.getItem("jwt") || "null");

			const response = await fetch(FEEDBACK_ENDPOINTS.SUBMIT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${jwt}`,
				},
				body: JSON.stringify({
					rating,
					feedbackType,
					wouldRecommend,
					feedbackText,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to submit feedback");
			}

			setSuccess(true);

			setTimeout(() => {
				onClose();
				setRating("");
				setFeedbackType("general");
				setWouldRecommend(false);
				setFeedbackText("");
				setSuccess(false);
				if (onSuccess) onSuccess();
			}, 1500);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "An error occurred while submitting feedback"
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		if (!loading) {
			setRating("");
			setFeedbackType("general");
			setWouldRecommend(false);
			setFeedbackText("");
			setError("");
			setSuccess(false);
			onClose();
		}
	};

	const sharedSx = {
		color: "var(--accent-primary)",
		"&.Mui-checked": { color: "var(--accent-primary)" },
	};

	return (
		<MuiModal open={open} onClose={handleClose}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 500,
					maxHeight: "90vh",
					overflowY: "auto",
					bgcolor: "var(--bg-card, #1a1a2e)",
					borderRadius: 2,
					boxShadow: 24,
					p: 4,
					border: "1px solid var(--border-color, rgba(139, 123, 163, 0.3))",
				}}
			>
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
					<Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent-primary)" }}>
						Share Your Feedback
					</Typography>
					<IconButton onClick={handleClose} disabled={loading} size="small" sx={{ color: "var(--accent-primary)" }}>
						<CloseIcon />
					</IconButton>
				</Box>

				{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
				{success && (
					<Alert severity="success" sx={{ mb: 2 }}>
						Thank you! Your feedback has been submitted successfully.
					</Alert>
				)}

				<form onSubmit={handleSubmit} style={{ display: success ? "none" : "block" }}>


					<FormControl fullWidth sx={{ mb: 3 }}>
						<InputLabel
							sx={{
								color: "var(--text-muted)",
								"&.Mui-focused": { color: "var(--accent-primary)" },
							}}
						>
							Rating *
						</InputLabel>
						<Select
							value={rating}
							onChange={(e) => setRating(e.target.value)}
							label="Rating *"
							disabled={loading || success}
							sx={{
								color: "var(--text-primary)",
								"& .MuiOutlinedInput-notchedOutline": {
									borderColor: "var(--border-color, rgba(139, 123, 163, 0.3))",
								},
								"&:hover .MuiOutlinedInput-notchedOutline": {
									borderColor: "var(--accent-primary)",
								},
								"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
									borderColor: "var(--accent-primary)",
								},
								"& .MuiSvgIcon-root": { color: "var(--accent-primary)" },
							}}
							MenuProps={{
								PaperProps: {
									sx: {
										backgroundColor: "var(--bg-card, #1a1a2e)",
										border: "1px solid var(--border-light)",
										"& .MuiMenuItem-root": {
											color: "var(--text-primary)",
											"&:hover": { backgroundColor: "rgba(139, 123, 163, 0.2)" },
											"&.Mui-selected": {
												backgroundColor: "rgba(139, 123, 163, 0.3)",
												"&:hover": { backgroundColor: "rgba(139, 123, 163, 0.4)" },
											},
										},
									},
								},
							}}
						>
							<MenuItem value="EXCELLENT">Excellent</MenuItem>
							<MenuItem value="GOOD">Good</MenuItem>
							<MenuItem value="AVERAGE">Average</MenuItem>
							<MenuItem value="POOR">Poor</MenuItem>
						</Select>
					</FormControl>

					<FormControl sx={{ mb: 3 }}>
						<FormLabel sx={{ color: "var(--text-muted)", "&.Mui-focused": { color: "var(--accent-primary)" } }}>
							Feedback Type
						</FormLabel>
						<RadioGroup
							row
							value={feedbackType}
							onChange={(e) => setFeedbackType(e.target.value)}
						>
							<FormControlLabel
								value="general"
								control={<Radio disabled={loading || success} sx={sharedSx} />}
								label={<Typography sx={{ color: "var(--text-primary)" }}>General</Typography>}
							/>
							<FormControlLabel
								value="bug"
								control={<Radio disabled={loading || success} sx={sharedSx} />}
								label={<Typography sx={{ color: "var(--text-primary)" }}>Bug Report</Typography>}
							/>
							<FormControlLabel
								value="suggestion"
								control={<Radio disabled={loading || success} sx={sharedSx} />}
								label={<Typography sx={{ color: "var(--text-primary)" }}>Suggestion</Typography>}
							/>
						</RadioGroup>
					</FormControl>

					<Box sx={{ mb: 3 }}>
						<FormControlLabel
							control={
								<Checkbox
									checked={wouldRecommend}
									onChange={(e) => setWouldRecommend(e.target.checked)}
									disabled={loading || success}
									sx={sharedSx}
								/>
							}
							label={
								<Typography sx={{ color: "var(--text-primary)" }}>
									I would recommend this blog to others
								</Typography>
							}
						/>
					</Box>

					<Box sx={{ mb: 3 }}>
						<Typography sx={{ color: "var(--text-muted)", fontSize: "0.875rem", mb: 1 }}>
							Your Feedback *
						</Typography>
						<textarea
							value={feedbackText}
							onChange={(e) => setFeedbackText(e.target.value)}
							placeholder="Tell us what you think about this blog..."
							disabled={loading || success}
							rows={6}
							style={{
								width: "100%",
								borderRadius: "4px",
								border: "1px solid var(--border-color, rgba(139, 123, 163, 0.3))",
								backgroundColor: "var(--bg-dark, #0f0f1e)",
								color: "var(--text-primary)",
								padding: "12px",
								fontFamily: "inherit",
								fontSize: "1rem",
								boxSizing: "border-box",
								transition: "border-color 0.3s ease",
								opacity: loading || success ? 0.6 : 1,
								cursor: loading || success ? "not-allowed" : "text",
								resize: "vertical",
							}}
							onFocus={(e) => {
								if (!loading && !success)
									e.currentTarget.style.borderColor = "var(--accent-primary)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor =
									"var(--border-color, rgba(139, 123, 163, 0.3))";
							}}
						/>
					</Box>

					<Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
						<Button
							onClick={handleClose}
							disabled={loading || success}
							variant="outlined"
							sx={{
								color: "var(--accent-primary)",
								borderColor: "var(--border-color, rgba(139, 123, 163, 0.3))",
								"&:hover": { backgroundColor: "rgba(139, 123, 163, 0.1)" },
							}}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading || success}
							variant="contained"
							sx={{
								backgroundColor: "var(--accent-primary)",
								color: "#fff",
								"&:hover": { backgroundColor: "var(--accent-light, #8b7ba3)" },
								"&:disabled": { opacity: 0.6 },
							}}
						>
							{loading ? "Submitting..." : "Submit Feedback"}
						</Button>
					</Box>
				</form>
			</Box>
		</MuiModal>
	);
};

export default FeedbackForm;