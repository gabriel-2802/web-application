import { FC, useState, useEffect } from 'react';
import '../styles/home.css';
import Header from '../components/Header';
import Posts from '../components/Posts';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Post } from '../context/Context';
import { POST_ENDPOINTS } from '../constants/api';

const Home: FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { search } = useLocation();
  const collectionId = search.split('=')[1];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(POST_ENDPOINTS.ALL);
        // Filter posts by collection if collectionId is provided
        const filteredPosts = collectionId 
          ? res.data.filter((post: Post) => post.collectionId === Number(collectionId))
          : res.data;
        setPosts(filteredPosts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchPosts();
  }, [search, collectionId]);

  return (
    <>
      <Header />
      <div className="home">
        <Posts posts={posts} />
        <Sidebar />
      </div>
    </>
  );
};

export default Home;
