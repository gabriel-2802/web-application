import { FC, useContext, useState, useEffect } from 'react';
import '../styles/profile.css';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { LoginContext, isWriter } from '../context/Context';
import ProfileImage from '../assets/profile.jpg';
import axios from 'axios';
import { USER_ENDPOINTS } from '../constants/api';

const Profile: FC = () => {
  const { user, jwt, dispatch } = useContext(LoginContext);
  const isWriterRole = isWriter(user);

  // Writer-specific fields
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [location, setLocation] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userCollections, setUserCollections] = useState<any[]>([]);

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [completed, setCompleted] = useState(false);
  const [completedText, setCompletedText] = useState('');

  // Fetch writer profile on mount
  useEffect(() => {
    if (isWriterRole && jwt) {
      fetchWriterProfile();
    }
  }, [isWriterRole, jwt]);

  const fetchWriterProfile = async () => {
    try {
      const res = await axios.get(USER_ENDPOINTS.GET_CURRENT_WRITER, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setProfileImageUrl(res.data.profileImageUrl || '');
      setWebsiteUrl(res.data.websiteUrl || '');
      setLocation(res.data.location || '');
      setProfessionalTitle(res.data.professionalTitle || '');
      setBio(res.data.bio || '');
      setUserPosts(res.data.posts || []);
      setUserCollections(res.data.collections || []);
    } catch (error) {
      console.error('Failed to fetch writer profile:', error);
    }
  };

  const updateField = async (endpoint: string, fieldName: string, value: string) => {
    try {
      const payload = { [fieldName]: value };
      await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setCompleted(true);
      setCompletedText(`${fieldName} updated successfully!`);
      setError(false);
      setTimeout(() => setCompleted(false), 3000);
    } catch (error: any) {
      setError(true);
      setCompleted(false);
      setErrorText(error.response?.data || 'An error occurred');
      setTimeout(() => setError(false), 3000);
    }
  };

  const updateProfileImage = () => updateField(USER_ENDPOINTS.UPDATE_PROFILE_IMAGE, 'profileImageUrl', profileImageUrl);
  const updateWebsite = () => updateField(USER_ENDPOINTS.UPDATE_WEBSITE_URL, 'websiteUrl', websiteUrl);
  const updateLocationField = () => updateField(USER_ENDPOINTS.UPDATE_LOCATION, 'location', location);
  const updateTitle = () => updateField(USER_ENDPOINTS.UPDATE_PROFESSIONAL_TITLE, 'professionalTitle', professionalTitle);
  const updateBioField = () => updateField(USER_ENDPOINTS.UPDATE_BIO, 'bio', bio);

  const deleteClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await axios.delete(
        USER_ENDPOINTS.DELETE_ACCOUNT,
        { headers: { Authorization: `Bearer ${jwt}` } }
      );
      dispatch({ type: 'LOGOUT' });
      setCompleted(true);
      setError(false);
      setCompletedText('Account Deleted Successfully!');
    } catch (error: any) {
      setCompleted(false);
      setError(true);
      setErrorText(error.response?.data || 'An error occurred');
    }
  };

  if (isWriterRole) {
    return (
      <div className="profile">
        <div className="profileWrapper">
          <h2>Writer Profile</h2>
          
          {/* Profile Picture */}
          <div className="profileSection">
            <label>Profile Picture</label>
            <div className="profilePP">
              <img
                src={profileImageUrl || user?.profilePicture || ProfileImage}
                className="profileImg"
                alt="profile"
              />
              <label htmlFor="profileImageInput">
                <i className="profilePPIcon">
                  <AddAPhotoIcon />
                </i>
              </label>
            </div>
            <input
              type="text"
              id="profileImageInput"
              style={{ marginTop: '10px', width: '100%' }}
              placeholder="Profile Image URL"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
            />
            <button type="button" onClick={updateProfileImage} className="profileSaveButton">
              Update Profile Image
            </button>
          </div>

          {/* Username */}
          <div className="profileField">
            <label>Username: {user?.username}</label>
          </div>

          {/* Professional Title */}
          <div className="profileSection">
            <label>Professional Title</label>
            <input
              type="text"
              placeholder="e.g., Software Engineer & Author"
              value={professionalTitle}
              onChange={(e) => setProfessionalTitle(e.target.value)}
            />
            <button type="button" onClick={updateTitle} className="profileSaveButton">
              Update Title
            </button>
          </div>

          {/* Location */}
          <div className="profileSection">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g., New York, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button type="button" onClick={updateLocationField} className="profileSaveButton">
              Update Location
            </button>
          </div>

          {/* Website URL */}
          <div className="profileSection">
            <label>Website URL</label>
            <input
              type="url"
              placeholder="https://mywebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
            <button type="button" onClick={updateWebsite} className="profileSaveButton">
              Update Website
            </button>
          </div>

          {/* Bio */}
          <div className="profileSection">
            <label>Bio</label>
            <textarea
              placeholder="Tell about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
            <button type="button" onClick={updateBioField} className="profileSaveButton">
              Update Bio
            </button>
          </div>

          {/* Posts Count */}
          <div className="profileField">
            <label>Posts: {userPosts?.length || 0}</label>
          </div>

          {/* Collections Count */}
          <div className="profileField">
            <label>Collections: {userCollections?.length || 0}</label>
          </div>

          {/* Delete Account */}
          <button
            className="profileDeleteButton"
            onClick={deleteClick}
          >
            Delete Account
          </button>

          {error && <span className="profileError">{errorText}</span>}
          {completed && <span className="profileSuccess">{completedText}</span>}
        </div>
      </div>
    );
  }

  // Viewer role - read-only profile
  return (
    <div className="profile">
      <div className="profileWrapper">
        <h2>My Profile</h2>
        <div className="profilePP">
          <img
            src={user?.profilePicture || ProfileImage}
            className="profileImg"
            alt="profile"
          />
        </div>
        <label>Username: {user?.username}</label>
        <label>Email: {user?.email}</label>
        <button
          className="profileDeleteButton"
          onClick={deleteClick}
        >
          Delete Account
        </button>
        {error && <span className="profileError">{errorText}</span>}
        {completed && <span className="profileSuccess">{completedText}</span>}
      </div>
    </div>
  );
};

export default Profile;
