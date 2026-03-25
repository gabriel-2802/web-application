import { FC } from 'react';
import '../styles/posts.css';
import Post from './Post';
import { Post as PostType } from '../context/Context';

interface PostsProps {
  posts: PostType[];
  filterLabel?: string;
}

const Posts: FC<PostsProps> = ({ posts, filterLabel }) => {
  return (
    <div className="posts">
      {filterLabel && <h2 className="postsFilterLabel">{filterLabel}</h2>}
      {posts.length === 0 && filterLabel && (
        <p className="noPostsMessage">No posts found matching your search.</p>
      )}
      {posts.map((post) => {
        return <Post post={post} key={post.id} />;
      })}
    </div>
  );
};

export default Posts;
