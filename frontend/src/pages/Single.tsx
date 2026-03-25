import { FC } from 'react';
import '../styles/single.css';
import Sidebar from '../components/Sidebar';
import SinglePost from '../components/SinglePost';

const Single: FC = () => {
  return (
    <div className="single">
      <SinglePost />
      <Sidebar />
    </div>
  );
};

export default Single;
