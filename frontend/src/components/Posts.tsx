import { FC } from 'react';
import '../styles/posts.css';
import Post from './Post';
import { Post as PostType } from '../context/Context';

interface PostsProps {
  posts: PostType[];
}

const Posts: FC<PostsProps> = ({ posts }) => {
  return (
    <div className="posts">
      {posts.map((post) => {
        return <Post post={post} key={post.id} />;
      })}
    </div>
  );
};

export default Posts;
