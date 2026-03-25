import { FC, useState, useContext, useEffect } from 'react';
import '../styles/write.css';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PublishIcon from '@mui/icons-material/Publish';
import Image from '../assets/pexels-sheep-1846422.jpg';
import axios from 'axios';
import { LoginContext, Post, isWriter } from '../context/Context';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { POST_ENDPOINTS, COLLECTION_ENDPOINTS } from '../constants/api';

interface Collection {
  id: number;
  name: string;
  description: string;
}

const Write: FC = () => {
  const { jwt, user } = useContext(LoginContext);
  const nav = useNavigate();
  const location = useLocation();
  const { postId } = useParams<{ postId?: string }>();
  const statePost = location.state as Post | null;
  const isEditMode = !!postId;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [collectionId, setCollectionId] = useState<number | ''>('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Check if user is authenticated and is a writer
  useEffect(() => {
    console.log('AUTH CHECK:', {
      hasJwt: !!jwt,
      hasUser: !!user,
      isWriter: user ? `ROLE_WRITER: ${user.roles?.some((r: any) => typeof r === 'string' ? r === 'ROLE_WRITER' : r.authority === 'ROLE_WRITER')}` : 'N/A',
      userRoles: user?.roles,
    });

    if (!jwt || !user) {
      console.log('Not authenticated, redirecting to login');
      nav('/login');
      return;
    }
    
    if (!isWriter(user)) {
      console.log('User is not a writer');
      setError('You do not have permission to write posts. Only writers can create posts.');
      setTimeout(() => nav('/'), 3000);
      return;
    }
    console.log('User authenticated and is a writer');
  }, [jwt, user, nav]);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(COLLECTION_ENDPOINTS.ALL);
        setCollections(res.data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };
    fetchCollections();
  }, []);

  // Fetch post data when in edit mode
  useEffect(() => {
    if (isEditMode && postId) {
      console.log('EDIT MODE: Fetching post', { postId, isEditMode });
      const fetchPost = async () => {
        try {
          const endpoint = POST_ENDPOINTS.FIND(postId);
          console.log('Fetching from endpoint:', endpoint);
          const res = await axios.get(endpoint);
          const post = res.data;
          console.log('Post fetched successfully:', post);
          setTitle(post.title || '');
          setText(post.content || '');
          setCollectionId(post.collectionId || '');
          setIsLoading(false);
        } catch (err: any) {
          console.error('Failed to fetch post:', err);
          console.error('Error details:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          setError('Failed to load post for editing.');
          setIsLoading(false);
          setTimeout(() => nav('/'), 3000);
        }
      };
      fetchPost();
    } else if (statePost) {
      // Fallback to state if available (for backward compatibility)
      console.log('Using state post:', statePost);
      setTitle(statePost.title || '');
      setText(statePost.content || '');
      setCollectionId(statePost.collectionId || '');
    } else {
      console.log('CREATE MODE: New post');
    }
  }, [isEditMode, postId, statePost, nav]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !text.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const newPost: any = {
      title: title,
      content: text,
    };

    if (collectionId) {
      newPost.collectionId = collectionId;
    }

    console.log('SUBMIT: Preparing to save post', {
      isEditMode,
      postId,
      hasJwt: !!jwt,
      newPost,
      user: user?.username,
      userRoles: user?.roles,
    });

    try {
      if (isEditMode && postId) {
        const endpoint = POST_ENDPOINTS.UPDATE(postId);
        console.log('EDIT: Sending PUT request', {
          endpoint,
          payload: newPost,
          headers: { Authorization: `Bearer ${jwt?.substring(0, 20)}...` },
        });
        
        const response = await axios.put(
          endpoint,
          newPost,
          { headers: { Authorization: `Bearer ${jwt}` } }
        );
        
        console.log('POST UPDATED:', response.data);
      } else {
        console.log('CREATE: Sending POST request', {
          endpoint: POST_ENDPOINTS.CREATE,
          payload: newPost,
        });
        
        const response = await axios.post(POST_ENDPOINTS.CREATE, newPost, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        console.log('POST CREATED:', response.data);
      }
      setIsSubmitting(false);
      nav('/');
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || 'Failed to save post. Please try again.';
      
      console.error('SUBMIT FAILED:', {
        message: errorMessage,
        status: err.response?.status,
        statusText: err.response?.statusText,
        fullError: err.response?.data,
        errorStack: err.stack,
      });
      
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  if (!jwt || !user) {
    return (
      <div className="write">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isWriter(user)) {
    return (
      <div className="write">
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to write posts. Only writers can create posts.</p>
          <p>Register with a writer code to become a writer.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="write">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="write">
      <img
        className="writeImg"
        src={file != null ? URL.createObjectURL(file) : Image}
        alt=""
      />
      <form className="writeForm" onSubmit={handleSubmit}>
        <div className="writeFormGroup">
          <label className="fileInput" htmlFor="fileInput">
            <AddPhotoAlternateIcon />
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />

          <input
            type="text"
            placeholder="Title"
            className="writeInput"
            autoFocus={true}
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          />
        </div>
        <div className="writeFormGroup">
          <textarea
            placeholder="State..."
            className="writeInput writeText"
            onChange={(e) => setText(e.target.value)}
            value={text}
          />
        </div>
        <div className="writeFormGroup">
          <select
            className="writeInput"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">-- Select a Collection (Optional) --</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <div style={{ 
            color: 'red', 
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#ffe6e6',
            borderRadius: '4px',
            border: '1px solid red'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {isEditMode && (
          <div style={{
            color: '#666',
            marginBottom: '10px',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <strong>Debug Info:</strong> Editing post ID: {postId}
          </div>
        )}
        <button className="writeSubmit" type="submit" disabled={isSubmitting}>
          <PublishIcon />
        </button>
      </form>
    </div>
  );
};

export default Write;
