import { FC } from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLInputElement;
      const page = parseInt(target.value, 10);
      if (page > 0 && page <= totalPages) {
        onPageChange(page);
        target.value = '';
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        mt: 4,
        mb: 2,
        flexWrap: 'wrap',
      }}
    >
      <Button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        startIcon={<ChevronLeftIcon />}
        variant="outlined"
      >
        Previous
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </Typography>
      </Box>

      <Button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        endIcon={<ChevronRightIcon />}
        variant="outlined"
      >
        Next
      </Button>

      <TextField
        type="number"
        placeholder="Go to page"
        onKeyPress={handleJumpToPage}
        inputProps={{ min: 1, max: totalPages }}
        size="small"
        sx={{ width: 120 }}
      />
    </Box>
  );
};

export default Pagination;
