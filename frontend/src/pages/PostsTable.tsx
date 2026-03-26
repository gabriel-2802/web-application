import { FC, useState, useEffect, useContext, useCallback } from 'react';
import { CircularProgress, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { Post, LoginContext } from '../context/Context';
import { POST_ENDPOINTS, COLLECTION_ENDPOINTS } from '../constants/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import FormInput from '../components/FormInput';
import '../styles/posts-table.css';

interface FormData {
  title: string;
  content: string;
}

interface Collection {
  id: number;
  name: string;
  description?: string;
}

const PostsTable: FC = () => {
  const { jwt } = useContext(LoginContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<FormData>({ title: '', content: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const ROWS_PER_PAGE = 10;

  const fetchCollections = useCallback(async () => {
    try {
      const res = await axios.get(COLLECTION_ENDPOINTS.ALL, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    }
  }, [jwt]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(POST_ENDPOINTS.ALL);
      setPosts(res.data);
      setFilteredPosts(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    if (jwt) {
      fetchCollections();
    }
  }, [fetchPosts, fetchCollections, jwt]);

  const handleSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(lowercaseQuery) ||
        post.content?.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setFilteredPosts(posts);
    setCurrentPage(1);
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClick = () => {
    setModalMode('add');
    setFormData({ title: '', content: '' });
    setFormErrors({});
    setSelectedPost(null);
    setOpenModal(true);
  };

  const handleEditClick = (post: Post) => {
    setModalMode('edit');
    setSelectedPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
    });
    setFormErrors({});
    setOpenModal(true);
  };

  const handleDeleteClick = (postId: number | undefined) => {
    if (postId) {
      setDeleteTargetId(postId);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;

    try {
      setDeleting(true);
      await axios.delete(POST_ENDPOINTS.DELETE(deleteTargetId.toString()), {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setPosts(posts.filter((p) => p.id !== deleteTargetId));
      setFilteredPosts(filteredPosts.filter((p) => p.id !== deleteTargetId));
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('Failed to delete post. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (modalMode === 'add') {
        const res = await axios.post(POST_ENDPOINTS.CREATE, formData, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setPosts([...posts, res.data]);
        setFilteredPosts([...filteredPosts, res.data]);
      } else if (modalMode === 'edit' && selectedPost?.id) {
        const res = await axios.put(POST_ENDPOINTS.UPDATE(selectedPost.id.toString()), formData, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const updatedPosts = posts.map((p) => (p.id === selectedPost.id ? res.data : p));
        setPosts(updatedPosts);
        setFilteredPosts(
          filteredPosts.map((p) => (p.id === selectedPost.id ? res.data : p))
        );
      }
      setOpenModal(false);
      setFormData({ title: '', content: '' });
      setFormErrors({});
    } catch (err) {
      console.error('Failed to save post:', err);
      setError(modalMode === 'add' ? 'Failed to create post.' : 'Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  const paginatedData = filteredPosts.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredPosts.length / ROWS_PER_PAGE);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleCollectionChange = async (postId: number | undefined, collectionId: number | null) => {
    if (!postId) return;

    try {
      if (collectionId) {
        // Add post to collection
        await axios.put(
          COLLECTION_ENDPOINTS.ADD_POSTS(collectionId.toString()),
          null,
          { 
            params: { postIds: postId },
            headers: { Authorization: `Bearer ${jwt}` } 
          }
        );
      } else {
        // Remove post from collection
        const post = posts.find((p) => p.id === postId);
        if (post?.collectionId) {
          await axios.put(
            COLLECTION_ENDPOINTS.REMOVE_POSTS(post.collectionId.toString()),
            null,
            { 
              params: { postIds: postId },
              headers: { Authorization: `Bearer ${jwt}` } 
            }
          );
        }
      }

      // Update local state
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                collectionId: collectionId || undefined,
                collectionName: collections.find((c) => c.id === collectionId)?.name || undefined,
              }
            : p
        )
      );

      setFilteredPosts(
        filteredPosts.map((p) =>
          p.id === postId
            ? {
                ...p,
                collectionId: collectionId || undefined,
                collectionName: collections.find((c) => c.id === collectionId)?.name || undefined,
              }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to assign collection:', err);
      setError('Failed to assign collection. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="posts-table-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="posts-table-container">
      <div className="posts-table-card">
        <div className="posts-table-header">
          <h2 className="posts-table-title">My Posts</h2>
          <button className="posts-add-button" onClick={handleAddClick}>
            <AddIcon style={{ marginRight: '8px', fontSize: '18px' }} />
            Add Post
          </button>
        </div>

        {error && <div style={{ color: '#d4a574', margin: '16px', padding: '12px', backgroundColor: 'rgba(212, 165, 116, 0.1)', borderRadius: '4px' }}>{error}</div>}

        <div style={{ padding: '16px' }}>
          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} placeholder="Search posts by title or content..." />
        </div>

        {filteredPosts.length === 0 ? (
          <div className="posts-empty-state">
            {posts.length === 0 ? 'No posts yet.' : 'No posts match your search.'}
          </div>
        ) : (
          <>
            <table className="posts-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Collection</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((post) => (
                  <tr key={post.id}>
                    <td>{truncateText(post.title, 40)}</td>
                    <td>{truncateText(post.content, 50)}</td>
                    <td>
                      <select
                        className="posts-collection-select"
                        value={post.collectionId || ''}
                        onChange={(e) => handleCollectionChange(post.id, e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">No Collection</option>
                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td>
                      <div className="posts-table-actions">
                        <button className="posts-edit-button" onClick={() => handleEditClick(post)}>
                          <EditIcon style={{ marginRight: '4px', fontSize: '14px' }} />
                          Edit
                        </button>
                        <button className="posts-delete-button" onClick={() => handleDeleteClick(post.id)}>
                          <DeleteIcon style={{ marginRight: '4px', fontSize: '14px' }} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={openModal}
        title={modalMode === 'add' ? 'Add New Post' : 'Edit Post'}
        onClose={() => setOpenModal(false)}
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleFormChange}
            required
            error={!!formErrors.title}
            helperText={formErrors.title}
          />
          <FormInput
            name="content"
            label="Content"
            value={formData.content}
            onChange={handleFormChange}
            multiline
            rows={6}
            required
            error={!!formErrors.content}
            helperText={formErrors.content}
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <button 
              className="posts-edit-button" 
              onClick={() => setOpenModal(false)} 
              disabled={submitting}
              style={{ cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              Cancel
            </button>
            <button 
              className="posts-add-button" 
              onClick={handleFormSubmit} 
              disabled={submitting}
              style={{ cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Update'}
            </button>
          </Stack>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTargetId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        isDangerous={true}
      />
    </div>
  );
};

export default PostsTable;
