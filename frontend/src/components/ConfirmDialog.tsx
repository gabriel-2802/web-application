import { FC } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Button,
} from "@mui/material";

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
	isDangerous?: boolean;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
	open,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = "Confirm",
	cancelText = "Cancel",
	isLoading = false,
	isDangerous = false,
}) => {
	return (
		<Dialog
			open={open}
			onClose={onCancel}
			PaperProps={{
				sx: {
					backgroundColor: "var(--bg-card, #1a1a2e)",
					backgroundImage: "none",
					border: "1px solid var(--border-color, rgba(139, 123, 163, 0.3))",
					borderRadius: "8px",
				},
			}}
		>
			<DialogTitle
				sx={{
					fontWeight: 600,
					color: "var(--text-primary, #e0e0e0)",
					fontSize: "1.25rem",
					letterSpacing: "0.8px",
					fontFamily: "var(--font-serif-heading, serif)",
				}}
			>
				{title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText
					sx={{ color: "var(--text-secondary, #b0b0b0)" }}
				>
					{message}
				</DialogContentText>
			</DialogContent>
			<DialogActions sx={{ p: 2, gap: 1 }}>
				<Button
					onClick={onCancel}
					disabled={isLoading}
					variant="outlined"
					sx={{
						borderColor:
							"var(--border-light, rgba(139, 123, 163, 0.5))",
						color: "var(--text-secondary, #b0b0b0)",
						textTransform: "uppercase",
						letterSpacing: "0.6px",
						fontWeight: 600,
						fontSize: "0.85rem",
						"&:hover": {
							backgroundColor: "rgba(139, 123, 163, 0.08)",
							borderColor:
								"var(--accent-primary, rgb(139, 123, 163))",
							color: "var(--accent-primary, rgb(139, 123, 163))",
						},
					}}
				>
					{cancelText}
				</Button>
				<Button
					onClick={onConfirm}
					disabled={isLoading}
					variant="contained"
					sx={{
						backgroundColor: isDangerous
							? "#d4a574"
							: "var(--accent-primary, rgb(139, 123, 163))",
						color: isDangerous
							? "#1a1a2e"
							: "var(--text-primary, #e0e0e0)",
						textTransform: "uppercase",
						letterSpacing: "0.6px",
						fontWeight: 600,
						fontSize: "0.85rem",
						"&:hover": {
							backgroundColor: isDangerous
								? "#dab896"
								: "var(--accent-light, rgb(169, 143, 193))",
							boxShadow: "0 4px 12px rgba(139, 123, 163, 0.3)",
						},
					}}
				>
					{isLoading ? "Processing..." : confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
