import { FC } from 'react';
import '../styles/navbar.css';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext, isWriter } from '../context/Context';
import ProfileImage from '../assets/profile.jpg';

const Navbar: FC = () => {
  const { user, dispatch } = useContext(LoginContext);
  
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div className="top">
      <div className="topLeft">
        <a href="https://github.com/gabriel-2802">
          <GitHubIcon />
        </a>
        <span className="logo">Gabriel's Blog</span>
      </div>
      <div className="topCenter">
        <ul className="topList">
          {isWriter(user) && (
            <Link to="/write" className="homeLink">
              <li className="topListItem">Write</li>
            </Link>
          )}
          <Link to="/" className="homeLink">
            <li className="topListItem">Home</li>
          </Link>
          <Link to="/login" className="homeLink">
            <li className="topListItem">{!user ? 'Login' : ''}</li>
          </Link>
          <Link to="/" className="homeLink" onClick={handleLogout}>
            <li className="topListItem">{user && 'Logout'}</li>
          </Link>
        </ul>
      </div>
      <div className="topRight">
        <Link to="profile" className="link">
          <img
            className="topImg"
            src={user?.profilePicture != null ? user.profilePicture : ProfileImage}
            alt="profile"
          />
        </Link>
        <i className="topSearchIcon">
          <button className="topSearchButton">
            <SearchIcon />
          </button>
        </i>
      </div>
    </div>
  );
};

export default Navbar;
