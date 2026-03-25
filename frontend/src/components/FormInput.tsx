import { FC } from 'react';
import { TextField } from '@mui/material';

interface FormInputProps {
  name: string;
  label: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    />
  );
};

export default FormInput;
