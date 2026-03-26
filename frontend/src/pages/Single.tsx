import { FC, useState, useEffect } from 'react';
import '../styles/single.css';
import Sidebar from '../components/Sidebar';
import SinglePost from '../components/SinglePost';
import Posts from '../components/Posts';
import axios from 'axios';
import { Post } from '../context/Context';
import { POST_ENDPOINTS, COLLECTION_ENDPOINTS } from '../constants/api';
import { useLocation } from 'react-router-dom';

const Single: FC = () => {
  const location = useLocation();
  const postId = location.pathname.split('/')[2];
  const [collectionPosts, setCollectionPosts] = useState<Post[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [currentPost, setCurrentPost] = useState<Post | undefined>();

  useEffect(() => {
    const fetchCurrentPost = async () => {
      try {
        const res = await axios.get(POST_ENDPOINTS.FIND(postId));
        setCurrentPost(res.data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      }
    };
    fetchCurrentPost();
  }, [postId]);

  useEffect(() => {
    if (currentPost?.collectionId) {
      const fetchCollectionPosts = async () => {
        const collectionId = String(currentPost.collectionId);
        try {
          const res = await axios.get(POST_ENDPOINTS.ALL);
          const filteredPosts = res.data.filter((post: Post) => post.collectionId === Number(collectionId) && post.id !== currentPost.id);
          setCollectionPosts(filteredPosts);

          try {
            const collectionRes = await axios.get(COLLECTION_ENDPOINTS.FIND(collectionId));
            setCollectionName(collectionRes.data.name);
          } catch {
            setCollectionName(`Collection #${collectionId}`);
          }
        } catch (error) {
          console.error('Failed to fetch collection posts:', error);
        }
      };
      fetchCollectionPosts();
    }
  }, [currentPost?.collectionId, currentPost?.id]);

  return (
    <div className="single">
      <div className="single-main">
        <SinglePost />
      </div>
      <div className="single-right">
        <Sidebar />
        {collectionPosts.length > 0 && (
          <div className="collectionPostsSection">
            <Posts posts={collectionPosts} filterLabel={`More posts from ${collectionName}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Single;
