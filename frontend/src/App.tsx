import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import Single from './pages/Single';
import PostsTable from './pages/PostsTable';
import CollectionsTable from './pages/CollectionsTable';
import { useContext } from 'react';
import { LoginContext, isWriter } from './context/Context';
import { FC } from 'react';

const App: FC = () => {
  const { user } = useContext(LoginContext);
  console.log(user);

  // Protected route component for writer-only pages
  const WriterRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
    return isWriter(user) ? element : <Navigate to="/" replace />;
  };

  return (
    <div className="app">
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/write" element={<Write />} />
          <Route path="/log" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/posts-table" element={<WriterRoute element={<PostsTable />} />} />
          <Route path="/collections-table" element={<WriterRoute element={<CollectionsTable />} />} />
          <Route path="/*" element={<NotFound />} />
          <Route path="/post/:postId" element={<Single />} />
          <Route path="/post/edit/:postId" element={<Write />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
