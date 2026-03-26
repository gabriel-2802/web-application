import { FC, ReactNode } from "react";
import { Modal as MuiModal, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
	open: boolean;
	title: string;
	children: ReactNode;
	onClose: () => void;
	size?: "small" | "medium" | "large";
}

const Modal: FC<ModalProps> = ({
	open,
	title,
	children,
	onClose,
	size = "medium",
}) => {
	const getWidth = () => {
		switch (size) {
			case "small":
				return 400;
			case "large":
				return 800;
			case "medium":
			default:
				return 600;
		}
	};

	return (
		<MuiModal open={open} onClose={onClose}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: getWidth(),
					maxHeight: "90vh",
					overflowY: "auto",
					bgcolor: "var(--bg-card, #1a1a2e)",
					borderRadius: 2,
					boxShadow: 24,
					p: 4,
					border: "1px solid var(--border-color, rgba(139, 123, 163, 0.3))",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Typography
						variant="h6"
						component="h2"
						sx={{
							fontWeight: 600,
							color: "var(--text-primary, #e0e0e0)",
							fontSize: "1.5rem",
							letterSpacing: "0.8px",
							fontFamily: "var(--font-serif-heading, serif)",
						}}
					>
						{title}
					</Typography>
					<IconButton
						onClick={onClose}
						size="small"
						sx={{ color: "var(--text-primary, #e0e0e0)" }}
					>
						<CloseIcon />
					</IconButton>
				</Box>
				{children}
			</Box>
		</MuiModal>
	);
};

export default Modal;
