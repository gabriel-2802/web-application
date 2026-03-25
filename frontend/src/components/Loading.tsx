import { FC } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import '../styles/loading.css';

const Loading: FC = () => {
  return (
    <div className="loading">
      <CircularProgress />
    </div>
  );
};

export default Loading;
