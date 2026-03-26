import { FC, useState } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface SearchBarProps {
	onSearch: (query: string) => void;
	onClear: () => void;
	isLoading?: boolean;
	placeholder?: string;
}

const SearchBar: FC<SearchBarProps> = ({
	onSearch,
	onClear,
	isLoading = false,
	placeholder = "Search...",
}) => {
	const [query, setQuery] = useState("");

	const handleSearch = () => {
		if (query.trim()) {
			onSearch(query);
		}
	};

	const handleClear = () => {
		setQuery("");
		onClear();
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<Box
			sx={{
				display: "flex",
				gap: 1,
				mb: 2,
				alignItems: "center",
				flexWrap: "nowrap",
			}}
		>
			<TextField
				placeholder={placeholder}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyPress={handleKeyPress}
				size="small"
				sx={{
					flex: 1,
					minWidth: 200,
					"& .MuiOutlinedInput-root": {
						backgroundColor: "rgba(255, 255, 255, 0.08)",
						color: "#e0e0e0",
						"& fieldset": {
							borderColor: "rgba(139, 123, 163, 0.3)",
						},
						"&:hover fieldset": {
							borderColor: "rgba(139, 123, 163, 0.5)",
						},
						"&.Mui-focused fieldset": {
							borderColor: "rgb(139, 123, 163)",
						},
					},
					"& .MuiOutlinedInput-input": {
						color: "#e0e0e0",
						"&::placeholder": {
							color: "rgba(224, 224, 224, 0.5)",
							opacity: 1,
						},
					},
				}}
				disabled={isLoading}
			/>
			<Button
				onClick={handleSearch}
				variant="outlined"
				startIcon={
					isLoading ? <CircularProgress size={20} /> : <SearchIcon />
				}
				disabled={isLoading || !query.trim()}
				sx={{
					borderColor: "rgb(139, 123, 163)",
					color: "#f5f1e8",
					flexShrink: 0,
					textTransform: "uppercase",
					fontSize: "0.85rem",
					fontWeight: 600,
					letterSpacing: "0.5px",
					"&:hover": {
						backgroundColor: "rgba(139, 123, 163, 0.12)",
						borderColor: "#a89fb8",
						color: "#a89fb8",
					},
				}}
			>
				Search
			</Button>
			<Button
				onClick={handleClear}
				variant="outlined"
				startIcon={<ClearIcon />}
				disabled={isLoading || !query}
				sx={{
					borderColor: "rgba(139, 123, 163, 0.5)",
					color: "#f5f1e8",
					flexShrink: 0,
					textTransform: "uppercase",
					fontSize: "0.85rem",
					fontWeight: 600,
					letterSpacing: "0.5px",
					"&:hover": {
						backgroundColor: "rgba(139, 123, 163, 0.12)",
						borderColor: "rgb(139, 123, 163)",
						color: "#a89fb8",
					},
				}}
			>
				Clear
			</Button>
		</Box>
	);
};

export default SearchBar;
