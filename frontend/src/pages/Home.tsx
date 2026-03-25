import { FC, useState, useEffect } from 'react';
import '../styles/home.css';
import Header from '../components/Header';
import Posts from '../components/Posts';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Post } from '../context/Context';
import { POST_ENDPOINTS, COLLECTION_ENDPOINTS } from '../constants/api';

const Home: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterLabel, setFilterLabel] = useState('');
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const collectionId = params.get('collection');
  const searchKeyword = params.get('search');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (searchKeyword) {
          // Fetch posts by search keyword
          const res = await axios.get(POST_ENDPOINTS.SEARCH(searchKeyword));
          setPosts(res.data);
          setFilterLabel(`Posts with keyword: "${searchKeyword}"`);
        } else if (collectionId) {
          // Fetch all posts and filter by collection
          const res = await axios.get(POST_ENDPOINTS.ALL);
          const filteredPosts = res.data.filter((post: Post) => post.collectionId === Number(collectionId));
          setPosts(filteredPosts);
          
          // Fetch collection name
          try {
            const collectionRes = await axios.get(COLLECTION_ENDPOINTS.FIND(collectionId));
            setFilterLabel(`Posts in ${collectionRes.data.name}`);
          } catch {
            setFilterLabel(`Posts in Collection #${collectionId}`);
          }
        } else {
          // Fetch all posts
          const res = await axios.get(POST_ENDPOINTS.ALL);
          setPosts(res.data);
          setFilterLabel('');
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchPosts();
  }, [search, collectionId, searchKeyword]);

  return (
    <>
      <Header />
      <div className="home">
        <Posts posts={posts} filterLabel={filterLabel} />
        <Sidebar />
      </div>
    </>
  );
};

export default Home;
