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

  useEffect(() => {
    if (!jwt || !user) {
      nav('/login');
      return;
    }
    if (!isWriter(user)) {
      setError('You do not have permission to write posts. Only writers can create posts.');
      setTimeout(() => nav('/'), 3000);
      return;
    }
  }, [jwt, user, nav]);

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

  useEffect(() => {
    if (isEditMode && postId) {
      const fetchPost = async () => {
        try {
          const res = await axios.get(POST_ENDPOINTS.FIND(postId));
          const post = res.data;
          setTitle(post.title || '');
          setText(post.content || '');
          setCollectionId(post.collectionId || '');
          setIsLoading(false);
        } catch (err: any) {
          setError('Failed to load post for editing.');
          setIsLoading(false);
          setTimeout(() => nav('/'), 3000);
        }
      };
      fetchPost();
    } else if (statePost) {
      setTitle(statePost.title || '');
      setText(statePost.content || '');
      setCollectionId(statePost.collectionId || '');
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

    const newPost: any = { title, content: text };
    if (collectionId) newPost.collectionId = collectionId;

    try {
      if (isEditMode && postId) {
        await axios.put(POST_ENDPOINTS.UPDATE(postId), newPost, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      } else {
        await axios.post(POST_ENDPOINTS.CREATE, newPost, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      }
      setIsSubmitting(false);
      nav('/');
    } catch (err: any) {
      setIsSubmitting(false);
      const errorMessage =
        err.response?.data?.message || err.response?.data || err.message || 'Failed to save post.';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    }
  };

  if (!jwt || !user) {
    return (
      <div className="write">
        <div className="writeMessage">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isWriter(user)) {
    return (
      <div className="write">
        <div className="writeAccessDenied">
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
        <div className="writeMessage">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="write">
      <form className="writeForm" onSubmit={handleSubmit}>

        {/* ── Image preview ── */}
        <div className="writeImageWrapper">
          <img
            className="writeImg"
            src={file != null ? URL.createObjectURL(file) : Image}
            alt=""
          />
        </div>

        {/* ── Title row: upload icon + title input ── */}
        <div className="writeTitleRow">
          <label className="writeIcon" htmlFor="fileInput" title="Change cover image">
            <AddPhotoAlternateIcon fontSize="small" />
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

        {/* ── Divider ── */}
        <div className="writeDivider" />

        {/* ── Body textarea ── */}
        <textarea
          placeholder="State..."
          className="writeText"
          onChange={(e) => setText(e.target.value)}
          value={text}
        />

        {/* ── Collection select ── */}
        <select
          className="writeSelect"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value ? parseInt(e.target.value) : '')}
        >
          <option value="">— Select a Collection (Optional) —</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>

        {/* ── Error ── */}
        {error && (
          <div className="writeError">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ── Debug (edit mode only) ── */}
        {isEditMode && (
          <div className="writeDebug">
            <strong>Debug Info:</strong> Editing post ID: {postId}
          </div>
        )}

        {/* ── Submit ── */}
        <button className="writeSubmit" type="submit" disabled={isSubmitting}>
          <PublishIcon />
          <span>{isEditMode ? 'Update' : 'Publish'}</span>
        </button>

      </form>
    </div>
  );
};

export default Write;