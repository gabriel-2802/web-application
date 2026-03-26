import { FC, useState } from 'react';
import '../styles/navbar.css';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext, isWriter } from '../context/Context';
import ProfileImage from '../assets/profile.jpg';

const Navbar: FC = () => {
  const { user, dispatch } = useContext(LoginContext);
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
      setShowSearchInput(false);
    }
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
          <Link to="/" className="homeLink">
            <li className="topListItem">Home</li>
          </Link>
          {isWriter(user) && (
            <>
              <Link to="/write" className="homeLink">
                <li className="topListItem">Write</li>
              </Link>
              <Link to="/posts-table" className="homeLink">
                <li className="topListItem">My Posts</li>
              </Link>
              <Link to="/collections-table" className="homeLink">
                <li className="topListItem">My Collections</li>
              </Link>
            </>
          )}
          {!user ? (
            <Link to="/login" className="homeLink">
              <li className="topListItem">Login</li>
            </Link>
          ) : (
            <Link to="/" className="homeLink" onClick={handleLogout}>
              <li className="topListItem">Logout</li>
            </Link>
          )}
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
          {showSearchInput && (
            <form onSubmit={handleSearch} className="searchForm">
              <input
                type="text"
                placeholder="Search posts..."
                className="searchInput"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                autoFocus
              />
            </form>
          )}
          <button 
            className="topSearchButton"
            onClick={() => setShowSearchInput(!showSearchInput)}
          >
            <SearchIcon />
          </button>
        </i>
      </div>
    </div>
  );
};

export default Navbar;
