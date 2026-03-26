import { FC } from 'react';
import { TextField } from '@mui/material';

interface FormInputProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

const FormInput: FC<FormInputProps> = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  rows = 1,
  required = false,
  error = false,
  helperText,
  placeholder,
}) => {
  return (
    <TextField
      fullWidth
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      multiline={multiline}
      rows={rows}
      required={required}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      margin="normal"
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#e0e0e0',
          '& fieldset': {
            borderColor: 'rgba(139, 123, 163, 0.3)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(139, 123, 163, 0.5)',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgb(139, 123, 163)',
            borderWidth: '2px',
          },
        },
        '& .MuiOutlinedInput-input': {
          color: '#e0e0e0',
          '&::placeholder': {
            color: 'rgba(224, 224, 224, 0.5)',
            opacity: 1,
          },
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: 'rgba(224, 224, 224, 0.5)',
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(224, 224, 224, 0.7)',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          fontFamily: 'var(--font-serif-heading, serif)',
          '&.Mui-focused': {
            color: 'rgb(139, 123, 163)',
          },
        },
        '& .MuiFormHelperText-root': {
          color: '#d4a574',
          fontSize: '0.75rem',
        },
        '& .MuiFormHelperText-root.Mui-error': {
          color: '#d4a574',
        },
      }}
    />
  );
};

export default FormInput;
