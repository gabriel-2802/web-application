import { FC, useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { Post, LoginContext } from '../context/Context';
import { POST_ENDPOINTS } from '../constants/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import FormInput from '../components/FormInput';

interface FormData {
  title: string;
  content: string;
}

const PostsTable: FC = () => {
  const { jwt } = useContext(LoginContext);
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
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
  }, [fetchPosts]);

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              My Posts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Post
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <SearchBar onSearch={handleSearch} onClear={handleClearSearch} placeholder="Search posts by title or content..." />

          {filteredPosts.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              {posts.length === 0 ? 'No posts yet.' : 'No posts match your search.'}
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Content</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.map((post) => (
                      <TableRow key={post.id} hover>
                        <TableCell sx={{ maxWidth: 150 }}>{truncateText(post.title, 40)}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>{truncateText(post.content, 50)}</TableCell>
                        <TableCell>{formatDate(post.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => handleEditClick(post)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(post.id)}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={openModal}
        title={modalMode === 'add' ? 'Add New Post' : 'Edit Post'}
        onClose={() => setOpenModal(false)}
        size="medium"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <Button
              variant="outlined"
              onClick={() => setOpenModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : modalMode === 'add' ? 'Create' : 'Update'}
            </Button>
          </Stack>
        </Box>
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
    </Container>
  );
};

export default PostsTable;
