import { FC } from 'react';
import '../styles/post.css';
import Image from '../assets/pexels-sheep-1846422.jpg';
import { Link } from 'react-router-dom';
import { Post as PostType } from '../context/Context';

interface PostProps {
  post: PostType;
}

const formatDate = (dateInput?: string | Date) => {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const Post: FC<PostProps> = ({ post }) => {
  return (
    <div className="post">
      <img src={Image} alt="" className="postImg" />
      <div className="postInfo">
        <Link to={`/post/${post.id}`} className="postLink">
          <span className="postTitle">{post.title}</span>
        </Link>
        <span className="postDesc">{post.content?.substring(0, 15)}...</span>
        <hr />
        <span className="postDate">
          Published: {formatDate(post.createdAt)}
          {post.updatedAt && (
            <>
              <br />
              Updated: {formatDate(post.updatedAt)}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default Post;
