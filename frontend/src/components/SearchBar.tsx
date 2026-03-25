import { FC, useState } from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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
  placeholder = 'Search...',
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
      <TextField
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        size="small"
        sx={{ flex: 1, minWidth: 200 }}
        disabled={isLoading}
      />
      <Button
        onClick={handleSearch}
        variant="contained"
        startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
        disabled={isLoading || !query.trim()}
      >
        Search
      </Button>
      <Button
        onClick={handleClear}
        variant="outlined"
        startIcon={<ClearIcon />}
        disabled={isLoading || !query}
      >
        Clear
      </Button>
    </Box>
  );
};

export default SearchBar;
